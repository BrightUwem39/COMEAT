import { z } from "zod";

import { phoneSchema } from "@/lib/auth-validation";

export const cateringEventTypes = [
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "Corporate event", value: "corporate-event" },
  { label: "Family gathering", value: "family-gathering" },
  { label: "Private event", value: "private-event" },
  { label: "Other", value: "other" },
] as const;

const eventTypeValues = [
  "wedding",
  "birthday",
  "corporate-event",
  "family-gathering",
  "private-event",
  "other",
] as const;

export const cateringInquirySchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name.").max(120, "Keep your name under 120 characters."),
  customerEmail: z.string().trim().email("Enter a valid email address.").max(254, "Enter a valid email address."),
  customerPhone: phoneSchema,
  eventType: z.enum(eventTypeValues, { message: "Choose an event type." }),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid event date."),
  guestCount: z.coerce.number().int("Enter a whole number of guests.").min(1, "Enter at least one guest.").max(10_000, "Contact us directly for events above 10,000 guests."),
  venue: z.string().trim().min(2, "Enter the venue or event location.").max(200, "Keep the venue under 200 characters."),
  message: z.string().trim().min(10, "Tell us a little more about your event.").max(2_000, "Keep the event details under 2,000 characters."),
});

export type CateringInquiryField = keyof z.infer<typeof cateringInquirySchema>;

export type CateringInquiryActionState = {
  fieldErrors?: Partial<Record<CateringInquiryField, string[]>>;
  message: string;
  status: "idle" | "error" | "success";
};

export const initialCateringInquiryState: CateringInquiryActionState = {
  message: "",
  status: "idle",
};

export function getCateringEventTypeLabel(value: string) {
  return cateringEventTypes.find((eventType) => eventType.value === value)?.label;
}
