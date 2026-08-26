import Image from "next/image";
import { Container } from "@/components/ui/Container";

const gallery = [
  { src: "/images/puff-puff.webp", alt: "Golden Nigerian puff-puff", className: "sm:col-span-5 sm:row-span-2" },
  { src: "/images/jollof-rice.webp", alt: "Nigerian jollof rice", className: "sm:col-span-7" },
  { src: "/images/egusi.webp", alt: "Nigerian egusi soup", className: "sm:col-span-4" },
  { src: "/images/asun.webp", alt: "Spicy grilled Nigerian asun", className: "sm:col-span-3" },
];

export function FoodGallery() {
  return (
    <section className="py-20 sm:py-28 lg:py-36">
      <Container>
        <div className="flex items-end justify-between gap-8">
          <h2 className="max-w-3xl font-display text-6xl leading-[0.88] tracking-[-0.04em] sm:text-8xl">Color. Heat. Comfort.</h2>
          <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-gold sm:block">A closer look</span>
        </div>
        <div className="mt-12 grid auto-rows-[260px] gap-3 sm:grid-cols-12 sm:auto-rows-[330px]">
          {gallery.map((image) => (
            <div className={`group relative min-h-[260px] overflow-hidden ${image.className}`} key={image.src}>
              <Image alt={image.alt} className="image-zoom object-cover" fill sizes="(min-width: 640px) 60vw, 100vw" src={image.src} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
