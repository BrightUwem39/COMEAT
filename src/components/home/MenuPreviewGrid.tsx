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
      className="mt-10 grid gap-4 min-[440px]:grid-cols-2 md:grid-cols-3 lg:mt-14 lg:grid-cols-5"
      initial={reduceMotion ? false : "hidden"}
      variants={reduceMotion ? undefined : menuGridVariants}
      viewport={{ amount: 0.2, once: true }}
      whileInView={reduceMotion ? undefined : "visible"}
    >
      {items.map((item) => <MenuCard href="/menu" item={item} key={item.id} />)}
    </motion.div>
  );
}
