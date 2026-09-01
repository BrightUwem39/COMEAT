import { z } from "zod";

import { cartLineRequestSchema } from "@/lib/cart-validation";
import { phoneSchema } from "@/lib/auth-validation";

const requiredText = (label: string, maximum: number) =>
  z.string().trim().min(1, `Enter ${label}.`).max(maximum, `${label} is too long.`);

export const checkoutOrderRequestSchema = z.object({
  checkoutToken: z.string().uuid(),
  items: z.array(cartLineRequestSchema).min(1).max(50),
  fulfillmentMethod: z.enum(["LOCAL_DELIVERY", "OUT_OF_STATE_SHIPPING"]),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid delivery date."),
  deliveryNotes: z.string().trim().max(500, "Delivery notes are too long."),
  address: z.object({
    recipientName: requiredText("the recipient name", 120),
    phone: phoneSchema,
    streetLine1: requiredText("the street address", 160),
    streetLine2: z.string().trim().max(160, "Address line 2 is too long.").nullable(),
    city: requiredText("the city", 80),
    state: requiredText("the state", 80),
    postalCode: requiredText("the ZIP or postal code", 20),
    countryCode: z.string().trim().length(2).regex(/^[A-Za-z]{2}$/),
  }),
  allergy: z.discriminatedUnion("status", [
    z.object({
      status: z.literal("none"),
      details: z.literal(""),
      acknowledged: z.literal(true),
    }),
    z.object({
      status: z.literal("has-allergies"),
      details: z.string().trim().min(1, "Describe the food allergies.").max(1_000),
      acknowledged: z.literal(true),
    }),
  ]),
});

export type CheckoutOrderRequest = z.infer<typeof checkoutOrderRequestSchema>;

export type CheckoutOrderResponse = {
  order: {
    publicReference: string;
    status: "PENDING_PAYMENT";
    statusLabel: "Pending payment";
    totalCents: number;
    currency: string;
    requestedFulfillmentAt: string;
    deliveryWindowStart: string;
    deliveryWindowEnd: string;
  };
};
