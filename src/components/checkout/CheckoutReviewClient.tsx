"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { PaymentSection } from "@/components/checkout/PaymentSection";
import type { CartValidationResponse } from "@/lib/cart-validation";
import type { CheckoutOrderResponse } from "@/lib/checkout-order";
import { DELIVERY_DRAFT_STORAGE_KEY, isDeliveryDraft, type DeliveryDraft } from "@/lib/delivery-draft";
import type { CheckoutRulesDTO } from "@/server/checkout";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function CheckoutReviewClient({ rules }: { rules: CheckoutRulesDTO }) {
  const { allergyInfo, clearCart, items } = useCart();
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState<DeliveryDraft | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [validation, setValidation] = useState<CartValidationResponse | null>(null);
  const [validationError, setValidationError] = useState("");
  const [orderPending, setOrderPending] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CheckoutOrderResponse["order"] | null>(null);
  const checkoutToken = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    window.queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = window.sessionStorage.getItem(DELIVERY_DRAFT_STORAGE_KEY);
        const parsed: unknown = saved ? JSON.parse(saved) : null;
        if (isDeliveryDraft(parsed)) setDraft(parsed);
      } catch {
        window.sessionStorage.removeItem(DELIVERY_DRAFT_STORAGE_KEY);
      } finally {
        setDraftLoaded(true);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!draft || items.length === 0) return;
    let active = true;
    void fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
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
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Validation failed");
        return response.json() as Promise<CartValidationResponse>;
      })
      .then((result) => {
        if (!active) return;
        setValidation(result);
        if (!result.valid) setValidationError("One or more order items changed. Return to your order and review them.");
      })
      .catch(() => {
        if (active) setValidationError("We could not verify current prices and availability. Please try again.");
      });
    return () => { active = false; };
  }, [draft, items]);

  useEffect(() => {
    if (!createdOrder) return;
    const frame = window.requestAnimationFrame(() => document.getElementById("checkout-payment")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }));
    return () => window.cancelAnimationFrame(frame);
  }, [createdOrder, reduceMotion]);

  if (createdOrder) return <OrderCreated order={createdOrder} />;

  if (items.length === 0) {
    return <EmptyState heading="Choose your dishes first." href="/menu" link="Explore the menu" />;
  }

  if (!draftLoaded) {
    return <p className="py-16 text-center text-sm text-muted" role="status">Loading delivery details…</p>;
  }

  if (!draft) {
    return <EmptyState heading="Add your delivery details first." href="/delivery" link="Go to delivery" />;
  }

  const allergyReady = allergyInfo.status !== "unanswered"
    && allergyInfo.acknowledged
    && (allergyInfo.status === "none" || Boolean(allergyInfo.details.trim()));

  async function handlePlaceOrder() {
    if (orderPending || !draft || !validation?.valid || !allergyReady) return;
    setOrderError("");
    setOrderPending(true);
    checkoutToken.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/checkout/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          checkoutToken: checkoutToken.current,
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
          fulfillmentMethod: draft.fulfillmentMethod,
          handoffMethod: draft.handoffMethod,
          requestedDate: draft.requestedDate,
          deliveryNotes: draft.deliveryNotes,
          address: draft.address,
          allergy: allergyInfo.status === "has-allergies"
            ? { status: "has-allergies", details: allergyInfo.details.trim(), acknowledged: true }
            : { status: "none", details: "", acknowledged: true },
        }),
      });
      const result = await response.json() as CheckoutOrderResponse | { error?: string };
      if (!response.ok || !("order" in result)) {
        setOrderError("error" in result && result.error ? result.error : "The order could not be created. Please try again.");
        return;
      }
      setCreatedOrder(result.order);
      window.sessionStorage.removeItem(DELIVERY_DRAFT_STORAGE_KEY);
      clearCart();
    } catch {
      setOrderError("The connection was interrupted. Please try again.");
    } finally {
      setOrderPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <motion.section animate={{ opacity: 1, x: 0 }} className="py-2 sm:py-4" initial={reduceMotion ? false : { opacity: 0, x: 18 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">Final check</p>
        <h2 className="mt-3 font-display text-2xl text-foreground sm:text-[1.75rem]">Review your order</h2>
        <div className="mt-7 divide-y divide-border">
          {validation?.valid ? validation.lines.map((line) => {
            const cartItem = items.find((item) => item.key === line.key);
            if (!cartItem || line.lineTotalCents === undefined) return null;
            return (
              <article className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center" key={line.key}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-background"><Image alt="" className="object-cover" fill sizes="88px" src={cartItem.image} /></div>
                <div className="min-w-0"><h3 className="font-semibold text-foreground">{line.productName ?? cartItem.name}</h3><p className="mt-1 text-xs leading-5 text-muted">{line.variantLabel ?? cartItem.sizeLabel}{line.grainLabel ? ` · ${line.grainLabel}` : ""}{line.proteinLabel ? ` · ${line.proteinLabel}` : ""}</p><p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-orange">{cartItem.pepperTolerance !== undefined ? `Pepper ${cartItem.pepperTolerance}/5 · ` : ""}Quantity {line.quantity}</p></div>
                <strong className="col-start-2 text-sm text-gold sm:col-start-auto sm:text-base">{currency.format(line.lineTotalCents / 100)}</strong>
              </article>
            );
          }) : <p className="py-8 text-sm text-muted">Verifying your order…</p>}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <ReviewBlock label="Fulfillment" value={draft.fulfillmentMethod === "LOCAL_DELIVERY" ? "Local delivery" : "Out-of-state shipping"} />
          <ReviewBlock label="Delivery method" value={draft.handoffMethod === "LEAVE_AT_DOOR" ? "Leave at door" : "Hand it to me"} />
          <ReviewBlock label="Requested date" value={formatDate(draft.requestedDate)} />
          <ReviewBlock label="Delivery window" value={`${formatTime(rules.deliveryWindowStart)}–${formatTime(rules.deliveryWindowEnd)}`} />
          <ReviewBlock label="Deliver to" value={`${draft.address.recipientName} · ${draft.address.streetLine1}, ${draft.address.city}, ${draft.address.state} ${draft.address.postalCode}`} />
        </div>
        <Link className="mt-4 inline-flex whitespace-nowrap text-xs font-bold uppercase tracking-[0.12em] text-gold hover:text-gold-light" href="/delivery">Edit delivery details</Link>

        <div className="mt-5"><p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">Allergy information</p><p className="mt-2 text-sm text-foreground">{allergyInfo.status === "has-allergies" ? allergyInfo.details.trim() : "No known allergies declared."}</p></div>
        {draft.deliveryNotes ? <ReviewBlock className="mt-4" label="Delivery notes" value={draft.deliveryNotes} /> : null}
        {validation?.valid ? <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Verified subtotal</p><strong className="font-display text-3xl text-gold">{currency.format(validation.subtotalCents / 100)}</strong></div> : null}
        {validationError ? <p className="mt-4 border-l-2 border-orange bg-orange/5 px-4 py-3 text-sm text-orange" role="alert">{validationError}</p> : null}
        {!allergyReady ? <p className="mt-4 border-l-2 border-orange bg-orange/5 px-4 py-3 text-sm text-orange">Complete allergy details on the order page before payment.</p> : null}
        {orderError ? <p className="mt-4 border-l-2 border-orange bg-orange/5 px-4 py-3 text-sm text-orange" role="alert">{orderError}</p> : null}
        <motion.button className="mt-5 min-h-11 w-full whitespace-nowrap rounded-lg bg-gold px-4 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-background transition-[background-color,box-shadow] hover:bg-gold-light hover:shadow-[0_12px_30px_rgba(230,165,26,0.16)] disabled:cursor-wait disabled:opacity-60 sm:px-5 sm:text-[0.68rem] sm:tracking-[0.12em]" disabled={orderPending || !validation?.valid || !allergyReady} onClick={handlePlaceOrder} type="button" whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }}>{orderPending ? "Preparing payment…" : "Continue to payment"}</motion.button>
      </motion.section>

    </div>
  );
}

