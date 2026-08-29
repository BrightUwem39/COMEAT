import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your configured ComEat dishes and order subtotal.",
};

export default function CartPage() {
  return (
    <main className="min-h-[calc(100svh-5rem)] py-12 sm:py-16 lg:py-20" id="main-content">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Your order</p>
        <h1 className="mt-5 font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.85] tracking-[-0.045em] text-foreground">Your cart.</h1>
        <div className="mt-10 lg:mt-14">
          <CartPageClient />
        </div>
      </Container>
    </main>
  );
}
