"use server";

import { revalidatePath } from "next/cache";

import type { InventoryAdjustmentType } from "@/generated/prisma/client";
import { writeAdminAuditLog } from "@/server/admin-audit";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export type InventoryActionState = { message: string; status: "error" | "idle" | "success" };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const QUANTITY_PATTERN = /^\d{1,8}(?:\.\d{1,3})?$/;
const SIGNED_QUANTITY_PATTERN = /^-?\d{1,8}(?:\.\d{1,3})?$/;
const MONEY_PATTERN = /^\d{1,5}(?:\.\d{1,2})?$/;
const ADJUSTMENT_TYPES = new Set<InventoryAdjustmentType>(["RESTOCK", "WASTE", "CORRECTION"]);

export async function createInventoryItemAction(_state: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  const admin = await assertCurrentAdmin("INVENTORY_MANAGE");
  const parsed = parseItemSettings(formData, true);
  if ("error" in parsed) return parsed.error;
  const duplicate = await db.inventoryItem.findFirst({ where: { name: { equals: parsed.data.name, mode: "insensitive" } }, select: { id: true } });
  if (duplicate) return { message: "An inventory item with that name already exists.", status: "error" };

  const item = await db.$transaction(async (transaction) => {
    const created = await transaction.inventoryItem.create({ data: parsed.data });
    if (created.quantity.greaterThan(0)) {
      await transaction.inventoryAdjustment.create({ data: { actorUserId: admin.userId, balanceAfter: created.quantity, delta: created.quantity, itemId: created.id, note: "Opening stock", type: "RESTOCK" } });
    }
    await writeAdminAuditLog(transaction, { action: "INVENTORY_ITEM_CREATED", actorUserId: admin.userId, afterData: inventoryAuditData(created), beforeData: {}, entityId: created.id, entityType: "INVENTORY_ITEM" });
    return created;
  });
  revalidateInventoryPages();
  return { message: `${item.name} is now tracked.`, status: "success" };
}

export async function updateInventoryItemAction(_state: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  const admin = await assertCurrentAdmin("INVENTORY_MANAGE");
  const identity = parseIdentity(formData);
  if ("error" in identity) return identity.error;
  const parsed = parseItemSettings(formData, false);
  if ("error" in parsed) return parsed.error;

  const result = await db.$transaction(async (transaction) => {
    const current = await transaction.inventoryItem.findUnique({ where: { id: identity.id } });
    if (!current) return { message: "This inventory item no longer exists.", status: "error" as const };
    const duplicate = await transaction.inventoryItem.findFirst({ where: { id: { not: identity.id }, name: { equals: parsed.data.name, mode: "insensitive" } }, select: { id: true } });
    if (duplicate) return { message: "An inventory item with that name already exists.", status: "error" as const };
    const updated = await transaction.inventoryItem.updateMany({ where: { id: identity.id, updatedAt: identity.updatedAt }, data: { active: parsed.data.active, lowStockThreshold: parsed.data.lowStockThreshold, name: parsed.data.name, unit: parsed.data.unit, unitCostCents: parsed.data.unitCostCents } });
    if (updated.count !== 1) return { message: "This item changed while you were editing it. Refresh and try again.", status: "error" as const };
    const saved = await transaction.inventoryItem.findUniqueOrThrow({ where: { id: identity.id } });
    await writeAdminAuditLog(transaction, { action: "INVENTORY_ITEM_UPDATED", actorUserId: admin.userId, afterData: inventoryAuditData(saved), beforeData: inventoryAuditData(current), entityId: saved.id, entityType: "INVENTORY_ITEM" });
    return { message: `${saved.name} was updated.`, status: "success" as const };
  });
  if (result.status === "success") revalidateInventoryPages();
  return result;
}

