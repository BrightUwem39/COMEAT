-- Add delivery PIN notifications and record successful customer verification.
ALTER TYPE "OrderEmailKind" ADD VALUE 'DELIVERY_PIN';

CREATE TYPE "DeliveryConfirmationMethod" AS ENUM ('PIN');

ALTER TABLE "Order"
ADD COLUMN "deliveryConfirmedAt" TIMESTAMPTZ(3),
ADD COLUMN "deliveryConfirmationMethod" "DeliveryConfirmationMethod";
