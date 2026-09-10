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
      <section className="border-b border-border">
        <Container className="py-8 sm:py-12 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">This is ComEat</p>
              <h1 className="mt-5 text-balance font-display text-[2.35rem] font-normal leading-[0.98] tracking-[-0.045em] text-foreground sm:text-[2.75rem] lg:text-5xl">Nigerian food, with room for everyone.</h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-muted">ComEat is for the kind of meal where one person becomes six, somebody asks for another spoon, and nobody leaves in a hurry.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="group inline-flex min-h-12 items-center gap-3 bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-gold-light" href="/menu">Explore the menu<ArrowIcon /></Link>
                <Link className="group inline-flex min-h-12 items-center gap-3 bg-surface px-6 text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-foreground hover:text-background" href="/catering">Plan an event<ArrowIcon /></Link>
              </div>
            </div>

            <div className="relative aspect-[4/5] min-h-[30rem] overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5] lg:min-h-[40rem]">
              <Image alt="A generous tray of ComEat jollof rice and grilled meat" className="object-cover" fill priority sizes="(min-width: 1024px) 58vw, 100vw" src="/images/menu/jollof-rice.webp" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold-light">Our promise</p>
                <p className="mt-2 max-w-md text-xl leading-snug text-white sm:text-2xl">Flavorful, Unforgettable Experience.</p>
              </div>
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
                <h2 className="mt-5 max-w-[13ch] text-balance font-display text-3xl font-normal leading-[1.02] tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">The table is where the day finally slows down.</h2>
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
                <h2 className="mt-5 max-w-[12ch] text-balance font-display text-3xl font-normal leading-[1.02] tracking-[-0.04em] sm:text-4xl lg:text-5xl">No tiny portions. No guessing games.</h2>
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
              <Image alt="ComEat ayamase served with assorted meat" className="image-zoom object-cover" fill sizes="100vw" src="/images/menu/ayamase.webp" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.92),rgba(5,5,5,0.25))]" />
              <div className="absolute inset-0 flex items-end p-6 sm:items-center sm:p-10 lg:p-14">
                <div className="max-w-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Come to the table</p>
                  <h2 className="mt-5 text-balance font-display text-3xl font-normal leading-[1.02] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">What are we eating?</h2>
                  <p className="mt-5 max-w-md text-base leading-8 text-white/70">Pick the dishes for your table, or tell us about the event you are planning. We will take it from there.</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link className="group inline-flex min-h-12 items-center gap-3 bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-gold-light" href="/menu">Start your order<ArrowIcon /></Link>
                    <a className="inline-flex min-h-12 items-center bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-background" href="tel:+14045182891">404-518-2891</a>
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
