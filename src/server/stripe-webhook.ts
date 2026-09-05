import "server-only";

import type Stripe from "stripe";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";

export class StripeWebhookDataError extends Error {}

export type StripeWebhookOutcome = "ignored" | "processed" | "duplicate";

export async function processStripeWebhookEvent(
  event: Stripe.Event,
): Promise<StripeWebhookOutcome> {
  if (!event.type.startsWith("payment_intent.")) return "ignored";

  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  if (paymentIntent.object !== "payment_intent") return "ignored";

  if (event.type === "payment_intent.succeeded") {
    return recordSuccessfulPayment(paymentIntent, event.created);
  }

  if (event.type === "payment_intent.payment_failed") {
    return recordUnsuccessfulPayment(paymentIntent, "failed");
  }

  if (event.type === "payment_intent.canceled") {
    return recordUnsuccessfulPayment(paymentIntent, "canceled");
  }

  if (event.type === "payment_intent.processing") {
    return recordProcessingPayment(paymentIntent);
  }

  return "ignored";
}

async function recordSuccessfulPayment(
  paymentIntent: Stripe.PaymentIntent,
  eventCreatedAt: number,
): Promise<StripeWebhookOutcome> {
  if (paymentIntent.status !== "succeeded") {
    throw new StripeWebhookDataError("Successful event contains an invalid payment status.");
  }

  return db.$transaction(async (transaction) => {
    const payment = await getVerifiedPayment(transaction, paymentIntent);
    if (!payment) return "ignored";

    if (paymentIntent.amount_received !== payment.amountCents) {
      throw new StripeWebhookDataError("The received payment amount does not match the order.");
    }

    const paidAt = new Date(eventCreatedAt * 1_000);
    const paymentUpdate = await transaction.payment.updateMany({
      where: {
        id: payment.id,
        status: { not: "SUCCEEDED" },
      },
      data: {
        failureCode: null,
        failureMessage: null,
        paidAt,
        status: "SUCCEEDED",
      },
    });

    const orderUpdate = await transaction.order.updateMany({
      where: {
        id: payment.order.id,
        status: "PENDING_PAYMENT",
      },
      data: { status: "PAID" },
    });

    if (orderUpdate.count > 0) {
      await transaction.orderStatusHistory.create({
        data: {
          newStatus: "PAID",
          note: "Payment verified by Stripe.",
          orderId: payment.order.id,
          previousStatus: "PENDING_PAYMENT",
        },
      });
    }

    return paymentUpdate.count > 0 || orderUpdate.count > 0 ? "processed" : "duplicate";
  });
}

async function recordUnsuccessfulPayment(
  paymentIntent: Stripe.PaymentIntent,
  reason: "failed" | "canceled",
): Promise<StripeWebhookOutcome> {
  return db.$transaction(async (transaction) => {
    const payment = await getVerifiedPayment(transaction, paymentIntent);
    if (!payment) return "ignored";

    const failureCode = reason === "canceled"
      ? "payment_intent_canceled"
      : paymentIntent.last_payment_error?.code ?? "payment_failed";
    const failureMessage = reason === "canceled"
      ? "The payment was canceled before completion."
      : paymentIntent.last_payment_error?.message ?? "Stripe could not complete the payment.";
    const update = await transaction.payment.updateMany({
      where: {
        id: payment.id,
        status: "PENDING",
      },
      data: {
        failureCode,
        failureMessage,
        paidAt: null,
        status: "FAILED",
      },
    });

    return update.count > 0 ? "processed" : "duplicate";
  });
}

async function recordProcessingPayment(
  paymentIntent: Stripe.PaymentIntent,
): Promise<StripeWebhookOutcome> {
  return db.$transaction(async (transaction) => {
    const payment = await getVerifiedPayment(transaction, paymentIntent);
    if (!payment) return "ignored";

    const update = await transaction.payment.updateMany({
      where: {
        id: payment.id,
        status: "FAILED",
      },
      data: {
        failureCode: null,
        failureMessage: null,
        paidAt: null,
        status: "PENDING",
      },
    });

    return update.count > 0 ? "processed" : "duplicate";
  });
}

async function getVerifiedPayment(
  transaction: Prisma.TransactionClient,
  paymentIntent: Stripe.PaymentIntent,
) {
  const payment = await transaction.payment.findUnique({
    where: { providerPaymentIntentId: paymentIntent.id },
    select: {
      amountCents: true,
      currency: true,
      id: true,
      orderId: true,
      provider: true,
      order: {
        select: {
          currency: true,
          id: true,
          publicReference: true,
          totalCents: true,
        },
      },
    },
  });

  if (!payment) return null;

  const matchesStoredPayment = (
    payment.provider === "STRIPE"
    && payment.orderId === payment.order.id
    && payment.amountCents === payment.order.totalCents
    && payment.currency === payment.order.currency
    && paymentIntent.amount === payment.amountCents
    && paymentIntent.currency === payment.currency.toLowerCase()
    && paymentIntent.metadata.order_id === payment.order.id
    && paymentIntent.metadata.order_reference === payment.order.publicReference
  );

  if (!matchesStoredPayment) {
    throw new StripeWebhookDataError("Stripe payment data does not match the stored order.");
  }

  return payment;
}
