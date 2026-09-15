import "server-only";

import { cache } from "react";

import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export const getAdminInventory = cache(async () => {
  await assertCurrentAdmin("INVENTORY_MANAGE");
  const [items, adjustments] = await Promise.all([
    db.inventoryItem.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] }),
    db.inventoryAdjustment.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        actor: { select: { firstName: true, lastName: true } },
        balanceAfter: true,
        createdAt: true,
        delta: true,
        id: true,
        item: { select: { name: true, unit: true } },
        note: true,
        type: true,
      },
      take: 12,
    }),
  ]);

  const mappedItems = items.map((item) => {
    const quantity = item.quantity.toNumber();
    const lowStockThreshold = item.lowStockThreshold.toNumber();
    return {
      active: item.active,
      id: item.id,
      lowStockThreshold,
      name: item.name,
      quantity,
      status: !item.active ? "INACTIVE" as const : quantity <= 0 ? "OUT" as const : quantity <= lowStockThreshold ? "LOW" as const : "HEALTHY" as const,
      unit: item.unit,
      unitCostCents: item.unitCostCents,
      updatedAt: item.updatedAt.toISOString(),
    };
  });

  return {
    adjustments: adjustments.map((adjustment) => ({
      actorName: `${adjustment.actor.firstName} ${adjustment.actor.lastName}`,
      balanceAfter: adjustment.balanceAfter.toNumber(),
      createdAt: adjustment.createdAt.toISOString(),
      delta: adjustment.delta.toNumber(),
      id: adjustment.id,
      itemName: adjustment.item.name,
      note: adjustment.note,
      type: adjustment.type,
      unit: adjustment.item.unit,
    })),
    inventoryValueCents: mappedItems.reduce((total, item) => total + Math.round(item.quantity * item.unitCostCents), 0),
    items: mappedItems,
    lowStock: mappedItems.filter((item) => item.status === "LOW").length,
    outOfStock: mappedItems.filter((item) => item.status === "OUT").length,
    total: mappedItems.length,
  };
});
