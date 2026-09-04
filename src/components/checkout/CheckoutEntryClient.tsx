"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, type FormEvent } from "react";

import { useCart } from "@/components/cart/CartProvider";
import type { CartValidationResponse } from "@/lib/cart-validation";
import type { CheckoutOrderResponse } from "@/lib/checkout-order";
import type { CheckoutAddressDTO, CheckoutRulesDTO } from "@/server/checkout";

type CheckoutCustomer = { email: string; firstName: string; lastName: string };
type FulfillmentMethod = "LOCAL_DELIVERY" | "OUT_OF_STATE_SHIPPING";
type HandoffMethod = "LEAVE_AT_DOOR" | "HAND_TO_ME";
type DeliveryDraft = {
  fulfillmentMethod: FulfillmentMethod;
  handoffMethod: HandoffMethod;
  requestedDate: string;
  deliveryNotes: string;
  address: Omit<CheckoutAddressDTO, "id" | "isDefault" | "label">;
};

const weekdayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function CheckoutEntryClient({ addresses, customer, rules }: {
  addresses: CheckoutAddressDTO[];
  customer: CheckoutCustomer;
  rules: CheckoutRulesDTO;
}) {
  const { allergyInfo, clearCart, itemCount, items } = useCart();
  const reduceMotion = useReducedMotion();
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const [handoffMethod, setHandoffMethod] = useState<HandoffMethod>("LEAVE_AT_DOOR");
  const [requestedDate, setRequestedDate] = useState("");
  const [formError, setFormError] = useState("");
  const [deliveryComplete, setDeliveryComplete] = useState(false);
  const [reviewPending, setReviewPending] = useState(false);
  const [deliveryDraft, setDeliveryDraft] = useState<DeliveryDraft | null>(null);
  const [validatedCart, setValidatedCart] = useState<CartValidationResponse | null>(null);
  const [orderPending, setOrderPending] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CheckoutOrderResponse["order"] | null>(null);
  const checkoutToken = useRef<string | null>(null);

  if (createdOrder) {
    return <OrderCreated order={createdOrder} />;
  }

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-surface px-6 py-14 text-center sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Your cart is empty</p>
        <h2 className="mt-4 font-display text-3xl tracking-[-0.035em] text-foreground">Choose your dishes first.</h2>
        <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-gold-light" href="/menu">Explore the menu</Link>
      </section>
    );
  }

  const allergyReady = allergyInfo.status !== "unanswered"
    && allergyInfo.acknowledged
    && (allergyInfo.status === "none" || Boolean(allergyInfo.details.trim()));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reviewPending) return;
    setFormError("");
    setDeliveryComplete(false);
    const form = new FormData(event.currentTarget);
    if (!manualAddressComplete(form)) {
      setFormError("Complete every required contact and delivery-address field.");
      return;
    }
    const address = manualAddressSnapshot(form);
    const fulfillmentMethod = fulfillmentMethodForState(address.state);

    if (!requestedDate || requestedDate < rules.earliestFulfillmentDate) {
      setFormError(`Choose a date at least ${rules.minimumAdvanceHours} hours from now.`);
      return;
    }

    if (fulfillmentMethod === "OUT_OF_STATE_SHIPPING") {
      const weekday = weekdayNames[new Date(`${requestedDate}T12:00:00Z`).getUTCDay()];
      if (!rules.outOfStateShippingDays.includes(weekday)) {
        setFormError(`Out-of-state shipping is available ${formatDayList(rules.outOfStateShippingDays)} only.`);
        return;
      }
    }

    if (!allergyReady) {
      setFormError("Complete the required allergy details in your cart before reviewing this order.");
      return;
    }

    setReviewPending(true);
    try {
      const response = await fetch("/api/cart/validate", {
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
      });
      if (!response.ok) throw new Error("Cart validation failed");
      const validation = await response.json() as CartValidationResponse;
      if (!validation.valid) {
        setValidatedCart(validation);
        setFormError("One or more cart items changed. Return to your cart and review the highlighted items.");
        return;
      }

      setDeliveryDraft({
        fulfillmentMethod,
        handoffMethod,
        requestedDate,
        deliveryNotes: formValue(form, "deliveryNotes"),
        address,
      });
      setValidatedCart(validation);
      setDeliveryComplete(true);
    } catch {
      setValidatedCart(null);
      setFormError("We could not verify current prices and availability. Please try again.");
    } finally {
      setReviewPending(false);
    }
  }

  async function handlePlaceOrder() {
    if (orderPending || !deliveryComplete || !deliveryDraft || !validatedCart?.valid || !allergyReady) return;
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
          fulfillmentMethod: deliveryDraft.fulfillmentMethod,
          handoffMethod: deliveryDraft.handoffMethod,
          requestedDate: deliveryDraft.requestedDate,
          deliveryNotes: deliveryDraft.deliveryNotes,
          address: deliveryDraft.address,
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
      clearCart();
    } catch {
      setOrderError("The connection was interrupted. Please try again.");
    } finally {
      setOrderPending(false);
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start" noValidate onChange={() => { setDeliveryComplete(false); setValidatedCart(null); }} onSubmit={handleSubmit}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface" aria-label="Checkout information">
          <div className="p-6 sm:p-8">
            <CheckoutSectionHeader number="01" title="Contact information" />
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <CheckoutField autoComplete="name" className="sm:col-span-2" defaultValue={`${customer.firstName} ${customer.lastName}`} label="Full name" name="recipientName" required />
              <CheckoutField defaultValue={customer.email} label="Email" name="contactEmail" readOnly required type="email" />
              <CheckoutField autoComplete="tel" defaultValue={defaultAddress?.phone ?? ""} label="Phone number" name="phone" required type="tel" />
            </div>
            <p className="mt-4 text-xs leading-5 text-muted">Your verified email keeps this order connected to your account for tracking.</p>
          </div>

          <div className="border-t border-border p-6 sm:p-8">
            <CheckoutSectionHeader number="02" title="Delivery address" />
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <CheckoutField autoComplete="address-line1" className="sm:col-span-2" defaultValue={defaultAddress?.streetLine1 ?? ""} label="Street address" name="streetLine1" required />
              <CheckoutField autoComplete="address-line2" defaultValue={defaultAddress?.streetLine2 ?? ""} label="Apt / Suite / Unit" name="streetLine2" />
              <CheckoutField autoComplete="address-level2" defaultValue={defaultAddress?.city ?? ""} label="City" name="city" required />
              <CheckoutField autoComplete="address-level1" defaultValue={defaultAddress?.state ?? ""} label="State" name="state" required />
              <CheckoutField autoComplete="postal-code" defaultValue={defaultAddress?.postalCode ?? ""} label="ZIP code" name="postalCode" required />
              <label className="block">
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">Requested delivery date</span>
                <input className="min-h-12 w-full border-b border-border bg-transparent px-1 text-sm text-foreground" min={rules.earliestFulfillmentDate} name="requestedDate" onChange={(event) => { setRequestedDate(event.target.value); setDeliveryComplete(false); }} required type="date" value={requestedDate} />
                <span className="mt-2 block text-xs leading-5 text-muted">Minimum {rules.minimumAdvanceHours} hours&apos; notice.</span>
              </label>
              <div className="border border-border bg-background/40 p-4"><p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">Delivery window</p><p className="mt-3 font-semibold text-foreground">{formatTime(rules.deliveryWindowStart)}–{formatTime(rules.deliveryWindowEnd)}</p></div>
            </div>
            <input name="countryCode" type="hidden" value="US" />
            <label className="mt-6 block">
              <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">Delivery instructions <span className="normal-case tracking-normal">(optional)</span></span>
              <textarea className="min-h-24 w-full resize-y border-b border-border bg-transparent px-1 py-3 text-sm text-foreground" maxLength={500} name="deliveryNotes" placeholder="Gate code, building access, landmarks, or another helpful note." />
            </label>
            <p className="mt-4 border-l-2 border-orange bg-orange/5 px-4 py-3 text-xs leading-6 text-muted">Addresses outside Georgia use {formatDayList(rules.outOfStateShippingDays)} shipping and must meet the {titleCase(rules.weeklyShippingCutoffDay)} cutoff.</p>
          </div>

          <fieldset className="border-t border-border p-6 sm:p-8">
            <legend className="sr-only">Delivery method</legend>
            <CheckoutSectionHeader number="03" title="Delivery method" />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <DeliveryPreference active={handoffMethod === "LEAVE_AT_DOOR"} description="Your order will be left safely at the provided address." label="Leave at door" onChange={() => setHandoffMethod("LEAVE_AT_DOOR")} value="LEAVE_AT_DOOR" />
              <DeliveryPreference active={handoffMethod === "HAND_TO_ME"} description="The driver will hand the order directly to you." label="Hand it to me" onChange={() => setHandoffMethod("HAND_TO_ME")} value="HAND_TO_ME" />
            </div>
          </fieldset>

          <div className="border-t border-border p-6 sm:p-8">
            {formError ? <p className="border-l-2 border-orange bg-orange/5 px-4 py-3 text-sm text-orange" role="alert">{formError}</p> : null}
            {deliveryComplete ? <p className="border-l-2 border-gold bg-gold/5 px-4 py-3 text-sm text-gold" role="status">Delivery details and current menu prices are verified.</p> : null}
            <button className={`${formError || deliveryComplete ? "mt-5" : ""} min-h-12 w-full rounded-lg bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-gold-light disabled:cursor-wait disabled:opacity-60 sm:w-auto`} disabled={reviewPending} type="submit">{reviewPending ? "Preparing review…" : "Review order"}</button>
          </div>
        </section>

        {deliveryComplete && deliveryDraft && validatedCart?.valid ? (
          <motion.section
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-gold/35 bg-surface p-6 sm:p-8"
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            aria-labelledby="order-review-title"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">Final check</p>
            <h2 className="mt-3 font-display text-2xl tracking-[-0.03em] text-foreground sm:text-[1.75rem]" id="order-review-title">Review your order</h2>

            <div className="mt-7 divide-y divide-border border-y border-border">
              {validatedCart.lines.map((line) => {
                const cartItem = items.find((item) => item.key === line.key);
                if (!cartItem || line.lineTotalCents === undefined) return null;
                return (
                  <article className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center" key={line.key}>
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
                      <Image alt="" className="object-cover" fill sizes="88px" src={cartItem.image} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">{line.productName ?? cartItem.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted">{line.variantLabel ?? cartItem.sizeLabel}{line.grainLabel ? ` · ${line.grainLabel}` : ""}{line.proteinLabel ? ` · ${line.proteinLabel}` : ""}</p>
                      <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-orange">Pepper {cartItem.pepperTolerance}/5 · Quantity {line.quantity}</p>
                      {line.priceChanged ? <p className="mt-1 text-xs text-gold">Price updated during verification.</p> : null}
                    </div>
                    <strong className="col-start-2 text-sm text-gold sm:col-start-auto sm:text-base">{currency.format(line.lineTotalCents / 100)}</strong>
                  </article>
                );
              })}
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <ReviewBlock label="Fulfillment" value={deliveryDraft.fulfillmentMethod === "LOCAL_DELIVERY" ? "Local delivery" : "Out-of-state shipping"} />
              <ReviewBlock label="Delivery method" value={deliveryDraft.handoffMethod === "LEAVE_AT_DOOR" ? "Leave at door" : "Hand it to me"} />
              <ReviewBlock label="Requested date" value={formatDate(deliveryDraft.requestedDate)} />
              <ReviewBlock label="Delivery window" value={`${formatTime(rules.deliveryWindowStart)}–${formatTime(rules.deliveryWindowEnd)}`} />
              <ReviewBlock label="Deliver to" value={`${deliveryDraft.address.recipientName} · ${deliveryDraft.address.streetLine1}, ${deliveryDraft.address.city}, ${deliveryDraft.address.state} ${deliveryDraft.address.postalCode}`} />
            </div>

            <div className="mt-4 border border-border bg-background/40 p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">Allergy information</p>
              <p className="mt-3 text-sm leading-6 text-foreground">{allergyInfo.status === "has-allergies" ? allergyInfo.details.trim() : "No known allergies declared."}</p>
              <p className="mt-2 text-xs leading-5 text-muted">Cross-contact acknowledgement recorded for checkout.</p>
            </div>

            {deliveryDraft.deliveryNotes ? <ReviewBlock className="mt-4" label="Delivery notes" value={deliveryDraft.deliveryNotes} /> : null}

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-6">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Verified subtotal</p><p className="mt-2 text-xs text-muted">Delivery fees and taxes are calculated before payment.</p></div>
              <strong className="shrink-0 font-display text-3xl text-gold">{currency.format(validatedCart.subtotalCents / 100)}</strong>
            </div>
            <p className="mt-6 text-xs leading-6 text-muted">Creating the order records it as <strong className="text-foreground">Pending payment</strong>. It is not confirmed until full payment is completed.</p>
            {orderError ? <p className="mt-4 border-l-2 border-orange bg-orange/5 px-4 py-3 text-sm text-orange" role="alert">{orderError}</p> : null}
            <motion.button
              className="mt-5 min-h-12 w-full rounded-lg bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-gold-light disabled:cursor-wait disabled:opacity-60"
              disabled={orderPending}
              onClick={handlePlaceOrder}
              type="button"
              whileHover={reduceMotion || orderPending ? undefined : { y: -2 }}
              whileTap={reduceMotion || orderPending ? undefined : { scale: 0.98 }}
            >
              {orderPending ? "Creating order…" : "Place order — pending payment"}
            </motion.button>
          </motion.section>
        ) : null}
      </div>

      <aside className="rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-28">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Checkout status</p>
        <StatusRow label="Cart items" value={String(itemCount)} />
        <StatusRow highlight={allergyReady} label="Allergy details" value={allergyReady ? "Complete" : "Required"} />
        <StatusRow highlight={deliveryComplete} label="Delivery details" value={deliveryComplete ? "Complete" : "Required"} />
        <StatusRow highlight={deliveryComplete && Boolean(validatedCart?.valid)} label="Order review" value={deliveryComplete && validatedCart?.valid ? "Ready" : "Required"} />
        {!allergyReady ? <Link className="mt-5 flex min-h-11 items-center justify-center rounded-lg border border-orange/50 text-xs font-bold uppercase tracking-[0.12em] text-orange transition-colors hover:bg-orange/10" href="/cart">Complete cart details</Link> : null}
        <p className="mt-5 text-xs leading-6 text-muted">Your order is not submitted until review and payment are completed.</p>
      </aside>
    </form>
  );
}

