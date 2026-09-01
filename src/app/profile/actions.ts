"use server";

import { revalidatePath } from "next/cache";

import { addressSchema } from "@/lib/address-validation";
import { requireCurrentCustomer } from "@/server/auth-session";
import { db } from "@/server/db";

export type AddressActionState = {
  error: string;
  saved: boolean;
};

export async function saveAddressAction(
  _previousState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const customer = await requireCurrentCustomer("/profile");
  const result = addressSchema.safeParse({
    id: optionalValue(formData, "id"),
    label: optionalValue(formData, "label"),
    recipientName: value(formData, "recipientName"),
    phone: value(formData, "phone"),
    streetLine1: value(formData, "streetLine1"),
    streetLine2: optionalValue(formData, "streetLine2"),
    city: value(formData, "city"),
    state: value(formData, "state"),
    postalCode: value(formData, "postalCode"),
    countryCode: value(formData, "countryCode"),
    isDefault: formData.get("isDefault") === "on",
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Review the address details.", saved: false };
  }

  const { id, isDefault, ...address } = result.data;
  const addressData = {
    ...address,
    countryCode: address.countryCode.toUpperCase(),
    label: address.label ?? null,
    streetLine2: address.streetLine2 ?? null,
  };

  try {
    await db.$transaction(async (transaction) => {
      const addressCount = await transaction.address.count({ where: { userId: customer.userId } });
      const existingAddress = id
        ? await transaction.address.findFirst({ where: { id, userId: customer.userId }, select: { isDefault: true } })
        : null;
      if (id && !existingAddress) throw new Error("ADDRESS_NOT_FOUND");
      const makeDefault = isDefault || addressCount === 0 || Boolean(existingAddress?.isDefault);

      if (makeDefault) {
        await transaction.address.updateMany({
          where: { userId: customer.userId },
          data: { isDefault: false },
        });
      }

      if (id) {
        const update = await transaction.address.updateMany({
          where: { id, userId: customer.userId },
          data: { ...addressData, isDefault: makeDefault },
        });
        if (update.count !== 1) throw new Error("ADDRESS_NOT_FOUND");
      } else {
        await transaction.address.create({
          data: { ...addressData, isDefault: makeDefault, userId: customer.userId },
        });
      }
    });
  } catch {
    return { error: "We could not save this address. Please try again.", saved: false };
  }

  revalidatePath("/profile");
  return { error: "", saved: true };
}

export async function setDefaultAddressAction(formData: FormData) {
  const customer = await requireCurrentCustomer("/profile");
  const id = optionalValue(formData, "id");
  if (!id) return;

  await db.$transaction(async (transaction) => {
    const owned = await transaction.address.findFirst({
      where: { id, userId: customer.userId },
      select: { id: true },
    });
    if (!owned) return;

    await transaction.address.updateMany({
      where: { userId: customer.userId },
      data: { isDefault: false },
    });
    await transaction.address.update({
      where: { id: owned.id },
      data: { isDefault: true },
    });
  });
  revalidatePath("/profile");
}

export async function deleteAddressAction(formData: FormData) {
  const customer = await requireCurrentCustomer("/profile");
  const id = optionalValue(formData, "id");
  if (!id) return;

  await db.$transaction(async (transaction) => {
    const address = await transaction.address.findFirst({
      where: { id, userId: customer.userId },
      select: { id: true, isDefault: true },
    });
    if (!address) return;

    await transaction.address.delete({ where: { id: address.id } });
    if (address.isDefault) {
      const nextAddress = await transaction.address.findFirst({
        where: { userId: customer.userId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      if (nextAddress) {
        await transaction.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }
  });
  revalidatePath("/profile");
}

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry : "";
}

function optionalValue(formData: FormData, key: string) {
  const entry = value(formData, key).trim();
  return entry || undefined;
}
