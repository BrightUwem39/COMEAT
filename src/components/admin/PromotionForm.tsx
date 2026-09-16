"use client";

import { useActionState, useState } from "react";

import { createPromotionAction, updatePromotionAction, type PromotionFormState } from "@/app/admin/promotions/actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type PromotionFormValue = {
  active: boolean;
  amountOffCents: number | null;
  code: string;
  expiresOn: string;
  id: string;
  minimumOrderCents: number;
  name: string;
  percentageOff: number | null;
  startsOn: string;
  type: "FIXED_AMOUNT" | "FREE_DELIVERY" | "PERCENTAGE";
  updatedAt: string;
  usageLimit: number | null;
};

const initialState: PromotionFormState = { message: "", status: "idle" };

export function PromotionForm({ promotion }: { promotion?: PromotionFormValue }) {
  const action = promotion ? updatePromotionAction : createPromotionAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState(promotion?.type ?? "PERCENTAGE");

  return (
    <form action={formAction} aria-busy={pending} className="grid gap-5">
      {promotion ? <><input name="promotionId" type="hidden" value={promotion.id} /><input name="promotionUpdatedAt" type="hidden" value={promotion.updatedAt} /></> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Promotion name"><input className={inputClass} defaultValue={promotion?.name} maxLength={80} name="name" placeholder="Weekend table offer" required /></Field>
        <Field hint="Shown in uppercase" label="Code"><input autoCapitalize="characters" className={inputClass} defaultValue={promotion?.code} maxLength={24} name="code" placeholder="COMEAT20" required /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Discount type"><select className={inputClass} name="type" onChange={(event) => setType(event.target.value as typeof type)} value={type}><option value="PERCENTAGE">Percentage off</option><option value="FIXED_AMOUNT">Fixed amount off</option><option value="FREE_DELIVERY">Free delivery</option></select></Field>
        {type !== "FREE_DELIVERY" ? <Field label={type === "PERCENTAGE" ? "Percentage" : "Amount in dollars"}><div className="relative"><span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-muted">{type === "PERCENTAGE" ? "%" : "$"}</span><input className={`${inputClass} pl-5`} defaultValue={type === "PERCENTAGE" ? promotion?.percentageOff ?? "" : promotion?.amountOffCents ? (promotion.amountOffCents / 100).toFixed(2) : ""} inputMode="decimal" name="value" required /></div></Field> : <input name="value" type="hidden" value="" />}
        <Field label="Minimum order"><div className="relative"><span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-muted">$</span><input className={`${inputClass} pl-5`} defaultValue={promotion ? (promotion.minimumOrderCents / 100).toFixed(2) : "0.00"} inputMode="decimal" name="minimumOrder" required /></div></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field hint="Leave blank for unlimited" label="Usage limit"><input className={inputClass} defaultValue={promotion?.usageLimit ?? ""} inputMode="numeric" min="1" name="usageLimit" type="number" /></Field>
        <Field label="Start date"><input className={inputClass} defaultValue={promotion?.startsOn} name="startsOn" type="date" /></Field>
        <Field label="End date"><input className={inputClass} defaultValue={promotion?.expiresOn} name="expiresOn" type="date" /></Field>
      </div>
      <label className="flex min-h-12 items-center justify-between gap-4 rounded-xl bg-white/[0.035] px-4 text-sm font-semibold"><span>Promotion active</span><input className="peer sr-only" defaultChecked={promotion?.active ?? true} name="active" type="checkbox" /><span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-white/12 transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-muted after:transition-transform peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-checked:bg-gold peer-checked:after:translate-x-5 peer-checked:after:bg-background" /></label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className={`min-h-5 text-xs leading-5 ${state.status === "success" ? "text-emerald-300" : "text-orange"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform,opacity] duration-300 hover:bg-gold-light active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none" disabled={pending} type="submit">{pending ? <><LoadingSpinner className="size-3.5" /> Saving…</> : promotion ? "Save promotion" : "Create promotion"}</button>
      </div>
    </form>
  );
}

function Field({ children, hint, label }: { children: React.ReactNode; hint?: string; label: string }) {
  return <label className="min-w-0"><span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">{label}</span>{children}{hint ? <span className="mt-1.5 block text-[0.68rem] text-muted">{hint}</span> : null}</label>;
}

const inputClass = "mt-2 h-11 w-full border-b border-white/15 bg-transparent px-0 text-sm text-foreground outline-none transition-colors placeholder:text-muted/55 focus:border-gold";
