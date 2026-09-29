"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const INTRO_DURATION_MS = 3_800;

export function HomeIntro() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setIsVisible(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    const restorePage = () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };

    const timeout = window.setTimeout(() => {
      restorePage();
      setIsVisible(false);
    }, INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(timeout);
      restorePage();
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div aria-hidden="true" className="home-intro-screen fixed inset-0 z-[100] grid h-dvh w-screen place-items-center overflow-hidden bg-background">
      <Image
        alt=""
        className="home-intro-logo size-[min(88vw,82dvh,46rem)] object-contain"
        height={640}
        loading="eager"
        src="/images/comeat-logo.png"
        width={640}
      />
    </div>
  );
}
