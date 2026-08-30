import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  ModifierKind,
  ModifierSelectionType,
  PrismaClient,
} from "../src/generated/prisma/client";
import { allMenuItems, menuCategories } from "../src/data/menu";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const featuredProducts = new Set([
  "jollof-rice",
  "egusi",
  "asun",
  "ayamase",
]);

const operationalSettings = [
  {
    key: "minimum_advance_order_hours",
    value: 48,
    description: "Minimum notice required before fulfillment.",
  },
  {
    key: "local_delivery_window",
    value: { start: "09:00", end: "15:00" },
    description: "Local delivery window displayed at order confirmation.",
  },
  {
    key: "out_of_state_shipping_days",
    value: ["MONDAY", "TUESDAY", "WEDNESDAY"],
    description: "Allowed out-of-state shipping days.",
  },
  {
    key: "weekly_shipping_cutoff",
    value: { day: "FRIDAY" },
    description: "Weekly order cut-off for the following shipping window.",
  },
  {
    key: "ordering_available",
    value: true,
    description: "Controls whether customers can submit orders.",
  },
  {
    key: "default_currency",
    value: "USD",
    description: "Default currency used for menu prices and orders.",
  },
] as const;

async function seed() {
  await prisma.$transaction(async (transaction) => {
    let productSortOrder = 0;

    for (const [categorySortOrder, category] of menuCategories.entries()) {
      const savedCategory = await transaction.category.upsert({
        where: { slug: category.id },
        create: {
          slug: category.id,
          name: category.name,
          internalNote: category.note,
          sortOrder: categorySortOrder,
          active: true,
        },
        update: {
          name: category.name,
          internalNote: category.note,
          sortOrder: categorySortOrder,
          active: true,
        },
      });

      for (const item of category.items) {
        const hasConfirmedPricing = Boolean(item.pricing?.length);
        const product = await transaction.product.upsert({
          where: { slug: item.id },
          create: {
            categoryId: savedCategory.id,
            slug: item.id,
            name: item.name,
            description: item.priceNote ?? item.name,
            imageUrl: item.image,
            priceNote: item.priceNote,
            active: true,
            featured: featuredProducts.has(item.id),
            pricePending: !hasConfirmedPricing,
            sortOrder: productSortOrder,
          },
          update: {
            categoryId: savedCategory.id,
            name: item.name,
            description: item.priceNote ?? item.name,
            imageUrl: item.image,
            priceNote: item.priceNote,
            active: true,
            featured: featuredProducts.has(item.id),
            pricePending: !hasConfirmedPricing,
            sortOrder: productSortOrder,
          },
        });

        productSortOrder += 1;

        const variantsByCode = new Map<string, string>();

        for (const [variantSortOrder, price] of (item.pricing ?? []).entries()) {
          const variant = await transaction.productVariant.upsert({
            where: {
              productId_code: {
                productId: product.id,
                code: price.id,
              },
            },
            create: {
              productId: product.id,
              code: price.id,
              label: price.label,
              basePriceCents: Math.round(price.price * 100),
              active: true,
              sortOrder: variantSortOrder,
            },
            update: {
              label: price.label,
              basePriceCents: Math.round(price.price * 100),
              active: true,
              sortOrder: variantSortOrder,
            },
          });

          variantsByCode.set(price.id, variant.id);
        }

        let modifierSortOrder = 0;

        if (item.grainOptions) {
          const grainGroup = await transaction.modifierGroup.upsert({
            where: {
              productId_code: { productId: product.id, code: "grain" },
            },
            create: {
              productId: product.id,
              code: "grain",
              name: "Rice type",
              kind: ModifierKind.GRAIN,
              selectionType: ModifierSelectionType.SINGLE,
              required: true,
              minimumSelections: 1,
              maximumSelections: 1,
              sortOrder: modifierSortOrder,
            },
            update: {
              name: "Rice type",
              kind: ModifierKind.GRAIN,
              selectionType: ModifierSelectionType.SINGLE,
              required: true,
              minimumSelections: 1,
              maximumSelections: 1,
              sortOrder: modifierSortOrder,
            },
          });

          modifierSortOrder += 1;

          for (const [optionSortOrder, grain] of item.grainOptions.entries()) {
            await transaction.modifierOption.upsert({
              where: {
                modifierGroupId_code: {
                  modifierGroupId: grainGroup.id,
                  code: grain.id,
                },
              },
              create: {
                modifierGroupId: grainGroup.id,
                code: grain.id,
                label: grain.label,
                sortOrder: optionSortOrder,
                active: true,
              },
              update: {
                label: grain.label,
                sortOrder: optionSortOrder,
                active: true,
              },
            });
          }
        }

        if (item.proteins) {
          const proteinGroup = await transaction.modifierGroup.upsert({
            where: {
              productId_code: { productId: product.id, code: "protein" },
            },
            create: {
              productId: product.id,
              code: "protein",
              name: "Protein",
              kind: ModifierKind.PROTEIN,
              selectionType: ModifierSelectionType.SINGLE,
              required: true,
              minimumSelections: 1,
              maximumSelections: 1,
              sortOrder: modifierSortOrder,
            },
            update: {
              name: "Protein",
              kind: ModifierKind.PROTEIN,
              selectionType: ModifierSelectionType.SINGLE,
              required: true,
              minimumSelections: 1,
              maximumSelections: 1,
              sortOrder: modifierSortOrder,
            },
          });

          modifierSortOrder += 1;

          for (const [optionSortOrder, protein] of item.proteins.entries()) {
            const proteinOption = await transaction.modifierOption.upsert({
              where: {
                modifierGroupId_code: {
                  modifierGroupId: proteinGroup.id,
                  code: protein.id,
                },
              },
              create: {
                modifierGroupId: proteinGroup.id,
                code: protein.id,
                label: protein.label,
                sortOrder: optionSortOrder,
                active: true,
              },
              update: {
                label: protein.label,
                sortOrder: optionSortOrder,
                active: true,
              },
            });

            for (const price of item.pricing ?? []) {
              const productVariantId = variantsByCode.get(price.id);
              const proteinPrice = price.proteinPrices?.[protein.id];

              if (!productVariantId || proteinPrice === undefined) continue;

              await transaction.variantOptionPrice.upsert({
                where: {
                  productVariantId_modifierOptionId: {
                    productVariantId,
                    modifierOptionId: proteinOption.id,
                  },
                },
                create: {
                  productVariantId,
                  modifierOptionId: proteinOption.id,
                  priceAdjustmentCents: Math.round((proteinPrice - price.price) * 100),
                },
                update: {
                  priceAdjustmentCents: Math.round((proteinPrice - price.price) * 100),
                },
              });
            }
          }
        }

        const pepperGroup = await transaction.modifierGroup.upsert({
          where: {
            productId_code: { productId: product.id, code: "pepper" },
          },
          create: {
            productId: product.id,
            code: "pepper",
            name: "Pepper tolerance",
            kind: ModifierKind.PEPPER,
            selectionType: ModifierSelectionType.SINGLE,
            required: true,
            minimumSelections: 1,
            maximumSelections: 1,
            sortOrder: modifierSortOrder,
          },
          update: {
            name: "Pepper tolerance",
            kind: ModifierKind.PEPPER,
            selectionType: ModifierSelectionType.SINGLE,
            required: true,
            minimumSelections: 1,
            maximumSelections: 1,
            sortOrder: modifierSortOrder,
          },
        });

        for (const level of [1, 2, 3, 4, 5]) {
          await transaction.modifierOption.upsert({
            where: {
              modifierGroupId_code: {
                modifierGroupId: pepperGroup.id,
                code: `level-${level}`,
              },
            },
            create: {
              modifierGroupId: pepperGroup.id,
              code: `level-${level}`,
              label: String(level),
              sortOrder: level - 1,
              active: true,
            },
            update: {
              label: String(level),
              sortOrder: level - 1,
              active: true,
            },
          });
        }
      }
    }

    for (const setting of operationalSettings) {
      await transaction.operationalSetting.upsert({
        where: { key: setting.key },
        create: setting,
        update: {
          value: setting.value,
          description: setting.description,
        },
      });
    }
  });

  const [activeProducts, pricedProducts, variants, pepperGroups, settings] =
    await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({
        where: { active: true, pricePending: false },
      }),
      prisma.productVariant.count({ where: { active: true } }),
      prisma.modifierGroup.count({
        where: { code: "pepper", required: true },
      }),
      prisma.operationalSetting.count(),
    ]);

  if (activeProducts !== allMenuItems.length) {
    throw new Error(
      `Expected ${allMenuItems.length} active products, found ${activeProducts}.`,
    );
  }

  if (pepperGroups !== allMenuItems.length) {
    throw new Error(
      `Expected ${allMenuItems.length} required pepper groups, found ${pepperGroups}.`,
    );
  }

  console.log(
    `Seeded ${activeProducts} dishes (${pricedProducts} priced), ${variants} variants, ${pepperGroups} required pepper scales, and ${settings} operational settings.`,
  );
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
