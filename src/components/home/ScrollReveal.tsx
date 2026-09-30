"use client";

import { useRef, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type ScrollRevealProps = {
  children: ReactNode;
  direction?: "left" | "right";
};

export function ScrollReveal({ children, direction = "left" }: ScrollRevealProps) {
  const target = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(target, { amount: 0.08, once: true });

  return (
    <div
      className="scroll-reveal-shell w-full max-w-full"
      data-direction={direction}
      data-visible={reduceMotion || isInView}
      ref={target}
    >
      {children}
    </div>
  );
}
