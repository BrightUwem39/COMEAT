"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pageEnterVariants } from "@/lib/animations";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate="visible"
      initial={reduceMotion ? false : "hidden"}
      variants={reduceMotion ? undefined : pageEnterVariants}
    >
      {children}
    </motion.div>
  );
}
