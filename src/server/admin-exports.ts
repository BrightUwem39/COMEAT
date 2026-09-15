import "server-only";

import { db } from "@/server/db";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseExportRange(url: URL) {
  const fromValue = url.searchParams.get("from") ?? "";
  const toValue = url.searchParams.get("to") ?? "";
  if (!DATE_PATTERN.test(fromValue) || !DATE_PATTERN.test(toValue)) return null;
  const from = new Date(`${fromValue}T00:00:00.000Z`);
  const to = new Date(`${toValue}T00:00:00.000Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return null;
  const toExclusive = new Date(to); toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);
  if (toExclusive.getTime() - from.getTime() > 366 * 24 * 60 * 60 * 1000) return null;
  return { from, fromValue, toExclusive, toValue };
}

export async function buildOrderExport(from: Date, toExclusive: Date) {
  const orders = await db.order.findMany({ where: { createdAt: { gte: from, lt: toExclusive } }, orderBy: { createdAt: "desc" }, take: 25_000, select: { createdAt: true, currency: true, customerEmail: true, customerFirstName: true, customerLastName: true, customerPhone: true, deliveryFeeCents: true, fulfillmentMethod: true, publicReference: true, status: true, subtotalCents: true, taxCents: true, totalCents: true, _count: { select: { items: true } } } });
  return toCsv([
    ["Order reference", "Created at", "Customer", "Email", "Phone", "Status", "Fulfillment", "Items", "Subtotal", "Delivery fee", "Tax", "Total", "Currency"],
    ...orders.map((order) => [order.publicReference, order.createdAt.toISOString(), `${order.customerFirstName} ${order.customerLastName}`, order.customerEmail, order.customerPhone, formatEnum(order.status), formatEnum(order.fulfillmentMethod), order._count.items, moneyDecimal(order.subtotalCents), moneyDecimal(order.deliveryFeeCents), moneyDecimal(order.taxCents), moneyDecimal(order.totalCents), order.currency]),
  ]);
}

export async function buildCustomerExport(from: Date, toExclusive: Date) {
  const customers = await db.user.findMany({ where: { createdAt: { gte: from, lt: toExclusive }, role: "CUSTOMER" }, orderBy: { createdAt: "desc" }, take: 25_000, select: { active: true, createdAt: true, email: true, emailVerified: true, firstName: true, lastName: true, phone: true, orders: { select: { totalCents: true } } } });
  return toCsv([
    ["Customer", "Email", "Phone", "Joined at", "Email verified", "Account active", "Orders", "Lifetime spend"],
    ...customers.map((customer) => [`${customer.firstName} ${customer.lastName}`, customer.email, customer.phone ?? "", customer.createdAt.toISOString(), customer.emailVerified ? "Yes" : "No", customer.active ? "Yes" : "No", customer.orders.length, moneyDecimal(customer.orders.reduce((total, order) => total + order.totalCents, 0))]),
  ]);
}

export function csvResponse(csv: string, filename: string) {
  return new Response(`\uFEFF${csv}`, { headers: { "Cache-Control": "no-store", "Content-Disposition": `attachment; filename="${filename}"`, "Content-Type": "text/csv; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}

function toCsv(rows: Array<Array<number | string>>) { return rows.map((row) => row.map(csvCell).join(",")).join("\r\n"); }
function csvCell(rawValue: number | string) { let value = String(rawValue); if (/^[\t\r ]*[=+\-@]/.test(value)) value = `'${value}`; return `"${value.replaceAll('"', '""')}"`; }
function moneyDecimal(cents: number) { return (cents / 100).toFixed(2); }
function formatEnum(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase()); }
