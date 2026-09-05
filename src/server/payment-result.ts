import "server-only";

import { db } from "@/server/db";
import { getStripe } from "@/server/stripe";

export type CustomerPaymentResult = {
  amountCents: number;
  currency: string;
  orderReference: string;
  state: "received" | "processing" | "failed" | "not_completed";
};

export async function getCustomerPaymentResult(
  orderReference: string,
  paymentIntentId: string,
  userId: string,
): Promise<CustomerPaymentResult | null> {
  if (
    !/^CE-[0-9A-F]{14}$/.test(orderReference)
    || !/^pi_[A-Za-z0-9]{6,250}$/.test(paymentIntentId)
  ) {
    return null;
  }

  const payment = await db.payment.findFirst({
    where: {
      provider: "STRIPE",
      providerPaymentIntentId: paymentIntentId,
      order: {
        publicReference: orderReference,
        userId,
      },
    },
    select: {
      amountCents: true,
      currency: true,
      orderId: true,
      order: {
        select: {
          currency: true,
          publicReference: true,
          totalCents: true,
        },
      },
    },
  });

  if (!payment) return null;

  const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
  const currency = payment.currency.toLowerCase();
  const matchesStoredOrder = (
    payment.order.publicReference === orderReference
    && payment.amountCents === payment.order.totalCents
    && payment.currency === payment.order.currency
    && paymentIntent.id === paymentIntentId
    && paymentIntent.amount === payment.amountCents
    && paymentIntent.currency === currency
    && paymentIntent.metadata.order_id === payment.orderId
    && paymentIntent.metadata.order_reference === orderReference
  );

  if (!matchesStoredOrder) return null;

  return {
    amountCents: payment.amountCents,
    currency: payment.currency,
    orderReference,
    state: mapPaymentIntentStatus(paymentIntent.status),
  };
}

function mapPaymentIntentStatus(status: string): CustomerPaymentResult["state"] {
  if (status === "succeeded") return "received";
  if (status === "processing" || status === "requires_capture") return "processing";
  if (status === "requires_payment_method" || status === "canceled") return "failed";
  return "not_completed";
}
