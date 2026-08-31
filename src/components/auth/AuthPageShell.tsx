import type { ReactNode } from "react";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { Container } from "@/components/ui/Container";

type AuthPageShellProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
  wide?: boolean;
};

export function AuthPageShell({
  children,
  description,
  eyebrow,
  title,
  wide = false,
}: AuthPageShellProps) {
  return (
    <main className="relative isolate overflow-hidden bg-background" id="main-content">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(221,164,72,0.13),transparent_34%),radial-gradient(circle_at_10%_65%,rgba(213,87,32,0.07),transparent_28%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:72px_72px]"
      />

      <section className="border-b border-border px-0 py-10 sm:py-14 lg:py-18">
        <Container>
          <div className={`mx-auto ${wide ? "max-w-3xl" : "max-w-xl"}`}>
            <div className="text-center">
              <BrandLogo
                imageClassName="size-16 sm:size-18"
                linkClassName="rounded-full transition-transform duration-500 hover:scale-105 motion-reduce:transform-none"
                priority
              />
              <p className="mt-5 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-gold">
                {eyebrow}
              </p>
              <h1 className="mx-auto mt-3 max-w-2xl font-display text-[clamp(2.45rem,7vw,4.5rem)] leading-[0.94] tracking-[-0.04em] text-foreground">
                {title}
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base sm:leading-7">
                {description}
              </p>
            </div>

            <div className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-gold/20 bg-surface/95 p-5 shadow-[0_32px_90px_rgba(0,0,0,0.38)] backdrop-blur sm:p-8 lg:p-10">
              <span aria-hidden="true" className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
              <span aria-hidden="true" className="absolute -right-16 -top-16 size-40 rounded-full bg-gold/[0.055] blur-3xl" />
              <div className="relative">{children}</div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
