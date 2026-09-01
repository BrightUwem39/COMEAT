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
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        select: {
          city: true,
          countryCode: true,
          id: true,
          isDefault: true,
          label: true,
          phone: true,
          postalCode: true,
          recipientName: true,
          state: true,
          streetLine1: true,
          streetLine2: true,
        },
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

  const addresses = account.addresses.map((address) => ({
    ...address,
    label: address.label ?? undefined,
    streetLine2: address.streetLine2 ?? undefined,
  }));

  return {
    addressCount: account._count.addresses,
    addresses,
    defaultAddress: addresses.find((address) => address.isDefault) ?? null,
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

export const getCustomerOrderDetail = cache(async (publicReference: string) => {
  const customer = await requireCurrentCustomer(`/profile/orders/${encodeURIComponent(publicReference)}`);
  const order = await db.order.findFirst({
    where: { publicReference, userId: customer.userId },
    select: {
      publicReference: true,
      status: true,
      createdAt: true,
      currency: true,
      subtotalCents: true,
      deliveryFeeCents: true,
      taxCents: true,
      totalCents: true,
      fulfillmentMethod: true,
      requestedFulfillmentAt: true,
      deliveryWindowStart: true,
      deliveryWindowEnd: true,
      deliveryRecipientName: true,
      deliveryPhone: true,
      deliveryStreetLine1: true,
      deliveryStreetLine2: true,
      deliveryCity: true,
      deliveryState: true,
      deliveryPostalCode: true,
      deliveryCountryCode: true,
      deliveryNotes: true,
      allergyDeclared: true,
      allergyNotes: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productName: true,
          productImageUrl: true,
          variantLabel: true,
          unitPriceCents: true,
          quantity: true,
          lineTotalCents: true,
          modifiers: {
            select: {
              id: true,
              modifierName: true,
              optionLabel: true,
              priceAdjustmentCents: true,
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          previousStatus: true,
          newStatus: true,
          note: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) return null;
  return {
    ...order,
    statusLabel: orderStatusLabels[order.status],
    createdAt: order.createdAt.toISOString(),
    requestedFulfillmentAt: order.requestedFulfillmentAt.toISOString(),
    deliveryWindowStart: order.deliveryWindowStart?.toISOString() ?? null,
    deliveryWindowEnd: order.deliveryWindowEnd?.toISOString() ?? null,
    statusHistory: order.statusHistory.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      newStatusLabel: orderStatusLabels[entry.newStatus],
    })),
  };
});
