import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { menuCategories } from "@/data/menu";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse ComEat Nigerian dishes, tray sizes, and confirmed pricing.",
};

export default function MenuPage() {
  return (
    <main className="min-h-[calc(100svh-5rem)]" id="main-content">
      <aside className="allergy-marquee sticky top-20 z-40 border-b border-orange/45 bg-orange text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)]" aria-label="Food allergy warning" role="note">
        <div className="allergy-marquee-track py-3 text-xs font-bold uppercase tracking-[0.14em] sm:text-sm">
          <span className="allergy-marquee-message">Food allergy warning: Menu items may contain or come into contact with peanuts, tree nuts, sesame, soy, eggs, wheat, dairy, shellfish, or fish. Please tell us about all allergies and dietary requirements before ordering.</span>
          <span aria-hidden="true" className="allergy-marquee-message">Food allergy warning: Menu items may contain or come into contact with peanuts, tree nuts, sesame, soy, eggs, wheat, dairy, shellfish, or fish. Please tell us about all allergies and dietary requirements before ordering.</span>
        </div>
      </aside>
      <section className="border-b border-border py-8 sm:py-16 lg:py-20">
        <Container className="px-4 min-[360px]:px-5 sm:px-8 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">The ComEat menu</p>
          <h1 className="mt-4 font-display text-[2rem] leading-[1.02] tracking-[-0.045em] text-foreground sm:text-[2.5rem] lg:text-5xl">Find your favorite.</h1>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:mt-10 lg:grid-cols-2">
            <article className="bg-surface p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Plan ahead</p>
              <h2 className="mt-3 font-display text-2xl leading-none text-foreground sm:text-[1.75rem]">Order 48 hours ahead.</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">Choose your meal, tray size, protein where applicable, and pepper tolerance from 1–5. Full payment confirms your order.</p>
            </article>
            <article className="bg-surface p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Delivery</p>
              <h2 className="mt-3 font-display text-2xl leading-none text-foreground sm:text-[1.75rem]">Delivery runs 9AM–3PM.</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">Out-of-state orders ship Monday through Wednesday, with Friday as the weekly order cut-off.</p>
            </article>
          </div>
          <MenuBrowser categories={menuCategories} />
        </Container>
      </section>
    </main>
  );
}
