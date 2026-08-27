"use client";

import Image from "next/image";
import { useRef } from "react";

type MenuCard = {
  name: string;
  image: string;
};

type MenuCarouselProps = {
  items: readonly MenuCard[];
};

export function MenuCarousel({ items }: MenuCarouselProps) {
  const carouselRef = useRef<HTMLUListElement>(null);

  function move(direction: -1 | 1) {
    const carousel = carouselRef.current;

    if (!carousel) return;

    carousel.scrollBy({ left: direction * carousel.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative mt-10 lg:mt-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-28 bg-gradient-to-r from-background/80 via-background/20 to-transparent sm:block" />
      <button aria-label="View previous dishes" className="group absolute left-5 top-1/2 z-20 hidden size-14 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[border-color,background-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1/2 hover:scale-110 hover:border-orange/70 hover:bg-orange hover:text-background hover:shadow-[0_14px_40px_rgba(242,106,0,0.3)] active:-translate-y-1/2 active:scale-95 sm:grid" onClick={() => move(-1)} type="button">
        <svg aria-hidden="true" className="size-5 transition-transform duration-300 ease-out group-hover:-translate-x-0.5 motion-reduce:transform-none sm:size-6" fill="none" viewBox="0 0 24 24">
          <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </button>

      <ul
        aria-label="ComEat dishes"
        className="flex touch-pan-x snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        ref={carouselRef}
      >
        {items.map((item) => (
          <li className="group relative min-h-[320px] shrink-0 basis-[82%] snap-start overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:min-h-[340px] sm:basis-[46%] md:basis-[31%] lg:min-h-[360px] lg:basis-[calc(20%_-_0.8rem)]" key={item.name}>
            <Image alt={item.name} className="image-zoom object-cover" fill sizes="(min-width: 1024px) 20vw, (min-width: 768px) 31vw, (min-width: 640px) 46vw, 82vw" src={item.image} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/5 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="font-display text-3xl leading-none tracking-[-0.03em] text-foreground transition-transform duration-500 ease-out group-hover:-translate-y-1">{item.name}</h3>
              <span aria-hidden="true" className="mt-4 block h-0.5 w-12 origin-left scale-x-0 bg-orange transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </div>
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-28 bg-gradient-to-l from-background/80 via-background/20 to-transparent sm:block" />
      <button aria-label="View next dishes" className="group absolute right-5 top-1/2 z-20 hidden size-14 -translate-y-1/2 place-items-center rounded-full border border-orange/70 bg-orange/90 text-background shadow-[0_12px_40px_rgba(242,106,0,0.22)] backdrop-blur-xl transition-[border-color,background-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1/2 hover:scale-110 hover:border-gold-light hover:bg-gold-light hover:shadow-[0_14px_44px_rgba(255,200,61,0.3)] active:-translate-y-1/2 active:scale-95 sm:grid" onClick={() => move(1)} type="button">
        <svg aria-hidden="true" className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none sm:size-6" fill="none" viewBox="0 0 24 24">
          <path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </button>
    </div>
  );
}
