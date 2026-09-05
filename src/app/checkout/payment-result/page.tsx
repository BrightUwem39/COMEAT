import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { requireCurrentCustomer } from "@/server/auth-session";
import { getCustomerPaymentResult, type CustomerPaymentResult } from "@/server/payment-result";

export const metadata: Metadata = {
  title: "Payment status",
  description: "Review the secure payment status for your ComEat order.",
  robots: { index: false, follow: false },
};

type PaymentResultSearchParams = Promise<{
  orderReference?: string | string[];
  payment_intent?: string | string[];
}>;

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: PaymentResultSearchParams;
}) {
  const query = await searchParams;
  const orderReference = getSingleValue(query.orderReference);
  const paymentIntentId = getSingleValue(query.payment_intent);
  const returnTo = orderReference && paymentIntentId
    ? `/checkout/payment-result?orderReference=${encodeURIComponent(orderReference)}&payment_intent=${encodeURIComponent(paymentIntentId)}`
    : "/checkout/payment-result";
  const customer = await requireCurrentCustomer(returnTo);

  let result: CustomerPaymentResult | null = null;
  if (orderReference && paymentIntentId) {
    try {
      result = await getCustomerPaymentResult(orderReference, paymentIntentId, customer.userId);
    } catch {
      result = null;
    }
  }

  const content = getResultContent(result?.state);

  return (
    <main className="grid min-h-[calc(100svh-5rem)] place-items-center bg-background py-10 sm:py-14" id="main-content">
      <Container className="w-full">
        <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface" aria-labelledby="payment-result-title">
          <div className={`h-1.5 w-full ${content.accentClass}`} />
          <div className="p-6 sm:p-10">
            <div className={`grid size-12 place-items-center rounded-full border text-xl ${content.iconClass}`} aria-hidden="true">
              {content.icon}
            </div>
            <p className="mt-7 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Secure payment</p>
            <h1 className="mt-3 font-display text-[2rem] leading-[1.04] tracking-[-0.04em] text-foreground sm:text-[2.5rem]" id="payment-result-title">
              {content.heading}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{content.description}</p>

            {result ? (
              <dl className="mt-7 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
                <ResultDetail label="Order" value={result.orderReference} />
                <ResultDetail label="Payment amount" value={formatMoney(result.amountCents, result.currency)} />
              </dl>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {result ? (
                <Link className="inline-flex min-h-12 items-center justify-center rounded-lg bg-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-gold-light" href={`/profile/orders/${encodeURIComponent(result.orderReference)}`}>
                  Track order
                </Link>
              ) : null}
              <Link className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border px-6 text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-gold hover:text-gold" href="/menu">
                Return to menu
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}

function ResultDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/60 px-5 py-4">
      <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function getResultContent(state?: CustomerPaymentResult["state"]) {
  if (state === "received") {
    return {
      accentClass: "bg-gold",
      description: "Stripe received your payment. Secure server confirmation is handled automatically; track the order for its current status.",
      heading: "Payment received.",
      icon: "✓",
      iconClass: "border-gold/50 bg-gold/10 text-gold",
    };
  }
  if (state === "processing") {
    return {
      accentClass: "bg-gold",
      description: "Your payment is still processing. You can safely leave this page and follow the order from your account.",
      heading: "Payment processing.",
      icon: "…",
      iconClass: "border-gold/50 bg-gold/10 text-gold",
    };
  }
  if (state === "failed") {
    return {
      accentClass: "bg-orange",
      description: "Stripe did not complete this payment. No order will be confirmed until full payment succeeds.",
      heading: "Payment unsuccessful.",
      icon: "×",
      iconClass: "border-orange/50 bg-orange/10 text-orange",
    };
  }
  if (state === "not_completed") {
    return {
      accentClass: "bg-orange",
      description: "This payment needs another step and has not been completed. Your order remains pending payment.",
      heading: "Payment not completed.",
      icon: "!",
      iconClass: "border-orange/50 bg-orange/10 text-orange",
    };
  }
  return {
    accentClass: "bg-orange",
    description: "We could not securely match this payment to one of your orders. Open your order history to review its current status.",
    heading: "Unable to verify payment.",
    icon: "!",
    iconClass: "border-orange/50 bg-orange/10 text-orange",
  };
}

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
