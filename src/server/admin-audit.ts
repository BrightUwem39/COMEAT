import "server-only";

import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export const adminAuditActionLabels = {
  CUSTOMER_ACCESS_UPDATED: "Customer access updated",
  INQUIRY_UPDATED: "Enquiry updated",
  INVENTORY_ITEM_CREATED: "Inventory item created",
  INVENTORY_ITEM_UPDATED: "Inventory item updated",
  INVENTORY_STOCK_ADJUSTED: "Inventory stock adjusted",
  MENU_PRODUCT_UPDATED: "Menu dish updated",
  ORDER_STATUS_UPDATED: "Order status updated",
  PAYMENT_REFUND_ISSUED: "Payment refund issued",
  PROMOTION_CREATED: "Promotion created",
  PROMOTION_UPDATED: "Promotion updated",
  STAFF_ACCESS_UPDATED: "Staff access updated",
} as const;

export const adminAuditEntityLabels = {
  CATERING_INQUIRY: "Catering enquiry",
  CONTACT_MESSAGE: "Contact message",
  CUSTOMER: "Customer",
  INVENTORY_ITEM: "Inventory item",
  ORDER: "Order",
  PRODUCT: "Menu dish",
  PROMOTION: "Promotion",
  STAFF: "Staff member",
} as const;

export type AdminAuditAction = keyof typeof adminAuditActionLabels;
export type AdminAuditEntityType = keyof typeof adminAuditEntityLabels;

export async function writeAdminAuditLog(
  transaction: Prisma.TransactionClient,
  input: {
    action: AdminAuditAction;
    actorUserId: string;
    afterData: Prisma.InputJsonValue;
    beforeData: Prisma.InputJsonValue;
    entityId: string;
    entityType: AdminAuditEntityType;
  },
) {
  await transaction.adminAuditLog.create({ data: input });
}

const PAGE_SIZE = 15;

export const getAdminAuditLogs = cache(async (input: { action?: string; entityType?: string; page?: number; query?: string }) => {
  await assertCurrentAdmin("AUDIT_VIEW");
  const query = input.query?.trim().slice(0, 80) ?? "";
  const action = input.action && input.action in adminAuditActionLabels ? input.action as AdminAuditAction : null;
  const entityType = input.entityType && input.entityType in adminAuditEntityLabels ? input.entityType as AdminAuditEntityType : null;
  const page = Number.isSafeInteger(input.page) && (input.page ?? 0) > 0 ? Math.min(input.page as number, 100) : 1;

  const where: Prisma.AdminAuditLogWhereInput = {
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    ...(query ? { OR: [
      { entityId: { contains: query, mode: "insensitive" } },
      { actor: { is: { OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ] } } },
    ] } : {}),
  };

  const [total, logs] = await Promise.all([
    db.adminAuditLog.count({ where }),
    db.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        action: true,
        actor: { select: { email: true, firstName: true, lastName: true } },
        afterData: true,
        beforeData: true,
        createdAt: true,
        entityId: true,
        entityType: true,
        id: true,
      },
    }),
  ]);

  return {
    action,
    entityType,
    page,
    pageSize: PAGE_SIZE,
    query,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    logs: logs.map((log) => ({
      ...log,
      actionLabel: adminAuditActionLabels[log.action as AdminAuditAction] ?? log.action,
      actorName: `${log.actor.firstName} ${log.actor.lastName}`,
      createdAt: log.createdAt.toISOString(),
      entityLabel: adminAuditEntityLabels[log.entityType as AdminAuditEntityType] ?? log.entityType,
      summary: summarizeAuditChange(log.action, log.beforeData, log.afterData),
      targetHref: getAuditTargetHref(log.entityType, log.entityId, log.afterData),
    })),
  };
});

function summarizeAuditChange(action: string, beforeData: unknown, afterData: unknown) {
  const before = asRecord(beforeData);
  const after = asRecord(afterData);
  if (action === "PAYMENT_REFUND_ISSUED" && typeof after.amountCents === "number") return `${formatMoney(after.amountCents)} returned to original payment method`;
  if (typeof before.role === "string" && typeof after.role === "string") return `${formatValue(before.role)} → ${formatValue(after.role)}${after.active === false ? " · Access disabled" : ""}`;
  if (typeof before.status === "string" && typeof after.status === "string") return `${formatValue(before.status)} → ${formatValue(after.status)}`;
  if (typeof before.active === "boolean" && typeof after.active === "boolean") return `${before.active ? "Active" : "Disabled"} → ${after.active ? "Active" : "Disabled"}`;
  if (typeof after.available === "boolean") return `${after.available ? "Available" : "Unavailable"}${after.featured === true ? " · Featured" : ""}`;
  return "Operational settings updated";
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(cents / 100);
}

function getAuditTargetHref(entityType: string, entityId: string, afterData: unknown) {
  if (entityType === "ORDER") {
    const reference = asRecord(afterData).publicReference;
    return typeof reference === "string" ? `/admin/orders/${encodeURIComponent(reference)}` : null;
  }
  if (entityType === "PRODUCT") return "/admin/menu";
  if (entityType === "INVENTORY_ITEM") return "/admin/inventory";
  if (entityType === "PROMOTION") return "/admin/promotions";
  if (entityType === "STAFF") return "/admin/staff";
  if (entityType === "CUSTOMER") return `/admin/customers/${entityId}`;
  if (entityType === "CONTACT_MESSAGE") return `/admin/inquiries/contact/${entityId}`;
  if (entityType === "CATERING_INQUIRY") return `/admin/inquiries/catering/${entityId}`;
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function formatValue(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase());
}
