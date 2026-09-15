import "server-only";

import { cache } from "react";

import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export const getAdminMenuProducts = cache(async (rawQuery?: string) => {
  await assertCurrentAdmin("MENU_MANAGE");
  const query = rawQuery?.trim().slice(0, 80) ?? "";

  const products = await db.product.findMany({
    where: query ? {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ],
    } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      active: true,
      description: true,
      featured: true,
      id: true,
      imageUrl: true,
      name: true,
      pricePending: true,
      slug: true,
      updatedAt: true,
      variants: {
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: { active: true, basePriceCents: true, code: true, id: true, label: true },
      },
    },
  });

  const [total, active, featured] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { active: true } }),
    db.product.count({ where: { active: true, featured: true } }),
  ]);

  return {
    active,
    featured,
    query,
    total,
    products: products.map((product) => ({
      ...product,
      updatedAt: product.updatedAt.toISOString(),
    })),
  };
});
