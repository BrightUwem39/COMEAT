import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | undefined;

export function getStripePromise() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

  if (!publishableKey) {
    return null;
  }

  if (!publishableKey.startsWith("pk_test_") && !publishableKey.startsWith("pk_live_")) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a valid Stripe publishable key.");
  }

  stripePromise ??= loadStripe(publishableKey);
  return stripePromise;
}
