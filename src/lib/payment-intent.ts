import { z } from "zod";

export const paymentIntentRequestSchema = z.object({
  orderReference: z.string().trim().regex(/^CE-[0-9A-F]{14}$/, "Enter a valid ComEat order reference."),
});

export type PaymentIntentResponse = {
  amountCents: number;
  clientSecret: string;
  currency: "usd";
  orderReference: string;
  paymentIntentId: string;
};
