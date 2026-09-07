"use server";

import {
  cateringInquirySchema,
  getCateringEventTypeLabel,
  type CateringInquiryActionState,
} from "@/lib/catering-inquiry";
import { renderCateringInquiryEmail } from "@/server/catering-inquiry-email";
import { db } from "@/server/db";
import { getOrderNotificationEmail, sendTransactionalEmail } from "@/server/email-delivery";
import { checkPublicFormRateLimit, isAutomatedFormSubmission } from "@/server/public-form-protection";

export async function submitCateringInquiryAction(
  _previousState: CateringInquiryActionState,
  formData: FormData,
): Promise<CateringInquiryActionState> {
  if (isAutomatedFormSubmission(formData)) {
    return {
      message: "Thank you. Your catering inquiry has been received, and the ComEat team will be in touch.",
      status: "success",
    };
  }

  const result = cateringInquirySchema.safeParse({
    customerEmail: getFormValue(formData, "customerEmail"),
    customerName: getFormValue(formData, "customerName"),
    customerPhone: getFormValue(formData, "customerPhone"),
    eventDate: getFormValue(formData, "eventDate"),
    eventType: getFormValue(formData, "eventType"),
    guestCount: getFormValue(formData, "guestCount"),
    message: getFormValue(formData, "message"),
    venue: getFormValue(formData, "venue"),
  });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: "Review the highlighted details and try again.",
      status: "error",
    };
  }

  if (result.data.eventDate < getCurrentEasternDate()) {
    return {
      fieldErrors: { eventDate: ["Choose today or a future event date."] },
      message: "Review the highlighted details and try again.",
      status: "error",
    };
  }

  const eventType = getCateringEventTypeLabel(result.data.eventType);
  if (!eventType) {
    return { message: "Choose a valid event type.", status: "error" };
  }

  try {
    const rateLimit = await checkPublicFormRateLimit("catering", result.data.customerEmail);
    if (!rateLimit.allowed) {
      return {
        message: `Too many catering inquiries were submitted. Please wait ${formatWaitTime(rateLimit.retryAfterSeconds)} and try again.`,
        status: "error",
      };
    }
  } catch {
    return {
      message: "We could not submit your inquiry securely. Please try again.",
      status: "error",
    };
  }

  let inquiry;
  try {
    inquiry = await db.cateringInquiry.create({
      data: {
        customerEmail: result.data.customerEmail.toLowerCase(),
        customerName: result.data.customerName,
        customerPhone: result.data.customerPhone,
        eventDate: new Date(`${result.data.eventDate}T12:00:00.000Z`),
        eventType,
        guestCount: result.data.guestCount,
        message: result.data.message,
        venue: result.data.venue,
      },
      select: {
        customerEmail: true,
        customerName: true,
        customerPhone: true,
        eventDate: true,
        eventType: true,
        guestCount: true,
        id: true,
        message: true,
        venue: true,
      },
    });
  } catch {
    return {
      message: "We could not save your inquiry. Please try again.",
      status: "error",
    };
  }

  try {
    const notificationRecipient = getOrderNotificationEmail();
    if (!notificationRecipient || !inquiry.eventDate || !inquiry.guestCount || !inquiry.venue) {
      throw new Error("Catering notification configuration is incomplete.");
    }
    const email = renderCateringInquiryEmail({
      customerEmail: inquiry.customerEmail,
      customerName: inquiry.customerName,
      customerPhone: inquiry.customerPhone,
      eventDate: inquiry.eventDate,
      eventType: inquiry.eventType,
      guestCount: inquiry.guestCount,
      inquiryId: inquiry.id,
      message: inquiry.message,
      venue: inquiry.venue,
    });

    await sendTransactionalEmail({
      ...email,
      idempotencyKey: `catering-inquiry/${inquiry.id}`,
      replyTo: inquiry.customerEmail,
      to: notificationRecipient,
    });
  } catch {
    console.error("A saved catering inquiry notification could not be delivered.", {
      inquiryId: inquiry.id,
    });
  }

  return {
    message: "Thank you. Your catering inquiry has been received, and the ComEat team will be in touch.",
    status: "success",
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getCurrentEasternDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/New_York",
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatWaitTime(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
