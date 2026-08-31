import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { getCurrentCustomer } from "@/server/auth-session";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your ComEat customer account.",
};

export default async function RegisterPage() {
  if (await getCurrentCustomer()) redirect("/profile");

  return (
    <AuthPageShell
      description="Create one secure account for smoother checkout, saved preferences, and order history."
      eyebrow="Join the table"
      title="Good food, made easier."
      wide
    >
      <RegistrationForm />
    </AuthPageShell>
  );
}
