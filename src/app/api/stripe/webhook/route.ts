import { getStripe, getStripeWebhookSecret, isStripeConfigured } from "@/server/stripe";
import { processStripeWebhookEvent, StripeWebhookDataError } from "@/server/stripe-webhook";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const maximumWebhookBytes = 1_000_000;

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return Response.json({ error: "Stripe is not configured." }, { status: 503, headers: responseHeaders });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400, headers: responseHeaders });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maximumWebhookBytes) {
    return Response.json({ error: "Webhook payload is too large." }, { status: 413, headers: responseHeaders });
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maximumWebhookBytes) {
      return Response.json({ error: "Webhook payload is too large." }, { status: 413, headers: responseHeaders });
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
    const keyIsLive = process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_live_") ?? false;
    if (event.livemode !== keyIsLive) {
      return Response.json({ error: "Stripe mode does not match this environment." }, { status: 400, headers: responseHeaders });
    }

    await processStripeWebhookEvent(event);
    return Response.json({ received: true }, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof StripeWebhookDataError) {
      return Response.json({ error: "Payment data could not be verified." }, { status: 400, headers: responseHeaders });
    }

    if (isSignatureVerificationError(error)) {
      return Response.json({ error: "Invalid Stripe signature." }, { status: 400, headers: responseHeaders });
    }

    return Response.json({ error: "Webhook processing failed." }, { status: 500, headers: responseHeaders });
  }
}

function isSignatureVerificationError(error: unknown) {
  return error instanceof Error
    && (error as Error & { type?: string }).type === "StripeSignatureVerificationError";
}
