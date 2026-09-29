import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const DELIVERY_PIN_PATTERN = /^\d{4}$/;

export function getDeliveryPin(orderId: string, publicReference: string) {
  const digest = createHmac("sha256", getDeliveryPinSecret())
    .update(`comeat-delivery-pin:v1:${orderId}:${publicReference}`)
    .digest();
  const value = digest.readUInt32BE(0) % 10_000;
  return value.toString().padStart(4, "0");
}

export function verifyDeliveryPin(orderId: string, publicReference: string, candidate: string) {
  if (!DELIVERY_PIN_PATTERN.test(candidate)) return false;

  const expected = Buffer.from(getDeliveryPin(orderId, publicReference));
  const received = Buffer.from(candidate);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function getDeliveryPinSecret() {
  const secret = process.env.DELIVERY_PIN_SECRET?.trim()
    || process.env.BETTER_AUTH_SECRET?.trim();

  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "comeat-local-development-delivery-pin-secret-v1";
  }
  throw new Error("DELIVERY_PIN_SECRET or BETTER_AUTH_SECRET must contain at least 32 characters.");
}
