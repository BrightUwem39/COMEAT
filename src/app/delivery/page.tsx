import type { Metadata } from "next";

import { DeliveryEntryClient } from "@/components/checkout/DeliveryEntryClient";
import { Container } from "@/components/ui/Container";
import { getCheckoutEntryData } from "@/server/checkout";

export const metadata: Metadata = {
  title: "Delivery details",
  description: "Choose where and when your ComEat order should arrive.",
};

export default async function DeliveryPage() {
  const { addresses, customer, rules } = await getCheckoutEntryData();

  return (
    <main className="min-h-[calc(100svh-5rem)] bg-background py-8 sm:py-10 lg:py-12" id="main-content">
      <Container>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gold">Delivery</p>
        <h1 className="mt-4 max-w-2xl font-display text-[2.25rem] leading-[0.98] tracking-[-0.045em] text-foreground sm:text-[2.75rem] lg:text-5xl">Where should we bring it?</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted">Add your delivery details before reviewing and paying for your order.</p>
        <div className="mt-7 lg:mt-9">
          <DeliveryEntryClient addresses={addresses} customer={customer} rules={rules} />
        </div>
      </Container>
    </main>
  );
}
