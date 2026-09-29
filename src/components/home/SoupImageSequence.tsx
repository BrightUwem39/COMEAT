"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

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
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSoup = soups[activeIndex];

  useEffect(() => {
    for (const soup of soups.slice(1)) {
      const image = new window.Image();
      image.src = soup.src;
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % soups.length);
    }, IMAGE_DURATION_MS);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <figure
      aria-label={`A rotating selection of ComEat soups. Currently showing ${activeSoup.name}.`}
      className="relative mx-auto h-[min(52svh,30rem)] min-h-[22rem] w-full max-w-[30.8rem] overflow-hidden sm:h-[min(56svh,34rem)] xl:col-span-6 xl:mx-0 xl:h-[min(62svh,38rem)] xl:min-h-[26rem] xl:max-w-[26.18rem] xl:justify-self-end"
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="absolute inset-0"
          exit={reduceMotion ? undefined : { opacity: 0, scale: 1.015, x: -12 }}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.045, x: 14 }}
          key={activeSoup.src}
          transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            alt=""
            className="food-image-crop object-cover"
            fill
            loading={activeIndex === 0 ? "eager" : "lazy"}
            sizes="(min-width: 1280px) 50vw, 100vw"
            src={activeSoup.src}
          />
        </motion.div>
      </AnimatePresence>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />

    </figure>
  );
}
