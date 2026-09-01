import type { Metadata } from "next";

import { CheckoutEntryClient } from "@/components/checkout/CheckoutEntryClient";
import { Container } from "@/components/ui/Container";
import { getCheckoutEntryData } from "@/server/checkout";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your ComEat order securely.",
};

export default async function CheckoutPage() {
  const { addresses, customer, rules } = await getCheckoutEntryData();

  return (
    <main className="min-h-[calc(100svh-5rem)] py-10 sm:py-14 lg:py-16" id="main-content">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Secure checkout</p>
        <h1 className="mt-4 font-display text-[2rem] leading-[1.02] tracking-[-0.045em] text-foreground sm:text-[2.5rem] lg:text-5xl">Complete your order.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Your verified account keeps this order connected to your profile for status tracking.</p>
        <div className="mt-8 lg:mt-10">
          <CheckoutEntryClient addresses={addresses} customer={customer} rules={rules} />
        </div>
      </Container>
    </main>
  );
}
