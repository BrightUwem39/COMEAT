"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { StorefrontMenuCategoryDTO } from "@/server/menu";
import { menuGridVariants } from "@/lib/animations";
import { MenuCard } from "./MenuCard";

type MenuBrowserProps = {
  categories: readonly StorefrontMenuCategoryDTO[];
};

export function MenuBrowser({ categories }: MenuBrowserProps) {
  const reduceMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const filteredCategories = categories.filter(
    (category) => selectedCategory === "all" || category.id === selectedCategory,
  );

  return (
    <section aria-label="Menu categories and dishes" className="mt-8 border-t border-border pt-7 sm:mt-10 sm:pt-8 lg:mt-14 lg:pt-10">
      <div className="mx-auto max-w-5xl">
        <fieldset>
          <legend className="sr-only">Filter dishes by category</legend>
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
            <CategoryButton active={selectedCategory === "all"} label="All dishes" onClick={() => setSelectedCategory("all")} />
            {categories.map((category) => (
              <CategoryButton active={selectedCategory === category.id} key={category.id} label={category.name} onClick={() => setSelectedCategory(category.id)} />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-10 space-y-14 sm:mt-14 sm:space-y-16">
        {filteredCategories.map((category) => (
          <section className="scroll-mt-44" id={category.id} key={category.id}>
            <div className="flex items-start gap-4 sm:gap-5">
              <span aria-hidden="true" className="mt-1 h-12 w-px shrink-0 bg-gradient-to-b from-gold via-orange to-transparent" />
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold">The collection</p>
                <h3 className="mt-2 font-display text-3xl leading-none tracking-[-0.03em] text-foreground sm:text-4xl">{category.name}</h3>
                {category.note ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{category.note}</p> : null}
              </div>
            </div>
            <motion.div
              className="mt-6 grid items-stretch gap-2.5 min-[360px]:gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4"
              initial={reduceMotion ? false : "hidden"}
              variants={reduceMotion ? undefined : menuGridVariants}
              viewport={{ amount: 0.08, once: true }}
              whileInView={reduceMotion ? undefined : "visible"}
            >
              {category.items.map((item) => (
                <MenuCard item={item} key={item.id} />
              ))}
            </motion.div>
          </section>
        ))}
      </div>

    </section>
  );
}

function CategoryButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={`group inline-flex min-h-12 items-center rounded-full border px-5 text-[0.68rem] font-bold uppercase tracking-[0.12em] transition-[background-color,border-color,color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:px-6 ${active ? "border-gold bg-gold text-background shadow-[0_10px_28px_rgba(230,165,26,0.2)]" : "border-white/12 bg-background/55 text-muted hover:border-gold/50 hover:text-foreground"}`}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
    </button>
  );
}
