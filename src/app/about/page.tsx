import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About",
  description: "Learn what ComEat cooks, how tray orders work, and why the table is at the heart of the brand.",
};

const principles = [
  {
    title: "Food you know",
    description: "Jollof rice, efo riro, asun, moi moi, and more of the dishes that belong on a Nigerian table.",
  },
  {
    title: "Enough to go round",
    description: "Tray sizes make it easier to order for the house, the office, or a celebration.",
  },
  {
    title: "Your order, your way",
    description: "Choose the options that matter for the dish and leave allergy notes before it reaches your order.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-background" id="main-content">
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-[1440px] lg:min-h-[38rem] lg:grid-cols-2">
          <div className="relative flex items-center px-5 py-11 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
            <div aria-hidden="true" className="absolute inset-y-12 right-0 hidden w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent lg:block" />
            <div className="max-w-[35rem]">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-9 bg-gold" />
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gold">About ComEat</p>
              </div>
              <h1 className="mt-6 max-w-[13ch] text-balance font-display text-[2.35rem] leading-[0.96] tracking-[-0.04em] text-foreground sm:text-[2.75rem] lg:text-5xl">
                The food you know, made for a full table.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-muted">
                ComEat cooks the Nigerian dishes people ask for when friends and family are coming over. Pick your tray, tell us how much pepper you can handle, and we’ll take it from there.
              </p>
              <div className="mt-8 flex flex-col items-start gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:gap-4">
                <Link className="group inline-flex min-h-11 cursor-pointer items-center justify-center gap-3 bg-gold px-6 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-background transition-[background-color,box-shadow] duration-300 hover:bg-gold-light hover:shadow-[0_14px_32px_rgba(230,165,26,0.18)]" href="/menu">
                  Explore the menu
                  <ArrowIcon />
                </Link>
                <Link className="group inline-flex min-h-11 cursor-pointer items-center gap-2 border border-border px-6 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-foreground transition-[border-color,color] duration-300 hover:border-gold/60 hover:text-gold" href="/catering">
                  Plan a gathering
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative min-h-[27rem] overflow-hidden lg:min-h-full">
            <Image
              alt="A serving of ComEat asun"
              className="object-cover object-[56%_center] sm:object-[54%_center]"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              src="/images/menu/asun.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 border-t border-r border-white/15 bg-background/85 px-5 py-4 backdrop-blur-sm sm:px-7 sm:py-5">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold">Our promise</p>
              <p className="mt-1.5 font-display text-lg tracking-[-0.02em] text-foreground sm:text-xl">Flavorful, Unforgettable Experience</p>
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal direction="left">
        <section className="bg-foreground py-12 text-background sm:py-16 lg:py-20">
          <Container>
            <div className="grid gap-9 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-5">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-orange">Our point of view</p>
                <h2 className="mt-5 max-w-[16ch] text-balance font-display text-3xl leading-[1.02] tracking-[-0.035em] sm:text-4xl">
                  A proper meal should bring people closer.
                </h2>
              </div>
              <div className="max-w-3xl space-y-5 text-base leading-8 text-background/70 lg:col-span-7">
                <p>
                  That is the whole idea behind ComEat. We cook the food Nigerians know and love, then make ordering it less of a guessing game.
                </p>
                <p>
                  Choose the tray size. Tell us about pepper, rice, protein, or allergies where needed. Feeding a crowd? Send the guest count and date, and we’ll talk through the rest.
                </p>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      <ScrollReveal direction="right">
        <section className="py-12 sm:py-16 lg:py-20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold">What to expect</p>
                <h2 className="mt-5 max-w-[12ch] text-balance font-display text-3xl leading-[1.02] tracking-[-0.035em] text-foreground sm:text-4xl">
                  Nigerian favourites, without the back-and-forth.
                </h2>
              </div>

              <div className="border-t border-border lg:col-span-8">
                {principles.map((principle) => (
                  <article className="grid gap-3 border-b border-border py-6 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] sm:gap-10 sm:py-7" key={principle.title}>
                    <div className="flex items-start gap-4">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rotate-45 bg-orange" />
                      <h3 className="font-display text-xl leading-tight tracking-[-0.02em] text-foreground sm:text-2xl">{principle.title}</h3>
                    </div>
                    <p className="max-w-lg text-base leading-7 text-muted">{principle.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      <ScrollReveal direction="left">
        <section className="border-t border-border bg-surface/40 py-12 sm:py-16">
          <Container>
            <div className="grid lg:grid-cols-12">
              <div className="relative min-h-[24rem] overflow-hidden lg:col-span-7 lg:min-h-[32rem]">
                <Image alt="ComEat ayamase served with assorted meat" className="image-zoom object-cover" fill sizes="(min-width: 1024px) 58vw, 100vw" src="/images/menu/ayamase.webp" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent" />
              </div>

              <div className="flex flex-col justify-between border border-border bg-background p-6 sm:p-9 lg:col-span-5 lg:border-l-0 lg:p-10">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-orange">Come to the table</p>
                  <h2 className="mt-5 max-w-[12ch] text-balance font-display text-3xl leading-[1.02] tracking-[-0.035em] text-foreground sm:text-4xl">
                    What are we eating?
                  </h2>
                  <p className="mt-5 max-w-md text-base leading-8 text-muted">
                    Start with the menu. If you are feeding a crowd, send us your event details instead.
                  </p>
                </div>
                <div className="mt-10 border-t border-border pt-6">
                  <Link className="group inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:text-gold" href="/menu">
                    Start your order
                    <span aria-hidden="true" className="grid size-10 place-items-center border border-gold/50 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-background">
                      <ArrowIcon />
                    </span>
                  </Link>
                  <a className="mt-3 inline-flex min-h-11 w-fit cursor-pointer items-center text-sm text-muted transition-colors duration-300 hover:text-foreground" href="tel:+14045182891">
                    Prefer to call? <span className="font-semibold text-foreground">404-518-2891</span>
                  </a>
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
