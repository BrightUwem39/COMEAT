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
        className="text-left"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      >
        <div className="grid size-10 place-items-center rounded-full bg-background text-base font-bold text-foreground" aria-hidden="true">✓</div>
        <h2 className="mt-4 font-display text-xl tracking-[-0.025em] text-background">Check your inbox.</h2>
        <p className="mt-2 text-xs leading-5 text-background/60 sm:text-sm">
          If an account exists for that email, a secure reset link will arrive shortly. The link expires after one hour.
        </p>
        <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-background px-5 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-surface" href="/login">
          Return to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.form animate="visible" className="space-y-4" initial={reduceMotion ? false : "hidden"} noValidate onSubmit={handleSubmit} variants={reduceMotion ? undefined : authFormVariants}>
      <motion.label className="block" htmlFor="recovery-email" variants={reduceMotion ? undefined : authFieldVariants}>
        <span className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-background/55">Email address</span>
        <input
          aria-describedby={error ? "recovery-email-error" : undefined}
          aria-invalid={Boolean(error)}
          autoComplete="email"
          className={`min-h-11 w-full rounded-lg border bg-white/55 px-3.5 text-sm text-background transition-colors duration-300 ${error ? "border-orange" : "border-background/15 hover:border-background/30"}`}
          id="recovery-email"
          inputMode="email"
          onChange={(event) => { setEmail(event.target.value); setError(""); }}
          type="email"
          value={email}
        />
        {error ? <span className="mt-2 block text-xs text-orange" id="recovery-email-error">{error}</span> : null}
      </motion.label>

      <motion.button
        className="group relative flex min-h-11 w-full items-center justify-center rounded-lg bg-background px-12 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-foreground shadow-[0_12px_26px_rgba(5,5,5,0.13)] transition-[background-color,box-shadow] duration-300 hover:bg-surface hover:shadow-[0_16px_34px_rgba(5,5,5,0.18)] disabled:cursor-wait disabled:bg-background/60"
        disabled={pending}
        type="submit"
        variants={reduceMotion ? undefined : menuControlVariants}
        whileHover={reduceMotion || pending ? undefined : "hover"}
        whileTap={reduceMotion || pending ? undefined : "tap"}
      >
        {pending ? "Sending secure link…" : "Send reset link"}
        <span aria-hidden="true" className="absolute right-5 text-xl font-normal transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </motion.button>

      <motion.p className="border-t border-background/10 pt-4 text-left text-xs text-background/55" variants={reduceMotion ? undefined : authFieldVariants}>
        Remembered it? <Link className="font-semibold text-orange transition-colors hover:text-background" href="/login">Sign in</Link>
      </motion.p>
    </motion.form>
  );
}
