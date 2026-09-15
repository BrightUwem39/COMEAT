import "server-only";

import { cache } from "react";

import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

const BUSINESS_TIME_ZONE = "America/New_York";

export const getAdminPromotions = cache(async () => {
  await assertCurrentAdmin("PROMOTIONS_MANAGE");
  const now = new Date();
  const promotions = await db.promotion.findMany({ orderBy: [{ active: "desc" }, { createdAt: "desc" }] });

  return {
    activeNow: promotions.filter((promotion) => getPromotionStatus(promotion, now) === "ACTIVE").length,
    expired: promotions.filter((promotion) => getPromotionStatus(promotion, now) === "EXPIRED").length,
    promotions: promotions.map((promotion) => ({
      ...promotion,
      amountOffCents: promotion.amountOffCents,
      createdAt: promotion.createdAt.toISOString(),
      expiresAt: promotion.expiresAt?.toISOString() ?? null,
      expiresOn: promotion.expiresAt ? formatDateInput(new Date(promotion.expiresAt.getTime() - 1)) : "",
      startsAt: promotion.startsAt?.toISOString() ?? null,
      startsOn: promotion.startsAt ? formatDateInput(promotion.startsAt) : "",
      status: getPromotionStatus(promotion, now),
      updatedAt: promotion.updatedAt.toISOString(),
    })),
    total: promotions.length,
    totalRedemptions: promotions.reduce((total, promotion) => total + promotion.redemptionCount, 0),
  };
});

function getPromotionStatus(promotion: { active: boolean; expiresAt: Date | null; redemptionCount: number; startsAt: Date | null; usageLimit: number | null }, now: Date) {
  if (!promotion.active) return "PAUSED" as const;
  if (promotion.usageLimit !== null && promotion.redemptionCount >= promotion.usageLimit) return "LIMIT_REACHED" as const;
  if (promotion.expiresAt && promotion.expiresAt <= now) return "EXPIRED" as const;
  if (promotion.startsAt && promotion.startsAt > now) return "SCHEDULED" as const;
  return "ACTIVE" as const;
}

function formatDateInput(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "2-digit", timeZone: BUSINESS_TIME_ZONE, year: "numeric" }).formatToParts(date);
  const read = (type: "day" | "month" | "year") => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}`;
}
