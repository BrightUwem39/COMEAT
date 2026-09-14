import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CustomerAccessControl } from "@/components/admin/CustomerAccessControl";
import { getAdminCustomerDetail } from "@/server/admin-customers";

export const metadata: Metadata = { title: "Customer details | Admin" };

const statusStyles = { PENDING_PAYMENT: "bg-white/7 text-muted", PAID: "bg-gold/12 text-gold", PREPARING: "bg-orange/12 text-orange", READY: "bg-emerald-400/10 text-emerald-300", OUT_FOR_DELIVERY: "bg-sky-400/10 text-sky-300", COMPLETED: "bg-white/7 text-foreground", CANCELLED: "bg-red-400/10 text-red-300", REFUNDED: "bg-violet-400/10 text-violet-300" } as const;

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getAdminCustomerDetail(id);
  if (!customer) notFound();

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <Link className="hero-reveal inline-flex min-h-11 items-center text-[0.64rem] font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light" href="/admin/customers">← All customers</Link>
      <header className="hero-reveal hero-reveal-1 mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="flex min-w-0 items-center gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold/12 text-base font-bold text-gold sm:size-16">{customer.firstName.charAt(0)}{customer.lastName.charAt(0)}</span><div className="min-w-0"><p className="text-[0.63rem] font-bold uppercase tracking-[0.19em] text-muted">Customer profile</p><h1 className="mt-2 truncate font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">{customer.firstName} {customer.lastName}</h1><p className="mt-3 truncate text-sm text-muted">{customer.email}</p></div></div><span className={`w-fit rounded-full px-3 py-1.5 text-[0.63rem] font-bold uppercase tracking-[0.1em] ${customer.active ? "bg-emerald-400/10 text-emerald-300" : "bg-orange/10 text-orange"}`}>{customer.active ? "Active" : "Disabled"}</span></header>

      <section aria-label="Customer activity" className="hero-reveal hero-reveal-2 mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"><Metric label="Orders" value={String(customer._count.orders)} /><Metric label="Lifetime spend" value={formatMoney(customer.lifetimeSpendCents, "USD")} /><Metric label="Addresses" value={String(customer._count.addresses)} /><Metric label="Last active" value={customer.lastActiveAt ? formatDate(customer.lastActiveAt) : "No session"} /></section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="space-y-6">
          <section className="hero-reveal hero-reveal-2 rounded-2xl bg-white/[0.035] p-5 sm:p-6"><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Account</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]">Customer information</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><Detail label="Full name" value={`${customer.firstName} ${customer.lastName}`} /><Detail label="Email" value={customer.email} /><Detail label="Phone" value={customer.phone || "Not provided"} /><Detail label="Email verification" value={customer.emailVerified ? "Verified" : "Not verified"} /><Detail label="Member since" value={formatDate(customer.createdAt)} /><Detail label="Account type" value="Customer" /></dl></section>

          <section className="hero-reveal hero-reveal-3 rounded-2xl bg-white/[0.035] p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Delivery</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]">Saved addresses</h2></div><p className="text-xs text-muted">{customer.addresses.length} saved</p></div>{customer.addresses.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{customer.addresses.map((address) => <address className="rounded-xl bg-white/[0.025] p-4 text-xs not-italic leading-6 text-muted" key={address.id}><div className="flex items-center justify-between gap-3"><strong className="text-sm text-foreground">{address.label || "Delivery address"}</strong>{address.isDefault ? <span className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-gold">Default</span> : null}</div><p className="mt-3">{address.recipientName}<br />{address.streetLine1}{address.streetLine2 ? <><br />{address.streetLine2}</> : null}<br />{address.city}, {address.state} {address.postalCode}<br />{address.countryCode}</p><p className="mt-2">{address.phone}</p></address>)}</div> : <p className="mt-5 text-sm text-muted">No saved addresses.</p>}</section>

          <section className="hero-reveal hero-reveal-3 overflow-hidden rounded-2xl bg-white/[0.035]"><div className="flex items-end justify-between gap-4 px-5 py-5 sm:px-6"><div><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Activity</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]">Recent orders</h2></div><p className="text-xs text-muted">Latest 10</p></div>{customer.orders.length ? <div className="divide-y divide-white/8 border-t border-white/8">{customer.orders.map((order) => <Link className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/[0.035] sm:px-6" href={`/admin/orders/${encodeURIComponent(order.publicReference)}`} key={order.publicReference}><div><p className="text-sm font-semibold">{order.publicReference}</p><p className="mt-1 text-xs text-muted">{formatDate(order.createdAt)}</p></div><span className={`rounded-full px-2.5 py-1 text-[0.59rem] font-bold uppercase tracking-[0.08em] ${statusStyles[order.status]}`}>{order.statusLabel}</span><p className="text-sm font-semibold text-gold">{formatMoney(order.totalCents, order.currency)}</p></Link>)}</div> : <p className="border-t border-white/8 px-5 py-10 text-sm text-muted sm:px-6">No orders placed from this account.</p>}</section>
        </div>

        <aside className="hero-reveal hero-reveal-3 xl:sticky xl:top-6"><section className="rounded-2xl bg-white/[0.045] p-5"><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Access control</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]">Account access</h2><p className="mt-3 text-xs leading-5 text-muted">{customer.active ? "Disabling access signs the customer out without deleting their orders or profile." : customer.emailVerified ? "Restoring access allows this customer to sign in again." : "Restoring access does not bypass the customer’s email-verification requirement."}</p><div className="mt-5"><CustomerAccessControl active={customer.active} id={customer.id} key={customer.updatedAt} updatedAt={customer.updatedAt} /></div></section></aside>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white/[0.04] px-4 py-4"><p className="truncate font-display text-lg font-medium sm:text-xl">{value}</p><p className="mt-1 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted">{label}</p></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/[0.025] px-4 py-3"><dt className="text-[0.58rem] font-bold uppercase tracking-[0.13em] text-muted">{label}</dt><dd className="mt-2 break-words font-medium">{value}</dd></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "America/New_York" }).format(new Date(value)); }
function formatMoney(cents: number, currency: string) { return new Intl.NumberFormat("en-US", { currency, maximumFractionDigits: 0, style: "currency" }).format(cents / 100); }
