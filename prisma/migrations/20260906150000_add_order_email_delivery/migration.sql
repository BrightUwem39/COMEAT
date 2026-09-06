-- CreateEnum
CREATE TYPE "OrderEmailKind" AS ENUM ('CUSTOMER_CONFIRMATION', 'ADMIN_NOTIFICATION');

-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "OrderEmailDelivery" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "kind" "OrderEmailKind" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "claimToken" TEXT,
    "lastAttemptAt" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3),
    "providerMessageId" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OrderEmailDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderEmailDelivery_orderId_kind_key" ON "OrderEmailDelivery"("orderId", "kind");

-- CreateIndex
CREATE INDEX "OrderEmailDelivery_status_lastAttemptAt_idx" ON "OrderEmailDelivery"("status", "lastAttemptAt");

-- AddForeignKey
ALTER TABLE "OrderEmailDelivery" ADD CONSTRAINT "OrderEmailDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddConstraint
ALTER TABLE "OrderEmailDelivery"
ADD CONSTRAINT "OrderEmailDelivery_attemptCount_nonnegative" CHECK ("attemptCount" >= 0);