function EmptyState({ heading, href, link }: { heading: string; href: string; link: string }) {
  return <section className="py-14 text-center"><h2 className="font-display text-3xl text-foreground">{heading}</h2><Link className="mt-7 inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg bg-gold px-5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-background" href={href}>{link}</Link></section>;
}

function ReviewBlock({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return <div className={`py-2 ${className}`}><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">{label}</p><p className="mt-1 text-sm leading-5 text-foreground">{value}</p></div>;
}

function OrderCreated({ order }: { order: CheckoutOrderResponse["order"] }) {
  return <div className="mx-auto max-w-3xl space-y-8"><section className="py-4 sm:py-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Order created</p><h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">Pending payment.</h2><p className="mt-4 text-sm leading-7 text-muted">Your order is saved, but it is not confirmed until full payment is completed.</p><dl className="mt-5 grid gap-3 sm:grid-cols-2"><ReviewBlock label="Order reference" value={order.publicReference} /><ReviewBlock label="Amount due" value={currency.format(order.totalCents / 100)} /></dl></section><div className="scroll-mt-24" id="checkout-payment"><PaymentSection amountCents={order.totalCents} currency={order.currency} orderReference={order.publicReference} /></div></div>;
}

function formatTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: minute ? "2-digit" : undefined }).format(new Date(2000, 0, 1, hour, minute));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
