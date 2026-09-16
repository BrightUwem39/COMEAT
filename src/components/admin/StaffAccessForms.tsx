"use client";

import { useActionState } from "react";

import { grantStaffAccessAction, updateStaffAccessAction, type StaffActionState } from "@/app/admin/staff/actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type EditableStaffMember = { active: boolean; id: string; role: string; updatedAt: string };
const roles = [{ label: "Owner", value: "OWNER" }, { label: "Manager", value: "MANAGER" }, { label: "Cashier", value: "CASHIER" }, { label: "Chef", value: "CHEF" }, { label: "Support", value: "SUPPORT" }] as const;
const initialState: StaffActionState = { message: "", status: "idle" };
const inputClass = "mt-2 h-11 w-full border-b border-white/15 bg-transparent px-0 text-sm text-foreground outline-none transition-colors placeholder:text-muted/55 focus:border-gold";

export function GrantStaffAccessForm() {
  const [state, formAction, pending] = useActionState(grantStaffAccessAction, initialState);
  return <form action={formAction} aria-busy={pending} className="grid gap-5"><div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.5fr)]"><Field hint="The account must already be verified" label="Account email"><input autoComplete="email" className={inputClass} name="email" placeholder="staff@example.com" required type="email" /></Field><Field label="Staff role"><RoleSelect /></Field></div><FormFooter label="Grant access" pending={pending} state={state} /></form>;
}

export function StaffAccessEditor({ member }: { member: EditableStaffMember }) {
  const [state, formAction, pending] = useActionState(updateStaffAccessAction, initialState);
  return <form action={formAction} aria-busy={pending} className="grid gap-5"><input name="staffId" type="hidden" value={member.id} /><input name="staffUpdatedAt" type="hidden" value={member.updatedAt} /><Field label="Role"><RoleSelect defaultValue={member.role} /></Field><label className="flex min-h-12 items-center justify-between gap-4 rounded-xl bg-white/[0.035] px-4 text-sm font-semibold"><span>Staff access active</span><input className="peer sr-only" defaultChecked={member.active} name="active" type="checkbox" /><span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-white/12 transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-muted after:transition-transform peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-checked:bg-gold peer-checked:after:translate-x-5 peer-checked:after:bg-background" /></label><FormFooter label="Save access" pending={pending} state={state} /></form>;
}

function RoleSelect({ defaultValue = "MANAGER" }: { defaultValue?: string }) { return <select className={inputClass} defaultValue={defaultValue} name="role">{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select>; }
function Field({ children, hint, label }: { children: React.ReactNode; hint?: string; label: string }) { return <label className="min-w-0"><span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">{label}</span>{children}{hint ? <span className="mt-1.5 block text-[0.68rem] text-muted">{hint}</span> : null}</label>; }
function FormFooter({ label, pending, state }: { label: string; pending: boolean; state: StaffActionState }) { return <div className="flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className={`min-h-5 text-xs leading-5 ${state.status === "success" ? "text-emerald-300" : "text-orange"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p><button className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform,opacity] duration-300 hover:bg-gold-light active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none" disabled={pending} type="submit">{pending ? <><LoadingSpinner className="size-3.5" /> Saving…</> : label}</button></div>; }
