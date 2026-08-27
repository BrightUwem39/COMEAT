"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

type ScrollRevealProps = {
  children: ReactNode;
  direction?: "left" | "right";
};

export function ScrollReveal({ children, direction = "left" }: ScrollRevealProps) {
  const target = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const delayedProgress = useSpring(scrollYProgress, {
    damping: 28,
    mass: 0.25,
    stiffness: 120,
  });
  const opacity = useTransform(delayedProgress, [0, 0.18, 0.78, 1], [0, 1, 1, 0]);
  const start = direction === "left" ? "-4vw" : "4vw";
  const end = direction === "left" ? "4vw" : "-4vw";
  const x = useTransform(delayedProgress, [0, 0.18, 0.78, 1], [start, "0vw", "0vw", end]);

  return (
    <motion.div
      className="w-full max-w-full"
      ref={target}
      style={reduceMotion ? undefined : { opacity, x }}
    >
      {children}
    </motion.div>
  );
}
