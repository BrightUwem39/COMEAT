"use server";

import { contactMessageSchema, type ContactMessageActionState } from "@/lib/contact-message";
import { renderContactMessageEmail } from "@/server/contact-message-email";
import { db } from "@/server/db";
import { getOrderNotificationEmail, sendTransactionalEmail } from "@/server/email-delivery";
import { checkPublicFormRateLimit, isAutomatedFormSubmission } from "@/server/public-form-protection";

export async function submitContactMessageAction(
  _previousState: ContactMessageActionState,
  formData: FormData,
): Promise<ContactMessageActionState> {
  if (isAutomatedFormSubmission(formData)) {
    return {
      message: "Thank you. Your message has been received, and the ComEat team will be in touch.",
      status: "success",
    };
  }

  const result = contactMessageSchema.safeParse({
    customerEmail: getFormValue(formData, "customerEmail"),
    customerName: getFormValue(formData, "customerName"),
    customerPhone: getFormValue(formData, "customerPhone"),
    message: getFormValue(formData, "message"),
    subject: getFormValue(formData, "subject"),
  });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: "Review the highlighted details and try again.",
      status: "error",
    };
  }

  try {
    const rateLimit = await checkPublicFormRateLimit("contact", result.data.customerEmail);
    if (!rateLimit.allowed) {
      return {
        message: `Too many messages were submitted. Please wait ${formatWaitTime(rateLimit.retryAfterSeconds)} and try again.`,
        status: "error",
      };
    }
  } catch {
    return {
      message: "We could not submit your message securely. Please try again.",
      status: "error",
    };
  }

  let savedMessage;
  try {
    savedMessage = await db.contactMessage.create({
      data: {
        customerEmail: result.data.customerEmail.toLowerCase(),
        customerName: result.data.customerName,
        customerPhone: result.data.customerPhone || null,
        message: result.data.message,
        subject: result.data.subject,
      },
      select: {
        customerEmail: true,
        customerName: true,
        customerPhone: true,
        id: true,
        message: true,
        subject: true,
      },
    });
  } catch {
    return {
      message: "We could not save your message. Please try again.",
      status: "error",
    };
  }

  try {
    const notificationRecipient = getOrderNotificationEmail();
    if (!notificationRecipient) {
      throw new Error("Contact notification configuration is incomplete.");
    }
    const email = renderContactMessageEmail({
      customerEmail: savedMessage.customerEmail,
      customerName: savedMessage.customerName,
      customerPhone: savedMessage.customerPhone,
      message: savedMessage.message,
      messageId: savedMessage.id,
      subject: savedMessage.subject,
    });

    await sendTransactionalEmail({
      ...email,
      idempotencyKey: `contact-message/${savedMessage.id}`,
      replyTo: savedMessage.customerEmail,
      to: notificationRecipient,
    });
  } catch {
    console.error("A saved contact message notification could not be delivered.", {
      messageId: savedMessage.id,
    });
  }

  return {
    message: "Thank you. Your message has been received, and the ComEat team will be in touch.",
    status: "success",
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formatWaitTime(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
