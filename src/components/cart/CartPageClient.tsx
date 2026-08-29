"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "./CartProvider";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function CartPageClient() {
  const { allergyInfo, items, itemCount, removeItem, subtotal, updateAllergyInfo, updateQuantity } = useCart();
  const reduceMotion = useReducedMotion();
  const allergyComplete = allergyInfo.status !== "unanswered"
    && allergyInfo.acknowledged
    && (allergyInfo.status === "none" || Boolean(allergyInfo.details.trim()));

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Nothing here yet</p>
        <h2 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground sm:text-5xl">Your cart is ready when you are.</h2>
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
        <section className="rounded-2xl border border-orange/35 bg-orange/5 p-5 sm:p-6" aria-labelledby="allergy-details-title">
          <div className="flex items-start gap-4">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-orange text-sm font-bold text-white">!</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange">Required order information</p>
              <h2 className="mt-2 font-display text-3xl leading-none text-foreground" id="allergy-details-title">Food allergies</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">Tell us about allergies for everyone sharing this order. This information will be attached to the order for the kitchen.</p>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground">Do you have any food allergies?</legend>
            <div className="grid grid-cols-2 gap-3">
              <button
                aria-pressed={allergyInfo.status === "none"}
                className={`min-h-11 rounded-lg border px-4 text-sm font-semibold transition-[background-color,border-color,color] ${allergyInfo.status === "none" ? "border-gold bg-gold text-background" : "border-border bg-background text-muted hover:border-gold/60 hover:text-foreground"}`}
                onClick={() => updateAllergyInfo({ ...allergyInfo, status: "none", details: "" })}
                type="button"
              >
                No known allergies
              </button>
              <button
                aria-pressed={allergyInfo.status === "has-allergies"}
                className={`min-h-11 rounded-lg border px-4 text-sm font-semibold transition-[background-color,border-color,color] ${allergyInfo.status === "has-allergies" ? "border-orange bg-orange text-white" : "border-border bg-background text-muted hover:border-orange/70 hover:text-foreground"}`}
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

        {items.map((item) => (
          <article className="grid gap-5 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:p-5" key={item.key}>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-elevated sm:aspect-auto sm:min-h-36">
              <Image alt={item.name} className="object-cover" fill sizes="144px" src={item.image} />
            </div>
            <div className="flex min-w-0 flex-col justify-between gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl leading-none tracking-[-0.03em] text-foreground">{item.name}</h2>
                  <p className="mt-2 text-sm text-muted">{item.sizeLabel}{item.grainLabel ? ` · ${item.grainLabel}` : ""}{item.proteinLabel ? ` · ${item.proteinLabel}` : ""}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-orange">Pepper level {item.pepperTolerance}/5</p>
                </div>
                <strong className="shrink-0 text-lg text-gold">{currency.format(item.unitPrice * item.quantity)}</strong>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-background" aria-label={`Quantity for ${item.name}`}>
                  <button aria-label={`Decrease ${item.name} quantity`} className="grid size-10 place-items-center text-lg text-muted transition-colors hover:bg-surface-elevated hover:text-foreground" onClick={() => updateQuantity(item.key, item.quantity - 1)} type="button">−</button>
                  <span className="min-w-10 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                  <button aria-label={`Increase ${item.name} quantity`} className="grid size-10 place-items-center text-lg text-muted transition-colors hover:bg-surface-elevated hover:text-foreground" onClick={() => updateQuantity(item.key, item.quantity + 1)} type="button">+</button>
                </div>
                <button className="text-xs font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-orange" onClick={() => removeItem(item.key)} type="button">Remove</button>
              </div>
            </div>
          </article>
        ))}
      </motion.div>

      <motion.aside
        className="rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-28"
        initial={reduceMotion ? false : { opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Order summary</p>
        <div className="mt-5 flex items-center justify-between border-b border-border pb-5 text-sm text-muted">
          <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          <span>{currency.format(subtotal)}</span>
        </div>
        <div className="flex items-end justify-between gap-4 py-5">
          <span className="font-semibold text-foreground">Subtotal</span>
          <strong className="font-display text-4xl leading-none text-gold">{currency.format(subtotal)}</strong>
        </div>
        <div className="mb-5 rounded-lg border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Allergy information</span>
            <span className={`text-xs font-bold uppercase tracking-[0.12em] ${allergyComplete ? "text-gold" : "text-orange"}`}>{allergyComplete ? "Complete" : "Required"}</span>
          </div>
          {allergyInfo.status === "has-allergies" && allergyInfo.details.trim() ? <p className="mt-3 text-xs leading-relaxed text-foreground/80">{allergyInfo.details.trim()}</p> : null}
        </div>
        <p className="text-xs leading-relaxed text-muted">Delivery fees and any applicable taxes will be calculated during checkout. Full payment is required before an order is confirmed.</p>
        <div className="mt-6 rounded-lg border border-dashed border-border px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-muted">Checkout setup is the next step</div>
        <Link className="mt-3 flex min-h-11 items-center justify-center text-xs font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light" href="/menu">Add more dishes</Link>
      </motion.aside>
    </div>
  );
}
