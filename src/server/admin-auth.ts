import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getSafeCustomerReturnTo } from "@/lib/customer-return-to";
import {
  getCurrentCustomer,
  type CustomerSessionDTO,
} from "@/server/auth-session";

export type AdminSessionDTO = CustomerSessionDTO & { role: "ADMIN" };

export class AdminAuthorizationError extends Error {
  constructor() {
    super("Administrator authorization is required.");
    this.name = "AdminAuthorizationError";
  }
}

function isAdmin(customer: CustomerSessionDTO | null): customer is AdminSessionDTO {
  return customer?.role === "ADMIN";
}

export const getCurrentAdmin = cache(async (): Promise<AdminSessionDTO | null> => {
  const customer = await getCurrentCustomer();
  return isAdmin(customer) ? customer : null;
});

export async function requireCurrentAdmin(returnTo = "/admin") {
  const customer = await getCurrentCustomer();

  if (!customer) {
    const safeReturnTo = getSafeCustomerReturnTo(returnTo, "/admin");
    redirect(`/login?returnTo=${encodeURIComponent(safeReturnTo)}`);
  }

  if (!isAdmin(customer)) redirect("/profile");
  return customer;
}

export async function assertCurrentAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AdminAuthorizationError();
  return admin;
}
