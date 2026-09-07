import "server-only";

export type CateringInquiryEmailInput = {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  eventDate: Date;
  eventType: string;
  guestCount: number;
  inquiryId: string;
  message: string;
  venue: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "America/New_York",
});

export function renderCateringInquiryEmail(input: CateringInquiryEmailInput) {
  const eventDate = dateFormatter.format(input.eventDate);
  const subject = `New catering inquiry — ${input.eventType} · ${eventDate}`;
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(subject)}</title></head>
  <body style="margin:0;background:#050505;color:#f7f3ea;font-family:Arial,Helvetica,sans-serif;padding:28px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;margin:0 auto;border:1px solid #292929;border-radius:22px;background:#111111">
      <tr><td style="padding:34px 30px">
        <div style="color:#e6a51a;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase">New catering inquiry</div>
        <h1 style="margin:14px 0 0;color:#f7f3ea;font-size:32px;line-height:1.08">${escapeHtml(input.eventType)}</h1>
        <p style="margin:12px 0 0;color:#a7a29a;font-size:14px;line-height:1.6">A new event request has been saved. Review the details and contact the customer.</p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;border:1px solid #292929;background:#090909">
          ${renderDetailRow("Event date", eventDate)}
          ${renderDetailRow("Estimated guests", String(input.guestCount))}
          ${renderDetailRow("Venue", input.venue)}
          ${renderDetailRow("Customer", `${input.customerName}\n${input.customerEmail}\n${input.customerPhone}`)}
        </table>

        <div style="margin-top:24px;border-left:2px solid #f26a00;background:rgba(242,106,0,0.06);padding:16px 18px">
          <div style="color:#f26a00;font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase">Event details and considerations</div>
          <div style="margin-top:8px;color:#f7f3ea;font-size:13px;line-height:1.7">${escapeHtml(input.message).replace(/\n/g, "<br>")}</div>
        </div>

        <p style="margin:24px 0 0;color:#77736c;font-size:10px;line-height:1.6">Inquiry ID: ${escapeHtml(input.inquiryId)}</p>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = `NEW CATERING INQUIRY\n\n${input.eventType}\nEvent date: ${eventDate}\nEstimated guests: ${input.guestCount}\nVenue: ${input.venue}\n\nCUSTOMER\n${input.customerName}\n${input.customerEmail}\n${input.customerPhone}\n\nEVENT DETAILS AND CONSIDERATIONS\n${input.message}\n\nInquiry ID: ${input.inquiryId}`;

  return { html, subject, text };
}

function renderDetailRow(label: string, value: string) {
  return `<tr><td style="border-bottom:1px solid #292929;padding:15px;color:#8f8a81;font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;vertical-align:top">${escapeHtml(label)}</td><td style="border-bottom:1px solid #292929;padding:15px;color:#f7f3ea;font-size:13px;line-height:1.7">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`;
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
