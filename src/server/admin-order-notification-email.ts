import "server-only";

export type AdminOrderNotificationEmailInput = {
  allergyDetails?: string | null;
  allergyDeclared: boolean;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string[];
  deliveryInstructions?: string | null;
  deliveryWindowEnd: Date;
  deliveryWindowStart: Date;
  fulfillmentMethod: "LOCAL_DELIVERY" | "OUT_OF_STATE_SHIPPING" | "PICKUP";
  items: Array<{
    lineTotalCents: number;
    modifiers: string[];
    name: string;
    quantity: number;
    variantLabel: string;
  }>;
  orderReference: string;
  requestedFulfillmentAt: Date;
  totalCents: number;
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

export function renderAdminOrderNotificationEmail(input: AdminOrderNotificationEmailInput) {
  const deliveryDate = dateFormatter.format(input.requestedFulfillmentAt);
  const deliveryWindow = `${timeFormatter.format(input.deliveryWindowStart)}–${timeFormatter.format(input.deliveryWindowEnd)} ET`;
  const fulfillment = input.fulfillmentMethod === "OUT_OF_STATE_SHIPPING"
    ? "Out-of-state shipping"
    : input.fulfillmentMethod === "PICKUP" ? "Pickup" : "Local delivery";
  const itemRows = input.items.map((item) => {
    const options = [item.variantLabel, ...item.modifiers].filter(Boolean).map(escapeHtml).join(" · ");
    return `<tr><td style="border-bottom:1px solid #292929;padding:13px 0;vertical-align:top"><strong style="color:#f7f3ea;font-size:14px">${item.quantity} × ${escapeHtml(item.name)}</strong>${options ? `<div style="margin-top:5px;color:#8f8a81;font-size:11px;line-height:1.5">${options}</div>` : ""}</td><td align="right" style="border-bottom:1px solid #292929;padding:13px 0;color:#f7f3ea;font-size:13px;vertical-align:top">${formatMoney(item.lineTotalCents, input.currency)}</td></tr>`;
  }).join("");
  const allergyMessage = input.allergyDeclared
    ? escapeHtml(input.allergyDetails?.trim() || "Customer declared an allergy without additional details.")
    : "No known allergies declared.";
  const plainTextItems = input.items.map((item) => {
    const options = [item.variantLabel, ...item.modifiers].filter(Boolean).join(" · ");
    return `${item.quantity} × ${item.name}${options ? ` (${options})` : ""} — ${formatMoney(item.lineTotalCents, input.currency)}`;
  }).join("\n");
  const subject = `New paid order — ${input.orderReference}`;
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(subject)}</title></head>
  <body style="margin:0;background:#050505;color:#f7f3ea;font-family:Arial,Helvetica,sans-serif;padding:28px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;margin:0 auto;border:1px solid #292929;border-radius:22px;background:#111111">
      <tr><td style="padding:34px 30px">
        <div style="color:#e6a51a;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase">New paid order</div>
        <h1 style="margin:14px 0 0;color:#f7f3ea;font-size:32px;line-height:1.08">${escapeHtml(input.orderReference)}</h1>
        <p style="margin:12px 0 0;color:#a7a29a;font-size:14px;line-height:1.6">Payment is verified. Review the preparation and delivery details below.</p>

        <div style="margin-top:24px;border-left:2px solid ${input.allergyDeclared ? "#f26a00" : "#e6a51a"};background:${input.allergyDeclared ? "rgba(242,106,0,0.08)" : "rgba(230,165,26,0.06)"};padding:14px 16px">
          <div style="color:${input.allergyDeclared ? "#f26a00" : "#e6a51a"};font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase">Allergy information</div>
          <div style="margin-top:7px;color:#f7f3ea;font-size:13px;line-height:1.6">${allergyMessage}</div>
        </div>

        <h2 style="margin:28px 0 0;color:#f7f3ea;font-size:18px">Order items</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;border-top:1px solid #292929">${itemRows}</table>
        <div style="margin-top:18px;text-align:right;color:#e6a51a;font-size:20px;font-weight:700">Total paid: ${formatMoney(input.totalCents, input.currency)}</div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;border:1px solid #292929;background:#090909">
          <tr><td style="padding:16px;color:#8f8a81;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase">Customer</td><td style="padding:16px;color:#f7f3ea;font-size:13px;line-height:1.7">${escapeHtml(input.customerName)}<br>${escapeHtml(input.customerEmail)}<br>${escapeHtml(input.customerPhone)}</td></tr>
          <tr><td style="border-top:1px solid #292929;padding:16px;color:#8f8a81;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase">Fulfillment</td><td style="border-top:1px solid #292929;padding:16px;color:#f7f3ea;font-size:13px;line-height:1.7">${escapeHtml(fulfillment)}<br>${escapeHtml(deliveryDate)}<br>${escapeHtml(deliveryWindow)}</td></tr>
          <tr><td style="border-top:1px solid #292929;padding:16px;color:#8f8a81;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase">Address</td><td style="border-top:1px solid #292929;padding:16px;color:#f7f3ea;font-size:13px;line-height:1.7">${input.deliveryAddress.map(escapeHtml).join("<br>")}</td></tr>
        </table>
        ${input.deliveryInstructions ? `<div style="margin-top:14px;color:#a7a29a;font-size:12px;line-height:1.7"><strong style="color:#f7f3ea">Delivery instructions:</strong><br>${escapeHtml(input.deliveryInstructions).replace(/\n/g, "<br>")}</div>` : ""}
      </td></tr>
    </table>
  </body>
</html>`;
  const instructions = input.deliveryInstructions ? `\nDelivery instructions:\n${input.deliveryInstructions}\n` : "";
  const text = `NEW PAID ORDER\n${input.orderReference}\n\nALLERGY INFORMATION\n${input.allergyDeclared ? input.allergyDetails?.trim() || "Customer declared an allergy without additional details." : "No known allergies declared."}\n\nORDER ITEMS\n${plainTextItems}\n\nTotal paid: ${formatMoney(input.totalCents, input.currency)}\n\nCUSTOMER\n${input.customerName}\n${input.customerEmail}\n${input.customerPhone}\n\nFULFILLMENT\n${fulfillment}\n${deliveryDate}\n${deliveryWindow}\n${input.deliveryAddress.join("\n")}\n${instructions}`;

  return { html, subject, text };
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}
