"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { DELIVERY_DRAFT_STORAGE_KEY, type DeliveryDraft, type HandoffMethod } from "@/lib/delivery-draft";
import type { CheckoutAddressDTO, CheckoutRulesDTO } from "@/server/checkout";

const weekdayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function DeliveryEntryClient({ addresses, customer, rules }: {
  addresses: CheckoutAddressDTO[];
  customer: { email: string; firstName: string; lastName: string };
  rules: CheckoutRulesDTO;
}) {
  const router = useRouter();
  const { allergyInfo, items } = useCart();
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const [handoffMethod, setHandoffMethod] = useState<HandoffMethod>("LEAVE_AT_DOOR");
  const [requestedDate, setRequestedDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (items.length === 0) {
      setError("Your order is empty. Choose your dishes before adding delivery details.");
      return;
    }
    if (!requiredFieldsComplete(form)) {
      setError("Complete every required contact and delivery-address field.");
      return;
    }
    if (!requestedDate || requestedDate < rules.earliestFulfillmentDate) {
      setError(`Choose a date at least ${rules.minimumAdvanceHours} hours from now.`);
      return;
    }

    const state = formValue(form, "state");
    const fulfillmentMethod = fulfillmentMethodForState(state);
    if (fulfillmentMethod === "OUT_OF_STATE_SHIPPING") {
      const weekday = weekdayNames[new Date(`${requestedDate}T12:00:00Z`).getUTCDay()];
      if (!rules.outOfStateShippingDays.includes(weekday)) {
        setError(`Out-of-state shipping is available ${formatDayList(rules.outOfStateShippingDays)} only.`);
        return;
      }
    }

    const allergyReady = allergyInfo.status !== "unanswered"
      && allergyInfo.acknowledged
      && (allergyInfo.status === "none" || Boolean(allergyInfo.details.trim()));
    if (!allergyReady) {
      setError("Complete the required allergy details on your order page before continuing.");
      return;
    }

    const draft: DeliveryDraft = {
      fulfillmentMethod,
      handoffMethod,
      requestedDate,
      deliveryNotes: formValue(form, "deliveryNotes"),
      address: {
        recipientName: formValue(form, "recipientName"),
        phone: formValue(form, "phone"),
        streetLine1: formValue(form, "streetLine1"),
        streetLine2: formValue(form, "streetLine2") || null,
        city: formValue(form, "city"),
        state,
        postalCode: formValue(form, "postalCode"),
        countryCode: "US",
      },
    };
    window.sessionStorage.setItem(DELIVERY_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    router.push("/checkout");
  }

  return (
    <form className="mx-auto max-w-4xl space-y-4" noValidate onSubmit={handleSubmit}>
      <section className="rounded-[1.25rem] border border-border bg-surface p-4 sm:p-6" aria-labelledby="contact-title">
        <SectionTitle description="Where we can reach you about this order." id="contact-title" title="Contact information" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field autoComplete="name" className="sm:col-span-2" defaultValue={`${customer.firstName} ${customer.lastName}`} label="Full name" name="recipientName" required />
          <Field defaultValue={customer.email} label="Email" name="contactEmail" readOnly type="email" />
          <Field autoComplete="tel" defaultValue={defaultAddress?.phone ?? ""} label="Phone number" name="phone" required type="tel" />
        </div>
      </section>

      <section className="rounded-[1.25rem] border border-border bg-surface p-4 sm:p-6" aria-labelledby="address-title">
        <SectionTitle description="Tell us where and when your food should arrive." id="address-title" title="Delivery address" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field autoComplete="address-line1" className="sm:col-span-2" defaultValue={defaultAddress?.streetLine1 ?? ""} label="Street address" name="streetLine1" required />
          <Field autoComplete="address-line2" defaultValue={defaultAddress?.streetLine2 ?? ""} label="Apt / Suite / Unit" name="streetLine2" />
          <Field autoComplete="address-level2" defaultValue={defaultAddress?.city ?? ""} label="City" name="city" required />
          <Field autoComplete="address-level1" defaultValue={defaultAddress?.state ?? ""} label="State" name="state" required />
          <Field autoComplete="postal-code" defaultValue={defaultAddress?.postalCode ?? ""} label="ZIP code" name="postalCode" required />
          <label className="rounded-lg border border-border bg-background/55 px-3 py-2">
            <span className="block text-[0.6rem] font-bold uppercase tracking-[0.16em] text-muted">Requested delivery date</span>
            <input className="mt-1 min-h-8 w-full bg-transparent text-base text-foreground sm:text-sm" min={rules.earliestFulfillmentDate} onChange={(event) => setRequestedDate(event.target.value)} required type="date" value={requestedDate} />
            <span className="mt-1 block text-[0.65rem] text-muted">Minimum {rules.minimumAdvanceHours} hours&apos; notice</span>
          </label>
        </div>
        <label className="mt-3 block rounded-lg border border-border bg-background/55 px-3 py-2">
          <span className="block text-[0.6rem] font-bold uppercase tracking-[0.16em] text-muted">Delivery instructions <span className="normal-case tracking-normal">(optional)</span></span>
          <textarea className="mt-1.5 min-h-16 w-full resize-y bg-transparent text-base text-foreground sm:text-sm" maxLength={500} name="deliveryNotes" placeholder="Gate code, building access, landmarks, or another helpful note." />
        </label>
        <p className="mt-3 rounded-lg border border-orange/25 bg-orange/5 px-3 py-2.5 text-xs leading-5 text-muted"><span className="font-semibold text-orange">Outside Georgia?</span> Shipping is available {formatDayList(rules.outOfStateShippingDays)} and must meet the {titleCase(rules.weeklyShippingCutoffDay)} cutoff.</p>
      </section>

      <fieldset className="rounded-[1.25rem] border border-border bg-surface p-4 sm:p-6">
        <legend className="sr-only">Delivery method</legend>
        <SectionTitle description="Choose how you would like to receive the order." id="method-title" title="Delivery method" />
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Method active={handoffMethod === "LEAVE_AT_DOOR"} label="Leave at door" onChange={() => setHandoffMethod("LEAVE_AT_DOOR")} value="LEAVE_AT_DOOR" />
          <Method active={handoffMethod === "HAND_TO_ME"} label="Hand it to me" onChange={() => setHandoffMethod("HAND_TO_ME")} value="HAND_TO_ME" />
        </div>
      </fieldset>

      {error ? <p className="border-l-2 border-orange bg-orange/5 px-4 py-3 text-sm text-orange" role="alert">{error}</p> : null}
      <div className="flex items-center justify-between gap-3">
        <Link className="text-sm font-semibold text-muted transition-colors hover:text-foreground" href="/cart">Back to order</Link>
        <button className="min-h-12 rounded-lg bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-gold-light" type="submit">Continue to checkout</button>
      </div>
    </form>
  );
}

function SectionTitle({ description, id, title }: { description: string; id: string; title: string }) {
  return <div className="border-l-2 border-gold pl-3"><h2 className="font-display text-[1.3rem] text-foreground sm:text-2xl" id={id}>{title}</h2><p className="mt-0.5 text-xs leading-5 text-muted">{description}</p></div>;
}

function Field({ className = "", label, name, readOnly, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { className?: string; label: string; name: string }) {
  return <label className={`block rounded-lg border border-border bg-background/55 px-3 py-2 ${className}`}><span className="block text-[0.58rem] font-bold uppercase tracking-[0.15em] text-muted">{label}</span><input className={`mt-0.5 min-h-8 w-full bg-transparent text-base text-foreground sm:text-sm ${readOnly ? "text-muted" : ""}`} name={name} readOnly={readOnly} {...props} /></label>;
}

function Method({ active, label, onChange, value }: { active: boolean; label: string; onChange: () => void; value: HandoffMethod }) {
  return <label className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-center text-xs font-semibold transition-colors ${active ? "border-gold bg-gold/10 text-foreground" : "border-border bg-background/45 text-muted"}`}><input checked={active} className="sr-only" name="handoffMethod" onChange={onChange} type="radio" value={value} /><span aria-hidden="true" className={`size-2 rounded-full ${active ? "bg-gold" : "bg-muted/50"}`} />{label}</label>;
}

function requiredFieldsComplete(form: FormData) {
  return ["recipientName", "phone", "streetLine1", "city", "state", "postalCode"].every((key) => formValue(form, key).length > 0);
}

function formValue(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function fulfillmentMethodForState(state: string): DeliveryDraft["fulfillmentMethod"] {
  const normalized = state.trim().toUpperCase().replace(/[^A-Z]/g, "");
  return normalized === "GA" || normalized === "GEORGIA" ? "LOCAL_DELIVERY" : "OUT_OF_STATE_SHIPPING";
}

function formatDayList(days: string[]) {
  return new Intl.ListFormat("en-US", { style: "long", type: "conjunction" }).format(days.map(titleCase));
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());
}
