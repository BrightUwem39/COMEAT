"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from "@/app/profile/actions";
import type { SavedAddress } from "@/lib/address-validation";

const initialState: AddressActionState = { error: "", saved: false };

export function AddressManager({ addresses }: { addresses: SavedAddress[] }) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const editingAddress = addresses.find((address) => address.id === editingId);

  return (
    <div className="mt-5">
      <div className="grid gap-4">
        {addresses.map((address) => (
          <article className="border border-border bg-surface/40 p-5 sm:p-6" key={address.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold">{address.label || "Delivery address"}</p>
                  {address.isDefault ? <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gold">Default</span> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{address.recipientName}<br />{address.streetLine1}{address.streetLine2 ? <><br />{address.streetLine2}</> : null}<br />{address.city}, {address.state} {address.postalCode}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-[0.65rem] font-bold uppercase tracking-[0.13em]">
                <button className="text-gold hover:text-gold-light" onClick={() => setEditingId(address.id)} type="button">Edit</button>
                {!address.isDefault ? (
                  <form action={setDefaultAddressAction}><input name="id" type="hidden" value={address.id} /><button className="text-muted hover:text-foreground" type="submit">Make default</button></form>
                ) : null}
                <form action={deleteAddressAction}><input name="id" type="hidden" value={address.id} /><button className="text-orange hover:text-white" type="submit">Delete</button></form>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editingId ? (
        <AddressForm address={editingAddress} onCancel={() => setEditingId(null)} />
      ) : (
        <button className="mt-5 min-h-12 border border-gold px-5 text-xs font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold hover:text-background" onClick={() => setEditingId("new")} type="button">
          Add address
        </button>
      )}
    </div>
  );
}

function AddressForm({ address, onCancel }: { address?: SavedAddress; onCancel: () => void }) {
  const [state, action] = useActionState(saveAddressAction, initialState);

  return (
    <form action={action} className="mt-5 border border-gold/30 bg-surface/60 p-5 sm:p-6">
      {address ? <input name="id" type="hidden" value={address.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <AddressField defaultValue={address?.label ?? ""} label="Label" name="label" placeholder="Home" />
        <AddressField defaultValue={address?.recipientName ?? ""} label="Recipient name" name="recipientName" required />
        <AddressField defaultValue={address?.phone ?? ""} label="Phone" name="phone" required type="tel" />
        <AddressField defaultValue={address?.streetLine1 ?? ""} label="Street address" name="streetLine1" required />
        <AddressField defaultValue={address?.streetLine2 ?? ""} label="Address line 2" name="streetLine2" />
        <AddressField defaultValue={address?.city ?? ""} label="City" name="city" required />
        <AddressField defaultValue={address?.state ?? ""} label="State" name="state" required />
        <AddressField defaultValue={address?.postalCode ?? ""} label="ZIP / postal code" name="postalCode" required />
        <AddressField defaultValue={address?.countryCode ?? "US"} label="Country code" maxLength={2} name="countryCode" required />
      </div>
      <label className="mt-5 flex items-center gap-3 text-sm text-muted">
        <input defaultChecked={address?.isDefault ?? false} name="isDefault" type="checkbox" />
        Use as my default delivery address
      </label>
      {state.error ? <p className="mt-4 text-sm text-orange" role="alert">{state.error}</p> : null}
      {state.saved ? <p className="mt-4 text-sm text-gold" role="status">Address saved.</p> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <SaveAddressButton />
        <button className="min-h-11 border border-border px-5 text-xs font-bold uppercase tracking-[0.13em] text-muted hover:text-foreground" onClick={onCancel} type="button">Cancel</button>
      </div>
    </form>
  );
}

function AddressField({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-muted">{label}</span>
      <input className="min-h-12 w-full border-b border-border bg-transparent px-1 text-sm text-foreground outline-none" name={name} {...props} />
    </label>
  );
}

function SaveAddressButton() {
  const { pending } = useFormStatus();
  return <button className="min-h-11 bg-gold px-5 text-xs font-bold uppercase tracking-[0.13em] text-background disabled:opacity-60" disabled={pending} type="submit">{pending ? "Saving…" : "Save address"}</button>;
}
