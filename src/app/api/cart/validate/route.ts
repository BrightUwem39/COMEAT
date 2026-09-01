import { cartValidationRequestSchema } from "@/lib/cart-validation";
import { validateCart } from "@/server/cart-validation";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return Response.json({ error: "Content-Type must be application/json." }, { status: 415, headers: responseHeaders });
    }

    const body = await request.text();
    if (body.length > 50_000) {
      return Response.json({ error: "Cart request is too large." }, { status: 413, headers: responseHeaders });
    }

    let json: unknown;
    try {
      json = JSON.parse(body);
    } catch {
      return Response.json({ error: "The cart data is invalid." }, { status: 400, headers: responseHeaders });
    }

    const parsed = cartValidationRequestSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: "The cart data is invalid." }, { status: 400, headers: responseHeaders });
    }

    const result = await validateCart(parsed.data);
    return Response.json(result, { headers: responseHeaders });
  } catch {
    return Response.json({ error: "The cart could not be verified right now." }, { status: 500, headers: responseHeaders });
  }
}
