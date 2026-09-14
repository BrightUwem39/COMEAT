"use client";

import { useActionState, useState } from "react";

import {
  updateMenuProductAction,
  type UpdateMenuProductState,
} from "@/app/admin/menu/actions";

type EditableMenuProduct = {
  active: boolean;
  featured: boolean;
  id: string;
  updatedAt: string;
  variants: readonly {
    active: boolean;
    basePriceCents: number | null;
    id: string;
    label: string;
  }[];
};

const initialState: UpdateMenuProductState = { message: "", status: "idle" };

export function MenuProductEditor({ product }: { product: EditableMenuProduct }) {
  const [state, formAction, pending] = useActionState(updateMenuProductAction, initialState);
  const [productActive, setProductActive] = useState(product.active);

  return (
    <form action={formAction} aria-busy={pending} className="space-y-5">
      <input name="productId" type="hidden" value={product.id} />
      <input name="productUpdatedAt" type="hidden" value={product.updatedAt} />

      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleField checked={productActive} label="Available to order" name="productActive" onChange={setProductActive} />
        <ToggleField defaultChecked={product.featured} label="Featured on homepage" name="featured" />
      </div>

      <fieldset>
        <legend className="text-[0.61rem] font-bold uppercase tracking-[0.16em] text-muted">Sizes and base prices</legend>
        <div className="mt-3 divide-y divide-white/8">
          {product.variants.map((variant) => (
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(6rem,7rem)] items-center gap-3 py-3" key={variant.id}>
              <label className="flex min-h-11 min-w-0 items-center gap-3 text-sm">
                <input className="size-4 accent-gold" defaultChecked={variant.active} name={`variantActive:${variant.id}`} type="checkbox" />
                <span className="truncate">{variant.label}</span>
              </label>
              <label className="flex h-11 items-center border-b border-white/15 transition-colors focus-within:border-gold">
                <span className="sr-only">{variant.label} price in dollars</span>
                <span className="text-sm text-muted">$</span>
                <input aria-label={`${variant.label} price in dollars`} className="min-w-0 flex-1 bg-transparent px-1.5 text-right text-sm text-foreground outline-none" defaultValue={variant.basePriceCents === null ? "" : (variant.basePriceCents / 100).toFixed(2)} inputMode="decimal" name={`variantPrice:${variant.id}`} placeholder="0.00" type="text" />
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className={`min-h-5 text-xs leading-5 ${state.status === "success" ? "text-emerald-300" : "text-orange"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>
        <button className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform,opacity] duration-300 hover:bg-gold-light active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none" disabled={pending} type="submit">{pending ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}

function ToggleField({ checked, defaultChecked, label, name, onChange }: { checked?: boolean; defaultChecked?: boolean; label: string; name: string; onChange?: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-white/[0.035] px-3.5 text-xs font-semibold">
      <span>{label}</span>
      <input checked={checked} className="peer sr-only" defaultChecked={defaultChecked} name={name} onChange={onChange ? (event) => onChange(event.target.checked) : undefined} type="checkbox" />
      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-white/12 transition-[background-color,box-shadow] duration-200 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-muted after:transition-transform after:duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-checked:bg-gold peer-checked:after:translate-x-5 peer-checked:after:bg-background" />
    </label>
  );
}