export async function adjustInventoryStockAction(_state: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  const admin = await assertCurrentAdmin("INVENTORY_MANAGE");
  const identity = parseIdentity(formData);
  if ("error" in identity) return identity.error;
  const type = String(formData.get("adjustmentType") ?? "") as InventoryAdjustmentType;
  const rawAmount = String(formData.get("amount") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim().slice(0, 240);
  if (!ADJUSTMENT_TYPES.has(type)) return { message: "Choose a valid stock action.", status: "error" };
  const pattern = type === "CORRECTION" ? QUANTITY_PATTERN : SIGNED_QUANTITY_PATTERN;
  if (!pattern.test(rawAmount) || Number(rawAmount) <= 0 || Number(rawAmount) > 99_999_999) return { message: type === "CORRECTION" ? "Enter the corrected stock quantity." : "Enter a positive quantity to adjust.", status: "error" };
  if (type === "WASTE" && note.length < 3) return { message: "Add a brief reason for recorded waste.", status: "error" };

  const result = await db.$transaction(async (transaction) => {
    const current = await transaction.inventoryItem.findUnique({ where: { id: identity.id } });
    if (!current) return { message: "This inventory item no longer exists.", status: "error" as const };
    const currentQuantity = current.quantity.toNumber();
    const entered = Number(rawAmount);
    const nextQuantity = type === "CORRECTION" ? entered : type === "RESTOCK" ? currentQuantity + entered : currentQuantity - entered;
    if (nextQuantity < 0) return { message: `Only ${formatQuantity(currentQuantity)} ${current.unit} is available to remove.`, status: "error" as const };
    const delta = Number((nextQuantity - currentQuantity).toFixed(3));
    if (delta === 0) return { message: "The corrected quantity is unchanged.", status: "error" as const };
    const updated = await transaction.inventoryItem.updateMany({ where: { id: current.id, updatedAt: identity.updatedAt }, data: { quantity: nextQuantity } });
    if (updated.count !== 1) return { message: "Stock changed while you were editing it. Refresh and try again.", status: "error" as const };
    await transaction.inventoryAdjustment.create({ data: { actorUserId: admin.userId, balanceAfter: nextQuantity, delta, itemId: current.id, note: note || null, type } });
    await writeAdminAuditLog(transaction, { action: "INVENTORY_STOCK_ADJUSTED", actorUserId: admin.userId, afterData: { balance: nextQuantity, delta, name: current.name, type, unit: current.unit }, beforeData: { balance: currentQuantity, name: current.name, unit: current.unit }, entityId: current.id, entityType: "INVENTORY_ITEM" });
    return { message: `${current.name} now has ${formatQuantity(nextQuantity)} ${current.unit}.`, status: "success" as const };
  });
  if (result.status === "success") revalidateInventoryPages();
  return result;
}

function parseIdentity(formData: FormData): { id: string; updatedAt: Date } | { error: InventoryActionState } {
  const id = String(formData.get("inventoryItemId") ?? "");
  const updatedAt = new Date(String(formData.get("inventoryItemUpdatedAt") ?? ""));
  if (!UUID_PATTERN.test(id) || Number.isNaN(updatedAt.getTime())) return { error: { message: "This inventory item could not be validated. Refresh and try again.", status: "error" } };
  return { id, updatedAt };
}

function parseItemSettings(formData: FormData, includeQuantity: boolean): { data: { active: boolean; lowStockThreshold: number; name: string; quantity: number; unit: string; unitCostCents: number } } | { error: InventoryActionState } {
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const quantityInput = includeQuantity ? String(formData.get("quantity") ?? "").trim() : "0";
  const thresholdInput = String(formData.get("lowStockThreshold") ?? "").trim();
  const unitCostInput = String(formData.get("unitCost") ?? "").trim() || "0";
  if (name.length < 2 || name.length > 80) return { error: { message: "Enter an ingredient name between 2 and 80 characters.", status: "error" } };
  if (unit.length < 1 || unit.length > 20) return { error: { message: "Enter a short stock unit such as lb, kg, bottle, or tray.", status: "error" } };
  if (!QUANTITY_PATTERN.test(quantityInput) || !QUANTITY_PATTERN.test(thresholdInput)) return { error: { message: "Stock quantities can use up to three decimal places.", status: "error" } };
  if (!MONEY_PATTERN.test(unitCostInput) || Number(unitCostInput) > 10_000) return { error: { message: "Unit cost must be between $0 and $10,000.", status: "error" } };
  return { data: { active: formData.get("active") === "on", lowStockThreshold: Number(thresholdInput), name, quantity: Number(quantityInput), unit, unitCostCents: Math.round(Number(unitCostInput) * 100) } };
}

function inventoryAuditData(item: { active: boolean; lowStockThreshold: { toString(): string }; name: string; quantity: { toString(): string }; unit: string; unitCostCents: number }) {
  return { active: item.active, lowStockThreshold: item.lowStockThreshold.toString(), name: item.name, quantity: item.quantity.toString(), unit: item.unit, unitCostCents: item.unitCostCents };
}

function revalidateInventoryPages() { revalidatePath("/admin/inventory"); revalidatePath("/admin/activity"); }
function formatQuantity(value: number) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value); }
