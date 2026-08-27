"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MenuItem } from "@/data/menu";
import { menuCardVariants, menuImageVariants } from "@/lib/animations";

type MenuCardProps = {
  item: MenuItem;
  href?: string;
};

export function MenuCard({ item, href }: MenuCardProps) {
  const [loaded, setLoaded] = useState(false);
  const reduceMotion = useReducedMotion();

  const content = (
    <>
      <motion.div className="absolute inset-0" variants={reduceMotion ? undefined : menuImageVariants}>
        <div className={`menu-image-shimmer absolute inset-0 z-10 transition-opacity duration-200 ${loaded ? "pointer-events-none opacity-0" : "opacity-100"}`} />
        <Image
          alt={item.name}
          className={`object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
          fill
          onLoad={() => setLoaded(true)}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          src={item.image}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3 className="font-display text-3xl leading-none tracking-[-0.03em] text-foreground sm:text-4xl">{item.name}</h3>
      </div>
    </>
  );

  return (
    <motion.article
      className="group relative min-h-[320px] overflow-hidden rounded-xl border border-white/10 bg-surface shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-shadow duration-200 hover:shadow-[0_18px_42px_rgba(0,0,0,0.38)] sm:min-h-[360px]"
      layout
      variants={reduceMotion ? undefined : menuCardVariants}
      whileHover={reduceMotion ? undefined : "hover"}
      whileTap={href && !reduceMotion ? "tap" : undefined}
    >
      {href ? <Link aria-label={`View ${item.name} on the menu`} className="absolute inset-0" href={href}>{content}</Link> : content}
    </motion.article>
  );
}
