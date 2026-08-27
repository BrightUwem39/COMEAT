"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { scrollRevealVariants } from "@/lib/animations";

type ScrollRevealProps = {
  children: ReactNode;
  amount?: number;
};

export function ScrollReveal({ children, amount = 0.3 }: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      variants={reduceMotion ? undefined : scrollRevealVariants}
      viewport={{ amount, once: true }}
      whileInView={reduceMotion ? undefined : "visible"}
    >
      {children}
    </motion.div>
  );
}
