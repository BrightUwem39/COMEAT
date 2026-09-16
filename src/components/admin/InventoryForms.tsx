"use client";

import { useActionState, useState } from "react";

import { adjustInventoryStockAction, createInventoryItemAction, updateInventoryItemAction, type InventoryActionState } from "@/app/admin/inventory/actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type InventoryItemValue = { active: boolean; id: string; lowStockThreshold: number; name: string; quantity: number; unit: string; unitCostCents: number; updatedAt: string };
const initialState: InventoryActionState = { message: "", status: "idle" };
const inputClass = "mt-2 h-11 w-full border-b border-white/15 bg-transparent px-0 text-sm text-foreground outline-none transition-colors placeholder:text-muted/55 focus:border-gold";

export function InventoryItemForm({ item }: { item?: InventoryItemValue }) {
  const [state, formAction, pending] = useActionState(item ? updateInventoryItemAction : createInventoryItemAction, initialState);
  return (
    <form action={formAction} aria-busy={pending} className="grid gap-5">
      {item ? <><input name="inventoryItemId" type="hidden" value={item.id} /><input name="inventoryItemUpdatedAt" type="hidden" value={item.updatedAt} /></> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ingredient or supply"><input className={inputClass} defaultValue={item?.name} maxLength={80} name="name" placeholder="Basmati rice" required /></Field>
        <Field hint="Examples: lb, kg, bottle, tray" label="Stock unit"><input className={inputClass} defaultValue={item?.unit} maxLength={20} name="unit" placeholder="lb" required /></Field>
      </div>
      <div className={`grid gap-4 ${item ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {!item ? <Field label="Opening stock"><input className={inputClass} defaultValue="0" inputMode="decimal" name="quantity" required /></Field> : null}
        <Field label="Low-stock alert at"><input className={inputClass} defaultValue={item?.lowStockThreshold ?? "0"} inputMode="decimal" name="lowStockThreshold" required /></Field>
        <Field label="Cost per unit"><div className="relative"><span className="absolute left-0 top-1/2 mt-1 -translate-y-1/2 text-sm text-muted">$</span><input className={`${inputClass} pl-5`} defaultValue={item ? (item.unitCostCents / 100).toFixed(2) : "0.00"} inputMode="decimal" name="unitCost" required /></div></Field>
      </div>
      <label className="flex min-h-12 items-center justify-between gap-4 rounded-xl bg-white/[0.035] px-4 text-sm font-semibold"><span>Track this item</span><input className="peer sr-only" defaultChecked={item?.active ?? true} name="active" type="checkbox" /><span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-white/12 transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-muted after:transition-transform peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-checked:bg-gold peer-checked:after:translate-x-5 peer-checked:after:bg-background" /></label>
      <FormFooter label={item ? "Save settings" : "Track item"} pending={pending} state={state} />
    </form>
  );
}

export function InventoryAdjustmentForm({ item }: { item: InventoryItemValue }) {
  const [state, formAction, pending] = useActionState(adjustInventoryStockAction, initialState);
  const [type, setType] = useState<"CORRECTION" | "RESTOCK" | "WASTE">("RESTOCK");
  return (
    <form action={formAction} aria-busy={pending} className="grid gap-5">
      <input name="inventoryItemId" type="hidden" value={item.id} /><input name="inventoryItemUpdatedAt" type="hidden" value={item.updatedAt} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Stock action"><select className={inputClass} name="adjustmentType" onChange={(event) => setType(event.target.value as typeof type)} value={type}><option value="RESTOCK">Add stock</option><option value="WASTE">Record waste</option><option value="CORRECTION">Correct count</option></select></Field>
        <Field hint={type === "CORRECTION" ? `Enter the new total in ${item.unit}` : `Quantity in ${item.unit}`} label={type === "CORRECTION" ? "Corrected stock" : "Quantity"}><input className={inputClass} inputMode="decimal" name="amount" placeholder="0" required /></Field>
      </div>
      <Field hint={type === "WASTE" ? "Required for waste records" : "Optional operational note"} label="Note"><input className={inputClass} maxLength={240} name="note" placeholder={type === "WASTE" ? "Spoilage, damaged packaging…" : "Delivery or count details"} required={type === "WASTE"} /></Field>
      <FormFooter label={type === "RESTOCK" ? "Add stock" : type === "WASTE" ? "Record waste" : "Correct stock"} pending={pending} state={state} />
    </form>
  );
}

function Field({ children, hint, label }: { children: React.ReactNode; hint?: string; label: string }) { return <label className="min-w-0"><span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">{label}</span>{children}{hint ? <span className="mt-1.5 block text-[0.68rem] leading-5 text-muted">{hint}</span> : null}</label>; }
function FormFooter({ label, pending, state }: { label: string; pending: boolean; state: InventoryActionState }) { return <div className="flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className={`min-h-5 text-xs leading-5 ${state.status === "success" ? "text-emerald-300" : "text-orange"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p><button className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform,opacity] duration-300 hover:bg-gold-light active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none" disabled={pending} type="submit">{pending ? <><LoadingSpinner className="size-3.5" /> Saving…</> : label}</button></div>; }
