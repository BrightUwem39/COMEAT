import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutReviewClient } from "@/components/checkout/CheckoutReviewClient";
import { Container } from "@/components/ui/Container";
import { getCheckoutEntryData } from "@/server/checkout";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your ComEat order securely.",
};

export default async function CheckoutPage() {
  const { rules } = await getCheckoutEntryData();

  return (
    <main className="min-h-[calc(100svh-5rem)] overflow-x-clip bg-background py-7 sm:py-9 lg:py-11" id="main-content">
      <Container>
        <Link className="group inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:text-gold" href="/delivery"><span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span> Back to delivery</Link>
        <header className="mt-5">
          <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gold">Checkout</p><h1 className="mt-3 max-w-2xl font-display text-[2rem] leading-[0.98] tracking-[-0.045em] text-foreground sm:text-[2.45rem] lg:text-[2.75rem]">Review, then pay.</h1></div>
        </header>
        <div className="mt-6 lg:mt-8">
          <CheckoutReviewClient rules={rules} />
        </div>
      </Container>
    </main>
  );
}
