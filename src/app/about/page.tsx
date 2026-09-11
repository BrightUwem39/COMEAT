import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About",
  description: "Discover ComEat’s approach to Nigerian food, generous trays, and bringing people together around the table.",
};

const principles = [
  { title: "Food that feels familiar", description: "The dishes you already know, cooked with the depth, heat, and generosity you expect." },
  { title: "Made for more than one", description: "Our trays are built for Sunday lunch, a full house, office gatherings, and proper celebrations." },
  { title: "Your table, your order", description: "Choose the size and available options, then tell us about pepper preferences and allergies." },
] as const;

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-background" id="main-content">
      <section className="relative border-b border-border">
        <Container className="relative py-12 sm:py-16 lg:flex lg:min-h-[42rem] lg:items-center lg:py-20">
          <div className="grid w-full items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
            <div className="max-w-[35rem]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Discover ComEat</p>
              <h1 className="mt-5 text-balance font-display text-[2.35rem] font-normal leading-[0.98] tracking-[-0.045em] text-foreground sm:text-[2.75rem] lg:text-5xl">Nigerian food, with room for everyone.</h1>
              <p className="mt-6 max-w-[32rem] text-base leading-8 text-muted">The food is generous. The table is open. ComEat brings familiar Nigerian dishes to gatherings where one plate becomes a shared moment.</p>
              <div className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-3 md:grid-cols-1 xl:grid-cols-2">
                <Link className="group inline-flex min-h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap bg-gold px-3 text-center text-[0.62rem] font-bold uppercase tracking-[0.1em] text-background transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-gold-light sm:gap-3 sm:px-5 sm:text-xs sm:tracking-[0.14em] md:gap-2 md:px-3 md:text-[0.55rem] md:tracking-[0.06em] lg:gap-3 lg:px-5 lg:text-xs lg:tracking-[0.14em]" href="/menu">Explore the menu<ArrowIcon /></Link>
                <Link className="group inline-flex min-h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap bg-surface px-3 text-center text-[0.62rem] font-bold uppercase tracking-[0.1em] text-foreground transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-foreground hover:text-background sm:gap-3 sm:px-5 sm:text-xs sm:tracking-[0.14em] md:gap-2 md:px-3 md:text-[0.55rem] md:tracking-[0.06em] lg:gap-3 lg:px-5 lg:text-xs lg:tracking-[0.14em]" href="/catering">Plan an event<ArrowIcon /></Link>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[32rem] overflow-hidden md:max-w-[26rem] lg:max-w-[32rem]">
              <Image alt="ComEat asun with peppers" className="object-cover" fill priority sizes="(min-width: 1024px) 32rem, 100vw" src="/images/menu/asun.webp" />
            </div>
          </div>
        </Container>
      </section>

      <ScrollReveal direction="left">
        <section className="py-14 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Why we cook</p>
                <h2 className="mt-5 font-display text-[1.35rem] font-normal leading-[1.02] tracking-[-0.04em] text-foreground sm:max-w-[13ch] sm:text-balance sm:text-4xl lg:text-5xl"><span className="block whitespace-nowrap sm:inline sm:whitespace-normal">The table is where the day</span>{" "}<span className="block whitespace-nowrap sm:inline sm:whitespace-normal">finally slows down.</span></h2>
              </div>
              <div className="max-w-2xl space-y-5 text-base leading-8 text-muted lg:col-span-7 lg:pt-8">
                <p>Good food does more than feed the room. It gives people a reason to sit closer, stay longer, and reach across the table.</p>
                <p>That is what ComEat is built around: Nigerian dishes with real flavour, practical tray sizes, and an ordering experience that keeps the focus on the gathering.</p>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      <ScrollReveal direction="right">
        <section className="bg-foreground py-14 text-background sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image alt="ComEat asun with peppers" className="object-cover" fill sizes="(min-width: 1024px) 22vw, 48vw" src="/images/menu/asun.webp" />
                </div>
                <div className="relative mt-12 aspect-[3/4] overflow-hidden">
                  <Image alt="ComEat efo riro with assorted meat" className="object-cover" fill sizes="(min-width: 1024px) 22vw, 48vw" src="/images/menu/efo-riro.webp" />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">What matters here</p>
                <h2 className="mt-5 font-display text-3xl font-normal leading-[1.02] tracking-[-0.04em] sm:text-4xl lg:text-5xl"><span className="block">No tiny portions.</span><span className="block">No guessing games.</span></h2>
                <div className="mt-9 divide-y divide-background/20 border-y border-background/20">
                  {principles.map((principle) => (
                    <article className="py-6 sm:grid sm:grid-cols-[0.8fr_1.2fr] sm:gap-8" key={principle.title}>
                      <h3 className="text-lg font-semibold leading-snug text-background">{principle.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-background/65 sm:mt-0">{principle.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      <ScrollReveal direction="left">
        <section className="py-14 sm:py-20 lg:py-24">
          <Container>
            <div className="relative min-h-[32rem] overflow-hidden sm:min-h-[38rem]">
              <Image alt="ComEat puff puff" className="image-zoom object-cover" fill sizes="100vw" src="/images/menu/puff-puff.webp" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.92),rgba(5,5,5,0.25))]" />
              <div className="absolute inset-0 flex items-end p-6 sm:items-center sm:p-10 lg:p-14">
                <div className="max-w-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Come to the table</p>
                  <h2 className="mt-5 text-balance font-display text-3xl font-normal leading-[1.02] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">What are we eating?</h2>
                  <p className="mt-5 max-w-md text-base leading-8 text-white/70">Pick the dishes for your table, or tell us about the event you are planning. We will take it from there.</p>
                  <div className="mt-8 grid max-w-md grid-cols-2 gap-2 sm:gap-3">
                    <Link className="group inline-flex min-h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap bg-gold px-3 text-center text-[0.62rem] font-bold uppercase tracking-[0.1em] text-background transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-gold-light sm:gap-3 sm:px-6 sm:text-xs sm:tracking-[0.14em]" href="/menu">Start your order<ArrowIcon /></Link>
                    <a className="inline-flex min-h-12 min-w-0 items-center justify-center whitespace-nowrap bg-white/10 px-3 text-center text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-background sm:px-6 sm:text-sm" href="tel:+14045182891">404-518-2891</a>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>
    </main>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}
