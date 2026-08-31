import type { Metadata } from "next";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/AuthPageShell";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Confirm your ComEat account email.",
};

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const query = await searchParams;
  const hasError = typeof query.error === "string";
  const verified = query.verified === "1" && !hasError;

  return (
    <AuthPageShell
      description={verified ? "Your email address has been confirmed securely." : "Email verification keeps your account and order details protected."}
      eyebrow="Email verification"
      title={verified ? "You’re verified." : "Verify your email."}
    >
      <div className="text-center">
        <div className={`mx-auto grid size-12 place-items-center rounded-full text-xl font-bold ${verified ? "bg-gold text-background" : "border border-orange/40 bg-orange/10 text-orange"}`} aria-hidden="true">{verified ? "✓" : "×"}</div>
        <h2 className="mt-6 font-display text-3xl tracking-[-0.03em] text-foreground">{verified ? "Your account is ready." : "Verification link unavailable."}</h2>
        <p className="mt-4 text-sm leading-7 text-muted">{verified ? "You can now sign in and continue to your ComEat profile." : "The link is invalid or has expired. Attempting to sign in will send a fresh verification email if the account is eligible."}</p>
        <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-6 text-xs font-bold uppercase tracking-[0.15em] text-background hover:bg-gold-light" href="/login">Continue to sign in</Link>
      </div>
    </AuthPageShell>
  );
}
