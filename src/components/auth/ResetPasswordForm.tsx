"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { PasswordVisibilityIcon } from "@/components/auth/PasswordVisibilityIcon";
import { authClient } from "@/lib/auth-client";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/auth-validation";
import { authFieldVariants, authFormVariants, menuControlVariants } from "@/lib/animations";

type ResetPasswordFormProps = {
  invalid: boolean;
  token?: string;
};

type FieldName = keyof ResetPasswordValues;

export function ResetPasswordForm({ invalid, token }: ResetPasswordFormProps) {
  const reduceMotion = useReducedMotion();
  const [values, setValues] = useState<ResetPasswordValues>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [shown, setShown] = useState({ password: false, confirmPassword: false });

  function updateField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !token) return;

    const result = resetPasswordSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: Partial<Record<FieldName, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as FieldName | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      setFormError("Review the highlighted details before continuing.");
      return;
    }

    setPending(true);
    setFormError("");
    try {
      const response = await authClient.resetPassword({ newPassword: result.data.password, token });
      if (response.error) {
        setFormError("This reset link is invalid or has expired. Request a new one to continue.");
        return;
      }
      setComplete(true);
    } catch {
      setFormError("This reset link could not be used. Request a new one to continue.");
    } finally {
      setPending(false);
    }
  }

  if (complete) {
    return (
      <motion.div animate={{ opacity: 1, y: 0 }} className="text-center" initial={reduceMotion ? false : { opacity: 0, y: 18 }}>
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-gold text-xl font-bold text-background" aria-hidden="true">✓</div>
        <h2 className="mt-6 font-display text-3xl tracking-[-0.03em] text-foreground">Password updated.</h2>
        <p className="mt-4 text-sm leading-7 text-muted">Your previous sessions have been signed out. Use your new password to continue.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-6 text-xs font-bold uppercase tracking-[0.15em] text-background hover:bg-gold-light" href="/login">Sign in securely</Link>
      </motion.div>
    );
  }

  if (invalid || !token) {
    return (
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full border border-orange/40 bg-orange/10 text-xl text-orange" aria-hidden="true">×</div>
        <h2 className="mt-6 font-display text-3xl tracking-[-0.03em] text-foreground">Link unavailable.</h2>
        <p className="mt-4 text-sm leading-7 text-muted">This reset link is invalid or has expired. Request a new secure link to continue.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-6 text-xs font-bold uppercase tracking-[0.15em] text-background hover:bg-gold-light" href="/forgot-password">Request a new link</Link>
      </div>
    );
  }

  return (
    <motion.form animate="visible" className="space-y-6" initial={reduceMotion ? false : "hidden"} noValidate onSubmit={handleSubmit} variants={reduceMotion ? undefined : authFormVariants}>
      <ResetPasswordField error={errors.password} label="New password" name="password" onChange={(value) => updateField("password", value)} onToggle={() => setShown((current) => ({ ...current, password: !current.password }))} shown={shown.password} value={values.password} />
      <ResetPasswordField error={errors.confirmPassword} label="Confirm new password" name="confirmPassword" onChange={(value) => updateField("confirmPassword", value)} onToggle={() => setShown((current) => ({ ...current, confirmPassword: !current.confirmPassword }))} shown={shown.confirmPassword} value={values.confirmPassword} />
      <p className="text-xs leading-5 text-muted">Use at least 8 characters, begin with a capital letter, and include a number. All active sessions will be revoked after this change.</p>
      {formError ? <p className="border-l-2 border-orange bg-orange/10 px-4 py-3 text-sm leading-6 text-foreground" role="alert">{formError}</p> : null}
      <motion.button className="flex min-h-14 w-full items-center justify-center rounded-xl bg-gold px-6 text-xs font-bold uppercase tracking-[0.18em] text-background hover:bg-gold-light disabled:cursor-wait disabled:bg-gold/60" disabled={pending} type="submit" variants={reduceMotion ? undefined : menuControlVariants} whileHover={reduceMotion || pending ? undefined : "hover"} whileTap={reduceMotion || pending ? undefined : "tap"}>{pending ? "Updating password…" : "Update password"}</motion.button>
    </motion.form>
  );
}

type ResetPasswordFieldProps = {
  error?: string;
  label: string;
  name: FieldName;
  onChange: (value: string) => void;
  onToggle: () => void;
  shown: boolean;
  value: string;
};

function ResetPasswordField({ error, label, name, onChange, onToggle, shown, value }: ResetPasswordFieldProps) {
  const id = `reset-${name}`;
  return (
    <motion.div variants={authFieldVariants}>
      <label className="mb-2.5 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted" htmlFor={id}>{label}</label>
      <span className="relative block">
        <input aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} autoComplete="new-password" className={`min-h-14 w-full rounded-xl border bg-background/60 px-4 pr-14 text-base text-foreground ${error ? "border-orange" : "border-border hover:border-gold/35"}`} id={id} onChange={(event) => onChange(event.target.value)} type={shown ? "text" : "password"} value={value} />
        <button aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute inset-y-0 right-0 grid w-13 place-items-center rounded-r-xl text-muted transition-colors hover:text-gold" onClick={onToggle} type="button"><PasswordVisibilityIcon visible={shown} /></button>
      </span>
      {error ? <span className="mt-2 block text-xs text-orange" id={`${id}-error`}>{error}</span> : null}
    </motion.div>
  );
}
