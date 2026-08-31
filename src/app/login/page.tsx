import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeCustomerReturnTo } from "@/lib/customer-return-to";
import { getCurrentCustomer } from "@/server/auth-session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in securely to your ComEat customer account.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const query = await searchParams;
  const returnTo = getSafeCustomerReturnTo(query.returnTo);
  if (await getCurrentCustomer()) redirect(returnTo);

  return (
    <AuthPageShell
      description="Sign in to manage your details, preferences, and ComEat orders."
      eyebrow="Welcome back"
      title="Your table is waiting."
    >
      <LoginForm returnTo={returnTo} />
    </AuthPageShell>
  );
}
