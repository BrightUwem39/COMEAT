"use server";

import { revalidatePath } from "next/cache";

import { inquiryStatuses, type AdminInquiryStatus } from "@/lib/admin-inquiry";
import { writeAdminAuditLog } from "@/server/admin-audit";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

export type UpdateInquiryState = {
  message: string;
  status: "error" | "idle" | "success";
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ASSIGNMENT_ACTIONS = ["KEEP", "SELF", "UNASSIGN"] as const;

export async function updateInquiryAction(
  _previousState: UpdateInquiryState,
  formData: FormData,
): Promise<UpdateInquiryState> {
  const admin = await assertCurrentAdmin("INQUIRIES_MANAGE");
  const id = String(formData.get("id") ?? "");
  const type = String(formData.get("type") ?? "");
  const requestedStatus = String(formData.get("inquiryStatus") ?? "");
  const assignment = String(formData.get("assignment") ?? "KEEP");
  const internalNote = String(formData.get("internalNote") ?? "").trim();
  const updatedAt = new Date(String(formData.get("updatedAt") ?? ""));

  if (!UUID_PATTERN.test(id) || !["CATERING", "CONTACT"].includes(type) || Number.isNaN(updatedAt.getTime())) {
    return { message: "This enquiry could not be validated. Refresh and try again.", status: "error" };
  }
  if (!inquiryStatuses.includes(requestedStatus as AdminInquiryStatus)) {
    return { message: "Choose a valid enquiry status.", status: "error" };
  }
  if (!ASSIGNMENT_ACTIONS.includes(assignment as typeof ASSIGNMENT_ACTIONS[number])) {
    return { message: "Choose a valid assignment option.", status: "error" };
  }
  if (internalNote.length > 1_000) {
    return { message: "Internal notes must be 1,000 characters or fewer.", status: "error" };
  }

  const updated = await db.$transaction(async (transaction) => {
    const existing = type === "CONTACT"
      ? await transaction.contactMessage.findUnique({ where: { id }, select: { assignedUserId: true, internalNote: true, status: true } })
      : await transaction.cateringInquiry.findUnique({ where: { id }, select: { assignedUserId: true, internalNote: true, status: true } });
    if (!existing) return false;

    const assignedUserId = assignment === "SELF" ? admin.userId : assignment === "UNASSIGN" ? null : existing.assignedUserId;
    const data = { assignedUserId, internalNote: internalNote || null, status: requestedStatus as AdminInquiryStatus };
    const result = type === "CONTACT"
      ? await transaction.contactMessage.updateMany({ where: { id, updatedAt }, data })
      : await transaction.cateringInquiry.updateMany({ where: { id, updatedAt }, data });
    if (result.count !== 1) return false;

    await writeAdminAuditLog(transaction, {
      action: "INQUIRY_UPDATED",
      actorUserId: admin.userId,
      beforeData: { assignedUserId: existing.assignedUserId ?? "UNASSIGNED", hasInternalNote: Boolean(existing.internalNote), status: existing.status },
      afterData: { assignedUserId: assignedUserId ?? "UNASSIGNED", hasInternalNote: Boolean(internalNote), status: requestedStatus },
      entityId: id,
      entityType: type === "CONTACT" ? "CONTACT_MESSAGE" : "CATERING_INQUIRY",
    });
    return true;
  });

  if (!updated) {
    return { message: "This enquiry changed while you were viewing it. Refresh before saving again.", status: "error" };
  }

  const routeType = type.toLowerCase();
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${routeType}/${id}`);
  revalidatePath("/admin/activity");
  return { message: "Enquiry details were updated.", status: "success" };
}
