"use server";

import { revalidatePath } from "next/cache";

import { writeAdminAuditLog } from "@/server/admin-audit";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export type UpdateMenuProductState = {
  message: string;
  status: "error" | "idle" | "success";
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_PATTERN = /^\d{1,5}(?:\.\d{1,2})?$/;

export async function updateMenuProductAction(
  _previousState: UpdateMenuProductState,
  formData: FormData,
): Promise<UpdateMenuProductState> {
  const admin = await assertCurrentAdmin();
  const productId = String(formData.get("productId") ?? "");
  const productUpdatedAt = new Date(String(formData.get("productUpdatedAt") ?? ""));
  const productActive = formData.get("productActive") === "on";
  const featured = formData.get("featured") === "on";

  if (!UUID_PATTERN.test(productId) || Number.isNaN(productUpdatedAt.getTime())) {
    return { message: "This dish could not be validated. Refresh and try again.", status: "error" };
  }

  const result = await db.$transaction(async (transaction) => {
    const product = await transaction.product.findUnique({
      where: { id: productId },
      select: { active: true, featured: true, id: true, name: true, variants: { select: { active: true, basePriceCents: true, id: true } } },
    });
    if (!product) return { message: "This dish no longer exists.", status: "error" as const };

    const variants = [];
    for (const variant of product.variants) {
      const active = formData.get(`variantActive:${variant.id}`) === "on";
      const rawPrice = String(formData.get(`variantPrice:${variant.id}`) ?? "").trim();
      if (rawPrice && (!PRICE_PATTERN.test(rawPrice) || Number(rawPrice) > 10_000)) {
        return { message: "Enter each price as a valid dollar amount up to $10,000.", status: "error" as const };
      }
      const basePriceCents = rawPrice ? Math.round(Number(rawPrice) * 100) : null;
      if (active && (!basePriceCents || basePriceCents < 1)) {
        return { message: "Every available size needs a price of at least $0.01.", status: "error" as const };
      }
      variants.push({ active, basePriceCents, id: variant.id });
    }

    if (productActive && !variants.some((variant) => variant.active && variant.basePriceCents !== null)) {
      return { message: "Keep at least one priced size available, or mark the dish unavailable.", status: "error" as const };
    }

    const updated = await transaction.product.updateMany({
      where: { id: product.id, updatedAt: productUpdatedAt },
      data: {
        active: productActive,
        featured,
        pricePending: variants.some((variant) => variant.active && variant.basePriceCents === null),
      },
    });
    if (updated.count !== 1) {
      return { message: "This dish changed while you were editing it. Refresh before saving again.", status: "error" as const };
    }

    await Promise.all(variants.map((variant) => transaction.productVariant.update({
      where: { id: variant.id },
      data: { active: variant.active, basePriceCents: variant.basePriceCents },
    })));
    await writeAdminAuditLog(transaction, {
      action: "MENU_PRODUCT_UPDATED",
      actorUserId: admin.userId,
      beforeData: {
        available: product.active,
        featured: product.featured,
        variants: product.variants.map((variant) => ({ active: variant.active, basePriceCents: variant.basePriceCents, id: variant.id })),
      },
      afterData: { available: productActive, featured, variants },
      entityId: product.id,
      entityType: "PRODUCT",
    });

    return { message: `${product.name} was updated.`, status: "success" as const };
  });

  if (result.status === "success") {
    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/cart");
    revalidatePath("/admin/menu");
    revalidatePath("/admin/activity");
  }
  return result;
}
