"use server";

import { revalidatePath } from "next/cache";

import { writeAdminAuditLog } from "@/server/admin-audit";
import { assertCurrentAdmin } from "@/server/admin-auth";
import {
  adminOrderStatusLabels,
  adminOrderStatuses,
  getAllowedAdminOrderTransitions,
  type AdminOrderStatus,
} from "@/server/admin-orders";
import { db } from "@/server/db";
import { getStripe } from "@/server/stripe";

export type UpdateOrderStatusState = {
  message: string;
  status: "error" | "idle" | "success";
};

export type RefundOrderState = UpdateOrderStatusState;

const ESTIMATE_MINUTES = [15, 30, 45, 60, 90, 120, 180] as const;
const REFUND_AMOUNT_PATTERN = /^\d{1,5}(?:\.\d{1,2})?$/;

export async function updateAdminOrderStatusAction(
  _previousState: UpdateOrderStatusState,
  formData: FormData,
): Promise<UpdateOrderStatusState> {
  const admin = await assertCurrentAdmin("ORDERS_MANAGE");
  const publicReference = String(formData.get("publicReference") ?? "").trim();
  const requestedStatus = String(formData.get("nextStatus") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const readyMinutes = Number(formData.get("readyMinutes"));
  const deliveryMinutes = Number(formData.get("deliveryMinutes"));

  if (!publicReference || publicReference.length > 80) {
    return { message: "The order reference is invalid.", status: "error" };
  }
  if (!adminOrderStatuses.includes(requestedStatus as AdminOrderStatus)) {
    return { message: "Choose a valid next status.", status: "error" };
  }
  if (note.length > 300) {
    return { message: "The internal note must be 300 characters or fewer.", status: "error" };
  }

  const nextStatus = requestedStatus as AdminOrderStatus;
  const result = await db.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({
      where: { publicReference },
      select: { fulfillmentMethod: true, id: true, status: true },
    });
    if (!order) return { message: "This order could not be found.", status: "error" as const };

    const allowedTransitions = getAllowedAdminOrderTransitions(order.status, order.fulfillmentMethod);
    if (!allowedTransitions.includes(nextStatus)) {
      return { message: "That status change is not allowed from the order’s current state.", status: "error" as const };
    }

    const accepting = order.status === "PAID" && nextStatus === "CONFIRMED";
    if (accepting && !ESTIMATE_MINUTES.includes(readyMinutes as typeof ESTIMATE_MINUTES[number])) {
      return { message: "Choose a valid preparation estimate.", status: "error" as const };
    }
    if (accepting && order.fulfillmentMethod !== "PICKUP" && !ESTIMATE_MINUTES.includes(deliveryMinutes as typeof ESTIMATE_MINUTES[number])) {
      return { message: "Choose a valid delivery estimate.", status: "error" as const };
    }
    const estimatedReadyAt = accepting ? new Date(Date.now() + readyMinutes * 60_000) : undefined;
    const estimatedDeliveryAt = accepting && order.fulfillmentMethod !== "PICKUP" && estimatedReadyAt
      ? new Date(estimatedReadyAt.getTime() + deliveryMinutes * 60_000)
      : accepting ? null : undefined;

    const updated = await transaction.order.updateMany({
      where: { id: order.id, status: order.status },
      data: { estimatedDeliveryAt, estimatedReadyAt, status: nextStatus },
    });
    if (updated.count !== 1) {
      return { message: "The order changed while you were viewing it. Refresh and try again.", status: "error" as const };
    }

    await transaction.orderStatusHistory.create({
      data: {
        actorUserId: admin.userId,
        newStatus: nextStatus,
        note: note || (accepting ? "Order accepted by the kitchen." : null),
        orderId: order.id,
        previousStatus: order.status,
      },
    });
    await writeAdminAuditLog(transaction, {
      action: "ORDER_STATUS_UPDATED",
      actorUserId: admin.userId,
      beforeData: { status: order.status },
      afterData: { estimatedDeliveryAt: estimatedDeliveryAt?.toISOString() ?? null, estimatedReadyAt: estimatedReadyAt?.toISOString() ?? null, publicReference, status: nextStatus },
      entityId: order.id,
      entityType: "ORDER",
    });

    return {
      message: `Order moved to ${adminOrderStatusLabels[nextStatus].toLowerCase()}.`,
      status: "success" as const,
    };
  });

  if (result.status === "success") {
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/activity");
    revalidatePath(`/admin/orders/${encodeURIComponent(publicReference)}`);
    revalidatePath("/profile/orders");
    revalidatePath(`/profile/orders/${encodeURIComponent(publicReference)}`);
  }

  return result;
}

