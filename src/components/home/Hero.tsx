import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import heroImage from "../../../FoodImages/herojollof.jpg";

export function Hero() {
  return (
    <section className="relative isolate min-h-[68svh] min-h-[68dvh] overflow-hidden border-b border-border md:min-h-[72svh] md:min-h-[72dvh] xl:min-h-[calc(100svh-5rem)] xl:min-h-[calc(100dvh-5rem)]">
      <Image
        alt="ComEat jollof rice served with grilled meat"
        className="object-cover object-center"
        fill
        loading="eager"
        sizes="100vw"
        src={heroImage}
      />

      <Container className="relative flex min-h-[68svh] min-h-[68dvh] items-center justify-center py-[clamp(2rem,7svh,4rem)] md:min-h-[72svh] md:min-h-[72dvh] xl:min-h-[calc(100svh-5rem)] xl:min-h-[calc(100dvh-5rem)]">
        <div className="flex w-full max-w-[70rem] flex-col items-center text-center">
          <h1 className="hero-reveal hero-reveal-1 max-w-none whitespace-nowrap font-display text-[clamp(1.16rem,5.6vw,6rem)] font-normal leading-none tracking-[-0.035em] text-foreground">
            A taste that feels like home.
          </h1>
          <p className="hero-reveal hero-reveal-2 mt-5 max-w-[21rem] text-sm leading-6 text-foreground/80 sm:mt-7 sm:max-w-md sm:text-base sm:leading-7 lg:mt-8">Authentic Nigerian food, made to bring people together.</p>
          <div className="hero-reveal hero-reveal-3 mt-6 flex w-full max-w-[21rem] items-center justify-center sm:mt-8 sm:max-w-md lg:mt-10">
            <Button className="group min-h-[2.4rem]! w-4/5 min-w-0 gap-2 whitespace-nowrap px-3! text-[0.65rem] tracking-[0.08em] transition-[transform,background-color,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(230,165,26,0.2)] min-[440px]:w-auto sm:px-5! sm:text-xs sm:tracking-[0.12em]" href="/menu">
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
