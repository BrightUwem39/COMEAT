import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const dishes = [
  { name: "Jollof Rice", image: "/images/hero.jpg" },
  { name: "Egusi", image: "/images/menu/egusi.webp" },
  { name: "Asun", image: "/images/menu/asun.webp" },
  { name: "Ayamase", image: "/images/menu/ayamase.webp" },
];

export function FeaturedDishes() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <SectionHeading eyebrow="From the kitchen" singleLine title="Start with the favorites" />
        <Link className="group relative mt-8 inline-flex min-h-12 items-center gap-3 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-[0.18em] text-orange transition-[color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:text-gold-light" href="/menu">
          <span>See the full menu</span>
          <svg aria-hidden="true" className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1 motion-reduce:transform-none" fill="none" viewBox="0 0 20 20">
            <path d="M6 14 14 6m-6 0h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-orange transition-transform duration-300 ease-out group-hover:scale-x-75 group-focus-visible:scale-x-75" />
        </Link>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-14">
          {dishes.map((dish) => (
            <Link className="group relative min-h-[240px] overflow-hidden border border-border sm:min-h-[360px] lg:min-h-[520px]" href="/menu" key={dish.name}>
              <Image alt="" className="image-zoom object-cover" fill sizes="(min-width: 1440px) 696px, 50vw" src={dish.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8">
                <h3 className="font-display text-xl tracking-[-0.03em] sm:text-2xl lg:text-3xl">{dish.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
