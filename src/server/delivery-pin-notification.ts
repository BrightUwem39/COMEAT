import "server-only";

import { getDeliveryPin } from "@/server/delivery-pin";
import { renderDeliveryPinEmail } from "@/server/delivery-pin-email";
import { db } from "@/server/db";
import { sendOrderEmailOnce } from "@/server/order-email-delivery";

export async function sendDeliveryPinEmail(orderId: string) {
  const order = await db.order.findFirst({
    where: {
      fulfillmentMethod: "LOCAL_DELIVERY",
      id: orderId,
      status: "OUT_FOR_DELIVERY",
    },
    select: {
      customerEmail: true,
      customerFirstName: true,
      id: true,
      publicReference: true,
    },
  });
  if (!order) throw new Error("The local delivery order is not ready for a PIN notification.");

  const orderUrl = new URL(
    `/profile/orders/${encodeURIComponent(order.publicReference)}`,
    getSiteOrigin(),
  ).toString();
  const email = renderDeliveryPinEmail({
    customerFirstName: order.customerFirstName,
    deliveryPin: getDeliveryPin(order.id, order.publicReference),
    orderReference: order.publicReference,
    orderUrl,
  });

  return sendOrderEmailOnce({
    ...email,
    idempotencyKey: `customer-delivery-pin/${order.id}`,
    kind: "DELIVERY_PIN",
    orderId: order.id,
    recipient: order.customerEmail,
  });
}

function getSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
    || process.env.BETTER_AUTH_URL?.trim()
    || (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:3000");
  if (!configured) throw new Error("The public site URL is not configured for order emails.");

  const url = new URL(configured);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("The public site URL must use HTTPS in production.");
  }
  return url.origin;
}
