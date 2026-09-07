-- CreateTable
CREATE TABLE "PublicFormRateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PublicFormRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "PublicFormRateLimit_updatedAt_idx" ON "PublicFormRateLimit"("updatedAt");

-- AddConstraint
ALTER TABLE "PublicFormRateLimit"
ADD CONSTRAINT "PublicFormRateLimit_count_nonnegative" CHECK ("count" >= 0);
