"use client";

import { useActionState } from "react";

import { updateCustomerAccessAction, type UpdateCustomerState } from "@/app/admin/customers/actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const initialState: UpdateCustomerState = { message: "", status: "idle" };

export function CustomerAccessControl({ active, id, updatedAt }: { active: boolean; id: string; updatedAt: string }) {
  const [state, formAction, pending] = useActionState(updateCustomerAccessAction, initialState);
  const nextActive = !active;

  return (
    <form action={formAction} aria-busy={pending} onSubmit={(event) => {
      if (!nextActive && !window.confirm("Disable this customer account and close all active sessions?")) event.preventDefault();
    }}>
      <input name="id" type="hidden" value={id} />
      <input name="updatedAt" type="hidden" value={updatedAt} />
      <input name="nextActive" type="hidden" value={String(nextActive)} />
      <button className={`inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] transition-[background-color,color,transform,opacity] duration-300 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none ${active ? "bg-orange/12 text-orange hover:bg-orange hover:text-background" : "bg-gold text-background hover:bg-gold-light"}`} disabled={pending} type="submit">{pending ? <><LoadingSpinner className="size-3.5" /> Updating…</> : active ? "Disable account" : "Restore access"}</button>
      <p aria-live="polite" className={`mt-3 min-h-5 text-xs leading-5 ${state.status === "success" ? "text-emerald-300" : "text-orange"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>
    </form>
  );
}
