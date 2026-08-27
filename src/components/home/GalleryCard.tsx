"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { staggeredRevealVariants } from "@/lib/animations";

type GalleryCardProps = {
  alt: string;
  className: string;
  index: number;
  src: string;
};

export function GalleryCard({ alt, className, index, src }: GalleryCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`group relative min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.3)] ${className}`}
      custom={index}
      initial={reduceMotion ? false : "hidden"}
      variants={reduceMotion ? undefined : staggeredRevealVariants}
      viewport={{ amount: 0.25, once: true }}
      whileInView={reduceMotion ? undefined : "visible"}
    >
      <Image alt={alt} className="image-zoom object-cover" fill sizes="(min-width: 640px) 60vw, 100vw" src={src} />
      <div className="absolute inset-0 bg-background/0 transition-colors duration-200 group-hover:bg-background/10" />
    </motion.div>
  );
}
