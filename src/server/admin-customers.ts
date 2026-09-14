import "server-only";

import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { adminOrderStatusLabels } from "@/server/admin-orders";
import { db } from "@/server/db";

const PAGE_SIZE = 12;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getAdminCustomers = cache(async (input: { page?: number; query?: string; state?: string }) => {
  await assertCurrentAdmin();
  const query = input.query?.trim().slice(0, 80) ?? "";
  const state = input.state === "ACTIVE" || input.state === "DISABLED" ? input.state : null;
  const page = Number.isSafeInteger(input.page) && (input.page ?? 0) > 0 ? Math.min(input.page as number, 100) : 1;

  const where: Prisma.UserWhereInput = {
    role: "CUSTOMER",
    ...(state ? { active: state === "ACTIVE" } : {}),
    ...(query ? { OR: [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
    ] } : {}),
  };

  const [total, active, disabled, verified, customers] = await Promise.all([
    db.user.count({ where }),
    db.user.count({ where: { active: true, role: "CUSTOMER" } }),
    db.user.count({ where: { active: false, role: "CUSTOMER" } }),
    db.user.count({ where: { emailVerified: true, role: "CUSTOMER" } }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        active: true,
        createdAt: true,
        email: true,
        emailVerified: true,
        firstName: true,
        id: true,
        lastName: true,
        phone: true,
        _count: { select: { addresses: true, orders: true } },
        orders: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    }),
  ]);

  return {
    active,
    disabled,
    page,
    pageSize: PAGE_SIZE,
    query,
    state,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    verified,
    customers: customers.map((customer) => ({
      active: customer.active,
      addressCount: customer._count.addresses,
      createdAt: customer.createdAt.toISOString(),
      email: customer.email,
      emailVerified: customer.emailVerified,
      firstName: customer.firstName,
      id: customer.id,
      lastName: customer.lastName,
      lastOrderAt: customer.orders[0]?.createdAt.toISOString() ?? null,
      orderCount: customer._count.orders,
      phone: customer.phone,
    })),
  };
});

export const getAdminCustomerDetail = cache(async (id: string) => {
  await assertCurrentAdmin();
  if (!UUID_PATTERN.test(id)) return null;

  const [customer, spend] = await Promise.all([
    db.user.findFirst({
      where: { id, role: "CUSTOMER" },
      select: {
        active: true,
        createdAt: true,
        email: true,
        emailVerified: true,
        firstName: true,
        id: true,
        lastName: true,
        phone: true,
        updatedAt: true,
        _count: { select: { addresses: true, orders: true } },
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
          select: { city: true, countryCode: true, id: true, isDefault: true, label: true, phone: true, postalCode: true, recipientName: true, state: true, streetLine1: true, streetLine2: true },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { createdAt: true, currency: true, publicReference: true, status: true, totalCents: true },
        },
        sessions: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { updatedAt: true },
        },
      },
    }),
    db.order.aggregate({
      _sum: { totalCents: true },
      where: { userId: id, status: { in: ["PAID", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED"] } },
    }),
  ]);
  if (!customer) return null;

  return {
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    lastActiveAt: customer.sessions[0]?.updatedAt.toISOString() ?? null,
    lifetimeSpendCents: spend._sum.totalCents ?? 0,
    updatedAt: customer.updatedAt.toISOString(),
    orders: customer.orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      statusLabel: adminOrderStatusLabels[order.status],
    })),
  };
});
