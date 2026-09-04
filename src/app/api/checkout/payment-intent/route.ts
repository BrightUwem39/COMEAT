import { paymentIntentRequestSchema } from "@/lib/payment-intent";
import { getCurrentCustomer } from "@/server/auth-session";
import { createOrderPaymentIntent, PaymentIntentError } from "@/server/payment-intent";
import { PaymentTotalError } from "@/server/payment-total";
import { isStripeConfigured } from "@/server/stripe";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return Response.json({ error: "Sign in before paying for an order." }, { status: 401, headers: responseHeaders });
  }

  if (!isStripeConfigured()) {
    return Response.json({ error: "Online payment is not configured yet." }, { status: 503, headers: responseHeaders });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return Response.json({ error: "Content-Type must be application/json." }, { status: 415, headers: responseHeaders });
    }

    const body = await request.text();
    if (body.length > 2_000) {
      return Response.json({ error: "Payment request is too large." }, { status: 413, headers: responseHeaders });
    }

    let json: unknown;
    try {
      json = JSON.parse(body);
    } catch {
      return Response.json({ error: "The payment request is invalid." }, { status: 400, headers: responseHeaders });
    }

    const parsed = paymentIntentRequestSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message ?? "The payment request is invalid." }, { status: 400, headers: responseHeaders });
    }

    const result = await createOrderPaymentIntent(parsed.data.orderReference, customer.userId);
    return Response.json(result, { status: 201, headers: responseHeaders });
  } catch (error) {
    if (error instanceof PaymentTotalError || error instanceof PaymentIntentError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status, headers: responseHeaders });
    }

    return Response.json({ error: "Payment could not be started right now." }, { status: 502, headers: responseHeaders });
  }
}
