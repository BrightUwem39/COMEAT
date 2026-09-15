"use server";

import { revalidatePath } from "next/cache";

import type { PromotionType } from "@/generated/prisma/client";
import { writeAdminAuditLog } from "@/server/admin-audit";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export type PromotionFormState = { message: string; status: "error" | "idle" | "success" };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,23}$/;
const MONEY_PATTERN = /^\d{1,5}(?:\.\d{1,2})?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TYPES = new Set<PromotionType>(["PERCENTAGE", "FIXED_AMOUNT", "FREE_DELIVERY"]);

export async function createPromotionAction(_state: PromotionFormState, formData: FormData): Promise<PromotionFormState> {
  const admin = await assertCurrentAdmin("PROMOTIONS_MANAGE");
  const parsed = parsePromotion(formData);
  if ("error" in parsed) return parsed.error;
  const duplicate = await db.promotion.findUnique({ where: { code: parsed.data.code }, select: { id: true } });
  if (duplicate) return { message: "That promotion code is already in use.", status: "error" };

  const promotion = await db.$transaction(async (transaction) => {
    const created = await transaction.promotion.create({ data: parsed.data });
    await writeAdminAuditLog(transaction, {
      action: "PROMOTION_CREATED",
      actorUserId: admin.userId,
      afterData: auditData(created),
      beforeData: {},
      entityId: created.id,
      entityType: "PROMOTION",
    });
    return created;
  });
  revalidatePromotionPages();
  return { message: `${promotion.code} is ready.`, status: "success" };
}

export async function updatePromotionAction(_state: PromotionFormState, formData: FormData): Promise<PromotionFormState> {
  const admin = await assertCurrentAdmin("PROMOTIONS_MANAGE");
  const promotionId = String(formData.get("promotionId") ?? "");
  const updatedAt = new Date(String(formData.get("promotionUpdatedAt") ?? ""));
  if (!UUID_PATTERN.test(promotionId) || Number.isNaN(updatedAt.getTime())) return { message: "This promotion could not be validated. Refresh and try again.", status: "error" };
  const parsed = parsePromotion(formData);
  if ("error" in parsed) return parsed.error;

  const result = await db.$transaction(async (transaction) => {
    const current = await transaction.promotion.findUnique({ where: { id: promotionId } });
    if (!current) return { message: "This promotion no longer exists.", status: "error" as const };
    const duplicate = await transaction.promotion.findFirst({ where: { code: parsed.data.code, id: { not: promotionId } }, select: { id: true } });
    if (duplicate) return { message: "That promotion code is already in use.", status: "error" as const };
    const updated = await transaction.promotion.updateMany({ where: { id: promotionId, updatedAt }, data: parsed.data });
    if (updated.count !== 1) return { message: "This promotion changed while you were editing it. Refresh and try again.", status: "error" as const };
    const saved = await transaction.promotion.findUniqueOrThrow({ where: { id: promotionId } });
    await writeAdminAuditLog(transaction, {
      action: "PROMOTION_UPDATED",
      actorUserId: admin.userId,
      afterData: auditData(saved),
      beforeData: auditData(current),
      entityId: saved.id,
      entityType: "PROMOTION",
    });
    return { message: `${saved.code} was updated.`, status: "success" as const };
  });
  if (result.status === "success") revalidatePromotionPages();
  return result;
}

