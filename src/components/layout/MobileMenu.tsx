"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";

type MobileMenuProps = {
  navigation: readonly { href: string; label: string }[];
};

export function MobileMenu({ navigation }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
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
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label="Open menu"
        className="p-2 text-foreground"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" className="block h-px w-6 bg-current" />
        <span aria-hidden="true" className="mt-1.5 block h-px w-6 bg-current" />
      </button>

      {open ? (
        <div
          aria-label="Site navigation"
          aria-modal="true"
          className="fixed inset-0 z-[70] overflow-y-auto bg-background"
          id="mobile-navigation"
          ref={panelRef}
          role="dialog"
        >
          <div className="flex h-20 items-center justify-between border-b border-border px-5 sm:px-8">
            <BrandLogo imageClassName="size-16" onClick={() => setOpen(false)} />
            <button
              aria-label="Close menu"
              className="p-2 text-foreground"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              ref={closeButtonRef}
              type="button"
            >
              <span aria-hidden="true" className="block h-px w-6 rotate-45 bg-current" />
              <span aria-hidden="true" className="block h-px w-6 -rotate-45 bg-current" />
            </button>
          </div>

          <nav className="flex min-h-[calc(100svh-5rem)] flex-col justify-between px-5 py-10 sm:px-8" aria-label="Mobile navigation">
            <div>
              {navigation.map((item, index) => (
                <Link className="flex items-baseline gap-5 border-b border-border py-5 font-display text-5xl leading-none tracking-[-0.03em] transition-colors hover:text-gold" href={item.href} key={item.href} onClick={() => setOpen(false)}>
                  <span className="font-sans text-[10px] text-gold">0{index + 1}</span>
                  {item.label}
                </Link>
              ))}
            </div>
            <Link className="mt-10 flex min-h-14 items-center justify-center bg-gold px-6 text-sm font-bold uppercase tracking-[0.14em] text-background" href="/menu" onClick={() => setOpen(false)}>
              Order now
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
