import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";

import { db } from "@/server/db";

type PublicForm = "catering" | "contact";

type RateLimitRecord = {
  count: number;
  windowStartedAt: Date;
};

type Limit = {
  maximum: number;
  windowMs: number;
};

const IP_LIMIT: Limit = { maximum: 5, windowMs: 15 * 60 * 1_000 };
const EMAIL_LIMIT: Limit = { maximum: 3, windowMs: 60 * 60 * 1_000 };
const MINIMUM_COMPLETION_MS = 800;

export function isAutomatedFormSubmission(formData: FormData) {
  const honeypot = getFormValue(formData, "companyWebsite").trim();
  if (honeypot) return true;

  const startedAtValue = getFormValue(formData, "formStartedAt").trim();
  if (!startedAtValue) return false;

  const startedAt = Number(startedAtValue);
  if (!Number.isSafeInteger(startedAt) || startedAt <= 0) return true;

  const elapsed = Date.now() - startedAt;
  return elapsed < MINIMUM_COMPLETION_MS || elapsed < 0;
}

export async function checkPublicFormRateLimit(form: PublicForm, email: string) {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientAddress = forwardedFor || headerList.get("x-real-ip")?.trim() || "unknown";
  const userAgent = headerList.get("user-agent")?.slice(0, 256) || "unknown";
  const normalizedEmail = email.trim().toLowerCase();

  const [ipResult, emailResult] = await Promise.all([
    consumeLimit(createPrivateKey(`${form}:ip`, `${clientAddress}|${userAgent}`), IP_LIMIT),
    consumeLimit(createPrivateKey(`${form}:email`, normalizedEmail), EMAIL_LIMIT),
  ]);
  const blockedResults = [ipResult, emailResult].filter((result) => !result.allowed);

  return {
    allowed: blockedResults.length === 0,
    retryAfterSeconds: blockedResults.length
      ? Math.max(...blockedResults.map((result) => result.retryAfterSeconds))
      : 0,
  };
}

async function consumeLimit(key: string, limit: Limit) {
  const now = new Date();
  const resetBefore = new Date(now.getTime() - limit.windowMs);
  const records = await db.$queryRaw<RateLimitRecord[]>`
    INSERT INTO "PublicFormRateLimit" (
      "key", "count", "windowStartedAt", "createdAt", "updatedAt"
    )
    VALUES (${key}, 1, ${now}, ${now}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "PublicFormRateLimit"."windowStartedAt" <= ${resetBefore} THEN 1
        ELSE "PublicFormRateLimit"."count" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "PublicFormRateLimit"."windowStartedAt" <= ${resetBefore} THEN ${now}
        ELSE "PublicFormRateLimit"."windowStartedAt"
      END,
      "updatedAt" = ${now}
    RETURNING "count", "windowStartedAt"
  `;
  const record = records[0];
  if (!record) throw new Error("The form rate limit could not be evaluated.");

  return {
    allowed: record.count <= limit.maximum,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((record.windowStartedAt.getTime() + limit.windowMs - now.getTime()) / 1_000),
    ),
  };
}

function createPrivateKey(scope: string, value: string) {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret) throw new Error("The form rate-limit secret is not configured.");
  return `${scope}:${createHmac("sha256", secret).update(value).digest("hex")}`;
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
