import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact ComEat with a question about food, ordering, delivery, or an existing order.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-[70svh] overflow-hidden py-10 sm:py-14 lg:py-16" id="main-content">
      <div aria-hidden="true" className="pointer-events-none absolute -left-36 top-8 size-80 rounded-full bg-orange/7 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-0 size-72 rounded-full bg-gold/8 blur-3xl" />

      <Container className="relative">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(34rem,1fr)] lg:items-start lg:gap-16">
          <section className="min-w-0 lg:sticky lg:top-28">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold">Contact ComEat</p>
            <h1 className="mt-4 max-w-xl font-display text-[2.25rem] leading-[0.98] tracking-[-0.04em] text-foreground sm:text-[2.75rem] lg:text-5xl">
              Let’s talk food.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted sm:text-base">
              Have a question about the menu, delivery, or an existing order? Send us a message and include the details that will help us assist you.
            </p>

            <div className="mt-8 border-l border-gold/50 pl-5 sm:mt-10 sm:pl-6">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-orange">About an order?</p>
              <p className="mt-3 max-w-sm text-sm leading-7 text-foreground/75">
                Add your order reference to the subject or message so the team can find it quickly.
              </p>
            </div>

            <a className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold text-foreground transition-colors hover:text-gold sm:mt-10" href="tel:+14045182891">
              <span className="grid size-10 place-items-center rounded-full border border-border bg-surface transition-[border-color,transform] group-hover:-translate-y-0.5 group-hover:border-gold/60">
                <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20">
                  <path d="M6.1 3.5 8 7.2 6.8 8.5a11.6 11.6 0 0 0 4.7 4.7l1.3-1.2 3.7 1.9v2.3c0 .5-.4.9-.9.9A12.7 12.7 0 0 1 2.9 4.4c0-.5.4-.9.9-.9h2.3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                </svg>
              </span>
              <span><span className="block text-[0.6rem] uppercase tracking-[0.16em] text-muted">Call ComEat</span><span className="mt-1 block">404-518-2891</span></span>
            </a>
          </section>

          <ContactForm />
        </div>
      </Container>
    </main>
  );
}
