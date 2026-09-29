import "server-only";

export type DeliveryPinEmailInput = {
  customerFirstName: string;
  deliveryPin: string;
  orderReference: string;
  orderUrl: string;
};

export function renderDeliveryPinEmail(input: DeliveryPinEmailInput) {
  assertSafeOrderUrl(input.orderUrl);
  if (!/^\d{4}$/.test(input.deliveryPin)) {
    throw new Error("Delivery PIN must contain four digits.");
  }

  const customerFirstName = escapeHtml(input.customerFirstName);
  const orderReference = escapeHtml(input.orderReference);
  const deliveryPin = escapeHtml(input.deliveryPin);
  const orderUrl = escapeHtml(input.orderUrl);
  const subject = `Your delivery PIN - ${input.orderReference}`;
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(subject)}</title></head>
  <body style="margin:0;background:#050505;color:#f7f3ea;font-family:Arial,Helvetica,sans-serif;padding:28px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;margin:0 auto;border:1px solid #292929;border-radius:22px;background:#111111">
      <tr><td style="padding:38px 30px">
        <div style="color:#e6a51a;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase">ComEat delivery</div>
        <h1 style="margin:16px 0 0;color:#f7f3ea;font-size:34px;line-height:1.08">Your food is on the way.</h1>
        <p style="margin:16px 0 0;color:#a7a29a;font-size:14px;line-height:1.7">Hi ${customerFirstName}, use this PIN to confirm order ${orderReference} only after your food has been handed to you.</p>
        <div style="margin-top:28px;border:1px solid rgba(230,165,26,0.42);border-radius:16px;background:rgba(230,165,26,0.07);padding:24px;text-align:center">
          <div style="color:#a7a29a;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase">Delivery PIN</div>
          <div style="margin-top:10px;color:#e6a51a;font-size:38px;font-weight:700;letter-spacing:0.22em">${deliveryPin}</div>
        </div>
        <p style="margin:18px 0 0;color:#f26a00;font-size:12px;line-height:1.7"><strong>Do not share this code before receiving your order.</strong> ComEat uses it as proof that the delivery reached you.</p>
        <a href="${orderUrl}" style="display:inline-block;margin-top:28px;border-radius:10px;background:#e6a51a;color:#050505;font-size:11px;font-weight:700;letter-spacing:0.14em;padding:15px 22px;text-decoration:none;text-transform:uppercase">Track your order</a>
        <p style="margin:24px 0 0;color:#77736c;font-size:11px;line-height:1.7">Questions? Call ComEat at 404-518-2891.</p>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = `ComEat\n\nYour food is on the way.\n\nHi ${input.customerFirstName}, use this PIN to confirm order ${input.orderReference} only after your food has been handed to you.\n\nDELIVERY PIN: ${input.deliveryPin}\n\nDo not share this code before receiving your order. ComEat uses it as proof that the delivery reached you.\n\nTrack your order: ${input.orderUrl}\n\nQuestions? Call 404-518-2891.`;

  return { html, subject, text };
}

function assertSafeOrderUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:")) {
    throw new Error("Order tracking URL must use HTTPS.");
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
