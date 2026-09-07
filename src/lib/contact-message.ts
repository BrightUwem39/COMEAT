import { z } from "zod";

import { phoneSchema } from "@/lib/auth-validation";

export const contactMessageSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name.").max(120, "Keep your name under 120 characters."),
  customerEmail: z.string().trim().email("Enter a valid email address.").max(254, "Enter a valid email address."),
  customerPhone: z.union([phoneSchema, z.literal("")]),
  subject: z.string().trim().min(2, "Enter a subject.").max(140, "Keep the subject under 140 characters."),
  message: z.string().trim().min(10, "Tell us a little more about your question.").max(2_000, "Keep the message under 2,000 characters."),
});

export type ContactMessageField = keyof z.infer<typeof contactMessageSchema>;

export type ContactMessageActionState = {
  fieldErrors?: Partial<Record<ContactMessageField, string[]>>;
  message: string;
  status: "idle" | "error" | "success";
};

export const initialContactMessageState: ContactMessageActionState = {
  message: "",
  status: "idle",
};
