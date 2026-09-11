import type { Metadata } from "next";

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
    <main className="min-h-[calc(100svh-5rem)] overflow-x-clip bg-background py-8 sm:py-10 lg:py-12" id="main-content">
      <Container>
        <header>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gold">Checkout</p>
          <h1 className="mt-4 max-w-2xl font-display text-[2.25rem] leading-[0.98] tracking-[-0.045em] text-foreground sm:text-[2.75rem] lg:text-5xl">Complete your order.</h1>
        </header>
        <div className="mt-6 lg:mt-8">
          <CheckoutReviewClient rules={rules} />
        </div>
      </Container>
    </main>
  );
}
