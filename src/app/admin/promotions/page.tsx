import type { Metadata } from "next";

import { PromotionForm } from "@/components/admin/PromotionForm";
import { getAdminPromotions } from "@/server/admin-promotions";

export const metadata: Metadata = { title: "Promotions | Admin" };

const statusStyles = {
  ACTIVE: "bg-emerald-400/10 text-emerald-300",
  EXPIRED: "bg-white/7 text-muted",
  LIMIT_REACHED: "bg-orange/12 text-orange",
  PAUSED: "bg-white/7 text-muted",
  SCHEDULED: "bg-sky-400/10 text-sky-300",
} as const;
const statusLabels = { ACTIVE: "Active", EXPIRED: "Expired", LIMIT_REACHED: "Limit reached", PAUSED: "Paused", SCHEDULED: "Scheduled" } as const;

export default async function AdminPromotionsPage() {
  const data = await getAdminPromotions();
  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <header className="hero-reveal">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Growth</p>
        <h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">Promotions</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Create controlled offers without losing sight of limits, dates, or usage.</p>
      </header>

      <section aria-label="Promotion totals" className="hero-reveal hero-reveal-1 mt-7 grid grid-cols-2 gap-2 sm:max-w-3xl sm:grid-cols-4 sm:gap-3">
        <Metric label="Promotions" value={data.total} /><Metric label="Live now" value={data.activeNow} /><Metric label="Redemptions" value={data.totalRedemptions} /><Metric label="Expired" value={data.expired} />
      </section>

      <details className="group hero-reveal hero-reveal-2 mt-7 overflow-hidden rounded-2xl bg-white/[0.04] open:bg-white/[0.05]">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden sm:px-6 [&::-webkit-details-marker]:hidden"><div><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Quick action</p><h2 className="mt-1 font-display text-xl font-medium">Create a promotion</h2></div><span className="grid size-10 place-items-center rounded-full bg-gold text-xl text-background transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none">+</span></summary>
        <div className="border-t border-white/8 p-5 sm:p-6"><PromotionForm /></div>
      </details>

      <section aria-labelledby="promotion-list-heading" className="hero-reveal hero-reveal-3 mt-8">
        <div><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Campaign library</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl" id="promotion-list-heading">All promotions</h2></div>
        {data.promotions.length ? <div className="mt-5 grid gap-3 2xl:grid-cols-2">{data.promotions.map((promotion) => (
          <details className="group overflow-hidden rounded-2xl bg-white/[0.035] transition-colors duration-300 open:bg-white/[0.05] hover:bg-white/[0.05]" key={promotion.id}>
            <summary className="flex min-h-24 cursor-pointer list-none items-center gap-4 p-4 marker:hidden sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold"><TagIcon /></span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold sm:text-base">{promotion.name}</h3><span className={`rounded-full px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.09em] ${statusStyles[promotion.status]}`}>{statusLabels[promotion.status]}</span></div><p className="mt-1 font-mono text-xs font-semibold tracking-[0.08em] text-gold">{promotion.code}</p><p className="mt-2 text-xs text-muted">{describePromotion(promotion)} · {promotion.redemptionCount}{promotion.usageLimit ? `/${promotion.usageLimit}` : ""} used</p></div>
              <svg aria-hidden="true" className="size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180 group-open:text-gold motion-reduce:transition-none" fill="none" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>
            </summary>
            <div className="border-t border-white/8 p-4 sm:p-5"><PromotionForm promotion={promotion} /></div>
          </details>
        ))}</div> : <div className="mt-5 rounded-2xl bg-white/[0.035] px-5 py-14 text-center"><p className="text-sm font-semibold">No promotions yet</p><p className="mt-2 text-xs text-muted">Open the creator above to launch the first offer.</p></div>}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-white/[0.04] px-3 py-4 sm:px-4"><p className="font-display text-xl font-medium sm:text-2xl">{value}</p><p className="mt-1 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted sm:text-[0.6rem]">{label}</p></div>; }
function TagIcon() { return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M20 13 13 20 4 11V4h7l9 9Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /><circle cx="8.5" cy="8.5" r="1" fill="currentColor" /></svg>; }
function describePromotion(promotion: { amountOffCents: number | null; minimumOrderCents: number; percentageOff: number | null; type: string }) { const discount = promotion.type === "PERCENTAGE" ? `${promotion.percentageOff}% off` : promotion.type === "FIXED_AMOUNT" ? `${formatMoney(promotion.amountOffCents ?? 0)} off` : "Free delivery"; return promotion.minimumOrderCents ? `${discount} above ${formatMoney(promotion.minimumOrderCents)}` : discount; }
function formatMoney(cents: number) { return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" }).format(cents / 100); }
