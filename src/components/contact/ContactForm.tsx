"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { submitContactMessageAction } from "@/app/contact/actions";
import { initialContactMessageState, type ContactMessageActionState, type ContactMessageField } from "@/lib/contact-message";
import { authFieldVariants, authFormVariants, menuControlVariants } from "@/lib/animations";

const inputClassName = "h-11 w-full rounded-lg border border-border bg-background/70 px-3.5 text-sm text-foreground placeholder:text-muted/65 transition-colors hover:border-white/20";
const labelClassName = "mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-muted";

export function ContactForm() {
  const reduceMotion = useReducedMotion();
  const [state, formAction, pending] = useActionState(submitContactMessageAction, initialContactMessageState);
  const formStartedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formStartedAtRef.current) {
      formStartedAtRef.current.value = String(Date.now());
    }
  }, []);

  return (
    <motion.section
      animate="visible"
      className="min-w-0 rounded-[1.5rem] border border-border bg-surface/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-7 lg:p-8"
      initial={reduceMotion ? false : "hidden"}
      variants={reduceMotion ? undefined : authFormVariants}
    >
      <motion.div className="border-b border-border pb-5" variants={reduceMotion ? undefined : authFieldVariants}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">Send a message</p>
        <h2 className="mt-2 font-display text-2xl leading-none tracking-[-0.03em] text-foreground sm:text-3xl">How can we help?</h2>
        <p className="mt-3 text-sm leading-6 text-muted">Share your question below and give us enough detail to respond clearly.</p>
      </motion.div>

      <motion.form action={formAction} className="mt-6 grid min-w-0 gap-5 sm:grid-cols-2" variants={reduceMotion ? undefined : authFormVariants}>
        <div aria-hidden="true" className="absolute left-[-10000px] size-px overflow-hidden">
          <label htmlFor="contact-company-website">Company website</label>
          <input autoComplete="off" id="contact-company-website" name="companyWebsite" tabIndex={-1} type="text" />
        </div>
        <input name="formStartedAt" ref={formStartedAtRef} type="hidden" />
        <motion.label className="min-w-0" variants={reduceMotion ? undefined : authFieldVariants}>
          <span className={labelClassName}>Full name</span>
          <input aria-describedby="customerName-error" aria-invalid={hasError(state.fieldErrors, "customerName")} autoComplete="name" className={inputClassName} maxLength={120} name="customerName" placeholder="Your full name" required type="text" />
          <FieldError errors={state.fieldErrors?.customerName} id="customerName-error" />
        </motion.label>

        <motion.label className="min-w-0" variants={reduceMotion ? undefined : authFieldVariants}>
          <span className={labelClassName}>Email address</span>
          <input aria-describedby="customerEmail-error" aria-invalid={hasError(state.fieldErrors, "customerEmail")} autoComplete="email" className={inputClassName} maxLength={254} name="customerEmail" placeholder="you@example.com" required type="email" />
          <FieldError errors={state.fieldErrors?.customerEmail} id="customerEmail-error" />
        </motion.label>

        <motion.label className="min-w-0" variants={reduceMotion ? undefined : authFieldVariants}>
          <span className={labelClassName}>Phone number <span className="font-normal normal-case tracking-normal">(optional)</span></span>
          <input aria-describedby="customerPhone-error" aria-invalid={hasError(state.fieldErrors, "customerPhone")} autoComplete="tel" className={inputClassName} maxLength={25} name="customerPhone" placeholder="Your best contact number" type="tel" />
          <FieldError errors={state.fieldErrors?.customerPhone} id="customerPhone-error" />
        </motion.label>

        <motion.label className="min-w-0" variants={reduceMotion ? undefined : authFieldVariants}>
          <span className={labelClassName}>Subject</span>
          <input aria-describedby="subject-error" aria-invalid={hasError(state.fieldErrors, "subject")} className={inputClassName} maxLength={140} name="subject" placeholder="What is this about?" required type="text" />
          <FieldError errors={state.fieldErrors?.subject} id="subject-error" />
        </motion.label>

        <motion.label className="min-w-0 sm:col-span-2" variants={reduceMotion ? undefined : authFieldVariants}>
          <span className={labelClassName}>Message</span>
          <textarea aria-describedby="message-error" aria-invalid={hasError(state.fieldErrors, "message")} className="min-h-36 w-full resize-y rounded-lg border border-border bg-background/70 px-3.5 py-3 text-sm leading-6 text-foreground placeholder:text-muted/65 transition-colors hover:border-white/20" maxLength={2000} minLength={10} name="message" placeholder="Tell us how we can help" required />
          <FieldError errors={state.fieldErrors?.message} id="message-error" />
        </motion.label>

        <motion.div className="min-w-0 sm:col-span-2" variants={reduceMotion ? undefined : authFieldVariants}>
          {state.message ? (
            <p aria-live="polite" className={`mb-4 border-l-2 px-4 py-3 text-xs leading-5 ${state.status === "success" ? "border-gold bg-gold/5 text-foreground/80" : "border-orange bg-orange/5 text-orange"}`}>
              {state.message}
            </p>
          ) : null}
          <motion.button
            className="group flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-gold px-5 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-background transition-[background-color,box-shadow] hover:bg-gold-light hover:shadow-[0_12px_30px_rgba(230,165,26,0.2)] sm:w-auto"
            disabled={pending || state.status === "success"}
            type="submit"
            variants={reduceMotion ? undefined : menuControlVariants}
            whileHover={reduceMotion ? undefined : "hover"}
            whileTap={reduceMotion ? undefined : "tap"}
          >
            {pending ? "Sending message…" : "Send message"}
            <svg aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 20 20">
              <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.section>
  );
}

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  return errors?.[0] ? <span className="mt-1.5 block text-xs text-orange" id={id}>{errors[0]}</span> : null;
}

function hasError(errors: ContactMessageActionState["fieldErrors"], field: ContactMessageField) {
  return Boolean(errors?.[field]?.length);
}
