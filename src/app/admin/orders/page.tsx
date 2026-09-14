import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  adminOrderStatusLabels,
  adminOrderStatuses,
  getAdminOrders,
} from "@/server/admin-orders";

export const metadata: Metadata = {
  title: "Orders | Admin",
};

type OrdersPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    q?: string | string[];
    status?: string | string[];
  }>;
};

const statusStyles = {
  PENDING_PAYMENT: "bg-white/7 text-muted",
  PAID: "bg-gold/12 text-gold",
  PREPARING: "bg-orange/12 text-orange",
  READY: "bg-emerald-400/10 text-emerald-300",
  OUT_FOR_DELIVERY: "bg-sky-400/10 text-sky-300",
  COMPLETED: "bg-white/7 text-foreground",
  CANCELLED: "bg-red-400/10 text-red-300",
  REFUNDED: "bg-violet-400/10 text-violet-300",
} as const;

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const query = firstValue(params.q);
  const status = firstValue(params.status);
  const requestedPage = Number.parseInt(firstValue(params.page) || "1", 10);
  const result = await getAdminOrders({ page: requestedPage, query, status });
  if (result.total > 0 && result.page > result.totalPages) {
    redirect(buildOrdersHref(result.totalPages, result.query, result.status));
  }
  const start = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const end = Math.min(result.page * result.pageSize, result.total);

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 xl:px-9" id="main-content">
      <section className="hero-reveal">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Operations</p>
        <h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">Orders</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Find and review every order moving through ComEat.</p>
      </section>

      <form className="hero-reveal hero-reveal-1 mt-7 grid gap-3 rounded-2xl bg-white/[0.04] p-4 sm:grid-cols-[minmax(0,1fr)_13rem_auto] sm:items-end sm:p-5" method="get">
        <label className="block min-w-0">
          <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Search orders</span>
          <input
            className="mt-2 h-11 w-full border-b border-white/15 bg-transparent px-0 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold"
            defaultValue={result.query}
            name="q"
            placeholder="Reference, customer, email, or phone"
            type="search"
          />
        </label>
        <label className="block">
          <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Order status</span>
          <select className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 focus:border-gold" defaultValue={result.status ?? ""} name="status">
            <option className="bg-surface" value="">All statuses</option>
            {adminOrderStatuses.map((option) => <option className="bg-surface" key={option} value={option}>{adminOrderStatusLabels[option]}</option>)}
          </select>
        </label>
        <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-background transition-[background-color,transform] duration-300 hover:bg-gold-light active:scale-[0.97] motion-reduce:transform-none" type="submit">Apply filters</button>
      </form>

      <section className="hero-reveal hero-reveal-2 mt-6 overflow-hidden rounded-2xl bg-white/[0.035]" aria-label="Order results">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <p className="text-xs text-muted">Showing <span className="font-semibold text-foreground">{start}–{end}</span> of {result.total}</p>
          {result.query || result.status ? <Link className="text-[0.63rem] font-bold uppercase tracking-[0.13em] text-gold transition-colors hover:text-gold-light" href="/admin/orders">Clear filters</Link> : null}
        </div>

        {result.orders.length ? (
          <div className="border-t border-white/8">
            <div className="hidden grid-cols-[1.05fr_1.2fr_0.85fr_0.85fr_0.7fr] gap-4 px-6 py-3 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted xl:grid">
              <span>Order</span><span>Customer</span><span>Fulfillment</span><span>Status</span><span className="text-right">Total</span>
            </div>
            <div className="divide-y divide-white/8">
              {result.orders.map((order) => (
                <Link aria-label={`Open order ${order.publicReference}`} className="grid gap-4 px-5 py-5 transition-colors duration-200 hover:bg-white/[0.035] sm:grid-cols-2 sm:px-6 xl:grid-cols-[1.05fr_1.2fr_0.85fr_0.85fr_0.7fr] xl:items-center xl:gap-4" href={`/admin/orders/${encodeURIComponent(order.publicReference)}`} key={order.publicReference}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{order.publicReference}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{order.customerName}</p>
                    <p className="mt-1 truncate text-xs text-muted">{order.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-[0.58rem] font-bold uppercase tracking-[0.13em] text-muted xl:hidden">Fulfillment</p>
                    <p className="mt-1 text-sm xl:mt-0">{formatFulfillment(order.fulfillmentMethod)}</p>
                    <p className="mt-1 text-xs text-muted">{formatFulfillmentDate(order.requestedFulfillmentAt)}</p>
                  </div>
                  <div className="flex items-end justify-between gap-4 sm:block">
                    <div>
                      <p className="mb-2 text-[0.58rem] font-bold uppercase tracking-[0.13em] text-muted xl:hidden">Status</p>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.61rem] font-bold uppercase tracking-[0.09em] ${statusStyles[order.status]}`}>{order.statusLabel}</span>
                    </div>
                    <p className="text-sm font-semibold text-gold sm:mt-3 xl:mt-0 xl:text-right">{formatMoney(order.totalCents, order.currency)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="border-t border-white/8 px-5 py-14 text-center sm:px-6">
            <svg aria-hidden="true" className="mx-auto size-7 text-gold" fill="none" viewBox="0 0 24 24"><path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
            <p className="mt-4 text-sm font-semibold">No matching orders</p>
            <p className="mt-2 text-xs text-muted">Try a different reference, customer, or status.</p>
          </div>
        )}
      </section>

      {result.totalPages > 1 ? (
        <nav aria-label="Orders pagination" className="mt-6 flex items-center justify-between gap-3">
          {result.page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-xs font-semibold transition-colors hover:border-gold/50 hover:text-gold" href={buildOrdersHref(result.page - 1, result.query, result.status)}>← Previous</Link> : <span />}
          <p className="text-xs text-muted">Page {result.page} of {result.totalPages}</p>
          {result.page < result.totalPages ? <Link className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-xs font-semibold transition-colors hover:border-gold/50 hover:text-gold" href={buildOrdersHref(result.page + 1, result.query, result.status)}>Next →</Link> : <span />}
        </nav>
      ) : null}
    </main>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildOrdersHref(page: number, query: string, status: string | null) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return suffix ? `/admin/orders?${suffix}` : "/admin/orders";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function formatFulfillmentDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(value));
}

function formatFulfillment(value: string) {
  if (value === "OUT_OF_STATE_SHIPPING") return "Out-of-state shipping";
  if (value === "PICKUP") return "Pickup";
  return "Local delivery";
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { currency, maximumFractionDigits: 0, style: "currency" }).format(cents / 100);
}
