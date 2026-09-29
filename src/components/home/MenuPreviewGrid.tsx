"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { MenuItem } from "@/data/menu";
import { menuCardVariants, menuGridVariants } from "@/lib/animations";
import { MenuCard } from "@/components/menu/MenuCard";

type MenuPreviewGridProps = {
  items: readonly MenuItem[];
  mobileItems: readonly MenuItem[];
};

export function MenuPreviewGrid({ items, mobileItems }: MenuPreviewGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <motion.div
        aria-label="Featured menu dishes"
        className="mt-10 grid grid-cols-2 gap-2 sm:hidden"
        initial={reduceMotion ? false : "hidden"}
        role="region"
        variants={reduceMotion ? undefined : menuGridVariants}
        viewport={{ amount: 0.2, once: true }}
        whileInView={reduceMotion ? undefined : "visible"}
      >
        {mobileItems.map((item) => (
          <motion.div className="min-w-0" key={item.id} variants={reduceMotion ? undefined : menuCardVariants}>
            <Link
              aria-label={`View ${item.name} on the menu`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-surface"
              href="/menu"
            >
              <Image alt={item.name} className="food-image-crop object-cover" fill sizes="calc((100vw - 48px) / 2)" src={item.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2">
                <h3 className="font-display text-xs leading-tight tracking-[-0.02em] text-foreground">{item.name}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        aria-label="Featured menu dishes"
        className="mt-10 -mx-8 hidden touch-pan-x snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-8 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex md:mx-0 md:grid md:touch-auto md:snap-none md:grid-cols-3 md:overflow-visible md:overscroll-auto md:px-0 md:pb-0 lg:mt-14"
        initial={reduceMotion ? false : "hidden"}
        role="region"
        variants={reduceMotion ? undefined : menuGridVariants}
        viewport={{ amount: 0.2, once: true }}
        whileInView={reduceMotion ? undefined : "visible"}
      >
        {items.map((item, index) => (
          <div className={`w-[82vw] max-w-[21rem] shrink-0 snap-start md:w-auto md:max-w-none md:shrink ${index === 5 ? "hidden md:block" : ""}`} key={item.id}>
            <MenuCard href="/menu" item={item} size="tall" />
          </div>
        ))}
      </motion.div>
    </>
  );
}
