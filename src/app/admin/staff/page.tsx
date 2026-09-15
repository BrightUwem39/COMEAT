import type { Metadata } from "next";

import { GrantStaffAccessForm, StaffAccessEditor } from "@/components/admin/StaffAccessForms";
import type { AdminPermission } from "@/server/admin-auth";
import { getAdminStaff } from "@/server/admin-staff";

export const metadata: Metadata = { title: "Staff | Admin" };

const permissionLabels: Record<AdminPermission, string> = {
  ANALYTICS_VIEW: "Analytics",
  AUDIT_VIEW: "Audit log",
  CUSTOMERS_MANAGE: "Customer access",
  CUSTOMERS_VIEW: "Customers",
  INQUIRIES_MANAGE: "Enquiries",
  INVENTORY_MANAGE: "Inventory",
  MENU_MANAGE: "Menu",
  ORDERS_MANAGE: "Order status",
  ORDERS_VIEW: "Orders",
  OVERVIEW_VIEW: "Overview",
  PROMOTIONS_MANAGE: "Promotions",
  REPORTS_EXPORT: "Report exports",
  REFUNDS_MANAGE: "Refunds",
  STAFF_MANAGE: "Staff access",
};

export default async function AdminStaffPage() {
  const data = await getAdminStaff();
  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <header className="hero-reveal"><p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Access control</p><h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">Staff and permissions</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Give each team member only the tools needed for their role.</p></header>

      <section aria-label="Staff totals" className="hero-reveal hero-reveal-1 mt-7 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3"><Metric label="Staff" value={data.total} /><Metric label="Active" value={data.active} /><Metric label="Leadership" value={data.leadership} /></section>

      <details className="group hero-reveal hero-reveal-2 mt-7 overflow-hidden rounded-2xl bg-white/[0.04] open:bg-white/[0.05]"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden sm:px-6 [&::-webkit-details-marker]:hidden"><div><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Quick action</p><h2 className="mt-1 font-display text-xl font-medium">Grant staff access</h2></div><span className="grid size-10 place-items-center rounded-full bg-gold text-xl text-background transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none">+</span></summary><div className="border-t border-white/8 p-5 sm:p-6"><GrantStaffAccessForm /></div></details>

      <section aria-labelledby="roles-heading" className="hero-reveal hero-reveal-2 mt-8"><div><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Permission matrix</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl" id="roles-heading">Role access</h2></div><div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-5">{data.roleDefinitions.map((role) => <article className="rounded-2xl bg-white/[0.035] p-5 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/[0.055] motion-reduce:transform-none" key={role.role}><h3 className="text-sm font-semibold text-gold">{role.label}</h3><p className="mt-2 text-xs leading-5 text-muted">{role.description}</p><ul className="mt-4 flex flex-wrap gap-1.5">{role.permissions.map((permission) => <li className="rounded-full bg-white/[0.055] px-2.5 py-1 text-[0.58rem] font-semibold text-muted" key={permission}>{permissionLabels[permission]}</li>)}</ul></article>)}</div></section>

      <section aria-labelledby="team-heading" className="hero-reveal hero-reveal-3 mt-8"><div><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Team directory</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl" id="team-heading">Staff accounts</h2></div><div className="mt-5 grid gap-3 2xl:grid-cols-2">{data.staff.map((member) => {
        const protectedAccount = member.role === "ADMIN" || member.id === data.currentUserId;
        return <details className="group overflow-hidden rounded-2xl bg-white/[0.035] transition-colors duration-300 open:bg-white/[0.05] hover:bg-white/[0.05]" key={member.id}><summary className="flex min-h-24 cursor-pointer list-none items-center gap-4 p-4 marker:hidden sm:p-5 [&::-webkit-details-marker]:hidden"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold/10 text-sm font-bold text-gold">{member.firstName.charAt(0)}{member.lastName.charAt(0)}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold sm:text-base">{member.firstName} {member.lastName}</h3><span className={`rounded-full px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.09em] ${member.active ? "bg-emerald-400/10 text-emerald-300" : "bg-white/7 text-muted"}`}>{member.active ? "Active" : "Inactive"}</span>{member.id === data.currentUserId ? <span className="rounded-full bg-gold/12 px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.09em] text-gold">You</span> : null}</div><p className="mt-1 truncate text-xs text-muted">{member.email}</p><p className="mt-2 text-xs font-semibold text-gold">{member.roleLabel}</p></div><svg aria-hidden="true" className="size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180 group-open:text-gold motion-reduce:transition-none" fill="none" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg></summary><div className="border-t border-white/8 p-4 sm:p-5">{protectedAccount ? <div className="rounded-xl bg-gold/[0.065] px-4 py-4"><p className="text-sm font-semibold">Protected account</p><p className="mt-2 text-xs leading-5 text-muted">{member.id === data.currentUserId ? "Another owner must change your access to prevent accidental lockout." : "Legacy administrator access remains protected for deployment continuity."}</p></div> : <StaffAccessEditor member={member} />}</div></details>;
      })}</div></section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-white/[0.04] px-3 py-4 sm:px-4"><p className="font-display text-xl font-medium sm:text-2xl">{value}</p><p className="mt-1 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted sm:text-[0.6rem]">{label}</p></div>; }
