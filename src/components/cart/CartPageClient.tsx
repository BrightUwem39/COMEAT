"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { CartValidationResponse } from "@/lib/cart-validation";
import { useCart } from "./CartProvider";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function CartPageClient() {
  const { allergyInfo, items, itemCount, removeItem, updateAllergyInfo, updateQuantity } = useCart();
  const reduceMotion = useReducedMotion();
  const requestBody = useMemo(() => JSON.stringify({
    items: items.map((item) => ({
      key: item.key,
      itemId: item.itemId,
      sizeId: item.sizeId,
      proteinId: item.proteinId,
      grainId: item.grainId,
      pepperTolerance: item.pepperTolerance,
      quantity: item.quantity,
      unitPriceCents: Math.round(item.unitPrice * 100),
    })),
  }), [items]);
  const [validationAttempt, setValidationAttempt] = useState<{
    requestBody: string;
    result: CartValidationResponse | null;
    failed: boolean;
  } | null>(null);
  const currentAttempt = validationAttempt?.requestBody === requestBody ? validationAttempt : null;
  const validation = currentAttempt?.result ?? null;
  const validationStatus: "idle" | "checking" | "ready" | "error" = items.length === 0
    ? "idle"
    : !currentAttempt
      ? "checking"
      : currentAttempt.failed
        ? "error"
        : "ready";
  const validatedLines = useMemo(
    () => new Map(validation?.lines.map((line) => [line.key, line]) ?? []),
    [validation],
  );
  const allergyComplete = allergyInfo.status !== "unanswered"
    && allergyInfo.acknowledged
    && (allergyInfo.status === "none" || Boolean(allergyInfo.details.trim()));

  useEffect(() => {
    if (items.length === 0) return;

    const controller = new AbortController();
    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Cart validation failed");
        return response.json() as Promise<CartValidationResponse>;
      })
      .then((result) => {
        setValidationAttempt({ requestBody, result, failed: false });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setValidationAttempt({ requestBody, result: null, failed: true });
      });

    return () => controller.abort();
  }, [items.length, requestBody]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Nothing here yet</p>
        <h2 className="mt-4 font-display text-[1.75rem] tracking-[-0.03em] text-foreground sm:text-[2rem] lg:text-[2.5rem]">Your cart is ready when you are.</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted">Choose a meal, tray size, protein where applicable, and pepper tolerance from the menu.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-gold-light" href="/menu">Explore the menu</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <motion.div
        className="space-y-4"
        initial={reduceMotion ? false : { opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <CartValidationNotice status={validationStatus} validation={validation} />

        <section className="rounded-2xl border border-orange/35 bg-orange/5 p-5 sm:p-6" aria-labelledby="allergy-details-title">
          <div className="flex items-start gap-4">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-orange text-sm font-bold text-white">!</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange">Required order information</p>
              <h2 className="mt-2 font-display text-2xl leading-none text-foreground sm:text-[1.75rem]" id="allergy-details-title">Food allergies</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">Tell us about allergies for everyone sharing this order. This information will be attached to the order for the kitchen.</p>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground">Do you have any food allergies?</legend>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                aria-pressed={allergyInfo.status === "none"}
                className={`min-h-11 whitespace-nowrap rounded-lg border px-2 text-[10px] font-semibold transition-[background-color,border-color,color] min-[360px]:text-[11px] sm:px-4 sm:text-sm ${allergyInfo.status === "none" ? "border-gold bg-gold text-background" : "border-border bg-background text-muted hover:border-gold/60 hover:text-foreground"}`}
                onClick={() => updateAllergyInfo({ ...allergyInfo, status: "none", details: "" })}
                type="button"
              >
                No known allergies
              </button>
              <button
                aria-pressed={allergyInfo.status === "has-allergies"}
                className={`min-h-11 whitespace-nowrap rounded-lg border px-2 text-[10px] font-semibold transition-[background-color,border-color,color] min-[360px]:text-[11px] sm:px-4 sm:text-sm ${allergyInfo.status === "has-allergies" ? "border-orange bg-orange text-white" : "border-border bg-background text-muted hover:border-orange/70 hover:text-foreground"}`}
                onClick={() => updateAllergyInfo({ ...allergyInfo, status: "has-allergies" })}
                type="button"
              >
                Yes, I have allergies
              </button>
            </div>
          </fieldset>

          {allergyInfo.status === "has-allergies" ? (
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-foreground">Describe the allergies <span className="text-orange">Required</span></span>
              <textarea
                className="min-h-28 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted"
                onChange={(event) => updateAllergyInfo({ ...allergyInfo, details: event.target.value })}
                placeholder="Example: Severe peanut allergy. Please avoid peanut oil and contact with peanuts."
                required
                value={allergyInfo.details}
              />
              {!allergyInfo.details.trim() ? <span className="mt-2 block text-xs text-orange">Please describe the allergy before checkout.</span> : null}
            </label>
          ) : null}

          {allergyInfo.status !== "unanswered" ? (
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background/60 p-4">
              <input
                checked={allergyInfo.acknowledged}
                className="mt-0.5 size-4 shrink-0 accent-orange"
                onChange={(event) => updateAllergyInfo({ ...allergyInfo, acknowledged: event.target.checked })}
                type="checkbox"
              />
              <span className="text-xs leading-relaxed text-muted">I understand that menu items may share preparation areas and that cross-contact may still occur.</span>
            </label>
          ) : null}
        </section>

        <OrderSummary
          allergyComplete={allergyComplete}
          allergyDetails={allergyInfo.details}
          allergyStatus={allergyInfo.status}
          className="lg:hidden"
          itemCount={itemCount}
          reduceMotion={Boolean(reduceMotion)}
          subtotal={validationStatus === "ready" && validation?.valid ? validation.subtotalCents / 100 : null}
          validationStatus={validationStatus}
        />

        {items.map((item) => {
          const validatedLine = validatedLines.get(item.key);
          const linePrice = validatedLine?.lineTotalCents;
          return (
          <article className={`grid grid-cols-[5.75rem_minmax(0,1fr)] overflow-hidden rounded-xl border bg-surface min-[360px]:grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-5 sm:rounded-2xl sm:p-5 ${validatedLine && !validatedLine.valid ? "border-orange/70" : "border-border"}`} key={item.key}>
            <div className="relative min-h-full overflow-hidden bg-surface-elevated sm:min-h-36 sm:rounded-xl">
              <Image alt={item.name} className="object-cover" fill sizes="144px" src={item.image} />
            </div>
            <div className="flex min-w-0 flex-col justify-between gap-3 p-3 min-[360px]:p-4 sm:gap-5 sm:p-0">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                  <h2 className="font-display text-xl leading-none tracking-[-0.03em] text-foreground min-[360px]:text-2xl sm:text-[1.75rem]">{item.name}</h2>
                  <p className="mt-1.5 text-[11px] leading-snug text-muted sm:mt-2 sm:text-sm">{item.sizeLabel}{item.grainLabel ? ` · ${item.grainLabel}` : ""}{item.proteinLabel ? ` · ${item.proteinLabel}` : ""}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-orange sm:text-xs sm:tracking-[0.12em]">Pepper level {item.pepperTolerance}/5</p>
                </div>
                <strong className="shrink-0 text-sm text-gold min-[360px]:text-base sm:text-lg">
                  {linePrice !== undefined ? currency.format(linePrice / 100) : validationStatus === "checking" ? "Checking…" : "—"}
                </strong>
              </div>
              {validatedLine?.priceChanged && validatedLine.authoritativeUnitPriceCents !== undefined ? (
                <p className="text-xs font-semibold text-gold">Price updated to {currency.format(validatedLine.authoritativeUnitPriceCents / 100)} each.</p>
              ) : null}
              {validatedLine && !validatedLine.valid ? (
                <div className="space-y-1" role="alert">
                  {validatedLine.issues.map((issue) => <p className="text-xs leading-relaxed text-orange" key={issue.code}>{issue.message}</p>)}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-background" aria-label={`Quantity for ${item.name}`}>
                  <button aria-label={`Decrease ${item.name} quantity`} className="grid size-8 place-items-center text-base text-muted transition-colors hover:bg-surface-elevated hover:text-foreground sm:size-10 sm:text-lg" onClick={() => updateQuantity(item.key, item.quantity - 1)} type="button">−</button>
                  <span className="min-w-8 text-center text-xs font-bold text-foreground sm:min-w-10 sm:text-sm">{item.quantity}</span>
                  <button aria-label={`Increase ${item.name} quantity`} className="grid size-8 place-items-center text-base text-muted transition-colors hover:bg-surface-elevated hover:text-foreground sm:size-10 sm:text-lg" onClick={() => updateQuantity(item.key, item.quantity + 1)} type="button">+</button>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:text-orange sm:text-xs sm:tracking-[0.12em]" onClick={() => removeItem(item.key)} type="button">Remove</button>
              </div>
            </div>
          </article>
          );
        })}
      </motion.div>

      <OrderSummary
        allergyComplete={allergyComplete}
        allergyDetails={allergyInfo.details}
        allergyStatus={allergyInfo.status}
        className="hidden lg:sticky lg:top-28 lg:block"
        itemCount={itemCount}
        reduceMotion={Boolean(reduceMotion)}
        subtotal={validationStatus === "ready" && validation?.valid ? validation.subtotalCents / 100 : null}
        validationStatus={validationStatus}
      />
    </div>
  );
}

function CartValidationNotice({ status, validation }: {
  status: "idle" | "checking" | "ready" | "error";
  validation: CartValidationResponse | null;
}) {
  if (status === "idle") return null;
  const valid = status === "ready" && validation?.valid;
  const text = status === "checking"
    ? "Checking current prices and availability…"
    : status === "error"
      ? "We could not verify this cart. Please try again before checkout."
      : valid
        ? "Prices and meal options verified."
        : "Some cart items need attention before checkout.";

  return (
    <div
      aria-live="polite"
      className={`rounded-xl border px-4 py-3 text-xs font-semibold ${valid ? "border-gold/40 bg-gold/5 text-gold" : "border-orange/45 bg-orange/5 text-orange"}`}
      role={status === "error" || (status === "ready" && !validation?.valid) ? "alert" : "status"}
    >
      {text}
    </div>
  );
}

function OrderSummary({ allergyComplete, allergyDetails, allergyStatus, className, itemCount, reduceMotion, subtotal, validationStatus }: {
  allergyComplete: boolean;
  allergyDetails: string;
  allergyStatus: "has-allergies" | "none" | "unanswered";
  className: string;
  itemCount: number;
  reduceMotion: boolean;
  subtotal: number | null;
  validationStatus: "idle" | "checking" | "ready" | "error";
}) {
  const subtotalLabel = subtotal === null ? "—" : currency.format(subtotal);
  const checkoutReady = allergyComplete && validationStatus === "ready" && subtotal !== null;
  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-2xl border border-border bg-surface p-5 sm:p-6 ${className}`}
      initial={reduceMotion ? false : { opacity: 0, x: 28 }}
      transition={{ duration: 0.45, delay: 0.16 }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Order summary</p>
      <div className="mt-5 flex items-center justify-between border-b border-border pb-5 text-sm text-muted">
        <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        <span>{subtotalLabel}</span>
      </div>
      <div className="flex items-end justify-between gap-4 py-5">
        <span className="font-semibold text-foreground">Subtotal</span>
        <strong className="font-display text-3xl leading-none text-gold sm:text-[2rem]">{subtotalLabel}</strong>
      </div>
      {validationStatus !== "ready" || subtotal === null ? <p className="mb-5 text-xs leading-relaxed text-orange">The subtotal will appear after every item is verified.</p> : null}
      <div className="mb-5 rounded-lg border border-border bg-background/60 p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Allergy information</span>
          <span className={`text-xs font-bold uppercase tracking-[0.12em] ${allergyComplete ? "text-gold" : "text-orange"}`}>{allergyComplete ? "Complete" : "Required"}</span>
        </div>
        {allergyStatus === "has-allergies" && allergyDetails.trim() ? <p className="mt-3 text-xs leading-relaxed text-foreground/80">{allergyDetails.trim()}</p> : null}
      </div>
      <p className="text-xs leading-relaxed text-muted">Delivery fees and any applicable taxes will be calculated during checkout. Full payment is required before an order is confirmed.</p>
      {checkoutReady ? (
        <Link className="mt-6 flex min-h-12 items-center justify-center rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-[0.14em] text-background transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-gold-light" href="/checkout">
          Proceed to checkout
        </Link>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-muted">
          Complete verification and allergy details
        </div>
      )}
      <Link className="mt-3 flex min-h-11 items-center justify-center text-xs font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light" href="/menu">Add more dishes</Link>
    </motion.aside>
  );
}
