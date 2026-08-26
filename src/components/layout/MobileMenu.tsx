"use client";

import Link from "next/link";
import type { TouchEvent as ReactTouchEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";

type MobileMenuProps = {
  navigation: readonly { href: string; label: string }[];
};

export function MobileMenu({ navigation }: MobileMenuProps) {
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDragOffsetRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }

      if (event.key === "Tab") {
        const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;

    touchStartXRef.current = touch.clientX;
    currentDragOffsetRef.current = 0;
    setDragging(true);
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (touchStartXRef.current === null || !touch) return;

    const nextOffset = Math.min(0, touch.clientX - touchStartXRef.current);
    currentDragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const finishSwipe = () => {
    touchStartXRef.current = null;
    setDragging(false);

    if (currentDragOffsetRef.current <= -72) {
      setDragOffset(-window.innerWidth);
      closeTimerRef.current = setTimeout(() => {
        setOpen(false);
        setDragOffset(0);
        currentDragOffsetRef.current = 0;
        triggerRef.current?.focus();
      }, 220);
      return;
    }

    currentDragOffsetRef.current = 0;
    setDragOffset(0);
  };

  return (
    <>
      <button
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label="Open menu"
        className="group rounded-full p-2 text-foreground transition-[background-color,color,transform] duration-300 hover:bg-gold/10 hover:text-gold active:scale-90 motion-reduce:transform-none"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" className="block h-px w-6 bg-current transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transform-none" />
        <span aria-hidden="true" className="mt-1.5 block h-px w-6 bg-current transition-transform duration-300 ease-out group-hover:-translate-x-1 motion-reduce:transform-none" />
      </button>

      {open ? (
        <div
          aria-label="Site navigation"
          aria-modal="true"
          className="fixed inset-0 z-[70] overflow-y-auto bg-background transition-transform duration-300 ease-out will-change-transform"
          id="mobile-navigation"
          onTouchCancel={finishSwipe}
          onTouchEnd={finishSwipe}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          ref={panelRef}
          role="dialog"
          style={{
            touchAction: "pan-y",
            transform: `translate3d(${dragOffset}px, 0, 0)`,
            transition: dragging ? "none" : undefined,
          }}
        >
          <div className="flex h-20 items-center justify-between border-b border-border px-5 sm:px-8">
            <BrandLogo imageClassName="size-16" onClick={() => setOpen(false)} />
            <button
              aria-label="Close menu"
              className="group rounded-full p-2 text-foreground transition-[background-color,color,transform] duration-300 hover:bg-gold/10 hover:text-gold active:scale-90 motion-reduce:transform-none"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              ref={closeButtonRef}
              type="button"
            >
              <span aria-hidden="true" className="block h-px w-6 rotate-45 bg-current transition-transform duration-300 group-hover:rotate-[135deg] motion-reduce:transform-none" />
              <span aria-hidden="true" className="block h-px w-6 -rotate-45 bg-current transition-transform duration-300 group-hover:rotate-45 motion-reduce:transform-none" />
            </button>
          </div>

          <nav className="flex min-h-[calc(100svh-5rem)] flex-col justify-between px-5 py-10 sm:px-8" aria-label="Mobile navigation">
            <div>
              {navigation.map((item) => (
                <Link className="group flex border-b border-border py-4 font-display text-3xl leading-none tracking-[-0.025em] transition-[color,border-color,transform] duration-300 ease-out hover:translate-x-2 hover:border-gold/60 hover:text-gold sm:text-4xl motion-reduce:transform-none" href={item.href} key={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
            <Link className="mt-10 flex min-h-14 items-center justify-center bg-gold px-6 text-sm font-bold uppercase tracking-[0.14em] text-background transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_8px_28px_rgba(230,165,26,0.28)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none" href="/menu" onClick={() => setOpen(false)}>
              Order now
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
