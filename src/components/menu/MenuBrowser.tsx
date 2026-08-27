"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MenuCategory } from "@/data/menu";
import { menuGridVariants, menuSectionVariants } from "@/lib/animations";
import { MenuCard } from "./MenuCard";

type MenuBrowserProps = {
  categories: readonly MenuCategory[];
};

export function MenuBrowser({ categories }: MenuBrowserProps) {
  const [filter, setFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const reduceMotion = useReducedMotion();

  const visibleCategories = useMemo(
    () => filter === "all" ? categories : categories.filter((category) => category.id === filter),
    [categories, filter],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visibleEntry?.target.id) setActiveCategory(visibleEntry.target.id);
      },
      {
        rootMargin: "-160px 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    sectionRefs.current.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [filter]);

  const changeFilter = (nextFilter: string) => {
    setFilter(nextFilter);
    setActiveCategory(nextFilter);
  };

  return (
    <div>
      <nav aria-label="Menu categories" className="sticky top-20 z-40 -mx-5 mt-10 border-y border-border bg-background/95 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-12 lg:mt-14 lg:px-12">
        <div className="flex flex-wrap gap-2">
          <CategoryButton
            active={filter === "all" && activeCategory === "all"}
            label="All dishes"
            onClick={() => changeFilter("all")}
            pressed={filter === "all"}
          />
          {categories.map((category) => (
            <CategoryButton
              active={filter === category.id || filter === "all" && activeCategory === category.id}
              label={category.shortName}
              onClick={() => changeFilter(category.id)}
              pressed={filter === category.id}
              key={category.id}
            />
          ))}
        </div>
      </nav>

      <div className="mt-12 lg:mt-16">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            animate="visible"
            exit={reduceMotion ? undefined : "exit"}
            initial={reduceMotion ? false : "hidden"}
            key={filter}
            layout
            variants={reduceMotion ? undefined : menuSectionVariants}
          >
            {visibleCategories.map((category) => (
              <section
                aria-labelledby={`${category.id}-title`}
                className="relative mb-16 scroll-mt-40 last:mb-0"
                id={category.id}
                key={category.id}
                ref={(node) => {
                  if (node) sectionRefs.current.set(category.id, node);
                  else sectionRefs.current.delete(category.id);
                }}
              >
                <div className="mb-8 flex items-end justify-between gap-6 border-b border-border pb-5">
                  <h2 className="font-display text-4xl leading-none tracking-[-0.03em] text-foreground sm:text-5xl" id={`${category.id}-title`}>{category.name}</h2>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{category.items.length} dishes</span>
                </div>
                <motion.div
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  initial={reduceMotion ? false : "hidden"}
                  variants={reduceMotion ? undefined : menuGridVariants}
                >
                  {category.items.map((item) => <MenuCard item={item} key={item.id} />)}
                </motion.div>
              </section>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

type CategoryButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  pressed: boolean;
};

function CategoryButton({ active, label, onClick, pressed }: CategoryButtonProps) {
  return (
    <button
      aria-pressed={pressed}
      className={`relative min-h-10 overflow-hidden px-4 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-200 ${active ? "text-background" : "text-muted hover:text-foreground"}`}
      onClick={onClick}
      type="button"
    >
      {active ? <motion.span className="absolute inset-0 bg-gold" layoutId="active-menu-category" transition={{ duration: 0.2 }} /> : null}
      <span className="relative z-10">{label}</span>
    </button>
  );
}
