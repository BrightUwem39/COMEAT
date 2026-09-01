import { checkoutOrderRequestSchema } from "@/lib/checkout-order";
import { getCurrentCustomer } from "@/server/auth-session";
import { CheckoutOrderError, createPendingOrder } from "@/server/checkout-order";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return Response.json({ error: "Sign in before placing an order." }, { status: 401, headers: responseHeaders });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return Response.json({ error: "Content-Type must be application/json." }, { status: 415, headers: responseHeaders });
    }
    const body = await request.text();
    if (body.length > 100_000) {
      return Response.json({ error: "Checkout request is too large." }, { status: 413, headers: responseHeaders });
    }

    let json: unknown;
    try {
      json = JSON.parse(body);
    } catch {
      return Response.json({ error: "The checkout data is invalid." }, { status: 400, headers: responseHeaders });
    }
    const parsed = checkoutOrderRequestSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message ?? "The checkout data is invalid." }, { status: 400, headers: responseHeaders });
    }

    const result = await createPendingOrder(parsed.data, customer);
    return Response.json(result, { status: 201, headers: responseHeaders });
  } catch (error) {
    if (error instanceof CheckoutOrderError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status, headers: responseHeaders });
    }
    return Response.json({ error: "The order could not be created right now." }, { status: 500, headers: responseHeaders });
  }
}
