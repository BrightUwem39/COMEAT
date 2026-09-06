import "server-only";

import { renderAdminOrderNotificationEmail } from "@/server/admin-order-notification-email";
import { db } from "@/server/db";
import { getOrderNotificationEmail } from "@/server/email-delivery";
import { sendOrderEmailOnce } from "@/server/order-email-delivery";
import { renderOrderConfirmationEmail } from "@/server/order-confirmation-email";

export async function sendPaidOrderEmails(orderId: string) {
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      status: "PAID",
      payments: { some: { status: "SUCCEEDED" } },
    },
    select: {
      currency: true,
      customerEmail: true,
      customerFirstName: true,
      customerLastName: true,
      customerPhone: true,
      deliveryCity: true,
      deliveryCountryCode: true,
      deliveryFeeCents: true,
      deliveryNotes: true,
      deliveryPostalCode: true,
      deliveryRecipientName: true,
      deliveryState: true,
      deliveryStreetLine1: true,
      deliveryStreetLine2: true,
      deliveryWindowEnd: true,
      deliveryWindowStart: true,
      allergyDeclared: true,
      allergyNotes: true,
      fulfillmentMethod: true,
      id: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          lineTotalCents: true,
          modifiers: {
            select: {
              modifierName: true,
              optionLabel: true,
            },
          },
          productName: true,
          quantity: true,
          variantLabel: true,
        },
      },
      publicReference: true,
      requestedFulfillmentAt: true,
      subtotalCents: true,
      taxCents: true,
      totalCents: true,
    },
  });

  if (!order || !order.deliveryWindowStart || !order.deliveryWindowEnd || order.items.length === 0) {
    throw new Error("Paid order confirmation data is incomplete.");
  }

  const delivery = {
    city: requiredDeliveryValue(order.deliveryCity),
    countryCode: requiredDeliveryValue(order.deliveryCountryCode),
    postalCode: requiredDeliveryValue(order.deliveryPostalCode),
    recipientName: requiredDeliveryValue(order.deliveryRecipientName),
    state: requiredDeliveryValue(order.deliveryState),
    streetLine1: requiredDeliveryValue(order.deliveryStreetLine1),
    streetLine2: order.deliveryStreetLine2,
  };
  const items = order.items.map((item) => ({
    lineTotalCents: item.lineTotalCents,
    modifiers: item.modifiers.map((modifier) => `${modifier.modifierName}: ${modifier.optionLabel}`),
    name: item.productName,
    quantity: item.quantity,
    variantLabel: item.variantLabel,
  }));
  const customerEmail = renderOrderConfirmationEmail({
    currency: order.currency,
    customerFirstName: order.customerFirstName,
    delivery,
    deliveryFeeCents: order.deliveryFeeCents,
    deliveryInstructions: order.deliveryNotes,
    deliveryWindowEnd: order.deliveryWindowEnd,
    deliveryWindowStart: order.deliveryWindowStart,
    fulfillmentMethod: order.fulfillmentMethod,
    items,
    orderReference: order.publicReference,
    orderUrl: new URL(
      `/profile/orders/${encodeURIComponent(order.publicReference)}`,
      getSiteOrigin(),
    ).toString(),
    requestedFulfillmentAt: order.requestedFulfillmentAt,
    subtotalCents: order.subtotalCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
  });
  const notificationRecipient = getOrderNotificationEmail();
  if (!notificationRecipient) {
    throw new Error("ORDER_NOTIFICATION_EMAIL is not configured.");
  }
  const adminEmail = renderAdminOrderNotificationEmail({
    allergyDeclared: order.allergyDeclared,
    allergyDetails: order.allergyNotes,
    currency: order.currency,
    customerEmail: order.customerEmail,
    customerName: `${order.customerFirstName} ${order.customerLastName}`,
    customerPhone: order.customerPhone,
    deliveryAddress: [
      delivery.recipientName,
      delivery.streetLine1,
      delivery.streetLine2,
      `${delivery.city}, ${delivery.state} ${delivery.postalCode}`,
      delivery.countryCode,
    ].filter((line): line is string => Boolean(line)),
    deliveryInstructions: order.deliveryNotes,
    deliveryWindowEnd: order.deliveryWindowEnd,
    deliveryWindowStart: order.deliveryWindowStart,
    fulfillmentMethod: order.fulfillmentMethod,
    items,
    orderReference: order.publicReference,
    requestedFulfillmentAt: order.requestedFulfillmentAt,
    totalCents: order.totalCents,
  });

  return Promise.all([
    sendOrderEmailOnce({
      ...customerEmail,
      idempotencyKey: `customer-order-paid/${order.id}`,
      kind: "CUSTOMER_CONFIRMATION",
      orderId: order.id,
      recipient: order.customerEmail,
    }),
    sendOrderEmailOnce({
      ...adminEmail,
      idempotencyKey: `admin-order-paid/${order.id}`,
      kind: "ADMIN_NOTIFICATION",
      orderId: order.id,
      recipient: notificationRecipient,
    }),
  ]);
}

function getSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
    || process.env.BETTER_AUTH_URL?.trim()
    || (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:3000");

  if (!configured) {
    throw new Error("The public site URL is not configured for order emails.");
  }

  const url = new URL(configured);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("The public site URL must use HTTPS in production.");
  }
  return url.origin;
}

function requiredDeliveryValue(value: string | null) {
  if (!value?.trim()) {
    throw new Error("Paid order delivery data is incomplete.");
  }
  return value;
}
