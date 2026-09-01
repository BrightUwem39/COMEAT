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
    <main className="bg-foreground text-background" id="main-content">
      <section className="flex min-h-svh items-center px-0 py-4 sm:py-6">
        <Container>
          <div className={`mx-auto w-full ${wide ? "max-w-lg" : "max-w-md"}`}>
            <div>
              <div className="text-center">
                <BrandLogo
                  imageClassName="size-10 sm:size-12"
                  linkClassName="rounded-full transition-transform duration-300 hover:scale-105 motion-reduce:transform-none"
                  priority
                />
              </div>
              <p className="mt-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-orange">
                {eyebrow}
              </p>
              <h1 className="mt-2 font-display text-[clamp(1.65rem,5.5vw,2.25rem)] leading-none tracking-[-0.025em] text-background">
                {title}
              </h1>
              <p className="mt-2 max-w-md text-xs leading-5 text-background/60 sm:text-sm">
                {description}
              </p>
            </div>

            <div className="mt-5 sm:mt-6">{children}</div>
          </div>
        </Container>
      </section>
    </main>
  );
}
