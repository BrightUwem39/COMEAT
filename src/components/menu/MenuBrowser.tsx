"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MenuCategory } from "@/data/menu";
import { menuCardVariants, menuGridVariants } from "@/lib/animations";
import { MenuCard } from "./MenuCard";

type MenuBrowserProps = {
  categories: readonly MenuCategory[];
};

export function MenuBrowser({ categories }: MenuBrowserProps) {
  const reduceMotion = useReducedMotion();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAllMobile, setShowAllMobile] = useState(false);
  const items = useMemo(() => categories.flatMap((category) => category.items), [categories]);
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
  }, [items, query]);
  const mobileLimit = showAllMobile || query.trim() ? filteredItems.length : 6;

  useEffect(() => {
    const dismissSearchKeyboard = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !searchContainerRef.current?.contains(target)) {
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener("pointerdown", dismissSearchKeyboard);
    return () => document.removeEventListener("pointerdown", dismissSearchKeyboard);
  }, []);

  return (
    <section aria-labelledby="all-dishes-title" className="mt-8 border-t border-border pt-7 sm:mt-10 sm:pt-8 lg:mt-14 lg:pt-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl leading-none tracking-[-0.03em] text-foreground min-[360px]:text-4xl sm:text-5xl" id="all-dishes-title">All dishes</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">Choose any meal, select its available size, add a protein where offered, and set your required pepper level.</p>
        </div>
      </div>

      <motion.div
        animate={reduceMotion ? undefined : { y: searchFocused ? -2 : 0 }}
        className="relative mt-7 border-b border-border bg-transparent sm:max-w-xl"
        ref={searchContainerRef}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ opacity: searchFocused || query ? 1 : 0 }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_50%,rgba(230,165,26,0.12),transparent_38%)]"
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
        />
        <div className="relative flex min-h-14 items-center gap-3 px-2 min-[360px]:px-3 sm:min-h-16">
          <label className="sr-only" htmlFor="menu-search">Search dishes</label>
          <input
            className="min-w-0 flex-1 appearance-none bg-transparent py-4 text-sm font-medium text-foreground outline-none placeholder:text-muted"
            id="menu-search"
            onBlur={() => setSearchFocused(false)}
            onChange={(event) => { setQuery(event.target.value); setShowAllMobile(false); }}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            placeholder="Search for a dish..."
            ref={searchInputRef}
            type="search"
            value={query}
          />
          <AnimateSearchAction
            query={query}
            reduceMotion={Boolean(reduceMotion)}
            resultCount={filteredItems.length}
            totalCount={items.length}
            onClear={() => setQuery("")}
          />
        </div>
      </motion.div>

      <motion.div
        animate="visible"
        className="mt-6 grid items-stretch gap-2.5 min-[360px]:gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
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

function AnimateSearchAction({ onClear, query, reduceMotion, resultCount, totalCount }: { onClear: () => void; query: string; reduceMotion: boolean; resultCount: number; totalCount: number }) {
  if (!query) return <span className="hidden shrink-0 rounded-full bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted sm:block">{totalCount} dishes</span>;

  return (
    <motion.button
      animate={{ opacity: 1, scale: 1 }}
      aria-label={`Clear search showing ${resultCount} results`}
      className="grid size-9 shrink-0 place-items-center rounded-full bg-background text-lg leading-none text-muted transition-colors hover:text-gold"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
      onClick={onClear}
      type="button"
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
    >
      ×
    </motion.button>
  );
}
