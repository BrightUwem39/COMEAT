import "server-only";

import { createHash } from "node:crypto";

import type { CheckoutOrderRequest, CheckoutOrderResponse } from "@/lib/checkout-order";
import type { CustomerSessionDTO } from "@/server/auth-session";
import { validateCart } from "@/server/cart-validation";
import { getCheckoutRules, getFulfillmentWindow, getShippingCutoff } from "@/server/checkout";
import { db } from "@/server/db";

export class CheckoutOrderError extends Error {
  constructor(
    public readonly code: "CART_INVALID" | "DATE_INVALID" | "ORDERING_CLOSED" | "SHIPPING_CUTOFF" | "UNAUTHORIZED",
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function createPendingOrder(
  input: CheckoutOrderRequest,
  sessionCustomer: CustomerSessionDTO,
): Promise<CheckoutOrderResponse> {
  const publicReference = referenceFromToken(input.checkoutToken);

  try {
    return await db.$transaction(async (transaction) => {
      const existing = await transaction.order.findUnique({
        where: { publicReference },
        select: orderResponseSelect,
      });
      if (existing) {
        if (existing.userId !== sessionCustomer.userId) {
          throw new CheckoutOrderError("UNAUTHORIZED", "This checkout request cannot be used.", 409);
        }
        return toOrderResponse(existing);
      }

      const [customer, rules] = await Promise.all([
        transaction.user.findFirst({
          where: { id: sessionCustomer.userId, active: true, emailVerified: true },
          select: { id: true, email: true, firstName: true, lastName: true },
        }),
        getCheckoutRules(transaction),
      ]);
      if (!customer) throw new CheckoutOrderError("UNAUTHORIZED", "Sign in again before placing this order.", 401);
      if (!rules.orderingAvailable) throw new CheckoutOrderError("ORDERING_CLOSED", "Online ordering is temporarily unavailable.", 409);

      const requestedDate = validCalendarDate(input.requestedDate);
      if (!requestedDate || input.requestedDate < rules.earliestFulfillmentDate) {
        throw new CheckoutOrderError("DATE_INVALID", `Choose a date at least ${rules.minimumAdvanceHours} hours from now.`, 422);
      }

      const weekday = weekdayName(input.requestedDate);
      if (input.fulfillmentMethod === "OUT_OF_STATE_SHIPPING") {
        if (!rules.outOfStateShippingDays.includes(weekday)) {
          throw new CheckoutOrderError("DATE_INVALID", "Choose an available out-of-state shipping day.", 422);
        }
        if (new Date() > getShippingCutoff(input.requestedDate, rules)) {
          throw new CheckoutOrderError("SHIPPING_CUTOFF", `The ${rules.weeklyShippingCutoffDay.toLowerCase()} cutoff has passed for this shipping window.`, 422);
        }
      }

      const cart = await validateCart({ items: input.items }, transaction);
      if (!cart.valid || cart.lines.some((line) =>
        !line.productId || !line.variantId || line.authoritativeUnitPriceCents === undefined || line.lineTotalCents === undefined,
      )) {
        throw new CheckoutOrderError("CART_INVALID", "One or more cart items changed. Review your cart before placing the order.", 409);
      }

      const window = getFulfillmentWindow(input.requestedDate, rules);
      const order = await transaction.order.create({
        data: {
          publicReference,
          userId: customer.id,
          status: "PENDING_PAYMENT",
          customerFirstName: customer.firstName,
          customerLastName: customer.lastName,
          customerEmail: customer.email,
          customerPhone: input.address.phone,
          fulfillmentMethod: input.fulfillmentMethod,
          requestedFulfillmentAt: window.start,
          deliveryWindowStart: window.start,
          deliveryWindowEnd: window.end,
          deliveryRecipientName: input.address.recipientName,
          deliveryPhone: input.address.phone,
          deliveryStreetLine1: input.address.streetLine1,
          deliveryStreetLine2: input.address.streetLine2 || null,
          deliveryCity: input.address.city,
          deliveryState: input.address.state,
          deliveryPostalCode: input.address.postalCode,
          deliveryCountryCode: input.address.countryCode.toUpperCase(),
          deliveryNotes: input.deliveryNotes || null,
          allergyDeclared: input.allergy.status === "has-allergies",
          allergyNotes: input.allergy.status === "has-allergies" ? input.allergy.details : null,
          crossContactAcknowledgedAt: new Date(),
          subtotalCents: cart.subtotalCents,
          deliveryFeeCents: 0,
          taxCents: 0,
          totalCents: cart.subtotalCents,
          currency: "USD",
          items: {
            create: cart.lines.map((line) => ({
              productId: line.productId!,
              productVariantId: line.variantId!,
              productName: line.productName!,
              productImageUrl: line.productImageUrl ?? null,
              variantLabel: line.variantLabel!,
              unitPriceCents: line.authoritativeUnitPriceCents!,
              quantity: line.quantity,
              lineTotalCents: line.lineTotalCents!,
              modifiers: {
                create: (line.modifiers ?? []).map((modifier) => ({
                  modifierGroupId: modifier.groupId,
                  modifierOptionId: modifier.optionId,
                  modifierName: modifier.name,
                  optionLabel: modifier.label,
                  priceAdjustmentCents: modifier.priceAdjustmentCents,
                })),
              },
            })),
          },
          statusHistory: {
            create: {
              newStatus: "PENDING_PAYMENT",
              actorUserId: customer.id,
              note: "Order created and awaiting full payment.",
            },
          },
        },
        select: orderResponseSelect,
      });

      return toOrderResponse(order);
    });
  } catch (error) {
    if (error instanceof CheckoutOrderError) throw error;
    const existing = await db.order.findUnique({ where: { publicReference }, select: orderResponseSelect });
    if (existing?.userId === sessionCustomer.userId) return toOrderResponse(existing);
    throw error;
  }
}

const orderResponseSelect = {
  userId: true,
  publicReference: true,
  status: true,
  totalCents: true,
  currency: true,
  requestedFulfillmentAt: true,
  deliveryWindowStart: true,
  deliveryWindowEnd: true,
} as const;

function toOrderResponse(order: {
  publicReference: string;
  status: string;
  totalCents: number;
  currency: string;
  requestedFulfillmentAt: Date;
  deliveryWindowStart: Date | null;
  deliveryWindowEnd: Date | null;
}): CheckoutOrderResponse {
  if (!order.deliveryWindowStart || !order.deliveryWindowEnd || order.status !== "PENDING_PAYMENT") {
    throw new Error("The pending order response is incomplete.");
  }
  return {
    order: {
      publicReference: order.publicReference,
      status: "PENDING_PAYMENT",
      statusLabel: "Pending payment",
      totalCents: order.totalCents,
      currency: order.currency,
      requestedFulfillmentAt: order.requestedFulfillmentAt.toISOString(),
      deliveryWindowStart: order.deliveryWindowStart.toISOString(),
      deliveryWindowEnd: order.deliveryWindowEnd.toISOString(),
    },
  };
}

function referenceFromToken(token: string) {
  return `CE-${createHash("sha256").update(token).digest("hex").slice(0, 14).toUpperCase()}`;
}

function validCalendarDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function weekdayName(value: string) {
  return ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][
    new Date(`${value}T12:00:00Z`).getUTCDay()
  ];
}
