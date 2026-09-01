import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { MenuItem, MenuPrice } from "@/data/menu";
import { db } from "@/server/db";

export type MenuVariantDTO = {
  id: string;
  code: string;
  label: string;
  basePriceCents: number | null;
};

export type MenuModifierOptionDTO = {
  id: string;
  code: string;
  label: string;
  defaultPriceAdjustmentCents: number;
  variantPriceAdjustments: readonly {
    variantId: string;
    priceAdjustmentCents: number;
  }[];
};

export type MenuModifierGroupDTO = {
  id: string;
  code: string;
  name: string;
  kind: "GRAIN" | "PROTEIN" | "PEPPER" | "ADD_ON";
  selectionType: "SINGLE" | "MULTIPLE";
  required: boolean;
  minimumSelections: number;
  maximumSelections: number;
  options: readonly MenuModifierOptionDTO[];
};

export type MenuProductDTO = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  priceNote: string | null;
  allergenNote: string | null;
  featured: boolean;
  pricePending: boolean;
  variants: readonly MenuVariantDTO[];
  modifierGroups: readonly MenuModifierGroupDTO[];
};

const menuProductInclude = {
  variants: {
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  },
  modifierGroups: {
    orderBy: { sortOrder: "asc" },
    include: {
      options: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: {
          variantPrices: true,
        },
      },
    },
  },
} satisfies Prisma.ProductInclude;

type MenuProductRecord = Prisma.ProductGetPayload<{
  include: typeof menuProductInclude;
}>;

export async function getMenuCatalog(): Promise<readonly MenuProductDTO[]> {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: menuProductInclude,
  });

  return products.map(toMenuProductDTO);
}

export async function getStorefrontMenuItems(): Promise<readonly MenuItem[]> {
  const products = await getMenuCatalog();
  return products.map(toStorefrontMenuItem);
}

export async function getFeaturedMenuProducts(): Promise<
  readonly MenuProductDTO[]
> {
  const products = await db.product.findMany({
    where: { active: true, featured: true },
    orderBy: { sortOrder: "asc" },
    include: menuProductInclude,
  });

  return products.map(toMenuProductDTO);
}

export async function getMenuProductBySlug(
  slug: string,
): Promise<MenuProductDTO | null> {
  const product = await db.product.findFirst({
    where: { slug, active: true },
    include: menuProductInclude,
  });

  return product ? toMenuProductDTO(product) : null;
}

function toMenuProductDTO(product: MenuProductRecord): MenuProductDTO {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    priceNote: product.priceNote,
    allergenNote: product.allergenNote,
    featured: product.featured,
    pricePending: product.pricePending,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      code: variant.code,
      label: variant.label,
      basePriceCents: variant.basePriceCents,
    })),
    modifierGroups: product.modifierGroups.map((group) => ({
      id: group.id,
      code: group.code,
      name: group.name,
      kind: group.kind,
      selectionType: group.selectionType,
      required: group.required,
      minimumSelections: group.minimumSelections,
      maximumSelections: group.maximumSelections,
      options: group.options.map((option) => ({
        id: option.id,
        code: option.code,
        label: option.label,
        defaultPriceAdjustmentCents: option.defaultPriceAdjustmentCents,
        variantPriceAdjustments: option.variantPrices.map((price) => ({
          variantId: price.productVariantId,
          priceAdjustmentCents: price.priceAdjustmentCents,
        })),
      })),
    })),
  };
}

function toStorefrontMenuItem(product: MenuProductDTO): MenuItem {
  const proteinGroup = product.modifierGroups.find(
    (group) => group.kind === "PROTEIN",
  );
  const grainGroup = product.modifierGroups.find(
    (group) => group.kind === "GRAIN",
  );
  const pricing = product.variants.flatMap<MenuPrice>((variant) => {
    if (variant.basePriceCents === null) return [];

    const proteinPrices = proteinGroup
      ? Object.fromEntries(
          proteinGroup.options.map((option) => {
            const variantAdjustment = option.variantPriceAdjustments.find(
              (price) => price.variantId === variant.id,
            );
            const adjustment =
              variantAdjustment?.priceAdjustmentCents ??
              option.defaultPriceAdjustmentCents;
            return [
              option.id,
              (variant.basePriceCents! + adjustment) / 100,
            ];
          }),
        )
      : undefined;

    return [
      {
        id: variant.id,
        label: variant.label,
        price: variant.basePriceCents / 100,
        ...(proteinPrices ? { proteinPrices } : {}),
      },
    ];
  });

  return {
    id: product.id,
    name: product.name,
    image: product.imageUrl || "/images/hero.jpg",
    ...(pricing.length ? { pricing } : {}),
    ...(product.priceNote ? { priceNote: product.priceNote } : {}),
    ...(proteinGroup
      ? {
          proteins: proteinGroup.options.map((option) => ({
            id: option.id,
            label: option.label,
          })),
        }
      : {}),
    ...(grainGroup
      ? {
          grainOptions: grainGroup.options.map((option) => ({
            id: option.id,
            label: option.label,
          })),
        }
      : {}),
  };
}
