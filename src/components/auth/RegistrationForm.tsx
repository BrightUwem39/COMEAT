"use client";

import Link from "next/link";
import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ZodIssue } from "zod";

import { authClient } from "@/lib/auth-client";
import { PasswordVisibilityIcon } from "@/components/auth/PasswordVisibilityIcon";
import {
  registrationSchema,
  type RegistrationValues,
} from "@/lib/auth-validation";
import {
  authFieldVariants,
  authFormVariants,
  menuControlVariants,
} from "@/lib/animations";

type FieldName = keyof RegistrationValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const initialValues: RegistrationValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function issuesToFieldErrors(issues: ZodIssue[]) {
  return issues.reduce<FieldErrors>((errors, issue) => {
    const field = issue.path[0] as FieldName | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}

function registrationErrorMessage(status: number, code?: string) {
  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (code === "PASSWORD_TOO_SHORT") {
    return "Your password must contain at least 10 characters.";
  }

  if (code === "PASSWORD_TOO_LONG") {
    return "Your password must contain no more than 128 characters.";
  }

  return "We could not create your account. Check your details and try again.";
}

export function RegistrationForm() {
  const reduceMotion = useReducedMotion();
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  function updateField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) return;

    const result = registrationSchema.safeParse(values);

    if (!result.success) {
      setFieldErrors(issuesToFieldErrors(result.error.issues));
      setFormError("Review the highlighted details before continuing.");
      return;
    }

    setPending(true);
    setFieldErrors({});
    setFormError("");

    try {
      const response = await authClient.signUp.email({
        name: `${result.data.firstName} ${result.data.lastName}`,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        email: result.data.email,
        password: result.data.password,
        callbackURL: `${window.location.origin}/verify-email?verified=1`,
        ...(result.data.phone ? { phone: result.data.phone } : {}),
      });

      if (response.error) {
        setFormError(
          registrationErrorMessage(
            response.error.status,
            response.error.code,
          ),
        );
        return;
      }

      setValues(initialValues);
      setComplete(true);
    } catch {
      setFormError("The connection was interrupted. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (complete) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="border border-gold/30 bg-gold/[0.06] p-7 sm:p-9"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="grid size-12 place-items-center rounded-full bg-gold text-2xl text-background" aria-hidden="true">
          ✓
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Check your inbox
        </p>
        <h2 className="mt-3 font-display text-3xl leading-none tracking-[-0.025em] text-foreground sm:text-4xl">
          Verify your email.
        </h2>
        <p className="mt-5 max-w-md text-sm leading-7 text-muted">
          If the address can receive a ComEat account email, a verification link is on its way. It expires after 24 hours.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-12 items-center justify-center bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-colors duration-200 hover:bg-gold-light"
            href="/login"
          >
            Go to sign in
          </Link>
          <button
            className="min-h-12 border border-border px-6 text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors duration-200 hover:border-foreground"
            onClick={() => setComplete(false)}
            type="button"
          >
            Use another email
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      animate="visible"
      className="space-y-6"
      initial={reduceMotion ? false : "hidden"}
      noValidate
      onSubmit={handleSubmit}
      variants={reduceMotion ? undefined : authFormVariants}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <AuthField
          autoComplete="given-name"
          error={fieldErrors.firstName}
          label="First name"
          name="firstName"
          onChange={(event) => updateField("firstName", event.target.value)}
          value={values.firstName}
        />
        <AuthField
          autoComplete="family-name"
          error={fieldErrors.lastName}
          label="Last name"
          name="lastName"
          onChange={(event) => updateField("lastName", event.target.value)}
          value={values.lastName}
        />
      </div>

      <AuthField
        autoComplete="email"
        error={fieldErrors.email}
        inputMode="email"
        label="Email address"
        name="email"
        onChange={(event) => updateField("email", event.target.value)}
        type="email"
        value={values.email}
      />

      <AuthField
        autoComplete="tel"
        error={fieldErrors.phone}
        inputMode="tel"
        label="Phone number"
        name="phone"
        onChange={(event) => updateField("phone", event.target.value)}
        optional
        type="tel"
        value={values.phone}
      />

      <PasswordField
        autoComplete="new-password"
        error={fieldErrors.password}
        label="Password"
        name="password"
        onChange={(event) => updateField("password", event.target.value)}
        onToggle={() => setShowPassword((shown) => !shown)}
        shown={showPassword}
        value={values.password}
      />

      <PasswordField
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        label="Confirm password"
        name="confirmPassword"
        onChange={(event) =>
          updateField("confirmPassword", event.target.value)
        }
        onToggle={() => setShowConfirmation((shown) => !shown)}
        shown={showConfirmation}
        value={values.confirmPassword}
      />

      <motion.p
        className="text-xs leading-5 text-muted"
        variants={reduceMotion ? undefined : authFieldVariants}
      >
        Use at least 10 characters. Pasted passwords and password managers are supported.
      </motion.p>

      {formError ? (
        <motion.p
          aria-live="polite"
          className="border-l-2 border-orange bg-orange/10 px-4 py-3 text-sm leading-6 text-foreground"
          initial={reduceMotion ? false : { opacity: 0, x: -12 }}
          role="alert"
          animate={{ opacity: 1, x: 0 }}
        >
          {formError}
        </motion.p>
      ) : null}

      <motion.div variants={reduceMotion ? undefined : authFieldVariants}>
        <motion.button
          className="flex min-h-14 w-full items-center justify-center rounded-xl bg-gold px-6 text-xs font-bold uppercase tracking-[0.18em] text-background shadow-[0_12px_35px_rgba(221,164,72,0.16)] transition-[background-color,box-shadow] duration-300 hover:bg-gold-light hover:shadow-[0_16px_42px_rgba(221,164,72,0.24)] disabled:cursor-wait disabled:bg-gold/60"
          disabled={pending}
          type="submit"
          variants={reduceMotion ? undefined : menuControlVariants}
          whileHover={reduceMotion || pending ? undefined : "hover"}
          whileTap={reduceMotion || pending ? undefined : "tap"}
        >
          {pending ? "Creating account…" : "Create account"}
        </motion.button>
      </motion.div>

      <motion.p
        className="border-t border-border pt-6 text-center text-sm text-muted"
        variants={reduceMotion ? undefined : authFieldVariants}
      >
        Already have an account?{" "}
        <Link className="font-semibold text-gold transition-colors hover:text-gold-light" href="/login">
          Sign in
        </Link>
      </motion.p>
    </motion.form>
  );
}

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
  optional?: boolean;
};

function AuthField({ error, label, optional, ...inputProps }: AuthFieldProps) {
  const reduceMotion = useReducedMotion();
  const errorId = error ? `${inputProps.name}-error` : undefined;

  return (
    <motion.label
      className="block"
      variants={reduceMotion ? undefined : authFieldVariants}
    >
      <span className="mb-2.5 flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
        {optional ? (
          <span className="font-normal normal-case tracking-normal text-muted">Optional</span>
        ) : null}
      </span>
      <input
        {...inputProps}
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={`min-h-14 w-full rounded-xl border bg-background/60 px-4 text-base text-foreground transition-[border-color,background-color] duration-300 placeholder:text-muted/50 ${
          error ? "border-orange" : "border-border hover:border-gold/35"
        }`}
      />
      {error ? (
        <span className="mt-2 block text-xs leading-5 text-orange" id={errorId}>
          {error}
        </span>
      ) : null}
    </motion.label>
  );
}

type PasswordFieldProps = AuthFieldProps & {
  onToggle: () => void;
  shown: boolean;
};

function PasswordField({
  error,
  label,
  onToggle,
  shown,
  ...inputProps
}: PasswordFieldProps) {
  const reduceMotion = useReducedMotion();
  const errorId = error ? `${inputProps.name}-error` : undefined;

  const inputId = String(inputProps.name);

  return (
    <motion.div className="block" variants={reduceMotion ? undefined : authFieldVariants}>
      <label className="mb-2.5 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted" htmlFor={inputId}>
        {label}
      </label>
      <span className="relative block">
        <input
          {...inputProps}
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className={`min-h-14 w-full rounded-xl border bg-background/60 px-4 pr-14 text-base text-foreground transition-[border-color,background-color] duration-300 ${
            error ? "border-orange" : "border-border hover:border-gold/35"
          }`}
          id={inputId}
          type={shown ? "text" : "password"}
        />
        <button
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 grid w-13 place-items-center rounded-r-xl text-muted transition-colors duration-300 hover:text-gold"
          onClick={onToggle}
          type="button"
        >
          <PasswordVisibilityIcon visible={shown} />
        </button>
      </span>
      {error ? (
        <span className="mt-2 block text-xs leading-5 text-orange" id={errorId}>
          {error}
        </span>
      ) : null}
    </motion.div>
  );
}
