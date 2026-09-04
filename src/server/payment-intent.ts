import "server-only";

import type { PaymentIntentResponse } from "@/lib/payment-intent";
import { db } from "@/server/db";
import { getAuthoritativePaymentTotal } from "@/server/payment-total";
import { getStripe } from "@/server/stripe";

export class PaymentIntentError extends Error {
  constructor(
    public readonly code: "PAYMENT_UNAVAILABLE" | "PAYMENT_RECORD_INVALID",
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function createOrderPaymentIntent(
  orderReference: string,
  userId: string,
): Promise<PaymentIntentResponse> {
  const total = await getAuthoritativePaymentTotal(orderReference, userId);
  const stripe = getStripe();
  const idempotencyKey = `comeat:${total.orderId}:${total.amountCents}:${total.currency}`;
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: total.amountCents,
      currency: total.currency,
      automatic_payment_methods: { enabled: true },
      description: `ComEat order ${total.publicReference}`,
      metadata: {
        order_id: total.orderId,
        order_reference: total.publicReference,
      },
    },
    { idempotencyKey },
  );

  if (!paymentIntent.client_secret || paymentIntent.status === "canceled") {
    throw new PaymentIntentError("PAYMENT_UNAVAILABLE", "Payment is not available for this order.", 409);
  }

  const payment = await db.payment.upsert({
    where: { providerPaymentIntentId: paymentIntent.id },
    update: {},
    create: {
      orderId: total.orderId,
      provider: "STRIPE",
      providerPaymentIntentId: paymentIntent.id,
      status: "PENDING",
      amountCents: total.amountCents,
      currency: total.currency.toUpperCase(),
    },
    select: {
      orderId: true,
      amountCents: true,
      currency: true,
    },
  });

  if (
    payment.orderId !== total.orderId
    || payment.amountCents !== total.amountCents
    || payment.currency !== total.currency.toUpperCase()
  ) {
    throw new PaymentIntentError("PAYMENT_RECORD_INVALID", "The payment record could not be verified.", 409);
  }

  return {
    amountCents: total.amountCents,
    clientSecret: paymentIntent.client_secret,
    currency: total.currency,
    orderReference: total.publicReference,
    paymentIntentId: paymentIntent.id,
  };
}
