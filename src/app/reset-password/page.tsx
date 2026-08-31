import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new secure password for your ComEat account.",
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : undefined;
  const invalid = typeof query.error === "string";

  return (
    <AuthPageShell
      description="Choose a new password for your account. This secure link can only be used once."
      eyebrow="Secure reset"
      title="Choose a new password."
    >
      <ResetPasswordForm invalid={invalid} token={token} />
    </AuthPageShell>
  );
}
