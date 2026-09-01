import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { CartValidationRequest, CartValidationResponse, CartValidationIssue } from "@/lib/cart-validation";
import { db } from "@/server/db";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function validateCart(input: CartValidationRequest, client: Prisma.TransactionClient | typeof db = db): Promise<CartValidationResponse> {
  const productIds = [...new Set(input.items.map((item) => item.itemId).filter((id) => UUID_PATTERN.test(id)))];
  const products = await client.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: {
      variants: { where: { active: true } },
      modifierGroups: {
        include: {
          options: {
            where: { active: true },
            include: { variantPrices: true },
          },
        },
      },
    },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  const lines = input.items.map((item) => {
    const issues: CartValidationIssue[] = [];
    const product = productsById.get(item.itemId);
    if (!product) {
      issues.push({ code: "item_unavailable", message: "This dish is no longer available. Remove it and choose it again from the menu." });
      return { key: item.key, valid: false, issues, quantity: item.quantity, priceChanged: false };
    }

    const variant = product.variants.find((candidate) => candidate.id === item.sizeId);
    if (!variant) {
      issues.push({ code: "size_unavailable", message: "The selected tray size is no longer available." });
    } else if (variant.basePriceCents === null) {
      issues.push({ code: "price_unavailable", message: "Pricing for this tray size is currently unavailable." });
    }

    const proteinGroup = product.modifierGroups.find((group) => group.kind === "PROTEIN");
    const grainGroup = product.modifierGroups.find((group) => group.kind === "GRAIN");
    const pepperGroup = product.modifierGroups.find((group) => group.kind === "PEPPER");
    const proteinOption = item.proteinId
      ? proteinGroup?.options.find((option) => option.id === item.proteinId)
      : undefined;
    const grainOption = item.grainId
      ? grainGroup?.options.find((option) => option.id === item.grainId)
      : undefined;
    const pepperOption = pepperGroup?.options.find((option) => option.code === `level-${item.pepperTolerance}`);

    if (proteinGroup?.required && !item.proteinId) {
      issues.push({ code: "protein_required", message: "Choose a protein for this dish." });
    } else if (item.proteinId && !proteinOption) {
      issues.push({ code: "protein_unavailable", message: "The selected protein is no longer available." });
    }

    if (grainGroup?.required && !item.grainId) {
      issues.push({ code: "grain_required", message: "Choose basmati or long-grain rice for this dish." });
    } else if (item.grainId && !grainOption) {
      issues.push({ code: "grain_unavailable", message: "The selected rice option is no longer available." });
    }

    if (!pepperGroup || !pepperOption) {
      issues.push({ code: "pepper_unavailable", message: "The selected pepper level is unavailable." });
    }

    const unsupportedRequiredGroup = product.modifierGroups.some((group) =>
      group.required && !["PROTEIN", "GRAIN", "PEPPER"].includes(group.kind),
    );
    if (unsupportedRequiredGroup) {
      issues.push({ code: "configuration_unavailable", message: "This dish has a required option that must be selected again from the menu." });
    }

    if (!variant || variant.basePriceCents === null || issues.length > 0) {
      return {
        key: item.key,
        valid: false,
        issues,
        quantity: item.quantity,
        productName: product.name,
        variantLabel: variant?.label,
        proteinLabel: proteinOption?.label,
        grainLabel: grainOption?.label,
        priceChanged: false,
      };
    }

    const selectedOptions = [proteinOption, grainOption, pepperOption].filter((option) => option !== undefined);
    const modifiers = selectedOptions.map((option) => {
      const variantPrice = option.variantPrices.find((price) => price.productVariantId === variant.id);
      const group = product.modifierGroups.find((candidate) => candidate.id === option.modifierGroupId)!;
      return {
        groupId: group.id,
        optionId: option.id,
        name: group.name,
        label: option.label,
        priceAdjustmentCents: variantPrice?.priceAdjustmentCents ?? option.defaultPriceAdjustmentCents,
      };
    });
    const adjustmentCents = modifiers.reduce((total, modifier) => total + modifier.priceAdjustmentCents, 0);
    const authoritativeUnitPriceCents = variant.basePriceCents + adjustmentCents;

    return {
      key: item.key,
      valid: true,
      issues,
      quantity: item.quantity,
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl ?? undefined,
      variantId: variant.id,
      variantLabel: variant.label,
      proteinLabel: proteinOption?.label,
      grainLabel: grainOption?.label,
      authoritativeUnitPriceCents,
      lineTotalCents: authoritativeUnitPriceCents * item.quantity,
      priceChanged: authoritativeUnitPriceCents !== item.unitPriceCents,
      modifiers,
    };
  });

  return {
    valid: lines.every((line) => line.valid),
    subtotalCents: lines.reduce((total, line) => total + (line.lineTotalCents ?? 0), 0),
    checkedAt: new Date().toISOString(),
    lines,
  };
}
