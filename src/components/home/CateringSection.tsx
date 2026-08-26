import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const occasions = ["Weddings", "Birthdays", "Corporate events", "Family gatherings", "Private events"];

export function CateringSection() {
  return (
    <section className="relative min-h-[760px] overflow-hidden border-y border-border">
      <Image alt="A bowl of ComEat local rice" className="object-cover object-center" fill sizes="100vw" src="/images/menu/local-rice.webp" />
      <div className="absolute inset-0 bg-background/65" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96),rgba(5,5,5,0.35))]" />
      <Container className="relative flex min-h-[760px] items-center py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Catering by ComEat</p>
          <h2 className="mt-5 font-display text-6xl leading-[0.86] tracking-[-0.04em] sm:text-8xl lg:text-9xl">Bring everyone to the table.</h2>
          <div className="mt-8 flex max-w-xl flex-wrap gap-x-5 gap-y-2">
            {occasions.map((occasion) => <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70" key={occasion}>{occasion}</span>)}
          </div>
          <p className="mt-8 max-w-lg text-sm leading-7 text-foreground/75 sm:text-base">Tell us about your event. Catering packages and pricing will be shared after the details are confirmed.</p>
          <div className="mt-9"><Button href="/catering">Request catering</Button></div>
        </div>
      </Container>
    </section>
  );
}
