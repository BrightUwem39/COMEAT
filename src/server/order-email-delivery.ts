import "server-only";

import { randomUUID } from "node:crypto";

import { db } from "@/server/db";
import { sendTransactionalEmail } from "@/server/email-delivery";

type OrderEmailKind = "CUSTOMER_CONFIRMATION" | "ADMIN_NOTIFICATION";

type SendOrderEmailOnceInput = {
  html: string;
  idempotencyKey: string;
  kind: OrderEmailKind;
  orderId: string;
  recipient: string;
  subject: string;
  text?: string;
};

const DELIVERY_LEASE_MS = 10 * 60 * 1_000;

export async function sendOrderEmailOnce(input: SendOrderEmailOnceInput) {
  const delivery = await db.orderEmailDelivery.upsert({
    where: {
      orderId_kind: {
        kind: input.kind,
        orderId: input.orderId,
      },
    },
    create: {
      kind: input.kind,
      orderId: input.orderId,
      recipient: input.recipient,
      subject: input.subject,
    },
    update: {},
  });

  if (delivery.status === "SENT") {
    return delivery.providerMessageId;
  }

  const attemptedAt = new Date();
  const expiredBefore = new Date(attemptedAt.getTime() - DELIVERY_LEASE_MS);
  const claimToken = randomUUID();
  const claim = await db.orderEmailDelivery.updateMany({
    where: {
      id: delivery.id,
      sentAt: null,
      OR: [
        { status: { in: ["PENDING", "FAILED"] } },
        {
          status: "PROCESSING",
          lastAttemptAt: { lt: expiredBefore },
        },
      ],
    },
    data: {
      attemptCount: { increment: 1 },
      claimToken,
      lastAttemptAt: attemptedAt,
      lastError: null,
      recipient: input.recipient,
      status: "PROCESSING",
      subject: input.subject,
    },
  });

  if (claim.count === 0) {
    const current = await db.orderEmailDelivery.findUnique({
      where: { id: delivery.id },
      select: { providerMessageId: true, status: true },
    });
    if (current?.status === "SENT") {
      return current.providerMessageId;
    }
    throw new Error("This order email is already being delivered.");
  }

  try {
    const providerMessageId = await sendTransactionalEmail({
      html: input.html,
      idempotencyKey: input.idempotencyKey,
      subject: input.subject,
      text: input.text,
      to: input.recipient,
    });
    const completed = await db.orderEmailDelivery.updateMany({
      where: {
        claimToken,
        id: delivery.id,
        status: "PROCESSING",
      },
      data: {
        claimToken: null,
        lastError: null,
        providerMessageId,
        sentAt: new Date(),
        status: "SENT",
      },
    });

    if (completed.count === 0) {
      throw new Error("The order email delivery claim expired before completion.");
    }
    return providerMessageId;
  } catch (error) {
    await db.orderEmailDelivery.updateMany({
      where: {
        claimToken,
        id: delivery.id,
        status: "PROCESSING",
      },
      data: {
        claimToken: null,
        lastError: getDeliveryErrorMessage(error),
        status: "FAILED",
      },
    });
    throw error;
  }
}

function getDeliveryErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown email delivery error.";
  return message.slice(0, 1_000);
}
