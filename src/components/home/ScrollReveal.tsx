import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  direction?: "left" | "right";
};

export function ScrollReveal({ children, direction = "left" }: ScrollRevealProps) {
  return (
    <div className="scroll-reveal-viewport">
      <div className={`scroll-reveal scroll-reveal-${direction}`}>{children}</div>
    </div>
  );
}
