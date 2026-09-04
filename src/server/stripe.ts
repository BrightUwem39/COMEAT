import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("Stripe payments are not configured.");
  }

  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new Error("STRIPE_SECRET_KEY must be a valid Stripe secret key.");
  }

  stripeClient ??= new Stripe(secretKey, {
    appInfo: {
      name: "ComEat",
      version: "0.1.0",
    },
    maxNetworkRetries: 2,
    timeout: 10_000,
  });

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    throw new Error("Stripe webhook verification is not configured.");
  }

  if (!webhookSecret.startsWith("whsec_")) {
    throw new Error("STRIPE_WEBHOOK_SECRET must be a valid Stripe webhook secret.");
  }

  return webhookSecret;
}
