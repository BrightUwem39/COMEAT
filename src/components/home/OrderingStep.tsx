"use client";

import { motion, useReducedMotion } from "framer-motion";
import { staggeredRevealVariants } from "@/lib/animations";

type OrderingStepProps = {
  copy: string;
  index: number;
  showArrow: boolean;
  title: string;
};

export function OrderingStep({ copy, index, showArrow, title }: OrderingStepProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className="relative border-b border-border py-8 lg:border-b-0 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
      custom={index}
      initial={reduceMotion ? false : "hidden"}
      variants={reduceMotion ? undefined : staggeredRevealVariants}
      viewport={{ amount: 0.35, once: true }}
      whileInView={reduceMotion ? undefined : "visible"}
    >
      <h3 className="font-display text-2xl leading-none tracking-[-0.025em] sm:text-[1.75rem]">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-muted">{copy}</p>
      {showArrow ? (
        <span aria-hidden="true" className="absolute -bottom-5 left-1/2 z-10 grid size-10 -translate-x-1/2 rotate-90 place-items-center rounded-full border border-orange/50 bg-surface text-orange shadow-[0_8px_24px_rgba(0,0,0,0.3)] lg:-right-5 lg:bottom-auto lg:left-auto lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:rotate-0">
          <svg className="size-4" fill="none" viewBox="0 0 20 20">
            <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </span>
      ) : null}
    </motion.li>
  );
}
