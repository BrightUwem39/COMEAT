"use client";

import { useActionState, useState } from "react";

import {
  updateAdminOrderStatusAction,
  type UpdateOrderStatusState,
} from "@/app/admin/orders/actions";

const initialUpdateOrderStatusState: UpdateOrderStatusState = {
  message: "",
  status: "idle",
};

type StatusOption = {
  label: string;
  value: string;
};

export function OrderStatusUpdateForm({ currentStatus, fulfillmentMethod, options, publicReference }: { currentStatus: string; fulfillmentMethod: string; options: StatusOption[]; publicReference: string }) {
  const [state, formAction, pending] = useActionState(updateAdminOrderStatusAction, initialUpdateOrderStatusState);
  const [selectedStatus, setSelectedStatus] = useState(options[0]?.value ?? "");
  const acceptingOrder = currentStatus === "PAID" && selectedStatus === "CONFIRMED";

  if (!options.length) {
    return <p className="text-sm leading-6 text-muted">This order has reached a final status. No further updates are available.</p>;
  }

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className="space-y-5"
      onSubmit={(event) => {
        if (selectedStatus === "CANCELLED" && !window.confirm("Cancel this unpaid order? This cannot be reversed here.")) event.preventDefault();
      }}
    >
      <input name="publicReference" type="hidden" value={publicReference} />
      <label className="block">
        <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Next status</span>
        <select
          className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 focus:border-gold"
          name="nextStatus"
          onChange={(event) => setSelectedStatus(event.target.value)}
          value={selectedStatus}
        >
          {options.map((option) => <option className="bg-surface" key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      {acceptingOrder ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <EstimateSelect label="Preparation estimate" name="readyMinutes" options={[15, 30, 45, 60, 90, 120, 180]} />
          {fulfillmentMethod !== "PICKUP" ? <EstimateSelect label="Delivery after preparation" name="deliveryMinutes" options={[15, 30, 45, 60, 90, 120, 180]} /> : null}
        </div>
      ) : null}
      <label className="block">
        <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Internal note · optional</span>
        <textarea className="mt-2 min-h-20 w-full resize-y border-b border-white/15 bg-transparent py-3 text-sm leading-6 text-foreground outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold" maxLength={300} name="note" placeholder="Add context for the status history" />
      </label>
      <button className="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-full bg-gold px-5 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-background transition-[background-color,transform,opacity] duration-300 hover:bg-gold-light active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none" disabled={pending} type="submit">
        {pending ? "Updating…" : acceptingOrder ? "Accept order" : selectedStatus === "CANCELLED" ? "Cancel order" : "Update order"}
      </button>
      <p aria-live="polite" className={`min-h-5 text-xs leading-5 transition-colors ${state.status === "success" ? "text-emerald-300" : "text-orange"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>
    </form>
  );
}

function EstimateSelect({ label, name, options }: { label: string; name: string; options: number[] }) {
  return (
    <label className="block">
      <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">{label}</span>
      <select className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 focus:border-gold" defaultValue="60" name={name}>
        {options.map((minutes) => <option className="bg-surface" key={minutes} value={minutes}>{minutes < 60 ? `${minutes} minutes` : `${minutes / 60} ${minutes === 60 ? "hour" : "hours"}`}</option>)}
      </select>
    </label>
  );
}
