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
    <main className="min-h-[calc(100svh-5rem)] bg-background py-8 sm:py-10 lg:py-12" id="main-content">
      <Container>
        <header className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface px-6 py-8 sm:px-9 sm:py-10">
          <div aria-hidden="true" className="absolute -right-20 -top-28 size-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gold">Secure checkout</p>
            </div>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="max-w-2xl font-display text-[2.25rem] leading-[0.98] tracking-[-0.045em] text-foreground sm:text-[2.75rem] lg:text-5xl">Complete your order.</h1>
              <div className="flex w-fit items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted">
                <span className="size-1.5 rounded-full bg-gold" />
                Protected checkout
              </div>
            </div>
          </div>
        </header>
        <div className="mt-6 lg:mt-8">
          <CheckoutEntryClient addresses={addresses} customer={customer} rules={rules} />
        </div>
      </Container>
    </main>
  );
}
