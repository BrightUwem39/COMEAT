import Link from "next/link";
import { menuCategories } from "@/data/menu";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function MenuPreview() {
  return (
    <section className="py-20 sm:py-28 lg:py-36" id="menu-preview">
      <Container>
        <SectionHeading eyebrow="The menu" title="Food made to be shared." description="Browse the confirmed ComEat menu. Descriptions, portions, and pricing will be added after client confirmation." />
        <div className="mt-14 grid border-t border-border lg:mt-20 lg:grid-cols-3">
          {menuCategories.map((category, categoryIndex) => (
            <div className="border-b border-border py-9 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0" key={category.id}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="max-w-[12rem] font-display text-4xl leading-none tracking-[-0.03em]">{category.name}</h3>
                <span className="text-xs font-bold tracking-[0.18em] text-gold">0{categoryIndex + 1}</span>
              </div>
              <ul className="mt-8">
                {category.items.map((item) => <li className="border-t border-border/70 py-3.5 text-sm text-muted first:border-t-0" key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <Link className="mt-10 inline-flex min-h-12 items-center border-b border-gold text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-gold" href="/menu">
          Explore all dishes <span aria-hidden="true" className="ml-3">↗</span>
        </Link>
      </Container>
    </section>
  );
}
