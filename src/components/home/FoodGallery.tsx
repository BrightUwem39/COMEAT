import Image from "next/image";
import { Container } from "@/components/ui/Container";

const gallery = [
  { src: "/images/menu/puff-puff.webp", alt: "Golden Nigerian puff-puff", className: "sm:col-span-7" },
  { src: "/images/menu/jollof-rice.webp", alt: "Nigerian jollof rice", className: "sm:col-span-5" },
  { src: "/images/menu/egusi.webp", alt: "Nigerian egusi soup", className: "sm:col-span-5" },
  { src: "/images/menu/asun.webp", alt: "Spicy grilled Nigerian asun", className: "sm:col-span-7" },
];

export function FoodGallery() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="flex items-end justify-between gap-8">
          <h2 className="min-w-0 whitespace-nowrap font-display text-[clamp(1.4rem,7vw,6rem)] leading-[0.88] tracking-[-0.04em]">Color. Heat. Comfort.</h2>
          <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-gold sm:block">A closer look</span>
        </div>
        <div className="mt-12 grid auto-rows-[260px] gap-3 sm:grid-cols-12 sm:auto-rows-[360px] sm:gap-4 lg:auto-rows-[420px]">
          {gallery.map((image) => (
            <div className={`gallery-card-reveal group relative min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.3)] ${image.className}`} key={image.src}>
              <Image alt={image.alt} className="image-zoom object-cover" fill sizes="(min-width: 640px) 60vw, 100vw" src={image.src} />
              <div className="absolute inset-0 bg-background/0 transition-colors duration-500 group-hover:bg-background/10" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
