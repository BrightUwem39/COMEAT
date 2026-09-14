import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MenuProductEditor } from "@/components/admin/MenuProductEditor";
import { getAdminMenuProducts } from "@/server/admin-menu";

export const metadata: Metadata = { title: "Menu | Admin" };

export default async function AdminMenuPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const menu = await getAdminMenuProducts(queryValue);

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <header className="hero-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Catalog</p>
          <h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">Menu management</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Control dish availability, featured placement, and confirmed pricing.</p>
        </div>
        <Link className="inline-flex min-h-11 w-fit items-center whitespace-nowrap rounded-full border border-white/12 px-4 text-[0.63rem] font-bold uppercase tracking-[0.12em] transition-[border-color,color,background-color] duration-300 hover:border-gold/50 hover:bg-gold/8 hover:text-gold" href="/menu">View customer menu</Link>
      </header>

      <section aria-label="Menu totals" className="hero-reveal hero-reveal-1 mt-7 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
        <MenuMetric label="Dishes" value={menu.total} />
        <MenuMetric label="Available" value={menu.active} />
        <MenuMetric label="Featured" value={menu.featured} />
      </section>

      <form className="hero-reveal hero-reveal-2 mt-7 grid gap-3 rounded-2xl bg-white/[0.04] p-4 sm:max-w-2xl sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5" method="get">
        <label className="min-w-0 flex-1">
          <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Find a dish</span>
          <input className="mt-2 h-11 w-full border-b border-white/15 bg-transparent px-0 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold" defaultValue={menu.query} name="q" placeholder="Search by dish name" type="search" />
        </label>
        <button className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform] duration-300 hover:bg-gold-light active:scale-[0.98] motion-reduce:transform-none" type="submit">Search</button>
      </form>

      <section className="hero-reveal hero-reveal-3 mt-7" aria-labelledby="menu-inventory-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Inventory</p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl" id="menu-inventory-heading">All dishes</h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted">{menu.products.length} shown</p>
            {menu.query ? <Link className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light" href="/admin/menu">Clear</Link> : null}
          </div>
        </div>

        {menu.products.length ? (
          <div className="mt-5 grid gap-3 2xl:grid-cols-2">
            {menu.products.map((product) => (
              <details className="group overflow-hidden rounded-2xl bg-white/[0.035] transition-colors duration-300 open:bg-white/[0.05] hover:bg-white/[0.05]" key={product.id}>
                <summary className="flex min-h-24 cursor-pointer list-none items-center gap-4 p-4 marker:hidden sm:p-5 [&::-webkit-details-marker]:hidden">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface sm:size-[4.5rem]">
                    <Image alt="" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" fill sizes="72px" src={product.imageUrl || "/images/hero.jpg"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold sm:text-base">{product.name}</h3>
                      <span className={`rounded-full px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.09em] ${product.active ? "bg-emerald-400/10 text-emerald-300" : "bg-white/7 text-muted"}`}>{product.active ? "Available" : "Unavailable"}</span>
                      {product.featured ? <span className="rounded-full bg-gold/12 px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.09em] text-gold">Featured</span> : null}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">{product.description}</p>
                    <p className="mt-2 text-xs font-semibold text-gold">{formatPriceRange(product.variants)}</p>
                  </div>
                  <svg aria-hidden="true" className="size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180 group-open:text-gold motion-reduce:transition-none" fill="none" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>
                </summary>
                <div className="border-t border-white/8 p-4 sm:p-5">
                  <MenuProductEditor product={product} />
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-white/[0.035] px-5 py-14 text-center">
            <p className="text-sm font-semibold">No matching dishes</p>
            <p className="mt-2 text-xs text-muted">Try another dish name.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function MenuMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl bg-white/[0.04] px-3 py-4 sm:px-4"><p className="font-display text-xl font-medium text-foreground sm:text-2xl">{value}</p><p className="mt-1 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted sm:text-[0.6rem]">{label}</p></div>;
}

function formatPriceRange(variants: readonly { active: boolean; basePriceCents: number | null }[]) {
  const prices = variants.flatMap((variant) => variant.active && variant.basePriceCents !== null ? [variant.basePriceCents] : []);
  if (!prices.length) return "No active pricing";
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  return minimum === maximum ? formatMoney(minimum) : `${formatMoney(minimum)}–${formatMoney(maximum)}`;
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" }).format(cents / 100);
}
