import Link from "next/link";

import { getAdminDashboardOverview } from "@/server/admin-dashboard";

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

export default async function AdminPage() {
  const dashboard = await getAdminDashboardOverview();
  const metrics = [
    { label: "Total orders", value: dashboard.totalOrders.toLocaleString("en-US"), note: `${dashboard.ordersLast24Hours} in the last 24 hours`, icon: "orders" as const },
    { label: "Active kitchen", value: dashboard.activeOrders.toLocaleString("en-US"), note: "Paid through delivery", icon: "kitchen" as const },
    { label: "30-day revenue", value: formatMoney(dashboard.revenueCents, dashboard.currency), note: "Successful payments", icon: "revenue" as const },
    { label: "New enquiries", value: dashboard.newInquiries.toLocaleString("en-US"), note: "Contact and catering", icon: "messages" as const },
  ];

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 xl:px-9" id="main-content">
      <section className="hero-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Overview</p>
          <h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">
            Welcome back, {dashboard.adminFirstName}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">A live view of orders, revenue, and customer activity.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)]" />
          Updated {formatDashboardTime(dashboard.generatedAt)}
        </div>
      </section>

      <section aria-label="Business overview" className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <article
            className={`hero-reveal rounded-2xl bg-white/[0.045] p-5 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/[0.065] motion-reduce:transform-none hero-reveal-${Math.min(index + 1, 3)}`}
            key={metric.label}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-[0.63rem] font-bold uppercase tracking-[0.16em] text-muted">{metric.label}</p>
              <MetricIcon type={metric.icon} />
            </div>
            <p className="mt-6 font-display text-[1.9rem] font-medium tracking-[-0.04em] text-foreground">{metric.value}</p>
            <p className="mt-2 text-xs text-muted">{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="hero-reveal hero-reveal-3 mt-8 overflow-hidden rounded-2xl bg-white/[0.035]">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-gold">Latest activity</p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl">Recent orders</h2>
          </div>
          <p className="text-xs text-muted">Order tools arrive in Step 14.3</p>
        </div>

        {dashboard.recentOrders.length ? (
          <div className="border-t border-white/8">
            <div className="hidden grid-cols-[1.05fr_1.2fr_0.9fr_0.8fr] gap-5 px-6 py-3 text-[0.59rem] font-bold uppercase tracking-[0.15em] text-muted md:grid">
              <span>Order</span><span>Customer</span><span>Status</span><span className="text-right">Total</span>
            </div>
            <div className="divide-y divide-white/8">
              {dashboard.recentOrders.map((order) => (
                <div className="grid gap-3 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.035] sm:px-6 md:grid-cols-[1.05fr_1.2fr_0.9fr_0.8fr] md:items-center md:gap-5" key={order.publicReference}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{order.publicReference}</p>
                    <p className="mt-1 text-xs text-muted">{formatOrderDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{order.customerName}</p>
                    <p className="mt-1 truncate text-xs text-muted md:hidden">{order.customerEmail}</p>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] ${statusStyles[order.status]}`}>{order.statusLabel}</span>
                  </div>
                  <p className="text-sm font-semibold text-gold md:text-right">{formatMoney(order.totalCents, order.currency)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border-t border-white/8 px-5 py-12 text-center sm:px-6">
            <p className="text-sm font-semibold">No orders yet</p>
            <p className="mt-2 text-xs leading-5 text-muted">New customer orders will appear here automatically.</p>
            <Link className="mt-5 inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-background transition-[background-color,transform] duration-300 hover:bg-gold-light active:scale-[0.97] motion-reduce:transform-none" href="/menu">View menu</Link>
          </div>
        )}
      </section>
    </main>
  );
}

function MetricIcon({ type }: { type: "kitchen" | "messages" | "orders" | "revenue" }) {
  const common = "size-5 text-gold";
  if (type === "revenue") return <svg aria-hidden="true" className={common} fill="none" viewBox="0 0 24 24"><path d="M12 3v18m4-14.5H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "messages") return <svg aria-hidden="true" className={common} fill="none" viewBox="0 0 24 24"><path d="M4 5.5h16v11H9l-5 4v-15Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "kitchen") return <svg aria-hidden="true" className={common} fill="none" viewBox="0 0 24 24"><path d="M5 19h14M7 16a5 5 0 0 1 10 0H7Zm5-5V7m-3 1 3-5 3 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  return <svg aria-hidden="true" className={common} fill="none" viewBox="0 0 24 24"><path d="m5 7 7-4 7 4-7 4-7-4Zm0 0v10l7 4 7-4V7M12 11v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
}

function formatDashboardTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(value));
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { currency, maximumFractionDigits: 0, style: "currency" }).format(cents / 100);
}
