"use client";

import { useActionState } from "react";

import { updateInquiryAction, type UpdateInquiryState } from "@/app/admin/inquiries/actions";
import { inquiryStatusLabels, inquiryStatuses } from "@/lib/admin-inquiry";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const initialState: UpdateInquiryState = { message: "", status: "idle" };

export function InquiryUpdateForm({
  assignedName,
  id,
  internalNote,
  status,
  type,
  updatedAt,
}: {
  assignedName: string | null;
  id: string;
  internalNote: string | null;
  status: keyof typeof inquiryStatusLabels;
  type: "CATERING" | "CONTACT";
  updatedAt: string;
}) {
  const [state, formAction, pending] = useActionState(updateInquiryAction, initialState);

  return (
    <form action={formAction} aria-busy={pending} className="space-y-5">
      <input name="id" type="hidden" value={id} />
      <input name="type" type="hidden" value={type} />
      <input name="updatedAt" type="hidden" value={updatedAt} />
      <label className="block">
        <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Status</span>
        <select className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 focus:border-gold" defaultValue={status} name="inquiryStatus">
          {inquiryStatuses.map((option) => <option className="bg-surface" key={option} value={option}>{inquiryStatusLabels[option]}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Assignment</span>
        <select className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 focus:border-gold" defaultValue="KEEP" name="assignment">
          <option className="bg-surface" value="KEEP">Keep {assignedName ? `assigned to ${assignedName}` : "unassigned"}</option>
          <option className="bg-surface" value="SELF">Assign to me</option>
          {assignedName ? <option className="bg-surface" value="UNASSIGN">Remove assignment</option> : null}
        </select>
      </label>
      <label className="block">
        <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Internal notes</span>
        <textarea className="mt-2 min-h-28 w-full resize-y border-b border-white/15 bg-transparent py-3 text-sm leading-6 text-foreground outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold" defaultValue={internalNote ?? ""} maxLength={1_000} name="internalNote" placeholder="Visible only to administrators" />
      </label>
      <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform,opacity] duration-300 hover:bg-gold-light active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none" disabled={pending} type="submit">{pending ? <><LoadingSpinner className="size-3.5" /> Saving…</> : "Save enquiry"}</button>
      <p aria-live="polite" className={`min-h-5 text-xs leading-5 ${state.status === "success" ? "text-emerald-300" : "text-orange"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>
    </form>
  );
}
