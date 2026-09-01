import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { getCustomerOrders } from "@/server/customer-account";

export const metadata: Metadata = {
  title: "Order history",
  description: "Review orders placed through your ComEat account.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function CustomerOrdersPage() {
  const orders = await getCustomerOrders();

  return (
    <main className="min-h-[calc(100svh-5rem)] bg-background" id="main-content">
      <section className="border-b border-border py-10 sm:py-14 lg:py-18">
        <Container>
          <Link className="text-xs font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-light" href="/profile">← Back to profile</Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-gold">Your account</p>
          <h1 className="mt-4 max-w-5xl font-display text-[2rem] leading-[1.02] tracking-[-0.045em] text-foreground sm:text-[2.5rem] lg:text-5xl">Order history.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">Only orders attached to your verified ComEat account appear here.</p>
        </Container>
      </section>

      <section className="py-10 sm:py-14 lg:py-18">
        <Container>
          {orders.length ? (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article className="grid gap-5 rounded-[1.4rem] border border-border bg-surface p-6 transition-colors hover:border-gold/40 sm:grid-cols-[1.1fr_0.8fr_0.8fr_auto_auto] sm:items-center sm:p-7" key={order.publicReference}>
                  <div><p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-orange">Order</p><h2 className="mt-2 font-display text-2xl text-foreground">{order.publicReference}</h2></div>
                  <div><p className="text-xs text-muted">Status</p><p className="mt-1 text-sm font-semibold text-foreground">{order.statusLabel}</p></div>
                  <div><p className="text-xs text-muted">Placed</p><p className="mt-1 text-sm font-semibold text-foreground">{dateFormatter.format(new Date(order.createdAt))}</p></div>
                  <p className="text-lg font-semibold text-gold">{formatMoney(order.totalCents, order.currency)}</p>
                  <Link className="text-xs font-bold uppercase tracking-[0.13em] text-gold transition-colors hover:text-gold-light" href={`/profile/orders/${encodeURIComponent(order.publicReference)}`}>Track order →</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-gold/20 bg-surface p-8 text-center sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">No account orders yet</p>
              <h2 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground">Your next meal can start here.</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted">Orders placed while signed in will be saved securely to this history.</p>
              <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-6 text-xs font-bold uppercase tracking-[0.15em] text-background hover:bg-gold-light" href="/menu">Explore the menu</Link>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
