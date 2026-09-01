import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  light?: boolean;
  singleLine?: boolean;
  twoLine?: boolean;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, light = false, singleLine = false, twoLine = false, align = "left" }: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-background" : "text-gold"}`}>{eyebrow}</p>
      <h2 className={`mt-5 font-display leading-[0.96] tracking-[-0.035em] ${singleLine ? "whitespace-nowrap text-[clamp(1.3rem,6.5vw,3rem)]" : twoLine ? "text-[clamp(2.25rem,12vw,3rem)] sm:text-7xl lg:text-8xl" : "text-[2rem] sm:text-[2.5rem] lg:text-5xl"} ${light ? "text-background" : "text-foreground"}`}>{title}</h2>
      {description ? <p className={`mt-6 max-w-xl text-base leading-7 ${align === "center" ? "mx-auto" : ""} ${light ? "text-background/70" : "text-muted"}`}>{description}</p> : null}
    </div>
  );
}
