import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CateringSection() {
  return (
    <section className="relative overflow-hidden border-y border-border">
      <Image alt="A bowl of ComEat local rice" className="object-cover object-center" fill sizes="100vw" src="/images/menu/local-rice.webp" />
      <div className="absolute inset-0 bg-background/65" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96),rgba(5,5,5,0.35))]" />
      <Container className="relative py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Catering by ComEat</p>
          <h2 className="mt-5 whitespace-nowrap font-display text-[clamp(1.3rem,6.5vw,3rem)] leading-[0.96] tracking-[-0.04em]">Bring everyone to the table.</h2>
          <p className="mt-8 whitespace-nowrap text-[clamp(0.35rem,1.7vw,0.75rem)] font-semibold uppercase tracking-[0.06em] text-foreground/70 sm:tracking-[0.1em]">
            Weddings · Birthdays · Corporate events · Family gatherings · Private events
          </p>
          <p className="mt-8 max-w-lg text-sm leading-7 text-foreground/75 sm:text-base">Tell us about your event. Catering packages and pricing will be shared after the details are confirmed.</p>
          <div className="mt-9">
            <Button className="group gap-3 transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(230,165,26,0.25)]" href="/catering">
              <span>Request catering</span>
              <svg aria-hidden="true" className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none" fill="none" viewBox="0 0 20 20">
                <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
