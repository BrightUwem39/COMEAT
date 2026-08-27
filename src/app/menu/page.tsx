import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { menuCategories } from "@/data/menu";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse all 17 confirmed ComEat Nigerian dishes.",
};

export default function MenuPage() {
  return (
    <main className="min-h-[calc(100svh-5rem)]" id="main-content">
      <section className="border-b border-border py-12 sm:py-16 lg:py-20">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">The ComEat menu</p>
          <h1 className="mt-5 font-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.82] tracking-[-0.045em] text-foreground">Find your favorite.</h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-muted sm:text-base">Browse all 17 confirmed dishes. Descriptions, portions, modifiers, and pricing will be added only after client confirmation.</p>
          <MenuBrowser categories={menuCategories} />
        </Container>
      </section>
    </main>
  );
}
