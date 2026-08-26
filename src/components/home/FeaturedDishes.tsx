import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const dishes = [
  { name: "Jollof Rice", image: "/images/jollof-rice.webp", className: "lg:col-span-7 lg:row-span-2", number: "01" },
  { name: "Egusi", image: "/images/egusi.webp", className: "lg:col-span-5", number: "02" },
  { name: "Asun", image: "/images/asun.webp", className: "lg:col-span-5", number: "03" },
];

export function FeaturedDishes() {
  return (
    <section className="py-20 sm:py-28 lg:py-36">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow="From the kitchen" title="Start with the favorites." />
          <Link className="w-fit border-b border-gold pb-1 text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-gold" href="/menu">See the full menu</Link>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-12 lg:grid-rows-2">
          {dishes.map((dish, index) => (
            <Link className={`group relative min-h-[420px] overflow-hidden border border-border ${dish.className} ${index === 0 ? "lg:min-h-[780px]" : "lg:min-h-0"}`} href="/menu" key={dish.name}>
              <Image alt="" className="image-zoom object-cover" fill sizes={index === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, 100vw"} src={dish.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 sm:p-8">
                <h3 className="font-display text-4xl tracking-[-0.03em] sm:text-5xl">{dish.name}</h3>
                <span aria-hidden="true" className="text-xs font-bold tracking-[0.18em] text-gold">{dish.number}</span>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Development photography placeholders — final client images are still required.</p>
      </Container>
    </section>
  );
}
