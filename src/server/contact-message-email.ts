import "server-only";

export type ContactMessageEmailInput = {
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
  message: string;
  messageId: string;
  subject: string;
};

export function renderContactMessageEmail(input: ContactMessageEmailInput) {
  const subject = `New contact message — ${input.subject}`;
  const phone = input.customerPhone?.trim() || "Not provided";
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(subject)}</title></head>
  <body style="margin:0;background:#050505;color:#f7f3ea;font-family:Arial,Helvetica,sans-serif;padding:28px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;margin:0 auto;border:1px solid #292929;border-radius:22px;background:#111111">
      <tr><td style="padding:34px 30px">
        <div style="color:#e6a51a;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase">New contact message</div>
        <h1 style="margin:14px 0 0;color:#f7f3ea;font-size:30px;line-height:1.12">${escapeHtml(input.subject)}</h1>
        <p style="margin:12px 0 0;color:#a7a29a;font-size:14px;line-height:1.6">A customer message has been saved. Review it and respond using the details below.</p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;border:1px solid #292929;background:#090909">
          ${renderDetailRow("Customer", input.customerName)}
          ${renderDetailRow("Email", input.customerEmail)}
          ${renderDetailRow("Phone", phone)}
        </table>

        <div style="margin-top:24px;border-left:2px solid #f26a00;background:rgba(242,106,0,0.06);padding:16px 18px">
          <div style="color:#f26a00;font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase">Message</div>
          <div style="margin-top:8px;color:#f7f3ea;font-size:13px;line-height:1.7">${escapeHtml(input.message).replace(/\n/g, "<br>")}</div>
        </div>

        <p style="margin:24px 0 0;color:#77736c;font-size:10px;line-height:1.6">Message ID: ${escapeHtml(input.messageId)}</p>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = `NEW CONTACT MESSAGE\n\n${input.subject}\n\nCUSTOMER\n${input.customerName}\n${input.customerEmail}\n${phone}\n\nMESSAGE\n${input.message}\n\nMessage ID: ${input.messageId}`;

  return { html, subject, text };
}

function renderDetailRow(label: string, value: string) {
  return `<tr><td style="border-bottom:1px solid #292929;padding:15px;color:#8f8a81;font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;vertical-align:top">${escapeHtml(label)}</td><td style="border-bottom:1px solid #292929;padding:15px;color:#f7f3ea;font-size:13px;line-height:1.7">${escapeHtml(value)}</td></tr>`;
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
