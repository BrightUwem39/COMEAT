import "server-only";

import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export const adminOrderStatusLabels = {
  PENDING_PAYMENT: "Pending payment",
  PAID: "Paid",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
} as const;

export type AdminOrderStatus = keyof typeof adminOrderStatusLabels;

export const adminOrderStatuses = Object.keys(adminOrderStatusLabels) as AdminOrderStatus[];

const PAGE_SIZE = 12;

export function getAllowedAdminOrderTransitions(
  status: AdminOrderStatus,
  fulfillmentMethod: "LOCAL_DELIVERY" | "OUT_OF_STATE_SHIPPING" | "PICKUP",
): AdminOrderStatus[] {
  if (status === "PENDING_PAYMENT") return ["CANCELLED"];
  if (status === "PAID") return ["CONFIRMED"];
  if (status === "CONFIRMED") return ["PREPARING"];
  if (status === "PREPARING") return ["READY"];
  if (status === "READY") return fulfillmentMethod === "PICKUP" ? ["COMPLETED"] : ["OUT_FOR_DELIVERY"];
  if (status === "OUT_FOR_DELIVERY") return ["COMPLETED"];
  return [];
}

export const getAdminOrders = cache(async (input: { page?: number; query?: string; status?: string }) => {
  await assertCurrentAdmin("ORDERS_VIEW");

  const query = input.query?.trim().slice(0, 80) ?? "";
  const status = adminOrderStatuses.includes(input.status as AdminOrderStatus)
    ? input.status as AdminOrderStatus
    : null;
  const page = Number.isSafeInteger(input.page) && (input.page ?? 0) > 0
    ? Math.min(input.page as number, 999)
    : 1;

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(query ? {
      OR: [
        { publicReference: { contains: query, mode: "insensitive" } },
        { customerFirstName: { contains: query, mode: "insensitive" } },
        { customerLastName: { contains: query, mode: "insensitive" } },
        { customerEmail: { contains: query, mode: "insensitive" } },
        { customerPhone: { contains: query, mode: "insensitive" } },
      ],
    } : {}),
  };

  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      where,
      select: {
        createdAt: true,
        currency: true,
        customerEmail: true,
        customerFirstName: true,
        customerLastName: true,
        fulfillmentMethod: true,
        publicReference: true,
        requestedFulfillmentAt: true,
        status: true,
        totalCents: true,
        _count: { select: { items: true } },
      },
    }),
  ]);

  return {
    page,
    pageSize: PAGE_SIZE,
    query,
    status,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    orders: orders.map((order) => ({
      createdAt: order.createdAt.toISOString(),
      currency: order.currency,
      customerEmail: order.customerEmail,
      customerName: `${order.customerFirstName} ${order.customerLastName}`,
      fulfillmentMethod: order.fulfillmentMethod,
      itemCount: order._count.items,
      publicReference: order.publicReference,
      requestedFulfillmentAt: order.requestedFulfillmentAt.toISOString(),
      status: order.status,
      statusLabel: adminOrderStatusLabels[order.status],
      totalCents: order.totalCents,
    })),
  };
});

export const getAdminOrderDetail = cache(async (publicReference: string) => {
  await assertCurrentAdmin("ORDERS_VIEW");

  const order = await db.order.findUnique({
    where: { publicReference: publicReference.trim().slice(0, 80) },
    select: {
      allergyDeclared: true,
      allergyNotes: true,
      createdAt: true,
      crossContactAcknowledgedAt: true,
      currency: true,
      customerEmail: true,
      customerFirstName: true,
      customerLastName: true,
      customerPhone: true,
      deliveryCity: true,
      deliveryCountryCode: true,
      deliveryFeeCents: true,
      estimatedDeliveryAt: true,
      estimatedReadyAt: true,
      deliveryNotes: true,
      deliveryPostalCode: true,
      deliveryRecipientName: true,
      deliveryState: true,
      deliveryStreetLine1: true,
      deliveryStreetLine2: true,
      fulfillmentMethod: true,
      publicReference: true,
      requestedFulfillmentAt: true,
      status: true,
      subtotalCents: true,
      taxCents: true,
      totalCents: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          lineTotalCents: true,
          productImageUrl: true,
          productName: true,
          quantity: true,
          variantLabel: true,
          modifiers: {
            select: { id: true, modifierName: true, optionLabel: true, priceAdjustmentCents: true },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          amountCents: true,
          paidAt: true,
          paymentMethodType: true,
          refundedAmountCents: true,
          status: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        select: {
          createdAt: true,
          id: true,
          newStatus: true,
          note: true,
          actor: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    crossContactAcknowledgedAt: order.crossContactAcknowledgedAt.toISOString(),
    requestedFulfillmentAt: order.requestedFulfillmentAt.toISOString(),
    estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() ?? null,
    estimatedReadyAt: order.estimatedReadyAt?.toISOString() ?? null,
    statusLabel: adminOrderStatusLabels[order.status],
    allowedTransitions: getAllowedAdminOrderTransitions(order.status, order.fulfillmentMethod),
    payments: order.payments.map((payment) => ({
      ...payment,
      paidAt: payment.paidAt?.toISOString() ?? null,
    })),
    statusHistory: order.statusHistory.map((entry) => ({
      ...entry,
      actorName: entry.actor ? `${entry.actor.firstName} ${entry.actor.lastName}` : "System",
      createdAt: entry.createdAt.toISOString(),
      newStatusLabel: adminOrderStatusLabels[entry.newStatus],
    })),
  };
});
