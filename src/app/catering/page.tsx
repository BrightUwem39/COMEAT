import type { Metadata } from "next";

import { CateringInquiryForm } from "@/components/catering/CateringInquiryForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Catering",
  description: "Tell ComEat about your wedding, birthday, corporate event, or private gathering.",
};

export default function CateringPage() {
  return (
    <main className="min-h-[calc(100svh-5rem)]" id="main-content">
      <section className="border-b border-border py-8 sm:py-16 lg:py-20">
        <Container className="px-4 min-[360px]:px-5 sm:px-8 lg:px-12">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Catering by ComEat</p>
            <h1 className="mt-4 whitespace-nowrap font-display text-[clamp(1.35rem,5.6vw,3rem)] leading-[0.98] tracking-[-0.04em] text-foreground">
              Tell us about your gathering.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              From intimate celebrations to full-room occasions, share the details and we’ll shape the food experience around your event.
            </p>

            <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:mt-10 lg:grid-cols-2">
              <article className="bg-surface p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Helpful details</p>
                <h2 className="mt-2.5 font-display text-xl leading-none text-foreground sm:text-2xl">Help us plan your table.</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">Include your guest count, service date, venue, and any menu or allergy considerations that matter to your gathering.</p>
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

            <CateringInquiryForm />
          </div>
        </Container>
      </section>
    </main>
  );
}
