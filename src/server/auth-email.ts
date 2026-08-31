import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";

type AuthEmailKind = "password-reset" | "verification";

type SendAuthEmailInput = {
  actionLabel: string;
  actionUrl: string;
  heading: string;
  kind: AuthEmailKind;
  message: string;
  subject: string;
  to: string;
};

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

function getTrustedOrigin() {
  const configured =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://127.0.0.1:3000";

  return new URL(configured).origin;
}

function assertTrustedActionUrl(actionUrl: string) {
  const url = new URL(actionUrl);

  if (url.origin !== getTrustedOrigin()) {
    throw new Error("Authentication email URL did not match the trusted application origin.");
  }
}

function renderEmail({
  actionLabel,
  actionUrl,
  heading,
  message,
}: Pick<SendAuthEmailInput, "actionLabel" | "actionUrl" | "heading" | "message">) {
  const safeUrl = escapeHtml(actionUrl);

  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
  <body style="margin:0;background:#080806;color:#f7f3ea;font-family:Arial,sans-serif;padding:32px 16px">
    <div style="max-width:560px;margin:0 auto;border:1px solid #302b21;border-radius:24px;background:#12110e;padding:40px">
      <p style="margin:0 0 24px;color:#dda448;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase">ComEat</p>
      <h1 style="margin:0;font-size:34px;line-height:1.08">${escapeHtml(heading)}</h1>
      <p style="margin:20px 0 28px;color:#b8b1a5;font-size:15px;line-height:1.7">${escapeHtml(message)}</p>
      <a href="${safeUrl}" style="display:inline-block;border-radius:12px;background:#dda448;color:#080806;font-size:12px;font-weight:700;letter-spacing:0.14em;padding:16px 24px;text-decoration:none;text-transform:uppercase">${escapeHtml(actionLabel)}</a>
      <p style="margin:28px 0 0;color:#817b70;font-size:12px;line-height:1.6">If you did not request this, you can safely ignore this email. This link will expire automatically.</p>
    </div>
  </body>
</html>`;
}

async function writeDevelopmentPreview(input: SendAuthEmailInput, html: string) {
  const previewDirectory = path.join(process.cwd(), ".next", "auth-mailbox");
  const fileName = `${input.kind}-${Date.now()}-${randomUUID()}.html`;

  await mkdir(previewDirectory, { recursive: true });
  await writeFile(path.join(previewDirectory, fileName), html, {
    encoding: "utf8",
    mode: 0o600,
  });
}

export async function sendAuthEmail(input: SendAuthEmailInput) {
  assertTrustedActionUrl(input.actionUrl);

  const html = renderEmail(input);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.AUTH_EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Authentication email delivery is not configured.");
    }

    await writeDevelopmentPreview(input, html);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html,
  });

  if (error) {
    throw new Error("Authentication email delivery failed.");
  }
}
