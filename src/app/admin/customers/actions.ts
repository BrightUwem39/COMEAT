"use server";

import { revalidatePath } from "next/cache";

import { writeAdminAuditLog } from "@/server/admin-audit";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export type UpdateCustomerState = { message: string; status: "error" | "idle" | "success" };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateCustomerAccessAction(
  _previousState: UpdateCustomerState,
  formData: FormData,
): Promise<UpdateCustomerState> {
  const admin = await assertCurrentAdmin();
  const id = String(formData.get("id") ?? "");
  const updatedAt = new Date(String(formData.get("updatedAt") ?? ""));
  const nextActive = String(formData.get("nextActive") ?? "") === "true";

  if (!UUID_PATTERN.test(id) || Number.isNaN(updatedAt.getTime())) {
    return { message: "This customer account could not be validated.", status: "error" };
  }

  const updated = await db.$transaction(async (transaction) => {
    const customer = await transaction.user.findFirst({ where: { id, role: "CUSTOMER" }, select: { active: true } });
    if (!customer) return false;
    const result = await transaction.user.updateMany({
      where: { id, role: "CUSTOMER", updatedAt },
      data: { active: nextActive },
    });
    if (result.count !== 1) return false;
    if (!nextActive) await transaction.session.deleteMany({ where: { userId: id } });
    await writeAdminAuditLog(transaction, {
      action: "CUSTOMER_ACCESS_UPDATED",
      actorUserId: admin.userId,
      beforeData: { active: customer.active },
      afterData: { active: nextActive },
      entityId: id,
      entityType: "CUSTOMER",
    });
    return true;
  });

  if (!updated) {
    return { message: "The account changed while you were viewing it. Refresh before trying again.", status: "error" };
  }

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/activity");
  return { message: nextActive ? "Customer access was restored." : "Customer access was disabled and active sessions were closed.", status: "success" };
}
