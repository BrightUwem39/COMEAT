import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden border-b border-border">
      <Image alt="A bowl of ComEat local rice" className="object-cover object-[50%_70%]" fill priority sizes="100vw" src="/images/menu/local-rice.webp" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.98)_0%,rgba(5,5,5,0.9)_34%,rgba(5,5,5,0.25)_72%,rgba(5,5,5,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,5,5,0.85)_0%,transparent_35%)] lg:hidden" />

      <Container className="relative flex min-h-[calc(100svh-5rem)] items-end pb-14 pt-28 sm:items-center sm:py-20">
        <div className="max-w-5xl">
          <p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gold sm:text-xs">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Nigerian food, made with intention
          </p>
          <h1 className="max-w-5xl font-display text-[clamp(4.5rem,10vw,10rem)] leading-[0.78] tracking-[-0.045em] text-foreground">
            A taste<br />that feels<br /><em className="font-normal text-gold">like home.</em>
          </h1>
          <p className="mt-8 max-w-md text-sm leading-6 text-foreground/75 sm:text-base sm:leading-7">Authentic Nigerian food, made to bring people together.</p>
          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
            <Button href="/menu">Order now</Button>
            <Button href="#menu-preview" variant="secondary">Explore menu</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
