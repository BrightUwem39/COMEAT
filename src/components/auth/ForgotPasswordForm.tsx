"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { authClient } from "@/lib/auth-client";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/auth-validation";
import {
  authFieldVariants,
  authFormVariants,
  menuControlVariants,
} from "@/lib/animations";

export function ForgotPasswordForm() {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const result = forgotPasswordSchema.safeParse({ email } satisfies ForgotPasswordValues);

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setPending(true);
    setError("");

    try {
      await authClient.requestPasswordReset({
        email: result.data.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setComplete(true);
    } catch {
      setComplete(true);
    } finally {
      setPending(false);
    }
  }

  if (complete) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-gold text-xl font-bold text-background" aria-hidden="true">✓</div>
        <h2 className="mt-6 font-display text-3xl tracking-[-0.03em] text-foreground">Check your inbox.</h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          If an account exists for that email, a secure reset link will arrive shortly. The link expires after one hour.
        </p>
        <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl border border-gold/35 px-6 text-xs font-bold uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold/10" href="/login">
          Return to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.form animate="visible" className="space-y-6" initial={reduceMotion ? false : "hidden"} noValidate onSubmit={handleSubmit} variants={reduceMotion ? undefined : authFormVariants}>
      <motion.label className="block" htmlFor="recovery-email" variants={reduceMotion ? undefined : authFieldVariants}>
        <span className="mb-2.5 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">Email address</span>
        <input
          aria-describedby={error ? "recovery-email-error" : undefined}
          aria-invalid={Boolean(error)}
          autoComplete="email"
          className={`min-h-14 w-full rounded-xl border bg-background/60 px-4 text-base text-foreground transition-colors duration-300 ${error ? "border-orange" : "border-border hover:border-gold/35"}`}
          id="recovery-email"
          inputMode="email"
          onChange={(event) => { setEmail(event.target.value); setError(""); }}
          type="email"
          value={email}
        />
        {error ? <span className="mt-2 block text-xs text-orange" id="recovery-email-error">{error}</span> : null}
      </motion.label>

      <motion.button
        className="flex min-h-14 w-full items-center justify-center rounded-xl bg-gold px-6 text-xs font-bold uppercase tracking-[0.18em] text-background transition-colors hover:bg-gold-light disabled:cursor-wait disabled:bg-gold/60"
        disabled={pending}
        type="submit"
        variants={reduceMotion ? undefined : menuControlVariants}
        whileHover={reduceMotion || pending ? undefined : "hover"}
        whileTap={reduceMotion || pending ? undefined : "tap"}
      >
        {pending ? "Sending secure link…" : "Send reset link"}
      </motion.button>

      <motion.p className="border-t border-border pt-6 text-center text-sm text-muted" variants={reduceMotion ? undefined : authFieldVariants}>
        Remembered it? <Link className="font-semibold text-gold hover:text-gold-light" href="/login">Sign in</Link>
      </motion.p>
    </motion.form>
  );
}
