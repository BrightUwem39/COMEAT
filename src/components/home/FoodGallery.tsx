import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { GalleryCard } from "@/components/home/GalleryCard";

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
        <ScrollReveal>
          <div className="flex items-end justify-between gap-8">
            <h2 className="min-w-0 whitespace-nowrap font-display text-[clamp(1.4rem,7vw,6rem)] leading-[0.88] tracking-[-0.04em]">Color. Heat. Comfort.</h2>
            <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-gold sm:block">A closer look</span>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid auto-rows-[260px] gap-3 sm:grid-cols-12 sm:auto-rows-[360px] sm:gap-4 lg:auto-rows-[420px]">
          {gallery.map((image, index) => <GalleryCard {...image} index={index} key={image.src} />)}
        </div>
      </Container>
    </section>
  );
}
