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

export type UpdateOrderStatusState = {
  message: string;
  status: "error" | "idle" | "success";
};

export async function updateAdminOrderStatusAction(
  _previousState: UpdateOrderStatusState,
  formData: FormData,
): Promise<UpdateOrderStatusState> {
  const admin = await assertCurrentAdmin();
  const publicReference = String(formData.get("publicReference") ?? "").trim();
  const requestedStatus = String(formData.get("nextStatus") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

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

    const updated = await transaction.order.updateMany({
      where: { id: order.id, status: order.status },
      data: { status: nextStatus },
    });
    if (updated.count !== 1) {
      return { message: "The order changed while you were viewing it. Refresh and try again.", status: "error" as const };
    }

    await transaction.orderStatusHistory.create({
      data: {
        actorUserId: admin.userId,
        newStatus: nextStatus,
        note: note || null,
        orderId: order.id,
        previousStatus: order.status,
      },
    });
    await writeAdminAuditLog(transaction, {
      action: "ORDER_STATUS_UPDATED",
      actorUserId: admin.userId,
      beforeData: { status: order.status },
      afterData: { publicReference, status: nextStatus },
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