export async function refundAdminOrderAction(
  _previousState: RefundOrderState,
  formData: FormData,
): Promise<RefundOrderState> {
  const admin = await assertCurrentAdmin("REFUNDS_MANAGE");
  const publicReference = String(formData.get("publicReference") ?? "").trim();
  const rawAmount = String(formData.get("refundAmount") ?? "").trim();
  const note = String(formData.get("refundNote") ?? "").trim();

  if (!publicReference || publicReference.length > 80 || !REFUND_AMOUNT_PATTERN.test(rawAmount)) {
    return { message: "Enter a valid refund amount.", status: "error" };
  }
  if (!note || note.length > 300) {
    return { message: "Add a refund reason of 300 characters or fewer.", status: "error" };
  }
  const amountCents = Math.round(Number(rawAmount) * 100);
  if (amountCents < 1) return { message: "Refund amount must be at least $0.01.", status: "error" };

  const payment = await db.payment.findFirst({
    orderBy: { createdAt: "desc" },
    where: { order: { publicReference }, status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED"] } },
    select: {
      amountCents: true,
      currency: true,
      id: true,
      providerPaymentIntentId: true,
      refundedAmountCents: true,
      order: { select: { id: true, status: true } },
    },
  });
  if (!payment) return { message: "No refundable Stripe payment was found.", status: "error" };
  const remainingCents = payment.amountCents - payment.refundedAmountCents;
  if (amountCents > remainingCents) return { message: "The refund exceeds the remaining paid amount.", status: "error" };

  let refund;
  try {
    refund = await getStripe().refunds.create({
      amount: amountCents,
      metadata: { admin_user_id: admin.userId, order_id: payment.order.id, order_reference: publicReference },
      payment_intent: payment.providerPaymentIntentId,
    }, { idempotencyKey: `comeat-refund-${payment.id}-${payment.refundedAmountCents}-${amountCents}` });
  } catch (error) {
    console.error("Stripe refund request failed", error);
    return { message: "Stripe could not issue this refund. No local changes were made.", status: "error" };
  }

  if (refund.status !== "succeeded") {
    return { message: "Stripe is processing this refund. Refresh after the refund webhook is received.", status: "success" };
  }

  const totalRefundedCents = payment.refundedAmountCents + refund.amount;
  const fullyRefunded = totalRefundedCents >= payment.amountCents;
  const recorded = await db.$transaction(async (transaction) => {
    const paymentUpdate = await transaction.payment.updateMany({
      where: { id: payment.id, refundedAmountCents: payment.refundedAmountCents },
      data: { refundedAmountCents: totalRefundedCents, refundedAt: new Date(refund.created * 1_000), status: fullyRefunded ? "REFUNDED" : "PARTIALLY_REFUNDED" },
    });
    if (paymentUpdate.count !== 1) return false;
    if (fullyRefunded) {
      const orderUpdate = await transaction.order.updateMany({ where: { id: payment.order.id, status: payment.order.status }, data: { status: "REFUNDED" } });
      if (orderUpdate.count === 1) await transaction.orderStatusHistory.create({ data: { actorUserId: admin.userId, newStatus: "REFUNDED", note, orderId: payment.order.id, previousStatus: payment.order.status } });
    }
    await writeAdminAuditLog(transaction, {
      action: "PAYMENT_REFUND_ISSUED",
      actorUserId: admin.userId,
      beforeData: { refundedAmountCents: payment.refundedAmountCents, status: payment.order.status },
      afterData: { amountCents: refund.amount, publicReference, refundId: refund.id, refundedAmountCents: totalRefundedCents, status: fullyRefunded ? "REFUNDED" : payment.order.status },
      entityId: payment.order.id,
      entityType: "ORDER",
    });
    return true;
  });

  if (!recorded) return { message: "Stripe accepted the refund. Refresh to retrieve its latest status.", status: "success" };
  revalidateOrderPages(publicReference);
  return { message: `${fullyRefunded ? "Full" : "Partial"} refund issued successfully.`, status: "success" };
}

function revalidateOrderPages(publicReference: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/activity");
  revalidatePath(`/admin/orders/${encodeURIComponent(publicReference)}`);
  revalidatePath("/profile/orders");
  revalidatePath(`/profile/orders/${encodeURIComponent(publicReference)}`);
}
