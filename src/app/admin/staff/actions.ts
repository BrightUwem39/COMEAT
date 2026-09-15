"use server";

import { revalidatePath } from "next/cache";

import type { StaffRole } from "@/server/admin-auth";
import { writeAdminAuditLog } from "@/server/admin-audit";
import { assertCurrentAdmin, staffRoleLabels } from "@/server/admin-auth";
import { assignableStaffRoles } from "@/server/admin-staff";
import { db } from "@/server/db";

export type StaffActionState = { message: string; status: "error" | "idle" | "success" };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function grantStaffAccessAction(_state: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const admin = await assertCurrentAdmin("STAFF_MANAGE");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "") as StaffRole;
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return { message: "Enter a valid account email address.", status: "error" };
  if (!assignableStaffRoles.includes(role as typeof assignableStaffRoles[number])) return { message: "Choose a valid staff role.", status: "error" };

  const result = await db.$transaction(async (transaction) => {
    const user = await transaction.user.findUnique({ where: { email } });
    if (!user?.emailVerified) return { message: "Use an existing verified ComEat account email.", status: "error" as const };
    if (user.role !== "CUSTOMER") return { message: "That account already has staff access.", status: "error" as const };
    const updated = await transaction.user.update({ where: { id: user.id }, data: { active: true, role } });
    await writeAdminAuditLog(transaction, { action: "STAFF_ACCESS_UPDATED", actorUserId: admin.userId, afterData: { active: true, email: updated.email, role }, beforeData: { active: user.active, email: user.email, role: user.role }, entityId: updated.id, entityType: "STAFF" });
    return { message: `${updated.firstName} now has ${staffRoleLabels[role].toLowerCase()} access.`, status: "success" as const };
  });
  if (result.status === "success") revalidateStaffPages();
  return result;
}

export async function updateStaffAccessAction(_state: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const admin = await assertCurrentAdmin("STAFF_MANAGE");
  const id = String(formData.get("staffId") ?? "");
  const updatedAt = new Date(String(formData.get("staffUpdatedAt") ?? ""));
  const role = String(formData.get("role") ?? "") as StaffRole;
  const active = formData.get("active") === "on";
  if (!UUID_PATTERN.test(id) || Number.isNaN(updatedAt.getTime())) return { message: "This staff account could not be validated.", status: "error" };
  if (!assignableStaffRoles.includes(role as typeof assignableStaffRoles[number])) return { message: "Choose a valid staff role.", status: "error" };
  if (id === admin.userId) return { message: "Use another owner account to change your own staff access.", status: "error" };

  const result = await db.$transaction(async (transaction) => {
    const current = await transaction.user.findUnique({ where: { id } });
    if (!current || current.role === "CUSTOMER" || current.role === "ADMIN") return { message: "This protected staff account cannot be changed here.", status: "error" as const };
    const removingOwnerAccess = current.role === "OWNER" && (!active || role !== "OWNER");
    if (removingOwnerAccess) {
      const ownerCount = await transaction.user.count({ where: { active: true, role: { in: ["ADMIN", "OWNER"] } } });
      if (ownerCount <= 1) return { message: "Keep at least one active owner-level account.", status: "error" as const };
    }
    const updated = await transaction.user.updateMany({ where: { id, updatedAt }, data: { active, role } });
    if (updated.count !== 1) return { message: "This staff account changed while you were editing it. Refresh and try again.", status: "error" as const };
    if (!active) await transaction.session.deleteMany({ where: { userId: id } });
    await writeAdminAuditLog(transaction, { action: "STAFF_ACCESS_UPDATED", actorUserId: admin.userId, afterData: { active, email: current.email, role }, beforeData: { active: current.active, email: current.email, role: current.role }, entityId: id, entityType: "STAFF" });
    return { message: `${current.firstName}’s staff access was updated.`, status: "success" as const };
  });
  if (result.status === "success") revalidateStaffPages();
  return result;
}

function revalidateStaffPages() {
  revalidatePath("/admin/staff");
  revalidatePath("/admin/activity");
  revalidatePath("/admin");
}
