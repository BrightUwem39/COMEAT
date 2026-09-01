import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a secure ComEat password reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      description="Enter your account email and we’ll send you a secure recovery link."
      eyebrow="Account recovery"
      title="Reset your password"
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
