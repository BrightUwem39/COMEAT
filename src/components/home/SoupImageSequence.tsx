"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const soups = [
  { name: "Vegetable Soup (Efo Riro)", src: "/images/menu/efo-riro.webp" },
  { name: "Egusi Soup", src: "/images/menu/egusi.webp" },
  { name: "Ogbono Soup", src: "/images/menu/ogbono-soup.jpeg" },
  { name: "Okro Soup", src: "/images/menu/okro-soup.jpeg" },
  { name: "Seafood Okro", src: "/images/menu/seafood-okro.jpeg" },
  { name: "Pepper Soup", src: "/images/menu/pepper-soup.webp" },
] as const;

const IMAGE_DURATION_MS = 3_000;

export function SoupImageSequence() {
  const figureRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(figureRef, { amount: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const activeSoup = soups[activeIndex];

  useEffect(() => {
    if (!isInView || reduceMotion) return;

    let cancelled = false;
    let loaded = 0;

    const markLoaded = () => {
      loaded += 1;
      if (!cancelled && loaded === soups.length) setImagesReady(true);
    };

    soups.forEach((soup) => {
      const image = new window.Image();
      image.onload = markLoaded;
      image.onerror = markLoaded;
      image.src = soup.src;
    });

    return () => {
      cancelled = true;
    };
  }, [isInView, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !imagesReady || !isInView) return;

    const timeout = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % soups.length);
    }, IMAGE_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, imagesReady, isInView, reduceMotion]);

  return (
    <figure
      aria-label={`A rotating selection of ComEat soups. Currently showing ${activeSoup.name}.`}
      className="relative mx-auto h-[min(52svh,30rem)] min-h-[22rem] w-full max-w-[30.8rem] overflow-hidden sm:h-[min(56svh,34rem)] xl:col-span-6 xl:mx-0 xl:h-[min(62svh,38rem)] xl:min-h-[26rem] xl:max-w-[26.18rem] xl:justify-self-end"
      data-scroll-reveal-item="2"
      ref={figureRef}
    >
      <AnimatePresence initial={false}>
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={activeSoup.src}
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            ease: "easeInOut",
          }}
        >
          <Image
            alt=""
            className="scale-[1.14] object-cover"
            fill
            loading={activeIndex === 0 ? "eager" : "lazy"}
            sizes="(min-width: 1280px) 419px, (min-width: 640px) 493px, calc(100vw - 3rem)"
            src={activeSoup.src}
          />
        </motion.div>
      </AnimatePresence>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
    </figure>
  );
}
