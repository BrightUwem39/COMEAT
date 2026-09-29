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
    <section className="py-10 sm:py-14 lg:py-20" id="favorites">
      <Container>
        <SectionHeading eyebrow="From the kitchen" singleLine title="Start with the favorites" />
        <Link className="group relative mt-8 inline-flex min-h-12 items-center gap-3 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-[0.18em] text-orange transition-[color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:text-gold-light" href="/menu">
          <span>See the full menu</span>
          <svg aria-hidden="true" className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1 motion-reduce:transform-none" fill="none" viewBox="0 0 20 20">
            <path d="M6 14 14 6m-6 0h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-orange transition-transform duration-300 ease-out group-hover:scale-x-75 group-focus-visible:scale-x-75" />
        </Link>

        <div aria-label="Featured dishes moving from right to left" className="featured-dishes-rail mt-8 sm:mt-10 lg:mt-14">
          <div className="featured-dishes-track">
            {[false, true].map((duplicate) => (
              <div
                aria-hidden={duplicate || undefined}
                className="featured-dishes-group"
                data-duplicate={duplicate ? "true" : undefined}
                key={duplicate ? "duplicate" : "primary"}
              >
                {dishes.map((dish) => (
                  <Link
                    className="group relative block h-[49vw] max-h-[15rem] w-[24.5vw] max-w-[7.5rem] shrink-0 overflow-hidden border border-border sm:aspect-[4/5] sm:h-auto sm:max-h-none sm:w-[30vw] sm:max-w-[15rem] md:w-[27vw] lg:w-[15rem]"
                    href="/menu"
                    key={`${duplicate ? "duplicate" : "primary"}-${dish.name}`}
                    tabIndex={duplicate ? -1 : undefined}
                  >
                    <Image alt="" className="food-image-crop object-cover" fill sizes="(min-width: 1024px) 240px, (min-width: 768px) 27vw, (min-width: 640px) 30vw, 24.5vw" src={dish.image} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-2 sm:p-5 lg:p-6">
                      <h3 className="font-display text-sm leading-tight tracking-[-0.03em] sm:text-xl lg:text-2xl">{dish.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
