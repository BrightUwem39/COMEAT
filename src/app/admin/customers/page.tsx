import type { Metadata } from "next";
import Link from "next/link";

import { getAdminCustomers } from "@/server/admin-customers";

export const metadata: Metadata = { title: "Customers | Admin" };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ page?: string | string[]; q?: string | string[]; state?: string | string[] }> }) {
  const params = await searchParams;
  const query = firstValue(params.q);
  const state = firstValue(params.state);
  const page = Number.parseInt(firstValue(params.page) || "1", 10);
  const result = await getAdminCustomers({ page, query, state });
  const start = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const end = Math.min(result.page * result.pageSize, result.total);

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <header className="hero-reveal">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Accounts</p>
        <h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">Customers</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Review customer profiles, order activity, and account access.</p>
      </header>

      <section aria-label="Customer totals" className="hero-reveal hero-reveal-1 mt-7 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
        <CustomerMetric label="Active" value={result.active} />
        <CustomerMetric label="Disabled" value={result.disabled} />
        <CustomerMetric label="Verified" value={result.verified} />
      </section>

      <form className="hero-reveal hero-reveal-2 mt-7 grid gap-3 rounded-2xl bg-white/[0.04] p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end sm:p-5" method="get">
        <label className="block min-w-0"><span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Search customers</span><input className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold" defaultValue={result.query} name="q" placeholder="Name, email, or phone" type="search" /></label>
        <label className="block"><span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Account state</span><select className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 focus:border-gold" defaultValue={result.state ?? ""} name="state"><option className="bg-surface" value="">All accounts</option><option className="bg-surface" value="ACTIVE">Active</option><option className="bg-surface" value="DISABLED">Disabled</option></select></label>
        <button className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform] duration-300 hover:bg-gold-light active:scale-[0.98] motion-reduce:transform-none" type="submit">Apply filters</button>
      </form>

      <section className="hero-reveal hero-reveal-3 mt-6 overflow-hidden rounded-2xl bg-white/[0.035]" aria-label="Customer results">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"><p className="text-xs text-muted">Showing <span className="font-semibold text-foreground">{start}–{end}</span> of {result.total}</p>{result.query || result.state ? <Link className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light" href="/admin/customers">Clear filters</Link> : null}</div>
        {result.customers.length ? <div className="border-t border-white/8"><div className="hidden grid-cols-[1.3fr_1.25fr_0.7fr_0.75fr_0.8fr] gap-4 px-6 py-3 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted xl:grid"><span>Customer</span><span>Contact</span><span>Account</span><span>Orders</span><span>Last order</span></div><div className="divide-y divide-white/8">{result.customers.map((customer) => <Link aria-label={`Open customer ${customer.firstName} ${customer.lastName}`} className="grid gap-4 px-5 py-5 transition-colors duration-200 hover:bg-white/[0.035] sm:grid-cols-2 sm:px-6 xl:grid-cols-[1.3fr_1.25fr_0.7fr_0.75fr_0.8fr] xl:items-center xl:gap-4" href={`/admin/customers/${customer.id}`} key={customer.id}>
          <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/12 text-xs font-bold text-gold">{customer.firstName.charAt(0)}{customer.lastName.charAt(0)}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{customer.firstName} {customer.lastName}</p><p className="mt-1 text-xs text-muted">Joined {formatDate(customer.createdAt)}</p></div></div>
          <div className="min-w-0"><p className="truncate text-sm">{customer.email}</p><p className="mt-1 truncate text-xs text-muted">{customer.phone || "No phone provided"}</p></div>
          <div><span className={`inline-flex rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.09em] ${customer.active ? "bg-emerald-400/10 text-emerald-300" : "bg-orange/10 text-orange"}`}>{customer.active ? "Active" : "Disabled"}</span>{!customer.emailVerified ? <p className="mt-2 text-[0.6rem] text-muted">Unverified email</p> : null}</div>
          <p className="text-sm"><strong className="font-semibold text-foreground">{customer.orderCount}</strong><span className="ml-1 text-xs text-muted">orders</span></p>
          <p className="text-xs text-muted">{customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "No orders yet"}</p>
        </Link>)}</div></div> : <div className="border-t border-white/8 px-5 py-14 text-center"><p className="text-sm font-semibold">No matching customers</p><p className="mt-2 text-xs text-muted">Try another search or account state.</p></div>}
      </section>

      {result.totalPages > 1 ? <nav aria-label="Customers pagination" className="mt-6 flex items-center justify-between gap-3">{result.page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-xs font-semibold transition-colors hover:border-gold/50 hover:text-gold" href={buildHref(result.page - 1, result.query, result.state)}>← Previous</Link> : <span />}<p className="text-xs text-muted">Page {result.page} of {result.totalPages}</p>{result.page < result.totalPages ? <Link className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-xs font-semibold transition-colors hover:border-gold/50 hover:text-gold" href={buildHref(result.page + 1, result.query, result.state)}>Next →</Link> : <span />}</nav> : null}
    </main>
  );
}

function CustomerMetric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-white/[0.04] px-3 py-4 sm:px-4"><p className="font-display text-xl font-medium sm:text-2xl">{value}</p><p className="mt-1 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted sm:text-[0.6rem]">{label}</p></div>; }
function firstValue(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }
function buildHref(page: number, query: string, state: string | null) { const params = new URLSearchParams(); if (query) params.set("q", query); if (state) params.set("state", state); if (page > 1) params.set("page", String(page)); const suffix = params.toString(); return suffix ? `/admin/customers?${suffix}` : "/admin/customers"; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "America/New_York" }).format(new Date(value)); }
