"use client";

import { useActionState } from "react";

import { refundAdminOrderAction, type RefundOrderState } from "@/app/admin/orders/actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const initialState: RefundOrderState = { message: "", status: "idle" };

export function RefundOrderForm({ currency, orderStatus, publicReference, remainingAmountCents }: { currency: string; orderStatus: string; publicReference: string; remainingAmountCents: number }) {
  const [state, formAction, pending] = useActionState(refundAdminOrderAction, initialState);
  const rejecting = orderStatus === "PAID";
  const formattedMaximum = (remainingAmountCents / 100).toFixed(2);

  return (
    <form action={formAction} aria-busy={pending} className="space-y-4" onSubmit={(event) => {
      if (!window.confirm(`${rejecting ? "Reject this order and refund" : "Refund"} the entered amount to the original payment method?`)) event.preventDefault();
    }}>
      <input name="publicReference" type="hidden" value={publicReference} />
      <label className="block">
        <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Refund amount · {currency}</span>
        <span className="mt-2 flex h-11 items-center border-b border-white/15 focus-within:border-orange"><span className="text-sm text-muted">$</span><input aria-label={`Refund amount in ${currency}`} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none" defaultValue={formattedMaximum} inputMode="decimal" max={formattedMaximum} min="0.01" name="refundAmount" required step="0.01" type="number" /></span>
      </label>
      <label className="block"><span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Reason</span><textarea className="mt-2 min-h-20 w-full resize-y border-b border-white/15 bg-transparent py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted/60 focus:border-orange" maxLength={300} name="refundNote" placeholder="Required for the audit history" required /></label>
      <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-orange/12 px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-orange transition-[background-color,color,transform,opacity] duration-300 hover:bg-orange hover:text-background active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none" disabled={pending} type="submit">{pending ? <><LoadingSpinner className="size-3.5" /> Contacting Stripe…</> : rejecting ? "Reject & refund" : "Issue refund"}</button>
      <p aria-live="polite" className={`min-h-5 text-xs leading-5 ${state.status === "success" ? "text-emerald-300" : "text-orange"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>
    </form>
  );
}
