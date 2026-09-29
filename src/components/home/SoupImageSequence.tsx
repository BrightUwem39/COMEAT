"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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
  const [loadedImages, setLoadedImages] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const activeSoup = soups[activeIndex];
  const imagesReady = loadedImages.size === soups.length;

  useEffect(() => {
    if (reduceMotion || !imagesReady) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % soups.length);
    }, IMAGE_DURATION_MS);

    return () => window.clearInterval(interval);
  }, [imagesReady, reduceMotion]);

  return (
    <figure
      aria-label={`A rotating selection of ComEat soups. Currently showing ${activeSoup.name}.`}
      className="relative mx-auto h-[min(52svh,30rem)] min-h-[22rem] w-full max-w-[30.8rem] overflow-hidden sm:h-[min(56svh,34rem)] xl:col-span-6 xl:mx-0 xl:h-[min(62svh,38rem)] xl:min-h-[26rem] xl:max-w-[26.18rem] xl:justify-self-end"
    >
      {soups.map((soup, index) => {
        const isActive = index === activeIndex;

        return (
          <motion.div
            animate={{ opacity: isActive ? 1 : 0 }}
            aria-hidden={!isActive}
            className="absolute inset-0 will-change-[opacity]"
            initial={false}
            key={soup.src}
            style={{ zIndex: isActive ? 1 : 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.65,
              ease: "easeInOut",
            }}
          >
            <Image
              alt=""
              className="scale-[1.14] object-cover"
              fill
              loading={index === 0 ? "eager" : "lazy"}
              onLoad={() => {
                setLoadedImages((current) => {
                  if (current.has(index)) return current;

                  const next = new Set(current);
                  next.add(index);
                  return next;
                });
              }}
              sizes="(min-width: 1280px) 419px, (min-width: 640px) 493px, calc(100vw - 3rem)"
              src={soup.src}
            />
          </motion.div>
        );
      })}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/30 via-transparent to-black/5" />

    </figure>
  );
}
