import type { Metadata } from "next";

import { getAdminAnalytics } from "@/server/admin-analytics";

export const metadata: Metadata = { title: "Analytics | Admin" };

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalytics();
  const maxTrendRevenue = Math.max(...analytics.salesTrend.map((day) => day.revenueCents), 1);
  const maxPeakOrders = Math.max(...analytics.peakOrderingHours.map((period) => period.orderCount), 1);
  const maxBestSellerUnits = Math.max(...analytics.bestSelling.map((dish) => dish.unitsSold), 1);

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 xl:px-9" id="main-content">
      <section className="hero-reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Performance</p>
          <h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">Business analytics</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Revenue, demand, and dish performance from completed payments.</p>
        </div>
        <p className="text-xs text-muted">Updated {formatTime(analytics.generatedAt)} · Eastern Time</p>
      </section>

      <section aria-label="Revenue comparisons" className="mt-8 grid gap-3 lg:grid-cols-3">
        {analytics.periods.map((period, index) => {
          const positive = period.revenueChangePercent >= 0;
          return (
            <article className={`hero-reveal hero-reveal-${Math.min(index + 1, 3)} rounded-2xl bg-white/[0.045] p-5 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/[0.065] motion-reduce:transform-none`} key={period.key}>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[0.63rem] font-bold uppercase tracking-[0.16em] text-muted">{period.label}</p>
                <span className={`rounded-full px-2.5 py-1 text-[0.62rem] font-semibold ${positive ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>
                  {positive ? "↑" : "↓"} {Math.abs(period.revenueChangePercent).toFixed(1)}%
                </span>
              </div>
              <p className="mt-7 font-display text-[1.9rem] font-medium tracking-[-0.04em]">{formatMoney(period.revenueCents, analytics.currency)}</p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-4">
                <div><p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted">Orders</p><p className="mt-1.5 text-sm font-semibold">{period.orderCount.toLocaleString("en-US")}</p></div>
                <div><p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted">Average order</p><p className="mt-1.5 text-sm font-semibold">{formatMoney(period.averageOrderValueCents, analytics.currency)}</p></div>
              </div>
              <p className="mt-4 text-[0.68rem] leading-5 text-muted">Compared with the same elapsed time in the preceding period.</p>
            </article>
          );
        })}
      </section>

      <section className="hero-reveal hero-reveal-2 mt-6 rounded-2xl bg-white/[0.035] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-gold">Last 14 days</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl">Net sales trend</h2></div>
          <p className="text-xs text-muted">Revenue after refunds</p>
        </div>
        <figure className="mt-7 overflow-x-auto pb-2">
          <figcaption className="sr-only">Daily net revenue for the last 14 days</figcaption>
          <div className="flex h-56 min-w-[42rem] items-end gap-2 border-b border-white/10 px-1" role="list">
            {analytics.salesTrend.map((day) => {
              const height = day.revenueCents ? Math.max(5, (day.revenueCents / maxTrendRevenue) * 100) : 2;
              return (
                <div aria-label={`${day.label}: ${formatMoney(day.revenueCents, analytics.currency)} from ${day.orderCount} orders`} className="group flex h-full min-w-0 flex-1 flex-col justify-end" key={day.date} role="listitem">
                  <div className="relative mx-auto w-full max-w-8 rounded-t-md bg-gradient-to-t from-orange to-gold transition-[height,filter] duration-500 group-hover:brightness-125" style={{ height: `${height}%` }}>
                    <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[0.58rem] font-semibold text-background group-hover:block">{formatMoney(day.revenueCents, analytics.currency)}</span>
                  </div>
                  <span className="mt-2 text-center text-[0.58rem] text-muted">{day.label}</span>
                </div>
              );
            })}
          </div>
        </figure>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <PerformanceList dishes={analytics.bestSelling} maxUnits={maxBestSellerUnits} title="Best-selling dishes" eyebrow="Top performers · 30 days" currency={analytics.currency} />
        <PerformanceList dishes={analytics.underperforming} maxUnits={maxBestSellerUnits} title="Underperforming dishes" eyebrow="Needs attention · 30 days" currency={analytics.currency} quiet />
      </section>

      <section className="hero-reveal hero-reveal-3 mt-6 rounded-2xl bg-white/[0.035] p-5 sm:p-6">
        <div><p className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-gold">Last 30 days</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl">Peak ordering hours</h2></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2" role="list">
          {analytics.peakOrderingHours.map((period) => (
            <div className="grid grid-cols-[6.7rem_minmax(0,1fr)_2rem] items-center gap-3" key={period.label} role="listitem">
              <span className="text-xs text-muted">{period.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-white/7"><span className="block h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${period.orderCount ? Math.max(8, (period.orderCount / maxPeakOrders) * 100) : 0}%` }} /></span>
              <span className="text-right text-xs font-semibold">{period.orderCount}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function PerformanceList({ currency, dishes, eyebrow, maxUnits, quiet = false, title }: { currency: string; dishes: Array<{ grossSalesCents: number; name: string; unitsSold: number }>; eyebrow: string; maxUnits: number; quiet?: boolean; title: string }) {
  return (
    <article className="hero-reveal hero-reveal-3 rounded-2xl bg-white/[0.035] p-5 sm:p-6">
      <p className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
      <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl">{title}</h2>
      <ol className="mt-6 space-y-5">
        {dishes.map((dish) => (
          <li key={dish.name}>
            <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{dish.name}</p><p className="mt-1 text-xs text-muted">{dish.unitsSold} {dish.unitsSold === 1 ? "unit" : "units"} sold</p></div><p className={`shrink-0 text-sm font-semibold ${quiet ? "text-muted" : "text-gold"}`}>{formatMoney(dish.grossSalesCents, currency)}</p></div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/7"><div className={`h-full rounded-full ${quiet ? "bg-white/25" : "bg-gradient-to-r from-orange to-gold"}`} style={{ width: `${dish.unitsSold ? Math.max(6, (dish.unitsSold / maxUnits) * 100) : 0}%` }} /></div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { currency, maximumFractionDigits: 0, style: "currency" }).format(cents / 100);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(new Date(value));
}
