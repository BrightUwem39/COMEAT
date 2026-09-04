import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";

export type AuthoritativePaymentTotal = {
  amountCents: number;
  currency: "usd";
  deliveryFeeCents: number;
  orderId: string;
  publicReference: string;
  subtotalCents: number;
  taxCents: number;
};

export class PaymentTotalError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "NOT_PAYABLE" | "TOTAL_INVALID",
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function calculateOrderTotals(subtotalCents: number) {
  if (!Number.isSafeInteger(subtotalCents) || subtotalCents <= 0) {
    throw new PaymentTotalError("TOTAL_INVALID", "The order total is invalid.", 409);
  }

  // Delivery fees and tax remain zero until the business supplies confirmed rules.
  const deliveryFeeCents = 0;
  const taxCents = 0;

  return {
    subtotalCents,
    deliveryFeeCents,
    taxCents,
    totalCents: subtotalCents + deliveryFeeCents + taxCents,
  };
}

export async function getAuthoritativePaymentTotal(
  publicReference: string,
  userId: string,
  client: Prisma.TransactionClient | typeof db = db,
): Promise<AuthoritativePaymentTotal> {
  const order = await client.order.findFirst({
    where: { publicReference, userId },
    select: {
      id: true,
      publicReference: true,
      status: true,
      subtotalCents: true,
      deliveryFeeCents: true,
      taxCents: true,
      totalCents: true,
      currency: true,
      items: {
        select: {
          quantity: true,
          unitPriceCents: true,
          lineTotalCents: true,
        },
      },
      payments: {
        where: { status: "SUCCEEDED" },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!order) {
    throw new PaymentTotalError("NOT_FOUND", "The order could not be found.", 404);
  }

  if (order.status !== "PENDING_PAYMENT" || order.payments.length > 0) {
    throw new PaymentTotalError("NOT_PAYABLE", "This order is not awaiting payment.", 409);
  }

  const lineTotalsAreValid = order.items.length > 0 && order.items.every((item) =>
    Number.isSafeInteger(item.quantity)
    && item.quantity > 0
    && Number.isSafeInteger(item.unitPriceCents)
    && item.unitPriceCents >= 0
    && item.lineTotalCents === item.unitPriceCents * item.quantity,
  );
  const calculatedSubtotal = order.items.reduce((total, item) => total + item.lineTotalCents, 0);
  const storedTotalsAreValid = [
    order.subtotalCents,
    order.deliveryFeeCents,
    order.taxCents,
    order.totalCents,
  ].every((value) => Number.isSafeInteger(value) && value >= 0);

  if (
    !lineTotalsAreValid
    || !storedTotalsAreValid
    || order.subtotalCents !== calculatedSubtotal
    || order.totalCents !== order.subtotalCents + order.deliveryFeeCents + order.taxCents
    || order.totalCents <= 0
    || order.currency !== "USD"
  ) {
    throw new PaymentTotalError("TOTAL_INVALID", "The order total could not be verified.", 409);
  }

  return {
    amountCents: order.totalCents,
    currency: "usd",
    deliveryFeeCents: order.deliveryFeeCents,
    orderId: order.id,
    publicReference: order.publicReference,
    subtotalCents: order.subtotalCents,
    taxCents: order.taxCents,
  };
}
