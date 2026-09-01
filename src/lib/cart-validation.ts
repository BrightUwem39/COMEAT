import { z } from "zod";

export const cartLineRequestSchema = z.object({
  key: z.string().min(1).max(500),
  itemId: z.string().min(1).max(100),
  sizeId: z.string().min(1).max(100),
  proteinId: z.string().min(1).max(100).optional(),
  grainId: z.string().min(1).max(100).optional(),
  pepperTolerance: z.number().int().min(1).max(5),
  quantity: z.number().int().min(1).max(99),
  unitPriceCents: z.number().int().min(0).max(10_000_000),
});

export const cartValidationRequestSchema = z.object({
  items: z.array(cartLineRequestSchema).min(1).max(50),
});

export type CartValidationRequest = z.infer<typeof cartValidationRequestSchema>;

export type CartValidationIssue = {
  code:
    | "item_unavailable"
    | "size_unavailable"
    | "price_unavailable"
    | "protein_required"
    | "protein_unavailable"
    | "grain_required"
    | "grain_unavailable"
    | "pepper_unavailable"
    | "configuration_unavailable";
  message: string;
};

export type ValidatedCartLine = {
  key: string;
  valid: boolean;
  issues: CartValidationIssue[];
  quantity: number;
  productId?: string;
  productName?: string;
  productImageUrl?: string;
  variantId?: string;
  variantLabel?: string;
  proteinLabel?: string;
  grainLabel?: string;
  authoritativeUnitPriceCents?: number;
  lineTotalCents?: number;
  priceChanged: boolean;
  modifiers?: Array<{
    groupId: string;
    optionId: string;
    name: string;
    label: string;
    priceAdjustmentCents: number;
  }>;
};

export type CartValidationResponse = {
  valid: boolean;
  subtotalCents: number;
  checkedAt: string;
  lines: ValidatedCartLine[];
};