function parsePromotion(formData: FormData): { data: { active: boolean; amountOffCents: number | null; code: string; expiresAt: Date | null; minimumOrderCents: number; name: string; percentageOff: number | null; startsAt: Date | null; type: PromotionType; usageLimit: number | null } } | { error: PromotionFormState } {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as PromotionType;
  const value = String(formData.get("value") ?? "").trim();
  const minimumOrder = String(formData.get("minimumOrder") ?? "").trim() || "0";
  const usageLimitInput = String(formData.get("usageLimit") ?? "").trim();
  const startsOn = String(formData.get("startsOn") ?? "").trim();
  const expiresOn = String(formData.get("expiresOn") ?? "").trim();

  if (!CODE_PATTERN.test(code)) return { error: { message: "Use 3–24 letters, numbers, hyphens, or underscores for the code.", status: "error" } };
  if (name.length < 2 || name.length > 80) return { error: { message: "Enter a promotion name between 2 and 80 characters.", status: "error" } };
  if (!TYPES.has(type)) return { error: { message: "Choose a valid discount type.", status: "error" } };
  if (!MONEY_PATTERN.test(minimumOrder) || Number(minimumOrder) > 10_000) return { error: { message: "Minimum order must be between $0 and $10,000.", status: "error" } };
  const minimumOrderCents = Math.round(Number(minimumOrder) * 100);
  let percentageOff: number | null = null;
  let amountOffCents: number | null = null;
  if (type === "PERCENTAGE") {
    if (!/^\d{1,3}$/.test(value) || Number(value) < 1 || Number(value) > 100) return { error: { message: "Percentage discounts must be between 1% and 100%.", status: "error" } };
    percentageOff = Number(value);
  } else if (type === "FIXED_AMOUNT") {
    if (!MONEY_PATTERN.test(value) || Number(value) <= 0 || Number(value) > 10_000) return { error: { message: "Fixed discounts must be between $0.01 and $10,000.", status: "error" } };
    amountOffCents = Math.round(Number(value) * 100);
  }
  const usageLimit = usageLimitInput ? Number(usageLimitInput) : null;
  if (usageLimit !== null && (!/^\d{1,7}$/.test(usageLimitInput) || usageLimit < 1 || usageLimit > 1_000_000)) return { error: { message: "Usage limit must be between 1 and 1,000,000.", status: "error" } };
  if ((startsOn && !DATE_PATTERN.test(startsOn)) || (expiresOn && !DATE_PATTERN.test(expiresOn))) return { error: { message: "Enter valid promotion dates.", status: "error" } };
  const startsAt = startsOn ? easternDateBoundary(startsOn) : null;
  const expiresAt = expiresOn ? easternDateBoundary(expiresOn, 1) : null;
  if ((startsAt && Number.isNaN(startsAt.getTime())) || (expiresAt && Number.isNaN(expiresAt.getTime())) || (startsAt && expiresAt && startsAt >= expiresAt)) return { error: { message: "The end date must be after the start date.", status: "error" } };

  return { data: { active: formData.get("active") === "on", amountOffCents, code, expiresAt, minimumOrderCents, name, percentageOff, startsAt, type, usageLimit } };
}

function easternDateBoundary(value: string, dayOffset = 0) {
  const [year, month, day] = value.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1, day + dayOffset));
  const formatter = new Intl.DateTimeFormat("en-US", { day: "numeric", hour: "numeric", hourCycle: "h23", month: "numeric", timeZone: "America/New_York", year: "numeric" });
  let candidate = new Date(target);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = formatter.formatToParts(candidate);
    const read = (type: "day" | "hour" | "month" | "year") => Number(parts.find((part) => part.type === type)?.value);
    const rendered = Date.UTC(read("year"), read("month") - 1, read("day"), read("hour"));
    candidate = new Date(candidate.getTime() + target.getTime() - rendered);
  }
  return candidate;
}

function auditData(promotion: { active: boolean; amountOffCents: number | null; code: string; expiresAt: Date | null; minimumOrderCents: number; name: string; percentageOff: number | null; startsAt: Date | null; type: PromotionType; usageLimit: number | null }) {
  return { active: promotion.active, amountOffCents: promotion.amountOffCents, code: promotion.code, expiresAt: promotion.expiresAt?.toISOString() ?? null, minimumOrderCents: promotion.minimumOrderCents, name: promotion.name, percentageOff: promotion.percentageOff, startsAt: promotion.startsAt?.toISOString() ?? null, type: promotion.type, usageLimit: promotion.usageLimit };
}

function revalidatePromotionPages() {
  revalidatePath("/admin/promotions");
  revalidatePath("/admin/activity");
}
