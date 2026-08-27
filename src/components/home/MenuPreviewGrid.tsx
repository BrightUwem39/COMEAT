"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { MenuItem } from "@/data/menu";
import { menuGridVariants } from "@/lib/animations";
import { MenuCard } from "@/components/menu/MenuCard";

type MenuPreviewGridProps = {
  items: readonly MenuItem[];
};

export function MenuPreviewGrid({ items }: MenuPreviewGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-label="Featured menu dishes"
      className="mt-10 -mx-5 flex touch-pan-x snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8 md:mx-0 md:grid md:touch-auto md:snap-none md:grid-cols-3 md:overflow-visible md:overscroll-auto md:px-0 md:pb-0 lg:mt-14 lg:grid-cols-5"
      initial={reduceMotion ? false : "hidden"}
      role="region"
      variants={reduceMotion ? undefined : menuGridVariants}
      viewport={{ amount: 0.2, once: true }}
      whileInView={reduceMotion ? undefined : "visible"}
    >
      {items.map((item) => (
        <div className="w-[82vw] max-w-[21rem] shrink-0 snap-start md:w-auto md:max-w-none md:shrink" key={item.id}>
          <MenuCard href="/menu" item={item} />
        </div>
      ))}
    </motion.div>
  );
}
