import "server-only";

import { cache } from "react";

import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

const BUSINESS_TIME_ZONE = "America/New_York";
const PAID_PAYMENT_STATUSES = ["SUCCEEDED", "PARTIALLY_REFUNDED", "REFUNDED"] as const;
const SALES_ORDER_STATUSES = ["PAID", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED"] as const;

type CalendarParts = { day: number; month: number; year: number };

function zonedParts(date: Date): CalendarParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const read = (type: "day" | "month" | "year") => Number(parts.find((part) => part.type === type)?.value);
  return { day: read("day"), month: read("month"), year: read("year") };
}

function zonedMidnight({ day, month, year }: CalendarParts) {
  const target = Date.UTC(year, month - 1, day);
  let candidate = new Date(target);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const rendered = zonedParts(candidate);
    const renderedUtc = Date.UTC(rendered.year, rendered.month - 1, rendered.day);
    candidate = new Date(candidate.getTime() + target - renderedUtc);
  }
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hourCycle: "h23",
    timeZone: BUSINESS_TIME_ZONE,
  }).format(candidate));
  return new Date(candidate.getTime() - hour * 60 * 60 * 1000);
}

function shiftCalendar(parts: CalendarParts, days: number): CalendarParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { day: date.getUTCDate(), month: date.getUTCMonth() + 1, year: date.getUTCFullYear() };
}

function monthStart(parts: CalendarParts, offset: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1 + offset, 1));
  return zonedMidnight({ day: 1, month: date.getUTCMonth() + 1, year: date.getUTCFullYear() });
}

function dateKey(date: Date) {
  const parts = zonedParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function summarizePayments(payments: Array<{ amountCents: number; refundedAmountCents: number }>) {
  const revenueCents = payments.reduce((total, payment) => total + Math.max(0, payment.amountCents - payment.refundedAmountCents), 0);
  return {
    averageOrderValueCents: payments.length ? Math.round(revenueCents / payments.length) : 0,
    orderCount: payments.length,
    revenueCents,
  };
}

export const getAdminAnalytics = cache(async () => {
  await assertCurrentAdmin("ANALYTICS_VIEW");

  const now = new Date();
  const todayParts = zonedParts(now);
  const todayStart = zonedMidnight(todayParts);
  const calendarToday = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day));
  const daysSinceMonday = (calendarToday.getUTCDay() + 6) % 7;
  const weekParts = shiftCalendar(todayParts, -daysSinceMonday);
  const weekStart = zonedMidnight(weekParts);
  const currentMonthStart = monthStart(todayParts, 0);
  const periodDefinitions = [
    { key: "today", label: "Today", start: todayStart, previousStart: zonedMidnight(shiftCalendar(todayParts, -1)) },
    { key: "week", label: "This week", start: weekStart, previousStart: zonedMidnight(shiftCalendar(weekParts, -7)) },
    { key: "month", label: "This month", start: currentMonthStart, previousStart: monthStart(todayParts, -1) },
  ] as const;

  const trendStartParts = shiftCalendar(todayParts, -13);
  const trendStart = zonedMidnight(trendStartParts);
  const thirtyDaysAgo = zonedMidnight(shiftCalendar(todayParts, -29));
  const earliestPaymentDate = new Date(Math.min(...periodDefinitions.map((period) => period.previousStart.getTime()), trendStart.getTime()));

  const [payments, products, recentOrders] = await Promise.all([
    db.payment.findMany({
      orderBy: { paidAt: "asc" },
      select: { amountCents: true, currency: true, paidAt: true, refundedAmountCents: true },
      where: { paidAt: { gte: earliestPaymentDate }, status: { in: [...PAID_PAYMENT_STATUSES] } },
    }),
    db.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        name: true,
        orderItems: {
          select: { lineTotalCents: true, quantity: true },
          where: { order: { createdAt: { gte: thirtyDaysAgo }, status: { in: [...SALES_ORDER_STATUSES] } } },
        },
      },
      where: { active: true },
    }),
    db.order.findMany({
      select: { createdAt: true },
      where: { createdAt: { gte: thirtyDaysAgo }, status: { in: [...SALES_ORDER_STATUSES] } },
    }),
  ]);

  const paidPayments = payments.filter((payment): payment is typeof payment & { paidAt: Date } => payment.paidAt !== null);
  const periods = periodDefinitions.map((period) => {
    const elapsed = now.getTime() - period.start.getTime();
    const previousEnd = new Date(Math.min(period.start.getTime(), period.previousStart.getTime() + elapsed));
    const current = summarizePayments(paidPayments.filter((payment) => payment.paidAt >= period.start && payment.paidAt <= now));
    const previous = summarizePayments(paidPayments.filter((payment) => payment.paidAt >= period.previousStart && payment.paidAt < previousEnd));
    const revenueChangePercent = previous.revenueCents
      ? ((current.revenueCents - previous.revenueCents) / previous.revenueCents) * 100
      : current.revenueCents > 0 ? 100 : 0;
    return { ...current, key: period.key, label: period.label, previousRevenueCents: previous.revenueCents, revenueChangePercent };
  });

  const trendTotals = new Map<string, { orderCount: number; revenueCents: number }>();
  for (const payment of paidPayments.filter((item) => item.paidAt >= trendStart)) {
    const key = dateKey(payment.paidAt);
    const existing = trendTotals.get(key) ?? { orderCount: 0, revenueCents: 0 };
    existing.orderCount += 1;
    existing.revenueCents += Math.max(0, payment.amountCents - payment.refundedAmountCents);
    trendTotals.set(key, existing);
  }
  const salesTrend = Array.from({ length: 14 }, (_, index) => {
    const parts = shiftCalendar(trendStartParts, index);
    const date = zonedMidnight(parts);
    const totals = trendTotals.get(dateKey(date)) ?? { orderCount: 0, revenueCents: 0 };
    return {
      ...totals,
      date: date.toISOString(),
      label: new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", timeZone: BUSINESS_TIME_ZONE }).format(date),
    };
  });

  const dishPerformance = products.map((product) => ({
    grossSalesCents: product.orderItems.reduce((total, item) => total + item.lineTotalCents, 0),
    name: product.name,
    unitsSold: product.orderItems.reduce((total, item) => total + item.quantity, 0),
  }));
  const bestSelling = [...dishPerformance].sort((a, b) => b.unitsSold - a.unitsSold || b.grossSalesCents - a.grossSalesCents).slice(0, 5);
  const underperforming = [...dishPerformance].sort((a, b) => a.unitsSold - b.unitsSold || a.grossSalesCents - b.grossSalesCents).slice(0, 5);

  const hourFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: BUSINESS_TIME_ZONE });
  const peakOrderingHours = Array.from({ length: 8 }, (_, index) => ({
    label: `${String(index * 3).padStart(2, "0")}:00–${String(index * 3 + 3).padStart(2, "0")}:00`,
    orderCount: 0,
  }));
  for (const order of recentOrders) {
    const bucket = Math.min(7, Math.floor(Number(hourFormatter.format(order.createdAt)) / 3));
    peakOrderingHours[bucket].orderCount += 1;
  }

  return {
    bestSelling,
    businessTimeZone: BUSINESS_TIME_ZONE,
    currency: paidPayments.at(-1)?.currency ?? "USD",
    generatedAt: now.toISOString(),
    peakOrderingHours,
    periods,
    salesTrend,
    underperforming,
  };
});
