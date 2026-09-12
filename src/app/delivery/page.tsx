import type { Metadata } from "next";
import Link from "next/link";

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
    <main className="min-h-[calc(100svh-5rem)] bg-background py-7 sm:py-9 lg:py-11" id="main-content">
      <Container>
        <Link className="group inline-flex min-h-11 items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:text-gold" href="/cart"><span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span> Back to order</Link>
        <header className="mt-5 border-b border-border pb-6 sm:flex sm:items-end sm:justify-between sm:gap-8">
          <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gold">Delivery details</p><h1 className="mt-3 max-w-2xl font-display text-[2rem] leading-[0.98] tracking-[-0.045em] text-foreground sm:text-[2.45rem] lg:text-[2.75rem]">Where should we bring it?</h1></div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted sm:mt-0 sm:text-right">Tell us where and when. You will review everything before payment.</p>
        </header>
        <div className="mt-6 lg:mt-8">
          <DeliveryEntryClient addresses={addresses} customer={customer} rules={rules} />
        </div>
      </Container>
    </main>
  );
}
