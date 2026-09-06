import "server-only";

type OrderConfirmationItem = {
  lineTotalCents: number;
  modifiers: string[];
  name: string;
  quantity: number;
  variantLabel: string;
};

export type OrderConfirmationEmailInput = {
  currency: string;
  customerFirstName: string;
  delivery: {
    city: string;
    countryCode: string;
    postalCode: string;
    recipientName: string;
    state: string;
    streetLine1: string;
    streetLine2?: string | null;
  };
  deliveryFeeCents: number;
  deliveryInstructions?: string | null;
  deliveryWindowEnd: Date;
  deliveryWindowStart: Date;
  fulfillmentMethod: "LOCAL_DELIVERY" | "OUT_OF_STATE_SHIPPING" | "PICKUP";
  items: OrderConfirmationItem[];
  orderReference: string;
  orderUrl: string;
  requestedFulfillmentAt: Date;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

export type RenderedOrderConfirmationEmail = {
  html: string;
  subject: string;
  text: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "America/New_York",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

export function renderOrderConfirmationEmail(
  input: OrderConfirmationEmailInput,
): RenderedOrderConfirmationEmail {
  assertSafeOrderUrl(input.orderUrl);
  assertOrderSummary(input);

  const reference = escapeHtml(input.orderReference);
  const orderUrl = escapeHtml(input.orderUrl);
  const deliveryDate = dateFormatter.format(input.requestedFulfillmentAt);
  const deliveryWindow = `${timeFormatter.format(input.deliveryWindowStart)}–${timeFormatter.format(input.deliveryWindowEnd)} ET`;
  const deliveryAddress = formatDeliveryAddress(input.delivery);
  const fulfillmentMethod = formatFulfillmentMethod(input.fulfillmentMethod);
  const itemRows = input.items.map((item) => renderItemRow(item, input.currency)).join("");
  const plainTextItems = input.items.map((item) => {
    const options = [item.variantLabel, ...item.modifiers].filter(Boolean).join(" · ");
    return `${item.quantity} × ${item.name}${options ? ` (${options})` : ""} — ${formatMoney(item.lineTotalCents, input.currency)}`;
  }).join("\n");

  const subject = `Payment received — ${input.orderReference}`;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta name="color-scheme" content="dark">
    <title>${escapeHtml(subject)}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { padding: 18px 10px !important; }
        .email-card { padding: 28px 20px !important; }
        .email-heading { font-size: 32px !important; }
        .detail-cell { display: block !important; width: auto !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#050505;color:#f7f3ea;font-family:Arial,Helvetica,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Your ComEat payment was received for order ${reference}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#050505">
      <tr>
        <td class="email-shell" align="center" style="padding:36px 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px">
            <tr>
              <td style="padding:0 4px 18px;color:#e6a51a;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase">ComEat</td>
            </tr>
            <tr>
              <td class="email-card" style="border:1px solid #292929;border-radius:24px;background:#111111;padding:42px">
                <span style="display:inline-block;border:1px solid rgba(230,165,26,0.38);border-radius:999px;background:rgba(230,165,26,0.08);color:#e6a51a;font-size:10px;font-weight:700;letter-spacing:0.16em;padding:9px 13px;text-transform:uppercase">Payment confirmed</span>
                <h1 class="email-heading" style="margin:24px 0 0;color:#f7f3ea;font-size:42px;line-height:1.04;letter-spacing:-0.04em">Payment received.</h1>
                <p style="margin:18px 0 0;color:#a7a29a;font-size:15px;line-height:1.7">Hi ${escapeHtml(input.customerFirstName)}, your order is now paid and safely in our kitchen queue.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;border:1px solid #292929;border-radius:14px;background:#090909">
                  <tr>
                    <td class="detail-cell" width="50%" style="padding:16px 18px;border-bottom:1px solid #292929">
                      <div style="color:#77736c;font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase">Order</div>
                      <div style="margin-top:7px;color:#f7f3ea;font-size:14px;font-weight:700">${reference}</div>
                    </td>
                    <td class="detail-cell" width="50%" style="padding:16px 18px;border-bottom:1px solid #292929">
                      <div style="color:#77736c;font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase">Amount paid</div>
                      <div style="margin-top:7px;color:#e6a51a;font-size:18px;font-weight:700">${formatMoney(input.totalCents, input.currency)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="detail-cell" width="50%" style="padding:16px 18px">
                      <div style="color:#77736c;font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase">Requested date</div>
                      <div style="margin-top:7px;color:#f7f3ea;font-size:14px">${escapeHtml(deliveryDate)}</div>
                    </td>
                    <td class="detail-cell" width="50%" style="padding:16px 18px">
                      <div style="color:#77736c;font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase">Delivery window</div>
                      <div style="margin-top:7px;color:#f7f3ea;font-size:14px">${escapeHtml(deliveryWindow)}</div>
                    </td>
                  </tr>
                </table>

                <h2 style="margin:34px 0 0;color:#f7f3ea;font-size:20px">Your order</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;border-top:1px solid #292929">${itemRows}</table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px">
                  ${renderTotalRow("Subtotal", input.subtotalCents, input.currency)}
                  ${renderTotalRow("Delivery", input.deliveryFeeCents, input.currency)}
                  ${renderTotalRow("Tax", input.taxCents, input.currency)}
                  <tr>
                    <td style="border-top:1px solid #292929;padding:14px 0 0;color:#f7f3ea;font-size:14px;font-weight:700">Total paid</td>
                    <td align="right" style="border-top:1px solid #292929;padding:14px 0 0;color:#e6a51a;font-size:20px;font-weight:700">${formatMoney(input.totalCents, input.currency)}</td>
                  </tr>
                </table>

                <div style="margin-top:30px;border-left:2px solid #f26a00;background:rgba(242,106,0,0.06);padding:16px 18px">
                  <div style="color:#f26a00;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase">${escapeHtml(fulfillmentMethod)}</div>
                  <div style="margin-top:8px;color:#f7f3ea;font-size:14px;line-height:1.7">${deliveryAddress.map(escapeHtml).join("<br>")}</div>
                </div>
                ${input.deliveryInstructions ? `<div style="margin-top:12px;border:1px solid #292929;border-radius:12px;padding:14px 16px"><div style="color:#77736c;font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase">Delivery instructions</div><div style="margin-top:7px;color:#a7a29a;font-size:12px;line-height:1.7">${escapeHtml(input.deliveryInstructions).replace(/\n/g, "<br>")}</div></div>` : ""}

                <a href="${orderUrl}" style="display:inline-block;margin-top:30px;border-radius:10px;background:#e6a51a;color:#050505;font-size:11px;font-weight:700;letter-spacing:0.14em;padding:15px 22px;text-decoration:none;text-transform:uppercase">Track your order</a>
                <p style="margin:26px 0 0;color:#77736c;font-size:11px;line-height:1.7">Questions about this order? Call ComEat at 404-518-2891.</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:22px 12px 0;color:#77736c;font-size:10px;letter-spacing:0.12em;text-transform:uppercase">Flavorful, Unforgettable Experience</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const deliveryInstructions = input.deliveryInstructions
    ? `\n\nDelivery instructions:\n${input.deliveryInstructions}`
    : "";
  const text = `ComEat\n\nPayment received.\n\nHi ${input.customerFirstName}, your order is now paid and safely in our kitchen queue.\n\nOrder: ${input.orderReference}\nAmount paid: ${formatMoney(input.totalCents, input.currency)}\nRequested date: ${deliveryDate}\nDelivery window: ${deliveryWindow}\n\nYOUR ORDER\n${plainTextItems}\n\nSubtotal: ${formatMoney(input.subtotalCents, input.currency)}\nDelivery: ${formatMoney(input.deliveryFeeCents, input.currency)}\nTax: ${formatMoney(input.taxCents, input.currency)}\nTotal paid: ${formatMoney(input.totalCents, input.currency)}\n\n${fulfillmentMethod}\n${deliveryAddress.join("\n")}${deliveryInstructions}\n\nTrack your order: ${input.orderUrl}\n\nQuestions? Call 404-518-2891.\nFlavorful, Unforgettable Experience`;

  return { html, subject, text };
}

function renderItemRow(item: OrderConfirmationItem, currency: string) {
  const options = [item.variantLabel, ...item.modifiers].filter(Boolean).map(escapeHtml).join(" · ");
  return `<tr>
    <td style="border-bottom:1px solid #292929;padding:15px 0;vertical-align:top">
      <div style="color:#f7f3ea;font-size:14px;font-weight:700">${item.quantity} × ${escapeHtml(item.name)}</div>
      ${options ? `<div style="margin-top:5px;color:#77736c;font-size:11px;line-height:1.5">${options}</div>` : ""}
    </td>
    <td align="right" style="border-bottom:1px solid #292929;padding:15px 0;color:#f7f3ea;font-size:13px;font-weight:700;vertical-align:top">${formatMoney(item.lineTotalCents, currency)}</td>
  </tr>`;
}

function renderTotalRow(label: string, amountCents: number, currency: string) {
  return `<tr><td style="padding:5px 0;color:#a7a29a;font-size:12px">${label}</td><td align="right" style="padding:5px 0;color:#f7f3ea;font-size:12px">${formatMoney(amountCents, currency)}</td></tr>`;
}

function formatDeliveryAddress(delivery: OrderConfirmationEmailInput["delivery"]) {
  return [
    delivery.recipientName,
    delivery.streetLine1,
    delivery.streetLine2,
    `${delivery.city}, ${delivery.state} ${delivery.postalCode}`,
    delivery.countryCode,
  ].filter((line): line is string => Boolean(line?.trim()));
}

function formatFulfillmentMethod(method: OrderConfirmationEmailInput["fulfillmentMethod"]) {
  if (method === "OUT_OF_STATE_SHIPPING") return "Out-of-state shipping";
  if (method === "PICKUP") return "Pickup";
  return "Local delivery";
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function assertSafeOrderUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:")) {
    throw new Error("Order tracking URL must use HTTPS.");
  }
}

function assertOrderSummary(input: OrderConfirmationEmailInput) {
  const amounts = [
    input.subtotalCents,
    input.deliveryFeeCents,
    input.taxCents,
    input.totalCents,
  ];
  const validItems = input.items.length > 0 && input.items.every((item) => (
    Number.isSafeInteger(item.quantity)
    && item.quantity > 0
    && Number.isSafeInteger(item.lineTotalCents)
    && item.lineTotalCents >= 0
  ));
  const itemSubtotal = input.items.reduce((total, item) => total + item.lineTotalCents, 0);
  const datesAreValid = [
    input.requestedFulfillmentAt,
    input.deliveryWindowStart,
    input.deliveryWindowEnd,
  ].every((date) => date instanceof Date && !Number.isNaN(date.getTime()));

  if (
    !validItems
    || !amounts.every((amount) => Number.isSafeInteger(amount) && amount >= 0)
    || input.subtotalCents !== itemSubtotal
    || input.totalCents !== input.subtotalCents + input.deliveryFeeCents + input.taxCents
    || input.totalCents <= 0
    || !/^[A-Z]{3}$/.test(input.currency)
    || !datesAreValid
    || input.deliveryWindowEnd <= input.deliveryWindowStart
  ) {
    throw new Error("Order confirmation totals or delivery details are invalid.");
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character] ?? character;
  });
}
