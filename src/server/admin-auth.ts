import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getSafeCustomerReturnTo } from "@/lib/customer-return-to";
import {
  getCurrentCustomer,
  type CustomerSessionDTO,
} from "@/server/auth-session";
import type { UserRole } from "@/generated/prisma/client";

export const adminPermissions = [
  "OVERVIEW_VIEW",
  "ORDERS_VIEW",
  "ORDERS_MANAGE",
  "REFUNDS_MANAGE",
  "MENU_MANAGE",
  "INQUIRIES_MANAGE",
  "CUSTOMERS_VIEW",
  "CUSTOMERS_MANAGE",
  "ANALYTICS_VIEW",
  "PROMOTIONS_MANAGE",
  "INVENTORY_MANAGE",
  "REPORTS_EXPORT",
  "AUDIT_VIEW",
  "STAFF_MANAGE",
] as const;

export type AdminPermission = typeof adminPermissions[number];
export type StaffRole = Exclude<UserRole, "CUSTOMER">;
export type AdminSessionDTO = CustomerSessionDTO & { permissions: AdminPermission[]; role: StaffRole; roleLabel: string };

export const staffRoleLabels: Record<StaffRole, string> = {
  ADMIN: "Administrator",
  OWNER: "Owner",
  MANAGER: "Manager",
  CASHIER: "Cashier",
  CHEF: "Chef",
  SUPPORT: "Support",
};

const allPermissions = [...adminPermissions];
export const staffRolePermissions: Record<StaffRole, AdminPermission[]> = {
  ADMIN: allPermissions,
  OWNER: allPermissions,
  MANAGER: allPermissions.filter((permission) => permission !== "STAFF_MANAGE"),
  CASHIER: ["OVERVIEW_VIEW", "ORDERS_VIEW", "ORDERS_MANAGE", "CUSTOMERS_VIEW"],
  CHEF: ["OVERVIEW_VIEW", "ORDERS_VIEW", "ORDERS_MANAGE", "MENU_MANAGE", "INVENTORY_MANAGE"],
  SUPPORT: ["OVERVIEW_VIEW", "ORDERS_VIEW", "INQUIRIES_MANAGE", "CUSTOMERS_VIEW"],
};

export class AdminAuthorizationError extends Error {
  constructor() {
    super("Your staff role does not permit this action.");
    this.name = "AdminAuthorizationError";
  }
}

function isStaffRole(role: UserRole): role is StaffRole {
  return role !== "CUSTOMER";
}

function toAdminSession(customer: CustomerSessionDTO | null): AdminSessionDTO | null {
  if (!customer || !isStaffRole(customer.role)) return null;
  return { ...customer, permissions: staffRolePermissions[customer.role], role: customer.role, roleLabel: staffRoleLabels[customer.role] };
}

export const getCurrentAdmin = cache(async (): Promise<AdminSessionDTO | null> => {
  const customer = await getCurrentCustomer();
  return toAdminSession(customer);
});

export async function requireCurrentAdmin(returnTo = "/admin") {
  const customer = await getCurrentCustomer();

  if (!customer) {
    const safeReturnTo = getSafeCustomerReturnTo(returnTo, "/admin");
    redirect(`/login?returnTo=${encodeURIComponent(safeReturnTo)}`);
  }

  const admin = toAdminSession(customer);
  if (!admin) redirect("/profile");
  return admin;
}

export async function assertCurrentAdmin(permission?: AdminPermission) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AdminAuthorizationError();
  if (permission && !admin.permissions.includes(permission)) throw new AdminAuthorizationError();
  return admin;
}
