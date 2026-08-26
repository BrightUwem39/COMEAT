type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
};

export function SectionHeading({ eyebrow, title, description, light = false }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-background" : "text-gold"}`}>{eyebrow}</p>
      <h2 className={`mt-5 font-display text-5xl leading-[0.92] tracking-[-0.035em] sm:text-7xl lg:text-8xl ${light ? "text-background" : "text-foreground"}`}>{title}</h2>
      {description ? <p className={`mt-6 max-w-xl text-base leading-7 ${light ? "text-background/70" : "text-muted"}`}>{description}</p> : null}
    </div>
  );
}
