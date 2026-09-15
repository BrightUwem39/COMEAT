-- Add structured operational estimates without changing the customer's requested window.
ALTER TABLE "Order"
ADD COLUMN "estimatedReadyAt" TIMESTAMPTZ(3),
ADD COLUMN "estimatedDeliveryAt" TIMESTAMPTZ(3);
