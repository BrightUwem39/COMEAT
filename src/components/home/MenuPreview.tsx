import Link from "next/link";
import { allMenuItems } from "@/data/menu";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MenuPreviewGrid } from "@/components/home/MenuPreviewGrid";

export function MenuPreview() {
  const featuredItems = ["jollof-rice", "egusi", "asun", "ayamase", "asaro", "ikokore"]
    .flatMap((id) => allMenuItems.find((item) => item.id === id) ?? []);
  const mobileFeaturedItems = [
    "fried-rice",
    "coconut-rice",
    "ofada-rice",
    "efo-riro",
    "seafood-okro",
    "pepper-soup",
  ].flatMap((id) => allMenuItems.find((item) => item.id === id) ?? []);

  return (
    <section className="py-12 sm:py-16 lg:py-20" id="menu-preview">
      <Container>
        <div data-scroll-reveal-item="1">
          <SectionHeading eyebrow="The menu" title="We customize to your taste" description="Browse the confirmed ComEat menu. Descriptions, portions, and pricing will be added after client confirmation." singleLine />
        </div>
        <Link className="group relative mt-8 inline-flex min-h-12 items-center gap-3 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-[0.18em] text-orange transition-[color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:text-gold-light" data-scroll-reveal-item="2" href="/menu">
          <span>Explore all dishes</span>
          <svg aria-hidden="true" className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1 motion-reduce:transform-none" fill="none" viewBox="0 0 20 20">
            <path d="M6 14 14 6m-6 0h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-orange transition-transform duration-300 ease-out group-hover:scale-x-75 group-focus-visible:scale-x-75" />
        </Link>
        <div data-scroll-reveal-item="3">
          <MenuPreviewGrid items={featuredItems} mobileItems={mobileFeaturedItems} />
        </div>
      </Container>
    </section>
  );
}
