CREATE TYPE "InventoryAdjustmentType" AS ENUM ('RESTOCK', 'WASTE', 'CORRECTION', 'ORDER_USAGE');

CREATE TABLE "InventoryItem" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "lowStockThreshold" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "unitCostCents" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InventoryItem_quantity_check" CHECK ("quantity" >= 0),
    CONSTRAINT "InventoryItem_threshold_check" CHECK ("lowStockThreshold" >= 0),
    CONSTRAINT "InventoryItem_cost_check" CHECK ("unitCostCents" >= 0)
);

CREATE TABLE "InventoryAdjustment" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "type" "InventoryAdjustmentType" NOT NULL,
    "delta" DECIMAL(12,3) NOT NULL,
    "balanceAfter" DECIMAL(12,3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAdjustment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InventoryAdjustment_delta_check" CHECK ("delta" <> 0),
    CONSTRAINT "InventoryAdjustment_balance_check" CHECK ("balanceAfter" >= 0)
);

CREATE UNIQUE INDEX "InventoryItem_name_key" ON "InventoryItem"("name");
CREATE INDEX "InventoryItem_active_name_idx" ON "InventoryItem"("active", "name");
CREATE INDEX "InventoryAdjustment_itemId_createdAt_idx" ON "InventoryAdjustment"("itemId", "createdAt");
CREATE INDEX "InventoryAdjustment_actorUserId_createdAt_idx" ON "InventoryAdjustment"("actorUserId", "createdAt");
CREATE INDEX "InventoryAdjustment_type_createdAt_idx" ON "InventoryAdjustment"("type", "createdAt");

ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
