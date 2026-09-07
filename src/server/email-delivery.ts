import "server-only";

import { Resend } from "resend";

type TransactionalEmailInput = {
  html: string;
  idempotencyKey?: string;
  replyTo?: string;
  subject: string;
  text?: string;
  to: string | string[];
};

let resendClient: Resend | undefined;

export function isEmailDeliveryConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim()
    && process.env.AUTH_EMAIL_FROM?.trim(),
  );
}

export function getOrderNotificationEmail() {
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL?.trim();
  if (!recipient) return null;
  assertEmailAddress(recipient, "ORDER_NOTIFICATION_EMAIL");
  return recipient;
}

export async function sendTransactionalEmail(input: TransactionalEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.AUTH_EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    throw new Error("Transactional email delivery is not configured.");
  }
  if (!apiKey.startsWith("re_")) {
    throw new Error("RESEND_API_KEY must be a valid Resend API key.");
  }
  if (/\r|\n/.test(from) || !from.includes("@")) {
    throw new Error("AUTH_EMAIL_FROM must be a valid sender address.");
  }
  if (!input.subject.trim() || /\r|\n/.test(input.subject)) {
    throw new Error("Transactional email subject is invalid.");
  }
  if (!input.html.trim()) {
    throw new Error("Transactional email content is empty.");
  }

  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  if (recipients.length === 0) {
    throw new Error("Transactional email recipient is missing.");
  }
  recipients.forEach((recipient) => assertEmailAddress(recipient, "email recipient"));
  if (input.replyTo) {
    assertEmailAddress(input.replyTo, "reply-to address");
  }

  if (input.idempotencyKey && (input.idempotencyKey.length > 256 || /\r|\n/.test(input.idempotencyKey))) {
    throw new Error("Transactional email idempotency key is invalid.");
  }

  resendClient ??= new Resend(apiKey);
  const { data, error } = await resendClient.emails.send(
    {
      from,
      html: input.html,
      replyTo: input.replyTo,
      subject: input.subject.trim(),
      text: input.text,
      to: recipients,
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );

  if (error || !data?.id) {
    throw new Error("Transactional email delivery failed.");
  }

  return data.id;
}

function assertEmailAddress(value: string, field: string) {
  const address = value.trim();
  if (/\r|\n/.test(address) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    throw new Error(`${field} must be a valid email address.`);
  }
}
