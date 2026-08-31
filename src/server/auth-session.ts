import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSafeCustomerReturnTo } from "@/lib/customer-return-to";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export type CustomerSessionDTO = {
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "CUSTOMER";
  userId: string;
};

export const getCurrentCustomer = cache(async (): Promise<CustomerSessionDTO | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      firstName: true,
      lastName: true,
      role: true,
      active: true,
    },
  });

  if (!user?.active || !user.emailVerified) {
    if (user) await db.session.deleteMany({ where: { userId: user.id } });
    return null;
  }

  return {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    userId: user.id,
  };
});

export async function requireCurrentCustomer(returnTo = "/profile") {
  const customer = await getCurrentCustomer();
  if (!customer) {
    const safeReturnTo = getSafeCustomerReturnTo(returnTo);
    redirect(`/login?returnTo=${encodeURIComponent(safeReturnTo)}`);
  }
  return customer;
}
