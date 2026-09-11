import type { CheckoutAddressDTO } from "@/server/checkout";

export type FulfillmentMethod = "LOCAL_DELIVERY" | "OUT_OF_STATE_SHIPPING";
export type HandoffMethod = "LEAVE_AT_DOOR" | "HAND_TO_ME";

export type DeliveryDraft = {
  fulfillmentMethod: FulfillmentMethod;
  handoffMethod: HandoffMethod;
  requestedDate: string;
  deliveryNotes: string;
  address: Omit<CheckoutAddressDTO, "id" | "isDefault" | "label">;
};

export const DELIVERY_DRAFT_STORAGE_KEY = "comeat-delivery-draft";

export function isDeliveryDraft(value: unknown): value is DeliveryDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<DeliveryDraft>;
  const address = draft.address as Partial<DeliveryDraft["address"]> | undefined;
  return Boolean(
    address
      && typeof address.recipientName === "string"
      && typeof address.phone === "string"
      && typeof address.streetLine1 === "string"
      && typeof address.city === "string"
      && typeof address.state === "string"
      && typeof address.postalCode === "string"
      && typeof draft.requestedDate === "string"
      && (draft.handoffMethod === "LEAVE_AT_DOOR" || draft.handoffMethod === "HAND_TO_ME")
      && (draft.fulfillmentMethod === "LOCAL_DELIVERY" || draft.fulfillmentMethod === "OUT_OF_STATE_SHIPPING"),
  );
}
