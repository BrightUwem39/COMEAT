import "server-only";

import { cache } from "react";

import type { StaffRole } from "@/server/admin-auth";
import { assertCurrentAdmin, staffRoleLabels, staffRolePermissions } from "@/server/admin-auth";
import { db } from "@/server/db";

export const assignableStaffRoles = ["OWNER", "MANAGER", "CASHIER", "CHEF", "SUPPORT"] as const satisfies readonly StaffRole[];

export const staffRoleDescriptions: Record<typeof assignableStaffRoles[number], string> = {
  OWNER: "Full operational and staff access.",
  MANAGER: "Runs daily operations without staff administration.",
  CASHIER: "Handles orders and views customer details.",
  CHEF: "Controls kitchen orders, menu availability, and stock.",
  SUPPORT: "Manages enquiries and assists customers.",
};

export const getAdminStaff = cache(async () => {
  const currentAdmin = await assertCurrentAdmin("STAFF_MANAGE");
  const staff = await db.user.findMany({
    orderBy: [{ active: "desc" }, { firstName: "asc" }, { lastName: "asc" }],
    select: { active: true, createdAt: true, email: true, firstName: true, id: true, lastName: true, role: true, updatedAt: true },
    where: { role: { not: "CUSTOMER" } },
  });

  return {
    active: staff.filter((member) => member.active).length,
    currentUserId: currentAdmin.userId,
    leadership: staff.filter((member) => member.active && ["ADMIN", "OWNER", "MANAGER"].includes(member.role)).length,
    roleDefinitions: assignableStaffRoles.map((role) => ({ description: staffRoleDescriptions[role], label: staffRoleLabels[role], permissions: staffRolePermissions[role], role })),
    staff: staff.map((member) => ({
      ...member,
      createdAt: member.createdAt.toISOString(),
      roleLabel: staffRoleLabels[member.role as StaffRole],
      updatedAt: member.updatedAt.toISOString(),
    })),
    total: staff.length,
  };
});
