import "server-only";

import { cache } from "react";

import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

const orderStatusLabels = {
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

export const getAdminDashboardOverview = cache(async () => {
  const admin = await assertCurrentAdmin("OVERVIEW_VIEW");
  const now = new Date();
  const last24Hours = new Date(now);
  last24Hours.setHours(last24Hours.getHours() - 24);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalOrders, ordersLast24Hours, activeOrders, newContactMessages, newCateringInquiries, revenue, recentOrders, liveOrders] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: last24Hours } } }),
    db.order.count({ where: { status: { in: ["PAID", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"] } } }),
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.cateringInquiry.count({ where: { status: "NEW" } }),
    db.payment.aggregate({
      _sum: { amountCents: true, refundedAmountCents: true },
      where: { paidAt: { gte: thirtyDaysAgo }, status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED"] } },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        createdAt: true,
        currency: true,
        customerEmail: true,
        customerFirstName: true,
        customerLastName: true,
        publicReference: true,
        status: true,
        totalCents: true,
        _count: { select: { items: true } },
      },
    }),
    db.order.findMany({
      orderBy: [{ requestedFulfillmentAt: "asc" }, { createdAt: "asc" }],
      take: 24,
      where: { status: { in: ["PAID", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"] } },
      select: {
        createdAt: true,
        currency: true,
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
    activeOrders,
    adminFirstName: admin.firstName,
    currency: recentOrders[0]?.currency ?? "USD",
    generatedAt: now.toISOString(),
    newInquiries: newContactMessages + newCateringInquiries,
    ordersLast24Hours,
    revenueCents: Math.max(0, (revenue._sum.amountCents ?? 0) - (revenue._sum.refundedAmountCents ?? 0)),
    totalOrders,
    liveOrders: liveOrders.map((order) => ({
      createdAt: order.createdAt.toISOString(),
      currency: order.currency,
      customerName: `${order.customerFirstName} ${order.customerLastName}`,
      fulfillmentMethod: order.fulfillmentMethod,
      itemCount: order._count.items,
      publicReference: order.publicReference,
      requestedFulfillmentAt: order.requestedFulfillmentAt.toISOString(),
      status: order.status,
      statusLabel: orderStatusLabels[order.status],
      totalCents: order.totalCents,
    })),
    recentOrders: recentOrders.map((order) => ({
      createdAt: order.createdAt.toISOString(),
      currency: order.currency,
      customerEmail: order.customerEmail,
      customerName: `${order.customerFirstName} ${order.customerLastName}`,
      itemCount: order._count.items,
      publicReference: order.publicReference,
      status: order.status,
      statusLabel: orderStatusLabels[order.status],
      totalCents: order.totalCents,
    })),
  };
});
