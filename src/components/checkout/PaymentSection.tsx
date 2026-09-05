"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";

import type { PaymentIntentResponse } from "@/lib/payment-intent";
import { getStripePromise } from "@/lib/stripe-client";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const appearance: NonNullable<StripeElementsOptions["appearance"]> = {
  theme: "night",
  inputs: "spaced",
  labels: "above",
  variables: {
    colorPrimary: "#e6a51a",
    colorBackground: "#0a0a0a",
    colorText: "#f7f3ea",
    colorDanger: "#f26a00",
    colorTextSecondary: "#a7a29a",
    fontFamily: "Inter, Arial, sans-serif",
    borderRadius: "10px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #292929",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #292929",
      boxShadow: "none",
    },
    ".Tab": {
      border: "1px solid #292929",
      boxShadow: "none",
    },
    ".Tab:hover": {
      borderColor: "#e6a51a",
    },
    ".Tab--selected": {
      borderColor: "#e6a51a",
      boxShadow: "none",
    },
  },
};

type PaymentSectionProps = {
  amountCents: number;
  currency: string;
  orderReference: string;
};

export function PaymentSection({ amountCents, currency, orderReference }: PaymentSectionProps) {
  const reduceMotion = useReducedMotion();
  const stripePromise = getStripePromise();
  const [attempt, setAttempt] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPaymentIntent() {
      setClientSecret("");
      setLoadError("");

      if (!stripePromise) {
        setLoading(false);
        setLoadError("Online payment is not configured yet.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/checkout/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ orderReference }),
        });
        const result = await response.json() as PaymentIntentResponse | { error?: string };

        if (!response.ok || !("clientSecret" in result)) {
          throw new Error("error" in result && result.error ? result.error : "Payment could not be loaded.");
        }
        if (result.orderReference !== orderReference || result.amountCents !== amountCents) {
          throw new Error("The verified payment total does not match this order.");
        }

        if (active) setClientSecret(result.clientSecret);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Payment could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPaymentIntent();
    return () => { active = false; };
  }, [amountCents, attempt, orderReference, stripePromise]);

  const elementOptions: StripeElementsOptions | null = clientSecret
    ? {
        clientSecret,
        appearance,
        loader: "auto",
      }
    : null;

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-gold/35 bg-surface"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.08 }}
      aria-labelledby="payment-title"
    >
      <div className="border-b border-border p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">Secure payment</p>
            <h2 className="mt-3 font-display text-2xl tracking-[-0.03em] text-foreground sm:text-[1.75rem]" id="payment-title">Complete payment</h2>
          </div>
          <div className="sm:text-right">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">Amount due</p>
            <p className="mt-2 font-display text-3xl text-gold">{currencyFormatter.format(amountCents / 100)}</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-6 text-muted">Cards and Cash App Pay appear when eligible. Payment details are securely collected by Stripe and never touch ComEat servers.</p>
      </div>

      <div className="p-6 sm:p-8">
        {loading ? <PaymentLoading /> : null}
        {loadError ? (
          <div className="border-l-2 border-orange bg-orange/5 px-4 py-4" role="alert">
            <p className="text-sm text-orange">{loadError}</p>
            {stripePromise ? <button className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-foreground underline decoration-gold underline-offset-4" onClick={() => setAttempt((value) => value + 1)} type="button">Try again</button> : null}
          </div>
        ) : null}
        {stripePromise && elementOptions ? (
          <Elements options={elementOptions} stripe={stripePromise}>
            <StripePaymentForm amountCents={amountCents} currency={currency} orderReference={orderReference} />
          </Elements>
        ) : null}
      </div>
    </motion.section>
  );
}

function StripePaymentForm({ amountCents, currency, orderReference }: PaymentSectionProps) {
  const stripe = useStripe();
  const elements = useElements();
  const reduceMotion = useReducedMotion();
  const [elementReady, setElementReady] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements || submitting || !paymentComplete) return;

    setSubmitting(true);
    setMessage("");
    const resultUrl = new URL("/checkout/payment-result", window.location.origin);
    resultUrl.searchParams.set("orderReference", orderReference);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: resultUrl.toString() },
      redirect: "if_required",
    });

    if (result.error) {
      setMessage(result.error.message ?? "Payment could not be completed. Try again.");
      setSubmitting(false);
      return;
    }

    if (result.paymentIntent) {
      resultUrl.searchParams.set("payment_intent", result.paymentIntent.id);
      window.location.assign(resultUrl.toString());
      return;
    }

    setMessage("Payment could not be verified. Try again.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={elementReady ? "opacity-100 transition-opacity" : "min-h-40 opacity-0"}>
        <PaymentElement
          onChange={(event) => {
            setPaymentComplete(event.complete);
          }}
          onReady={() => setElementReady(true)}
          options={{
            layout: {
              type: "accordion",
              defaultCollapsed: false,
              radios: "always",
              spacedAccordionItems: true,
            },
          }}
        />
      </div>

      {message ? <p className="mt-5 border-l-2 border-orange bg-orange/5 px-4 py-3 text-sm leading-6 text-orange" aria-live="polite">{message}</p> : null}

      <motion.button
        className="mt-6 min-h-12 w-full rounded-lg bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!stripe || !elements || !elementReady || !paymentComplete || submitting}
        type="submit"
        whileHover={reduceMotion || submitting ? undefined : { y: -2 }}
        whileTap={reduceMotion || submitting ? undefined : { scale: 0.985 }}
      >
        {submitting ? "Processing securely…" : `Pay ${currencyFormatter.format(amountCents / 100)} ${currency.toUpperCase()}`}
      </motion.button>
      <p className="mt-4 text-center text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">Secured by Stripe</p>
    </form>
  );
}

function PaymentLoading() {
  return (
    <div aria-label="Loading secure payment form" className="animate-pulse space-y-4" role="status">
      <div className="h-12 rounded-lg bg-background" />
      <div className="h-24 rounded-lg bg-background" />
      <div className="h-12 rounded-lg bg-background" />
    </div>
  );
}
