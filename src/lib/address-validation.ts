import { z } from "zod";

import { phoneSchema } from "@/lib/auth-validation";

const requiredText = (label: string, maximum: number) =>
  z.string().trim().min(1, `Enter ${label}.`).max(maximum, `${label} is too long.`);

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().max(40, "Label is too long.").optional(),
  recipientName: requiredText("the recipient name", 120),
  phone: phoneSchema,
  streetLine1: requiredText("the street address", 160),
  streetLine2: z.string().trim().max(160, "Address line 2 is too long.").optional(),
  city: requiredText("the city", 80),
  state: requiredText("the state", 80),
  postalCode: requiredText("the ZIP or postal code", 20),
  countryCode: z.string().trim().length(2, "Use a two-letter country code.").regex(/^[A-Za-z]{2}$/, "Use a valid country code."),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;

export type SavedAddress = AddressInput & {
  id: string;
};
