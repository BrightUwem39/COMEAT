"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MenuCategory } from "@/data/menu";
import { menuCardVariants, menuGridVariants } from "@/lib/animations";
import { MenuCard } from "./MenuCard";

type MenuBrowserProps = {
  categories: readonly MenuCategory[];
};

export function MenuBrowser({ categories }: MenuBrowserProps) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [showAllMobile, setShowAllMobile] = useState(false);
  const items = useMemo(() => categories.flatMap((category) => category.items), [categories]);
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
  }, [items, query]);
  const mobileLimit = showAllMobile || query.trim() ? filteredItems.length : 6;

  return (
    <section aria-labelledby="all-dishes-title" className="mt-10 border-t border-border pt-8 lg:mt-14 lg:pt-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-4xl leading-none tracking-[-0.03em] text-foreground sm:text-5xl" id="all-dishes-title">All dishes</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">Choose any meal, select its available size, add a protein where offered, and set your required pepper level.</p>
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{filteredItems.length} dishes</span>
      </div>

      <label className="relative mt-7 block sm:max-w-md">
        <span className="sr-only">Search dishes</span>
        <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="m16.25 16.25 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
        <input
          className="min-h-12 w-full rounded-xl border border-border bg-surface pl-12 pr-4 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-gold focus:shadow-[0_0_0_3px_rgba(230,165,26,0.12)]"
          onChange={(event) => { setQuery(event.target.value); setShowAllMobile(false); }}
          placeholder="Search the menu"
          type="search"
          value={query}
        />
      </label>

      <aside className="mt-7 rounded-xl border border-border bg-surface px-5 py-4 text-sm leading-relaxed text-muted" aria-label="Menu preparation notes">
        Rice can be made with basmati or long-grain on request. Soups are made with assorted meat, while local sauces are made with seafood and assorted meat.
      </aside>

      <motion.div
        animate="visible"
        className="mt-8 grid items-stretch gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
        initial={reduceMotion ? false : "hidden"}
        variants={reduceMotion ? undefined : menuGridVariants}
      >
        {filteredItems.map((item, index) => (
          <motion.div
            className={index >= mobileLimit ? "hidden sm:block" : "block"}
            key={item.id}
            variants={reduceMotion ? undefined : menuCardVariants}
          >
            <MenuCard item={item} />
          </motion.div>
        ))}
      </motion.div>

      {filteredItems.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted">No dish matches “{query}”.</div>
      ) : null}

      {filteredItems.length > mobileLimit ? (
        <button className="mt-6 min-h-12 w-full rounded-xl border border-gold text-xs font-bold uppercase tracking-[0.14em] text-gold transition-[background-color,color,transform] hover:bg-gold hover:text-background active:scale-[0.99] sm:hidden" onClick={() => setShowAllMobile(true)} type="button">
          Show {filteredItems.length - mobileLimit} more dishes
        </button>
      ) : null}
    </section>
  );
}
