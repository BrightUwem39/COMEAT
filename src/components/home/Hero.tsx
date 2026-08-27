import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative isolate min-h-[max(34rem,calc(100svh-5rem))] overflow-hidden border-b border-border sm:min-h-[max(38rem,calc(100svh-5rem))]">
      <Image
        alt="ComEat jollof rice served with grilled meat"
        className="hero-image-reveal object-cover object-[56%_center] sm:object-[54%_center] lg:object-center"
        fill
        loading="eager"
        sizes="100vw"
        src="/images/hero.jpg"
      />
      <div className="absolute inset-0 bg-background/15" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.08)_0%,rgba(5,5,5,0.22)_36%,rgba(5,5,5,0.96)_100%)] sm:bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.84)_38%,rgba(5,5,5,0.28)_72%,rgba(5,5,5,0.08)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,transparent_0%,rgba(5,5,5,0.08)_45%,rgba(5,5,5,0.38)_100%)]" />

      <Container className="relative flex min-h-[max(34rem,calc(100svh-5rem))] items-end pb-[clamp(2rem,6svh,4rem)] pt-8 sm:min-h-[max(38rem,calc(100svh-5rem))] sm:items-center sm:py-14 lg:py-16">
        <div className="w-full max-w-[70rem]">
          <h1 className="hero-reveal hero-reveal-1 max-w-[11ch] font-display text-[clamp(3.15rem,14vw,4.5rem)] leading-[0.82] tracking-[-0.045em] text-foreground sm:text-[clamp(4.75rem,10vw,7rem)] lg:text-[clamp(6.25rem,9vw,9rem)] 2xl:text-[9.5rem]">
            A taste<br />that feels<br />like home
          </h1>
          <p className="hero-reveal hero-reveal-2 mt-5 max-w-[21rem] text-sm leading-6 text-foreground/80 sm:mt-7 sm:max-w-md sm:text-base sm:leading-7 lg:mt-8">Authentic Nigerian food, made to bring people together.</p>
          <div className="hero-reveal hero-reveal-3 mt-6 flex w-full max-w-[21rem] items-center sm:mt-8 sm:max-w-md lg:mt-10">
            <Button className="group w-full min-w-0 gap-2 whitespace-nowrap px-4 text-xs tracking-[0.08em] transition-[transform,background-color,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(230,165,26,0.2)] min-[440px]:w-auto sm:px-6 sm:text-sm sm:tracking-[0.12em]" href="/menu">
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
