import "server-only";

import { cache } from "react";

import type { AdminPermission } from "@/server/admin-auth";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export type AdminSearchResult = { detail: string; href: string; id: string; section: string; title: string };

export const searchAdminWorkspace = cache(async (rawQuery: string) => {
  const admin = await assertCurrentAdmin();
  const query = rawQuery.trim().slice(0, 80);
  if (query.length < 2) return { query, results: [] as AdminSearchResult[] };
  const can = (permission: AdminPermission) => admin.permissions.includes(permission);

  const [orders, customers, products, contacts, catering, inventory, promotions, staff] = await Promise.all([
    can("ORDERS_VIEW") ? db.order.findMany({ where: { OR: [{ publicReference: { contains: query, mode: "insensitive" } }, { customerFirstName: { contains: query, mode: "insensitive" } }, { customerLastName: { contains: query, mode: "insensitive" } }, { customerEmail: { contains: query, mode: "insensitive" } }] }, orderBy: { createdAt: "desc" }, take: 8, select: { customerEmail: true, customerFirstName: true, customerLastName: true, publicReference: true, status: true } }) : Promise.resolve([]),
    can("CUSTOMERS_VIEW") ? db.user.findMany({ where: { role: "CUSTOMER", OR: [{ firstName: { contains: query, mode: "insensitive" } }, { lastName: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] }, orderBy: { createdAt: "desc" }, take: 8, select: { email: true, firstName: true, id: true, lastName: true } }) : Promise.resolve([]),
    can("MENU_MANAGE") ? db.product.findMany({ where: { OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] }, orderBy: { name: "asc" }, take: 8, select: { active: true, id: true, name: true } }) : Promise.resolve([]),
    can("INQUIRIES_MANAGE") ? db.contactMessage.findMany({ where: { OR: [{ customerName: { contains: query, mode: "insensitive" } }, { customerEmail: { contains: query, mode: "insensitive" } }, { subject: { contains: query, mode: "insensitive" } }] }, orderBy: { createdAt: "desc" }, take: 6, select: { customerName: true, id: true, status: true, subject: true } }) : Promise.resolve([]),
    can("INQUIRIES_MANAGE") ? db.cateringInquiry.findMany({ where: { OR: [{ customerName: { contains: query, mode: "insensitive" } }, { customerEmail: { contains: query, mode: "insensitive" } }, { eventType: { contains: query, mode: "insensitive" } }] }, orderBy: { createdAt: "desc" }, take: 6, select: { customerName: true, eventType: true, id: true, status: true } }) : Promise.resolve([]),
    can("INVENTORY_MANAGE") ? db.inventoryItem.findMany({ where: { name: { contains: query, mode: "insensitive" } }, orderBy: { name: "asc" }, take: 8, select: { id: true, name: true, quantity: true, unit: true } }) : Promise.resolve([]),
    can("PROMOTIONS_MANAGE") ? db.promotion.findMany({ where: { OR: [{ code: { contains: query, mode: "insensitive" } }, { name: { contains: query, mode: "insensitive" } }] }, orderBy: { createdAt: "desc" }, take: 8, select: { active: true, code: true, id: true, name: true } }) : Promise.resolve([]),
    can("STAFF_MANAGE") ? db.user.findMany({ where: { role: { not: "CUSTOMER" }, OR: [{ firstName: { contains: query, mode: "insensitive" } }, { lastName: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] }, orderBy: { firstName: "asc" }, take: 8, select: { active: true, email: true, firstName: true, id: true, lastName: true, role: true } }) : Promise.resolve([]),
  ]);

  const results: AdminSearchResult[] = [
    ...orders.map((item) => ({ detail: `${item.customerFirstName} ${item.customerLastName} · ${formatEnum(item.status)}`, href: `/admin/orders/${encodeURIComponent(item.publicReference)}`, id: `order-${item.publicReference}`, section: "Orders", title: item.publicReference })),
    ...customers.map((item) => ({ detail: item.email, href: `/admin/customers/${item.id}`, id: `customer-${item.id}`, section: "Customers", title: `${item.firstName} ${item.lastName}` })),
    ...products.map((item) => ({ detail: item.active ? "Available" : "Unavailable", href: `/admin/menu?q=${encodeURIComponent(item.name)}`, id: `product-${item.id}`, section: "Menu", title: item.name })),
    ...contacts.map((item) => ({ detail: `${item.customerName} · ${formatEnum(item.status)}`, href: `/admin/inquiries/contact/${item.id}`, id: `contact-${item.id}`, section: "Enquiries", title: item.subject })),
    ...catering.map((item) => ({ detail: `${item.customerName} · ${formatEnum(item.status)}`, href: `/admin/inquiries/catering/${item.id}`, id: `catering-${item.id}`, section: "Enquiries", title: item.eventType })),
    ...inventory.map((item) => ({ detail: `${formatQuantity(item.quantity.toNumber())} ${item.unit} in stock`, href: "/admin/inventory", id: `inventory-${item.id}`, section: "Inventory", title: item.name })),
    ...promotions.map((item) => ({ detail: `${item.code} · ${item.active ? "Active" : "Paused"}`, href: "/admin/promotions", id: `promotion-${item.id}`, section: "Promotions", title: item.name })),
    ...staff.map((item) => ({ detail: `${item.email} · ${formatEnum(item.role)}${item.active ? "" : " · Inactive"}`, href: "/admin/staff", id: `staff-${item.id}`, section: "Staff", title: `${item.firstName} ${item.lastName}` })),
  ];
  return { query, results };
});

export const getAdminNotificationCenter = cache(async () => {
  const admin = await assertCurrentAdmin();
  const can = (permission: AdminPermission) => admin.permissions.includes(permission);
  const [orders, stock, contacts, catering, failedEmails] = await Promise.all([
    can("ORDERS_VIEW") ? db.order.findMany({ where: { status: "PAID" }, orderBy: { createdAt: "desc" }, take: 10, select: { createdAt: true, customerFirstName: true, customerLastName: true, publicReference: true, totalCents: true, currency: true } }) : Promise.resolve([]),
    can("INVENTORY_MANAGE") ? db.inventoryItem.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, lowStockThreshold: true, name: true, quantity: true, unit: true } }) : Promise.resolve([]),
    can("INQUIRIES_MANAGE") ? db.contactMessage.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 8, select: { createdAt: true, customerName: true, id: true, subject: true } }) : Promise.resolve([]),
    can("INQUIRIES_MANAGE") ? db.cateringInquiry.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 8, select: { createdAt: true, customerName: true, eventType: true, id: true } }) : Promise.resolve([]),
    can("AUDIT_VIEW") ? db.orderEmailDelivery.findMany({ where: { status: "FAILED" }, orderBy: { updatedAt: "desc" }, take: 8, select: { id: true, kind: true, order: { select: { publicReference: true } }, updatedAt: true } }) : Promise.resolve([]),
  ]);
  const lowStock = stock.filter((item) => item.quantity.lessThanOrEqualTo(item.lowStockThreshold));
  const notifications = [
    ...orders.map((order) => ({ createdAt: order.createdAt.toISOString(), detail: `${order.customerFirstName} ${order.customerLastName} · ${formatMoney(order.totalCents, order.currency)}`, href: `/admin/orders/${encodeURIComponent(order.publicReference)}`, id: `paid-${order.publicReference}`, kind: "ORDER" as const, title: `Accept order ${order.publicReference}` })),
    ...lowStock.map((item) => ({ createdAt: null, detail: `${formatQuantity(item.quantity.toNumber())} ${item.unit} remaining · alert at ${formatQuantity(item.lowStockThreshold.toNumber())}`, href: "/admin/inventory", id: `stock-${item.id}`, kind: "STOCK" as const, title: item.quantity.lessThanOrEqualTo(0) ? `${item.name} is out of stock` : `${item.name} is running low` })),
    ...contacts.map((item) => ({ createdAt: item.createdAt.toISOString(), detail: item.customerName, href: `/admin/inquiries/contact/${item.id}`, id: `contact-${item.id}`, kind: "INQUIRY" as const, title: item.subject })),
    ...catering.map((item) => ({ createdAt: item.createdAt.toISOString(), detail: `${item.customerName} · Catering enquiry`, href: `/admin/inquiries/catering/${item.id}`, id: `catering-${item.id}`, kind: "INQUIRY" as const, title: item.eventType })),
    ...failedEmails.map((item) => ({ createdAt: item.updatedAt.toISOString(), detail: `${formatEnum(item.kind)} email needs attention`, href: `/admin/orders/${encodeURIComponent(item.order.publicReference)}`, id: `email-${item.id}`, kind: "EMAIL" as const, title: `Email failed for ${item.order.publicReference}` })),
  ].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return { count: notifications.length, notifications };
});

function formatEnum(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase()); }
function formatQuantity(value: number) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value); }
function formatMoney(cents: number, currency: string) { return new Intl.NumberFormat("en-US", { currency, maximumFractionDigits: 0, style: "currency" }).format(cents / 100); }