function OrderCreated({ order }: { order: CheckoutOrderResponse["order"] }) {
  const fulfillmentDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "America/New_York",
  }).format(new Date(order.requestedFulfillmentAt));
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });

  return (
    <motion.section animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl rounded-2xl border border-gold/40 bg-surface p-6 sm:p-10" initial={{ opacity: 0, y: 18 }} transition={{ duration: 0.4 }}>
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-gold text-xl font-bold text-background">✓</span>
      <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-gold">Order created</p>
      <h2 className="mt-3 font-display text-3xl tracking-[-0.035em] text-foreground sm:text-4xl">Pending payment.</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Your order has been saved to your account, but it is not confirmed until full payment is completed.</p>

      <dl className="mt-7 grid gap-4 sm:grid-cols-2">
        <Detail label="Order reference" value={order.publicReference} />
        <Detail label="Amount due" value={currency.format(order.totalCents / 100)} />
        <Detail label="Requested date" value={fulfillmentDate} />
        <Detail label="Delivery window" value={`${timeFormatter.format(new Date(order.deliveryWindowStart))}–${timeFormatter.format(new Date(order.deliveryWindowEnd))}`} />
      </dl>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link className="inline-flex min-h-12 items-center justify-center rounded-lg bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-gold-light" href={`/profile/orders/${encodeURIComponent(order.publicReference)}`}>Track this order</Link>
        <Link className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border px-6 text-xs font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:border-gold/50 hover:text-foreground" href="/menu">Return to menu</Link>
      </div>
    </motion.section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="border border-border bg-background/50 p-5"><dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">{label}</dt><dd className="mt-3 break-words font-semibold text-foreground">{value}</dd></div>;
}

