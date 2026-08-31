import "server-only";

import { cache } from "react";

import { requireCurrentCustomer } from "@/server/auth-session";
import { db } from "@/server/db";

const orderStatusLabels = {
  PENDING_PAYMENT: "Pending payment",
  PAID: "Paid",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
} as const;

function toOrderDTO(order: {
  createdAt: Date;
  currency: string;
  fulfillmentMethod: string;
  publicReference: string;
  requestedFulfillmentAt: Date;
  status: keyof typeof orderStatusLabels;
  totalCents: number;
}) {
  return {
    createdAt: order.createdAt.toISOString(),
    currency: order.currency,
    fulfillmentMethod: order.fulfillmentMethod,
    publicReference: order.publicReference,
    requestedFulfillmentAt: order.requestedFulfillmentAt.toISOString(),
    status: order.status,
    statusLabel: orderStatusLabels[order.status],
    totalCents: order.totalCents,
  };
}

export const getCustomerAccountOverview = cache(async () => {
  const customer = await requireCurrentCustomer("/profile");
  const account = await db.user.findUniqueOrThrow({
    where: { id: customer.userId },
    select: {
      createdAt: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      _count: { select: { addresses: true, orders: true } },
      addresses: {
        where: { isDefault: true },
        take: 1,
        select: { city: true, label: true, state: true },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          createdAt: true,
          currency: true,
          fulfillmentMethod: true,
          publicReference: true,
          requestedFulfillmentAt: true,
          status: true,
          totalCents: true,
        },
      },
    },
  });

  return {
    addressCount: account._count.addresses,
    defaultAddress: account.addresses[0] ?? null,
    email: account.email,
    firstName: account.firstName,
    initials: `${account.firstName.charAt(0)}${account.lastName.charAt(0)}`.toUpperCase(),
    lastName: account.lastName,
    memberSince: account.createdAt.toISOString(),
    orderCount: account._count.orders,
    phone: account.phone,
    recentOrders: account.orders.map(toOrderDTO),
  };
});

export const getCustomerOrders = cache(async () => {
  const customer = await requireCurrentCustomer("/profile/orders");
  const orders = await db.order.findMany({
    where: { userId: customer.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      createdAt: true,
      currency: true,
      fulfillmentMethod: true,
      publicReference: true,
      requestedFulfillmentAt: true,
      status: true,
      totalCents: true,
    },
  });
  return orders.map(toOrderDTO);
});
