CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_DELIVERY');

CREATE TABLE "Promotion" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL,
    "percentageOff" INTEGER,
    "amountOffCents" INTEGER,
    "minimumOrderCents" INTEGER NOT NULL DEFAULT 0,
    "usageLimit" INTEGER,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Promotion_discount_check" CHECK (
      ("type" = 'PERCENTAGE' AND "percentageOff" BETWEEN 1 AND 100 AND "amountOffCents" IS NULL)
      OR ("type" = 'FIXED_AMOUNT' AND "amountOffCents" > 0 AND "percentageOff" IS NULL)
      OR ("type" = 'FREE_DELIVERY' AND "percentageOff" IS NULL AND "amountOffCents" IS NULL)
    ),
    CONSTRAINT "Promotion_minimum_order_check" CHECK ("minimumOrderCents" >= 0),
    CONSTRAINT "Promotion_usage_check" CHECK ("usageLimit" IS NULL OR "usageLimit" > 0),
    CONSTRAINT "Promotion_date_check" CHECK ("startsAt" IS NULL OR "expiresAt" IS NULL OR "startsAt" < "expiresAt")
);

CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");
CREATE INDEX "Promotion_active_startsAt_expiresAt_idx" ON "Promotion"("active", "startsAt", "expiresAt");
CREATE INDEX "Promotion_createdAt_idx" ON "Promotion"("createdAt");
