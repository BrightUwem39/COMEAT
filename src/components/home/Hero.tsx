import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden border-b border-border sm:min-h-[max(38rem,calc(100svh-5rem))]">
      <Image alt="ComEat jollof rice served with grilled meat" className="hero-image-reveal object-cover object-center" fill preload sizes="100vw" src="/images/hero.jpg" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.98)_0%,rgba(5,5,5,0.9)_34%,rgba(5,5,5,0.25)_72%,rgba(5,5,5,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,5,5,0.85)_0%,transparent_35%)] lg:hidden" />

      <Container className="relative flex min-h-[calc(100svh-5rem)] items-end pb-10 pt-16 sm:min-h-[max(38rem,calc(100svh-5rem))] sm:items-start sm:pb-10 sm:pt-20">
        <div className="w-full max-w-5xl">
          <h1 className="hero-reveal hero-reveal-1 max-w-5xl font-display text-[clamp(3.25rem,10vw,10rem)] leading-[0.8] tracking-[-0.045em] text-foreground">
            A taste<br />that feels<br />like home
          </h1>
          <p className="hero-reveal hero-reveal-2 mt-6 max-w-md text-sm leading-6 text-foreground/75 sm:mt-8 sm:text-base sm:leading-7">Authentic Nigerian food, made to bring people together.</p>
          <div className="hero-reveal hero-reveal-3 mt-7 flex w-full max-w-md items-center gap-2 sm:mt-10 sm:gap-4">
            <Button className="group min-w-0 flex-1 gap-2 whitespace-nowrap px-3 text-xs tracking-[0.08em] transition-[transform,background-color,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(230,165,26,0.2)] sm:flex-none sm:px-6 sm:text-sm sm:tracking-[0.12em]" href="/menu">
              <span>Explore menu</span>
              <svg aria-hidden="true" className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none" fill="none" viewBox="0 0 20 20">
                <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
