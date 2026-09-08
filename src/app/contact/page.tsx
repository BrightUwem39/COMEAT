import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact ComEat with a question about food, ordering, delivery, or an existing order.",
};

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100svh-5rem)]" id="main-content">
      <section className="border-b border-border py-8 sm:py-16 lg:py-20">
        <Container className="px-4 min-[360px]:px-5 sm:px-8 lg:px-12">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Contact ComEat</p>
            <h1 className="mt-4 font-display text-[2rem] leading-[1.02] tracking-[-0.045em] text-foreground sm:text-[2.5rem] lg:text-5xl">
              Let’s talk food.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Have a question about the menu, delivery, or an existing order? Send us a message and include the details that will help us assist you.
            </p>

            <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:mt-10 lg:grid-cols-2">
              <article className="bg-surface p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">About an order?</p>
                <h2 className="mt-2.5 font-display text-xl leading-none text-foreground sm:text-2xl">Help us find it quickly.</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">Add your order reference to the subject or message so the team can locate the details.</p>
              </article>
              <article className="bg-surface p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Prefer to call?</p>
                <h2 className="mt-2.5 font-display text-xl leading-none text-foreground sm:text-2xl">Speak with ComEat.</h2>
                <a className="group mt-2.5 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-gold" href="tel:+14045182891">
                  <span>404-518-2891</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              </article>
            </div>

            <ContactForm />
          </div>
        </Container>
      </section>
    </main>
  );
}
