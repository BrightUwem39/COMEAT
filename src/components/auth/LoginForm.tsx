"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { authClient, useSession } from "@/lib/auth-client";
import { PasswordVisibilityIcon } from "@/components/auth/PasswordVisibilityIcon";
import { loginSchema, type LoginValues } from "@/lib/auth-validation";
import {
  authFieldVariants,
  authFormVariants,
  menuControlVariants,
} from "@/lib/animations";

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const initialValues: LoginValues = {
  email: "",
  password: "",
};

function loginErrorMessage(status: number, code?: string) {
  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (status === 403 || code === "EMAIL_NOT_VERIFIED") {
    return "Verify your email before signing in. We have sent a fresh verification link if the account is eligible.";
  }

  return "The email or password is incorrect.";
}

type LoginFormProps = { returnTo?: string };

export function LoginForm({ returnTo = "/profile" }: LoginFormProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { data: session, isPending: sessionPending, refetch } = useSession();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(field: keyof LoginValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
    setNotice("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) return;

    const result = loginSchema.safeParse(values);

    if (!result.success) {
      const nextErrors: LoginErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginValues | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }

      setErrors(nextErrors);
      setFormError("Review the highlighted details before continuing.");
      return;
    }

    setPending(true);
    setErrors({});
    setFormError("");
    setNotice("");

    try {
      const response = await authClient.signIn.email({
        email: result.data.email,
        password: result.data.password,
      });

      if (response.error) {
        setFormError(loginErrorMessage(response.error.status, response.error.code));
        return;
      }

      router.replace(returnTo);
      router.refresh();
    } catch {
      setFormError("The connection was interrupted. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleLogout() {
    if (pending) return;

    setPending(true);
    setFormError("");
    setNotice("");

    try {
      const response = await authClient.signOut();

      if (response.error) {
        setFormError("We could not sign you out. Please try again.");
        return;
      }

      await refetch();
      setValues(initialValues);
      setNotice("You have signed out securely.");
      router.refresh();
    } catch {
      setFormError("The connection was interrupted. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (sessionPending) {
    return (
      <div aria-busy="true" aria-label="Checking account session" className="space-y-4">
        <div className="menu-image-shimmer h-12" />
        <div className="menu-image-shimmer h-12" />
        <div className="menu-image-shimmer h-12" />
      </div>
    );
  }

  if (session) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="border border-gold/30 bg-gold/[0.06] p-7 sm:p-9"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="grid size-12 place-items-center rounded-full bg-gold text-xl font-bold text-background" aria-hidden="true">
          {session.user.name.charAt(0).toUpperCase()}
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Signed in
        </p>
        <h2 className="mt-3 font-display text-3xl leading-none tracking-[-0.025em] text-foreground sm:text-4xl">
          Welcome back, {session.user.firstName}.
        </h2>
        <p className="mt-5 text-sm leading-7 text-muted">
          You are signed in as {session.user.email}.
        </p>

        {formError ? (
          <p className="mt-5 border-l-2 border-orange bg-orange/10 px-4 py-3 text-sm text-foreground" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-12 items-center justify-center bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-colors duration-200 hover:bg-gold-light"
            href="/profile"
          >
            View profile
          </Link>
          <motion.button
            className="min-h-12 border border-border px-6 text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors duration-200 hover:border-foreground disabled:cursor-wait disabled:text-muted"
            disabled={pending}
            onClick={handleLogout}
            type="button"
            variants={reduceMotion ? undefined : menuControlVariants}
            whileHover={reduceMotion || pending ? undefined : "hover"}
            whileTap={reduceMotion || pending ? undefined : "tap"}
          >
            {pending ? "Signing out…" : "Sign out"}
          </motion.button>
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
      {notice ? (
        <motion.p
          animate={{ opacity: 1, x: 0 }}
          aria-live="polite"
          className="border-l-2 border-gold bg-gold/10 px-4 py-3 text-sm leading-6 text-foreground"
          initial={reduceMotion ? false : { opacity: 0, x: -12 }}
        >
          {notice}
        </motion.p>
      ) : null}

      <motion.label className="block" htmlFor="login-email" variants={reduceMotion ? undefined : authFieldVariants}>
        <span className="mb-2.5 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
          Email address
        </span>
        <input
          aria-describedby={errors.email ? "login-email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          className={`min-h-14 w-full rounded-xl border bg-background/60 px-4 text-base text-foreground transition-[border-color,background-color] duration-300 placeholder:text-muted/50 ${errors.email ? "border-orange" : "border-border hover:border-gold/35"}`}
          id="login-email"
          inputMode="email"
          name="email"
          onChange={(event) => updateField("email", event.target.value)}
          type="email"
          value={values.email}
        />
        {errors.email ? (
          <span className="mt-2 block text-xs leading-5 text-orange" id="login-email-error">
            {errors.email}
          </span>
        ) : null}
      </motion.label>

      <motion.div className="block" variants={reduceMotion ? undefined : authFieldVariants}>
        <span className="mb-2.5 flex items-center justify-between gap-4">
          <label className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted" htmlFor="login-password">
            Password
          </label>
          <Link className="text-xs font-semibold text-gold transition-colors duration-300 hover:text-gold-light" href="/forgot-password">
            Forgot password?
          </Link>
        </span>
        <span className="relative block">
          <input
            aria-describedby={errors.password ? "login-password-error" : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete="current-password"
            className={`min-h-14 w-full rounded-xl border bg-background/60 px-4 pr-14 text-base text-foreground transition-[border-color,background-color] duration-300 ${errors.password ? "border-orange" : "border-border hover:border-gold/35"}`}
            id="login-password"
            name="password"
            onChange={(event) => updateField("password", event.target.value)}
            type={showPassword ? "text" : "password"}
            value={values.password}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-13 place-items-center rounded-r-xl text-muted transition-colors duration-300 hover:text-gold"
            onClick={() => setShowPassword((shown) => !shown)}
            type="button"
          >
            <PasswordVisibilityIcon visible={showPassword} />
          </button>
        </span>
        {errors.password ? (
          <span className="mt-2 block text-xs leading-5 text-orange" id="login-password-error">
            {errors.password}
          </span>
        ) : null}
      </motion.div>

      {formError ? (
        <motion.p
          animate={{ opacity: 1, x: 0 }}
          aria-live="polite"
          className="border-l-2 border-orange bg-orange/10 px-4 py-3 text-sm leading-6 text-foreground"
          initial={reduceMotion ? false : { opacity: 0, x: -12 }}
          role="alert"
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
          {pending ? "Signing in…" : "Sign in"}
        </motion.button>
      </motion.div>

      <motion.p className="border-t border-border pt-6 text-center text-sm text-muted" variants={reduceMotion ? undefined : authFieldVariants}>
        New to ComEat?{" "}
        <Link className="font-semibold text-gold transition-colors hover:text-gold-light" href="/register">
          Create an account
        </Link>
      </motion.p>
    </motion.form>
  );
}