function CheckoutSectionHeader({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-4"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full border border-gold/50 text-[0.65rem] font-bold tracking-[0.12em] text-gold">{number}</span><h2 className="font-display text-2xl tracking-[-0.03em] text-foreground sm:text-[1.75rem]">{title}</h2></div>;
}

function StatusRow({ highlight = false, label, value }: { highlight?: boolean; label: string; value: string }) {
  return <div className="mt-4 flex items-center justify-between border-b border-border pb-4 text-sm"><span className="text-muted">{label}</span><strong className={highlight ? "text-gold" : "text-foreground"}>{value}</strong></div>;
}

function ReviewBlock({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return <div className={`border border-border bg-background/40 p-4 ${className}`}><p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">{label}</p><p className="mt-3 text-sm leading-6 text-foreground">{value}</p></div>;
}

function DeliveryPreference({ active, description, label, onChange, value }: { active: boolean; description: string; label: string; onChange: () => void; value: HandoffMethod }) {
  return <label className={`group cursor-pointer rounded-xl border p-5 transition-[border-color,background-color,transform] hover:-translate-y-0.5 ${active ? "border-gold bg-gold/10" : "border-border bg-background/40 hover:border-gold/40"}`}><span className="flex items-center gap-3"><input checked={active} className="size-4 accent-gold" name="handoffMethod" onChange={onChange} type="radio" value={value} /><span className="font-semibold text-foreground">{label}</span></span><span className="mt-3 block pl-7 text-xs leading-5 text-muted">{description}</span></label>;
}

function CheckoutField({ className = "", label, name, readOnly, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { className?: string; label: string; name: string }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted">{label}</span><input className={`min-h-12 w-full border-b bg-transparent px-1 text-sm text-foreground transition-colors placeholder:text-muted/50 ${readOnly ? "border-border/60 text-muted" : "border-border hover:border-gold/50"}`} name={name} readOnly={readOnly} {...props} /></label>;
}

function manualAddressComplete(form: FormData) {
  return ["recipientName", "phone", "streetLine1", "city", "state", "postalCode", "countryCode"]
    .every((key) => typeof form.get(key) === "string" && String(form.get(key)).trim().length > 0)
    && /^[A-Za-z]{2}$/.test(String(form.get("countryCode") ?? ""));
}

function manualAddressSnapshot(form: FormData): DeliveryDraft["address"] {
  return {
    recipientName: formValue(form, "recipientName"),
    phone: formValue(form, "phone"),
    streetLine1: formValue(form, "streetLine1"),
    streetLine2: formValue(form, "streetLine2") || null,
    city: formValue(form, "city"),
    state: formValue(form, "state"),
    postalCode: formValue(form, "postalCode"),
    countryCode: formValue(form, "countryCode").toUpperCase(),
  };
}

function fulfillmentMethodForState(state: string): FulfillmentMethod {
  const normalized = state.trim().toUpperCase().replace(/[^A-Z]/g, "");
  return normalized === "GA" || normalized === "GEORGIA" ? "LOCAL_DELIVERY" : "OUT_OF_STATE_SHIPPING";
}

function formValue(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formatDayList(days: string[]) {
  return new Intl.ListFormat("en-US", { style: "long", type: "conjunction" }).format(days.map(titleCase));
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());
}

function formatTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: minute ? "2-digit" : undefined }).format(new Date(2000, 0, 1, hour, minute));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
