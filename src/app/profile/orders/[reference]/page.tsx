import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { getCustomerOrderDetail } from "@/server/customer-account";

export const metadata: Metadata = {
  title: "Track order",
  description: "Track a ComEat order securely from your customer account.",
};

const progressStages = [
  { status: "PENDING_PAYMENT", label: "Pending payment" },
  { status: "PAID", label: "Paid" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY", label: "Ready" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "COMPLETED", label: "Completed" },
] as const;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "America/New_York",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/New_York",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

export default async function CustomerOrderDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const order = await getCustomerOrderDetail(reference);
  if (!order) notFound();

  const currentStage = progressStages.findIndex((stage) => stage.status === order.status);
  const terminalStatus = order.status === "CANCELLED" || order.status === "REFUNDED";
  const historyByStatus = new Map(order.statusHistory.map((entry) => [entry.newStatus, entry]));

  return (
    <main className="min-h-[calc(100svh-5rem)] bg-background" id="main-content">
      <section className="border-b border-border py-10 sm:py-14">
        <Container>
          <Link className="text-xs font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light" href="/profile/orders">← Order history</Link>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Track order</p>
              <h1 className="mt-4 font-display text-[2rem] leading-[1.02] tracking-[-0.045em] text-foreground sm:text-[2.5rem] lg:text-5xl">{order.publicReference}</h1>
              <p className="mt-4 text-sm text-muted">Placed {dateTimeFormatter.format(new Date(order.createdAt))}</p>
            </div>
            <div className={`w-fit rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] ${terminalStatus ? "border-orange/50 bg-orange/5 text-orange" : "border-gold/40 bg-gold/5 text-gold"}`}>{order.statusLabel}</div>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        {order.status === "PENDING_PAYMENT" ? (
          <div className="mb-7 border-l-2 border-orange bg-orange/5 px-5 py-4 text-sm leading-6 text-muted"><strong className="text-orange">Payment required.</strong> This order is saved but is not confirmed until full payment is completed.</div>
        ) : null}
        {terminalStatus ? (
          <div className="mb-7 border-l-2 border-orange bg-orange/5 px-5 py-4 text-sm leading-6 text-orange">This order is {order.statusLabel.toLowerCase()}. Review the activity history below for details.</div>
        ) : null}

        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8" aria-labelledby="order-progress-title">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">Live progress</p>
          <h2 className="mt-3 font-display text-2xl tracking-[-0.03em] text-foreground sm:text-[1.75rem]" id="order-progress-title">Order status</h2>
          <ol className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {progressStages.map((stage, index) => {
              const reached = !terminalStatus && index <= currentStage;
              const active = !terminalStatus && index === currentStage;
              const history = historyByStatus.get(stage.status);
              return (
                <li className={`relative border p-4 ${active ? "border-gold bg-gold/10" : reached ? "border-gold/35 bg-background/50" : "border-border bg-background/30"}`} key={stage.status}>
                  <span aria-hidden="true" className={`grid size-7 place-items-center rounded-full text-xs font-bold ${reached ? "bg-gold text-background" : "border border-border text-muted"}`}>{reached ? "✓" : index + 1}</span>
                  <p className={`mt-3 text-xs font-bold uppercase tracking-[0.1em] ${reached ? "text-foreground" : "text-muted"}`}>{stage.label}</p>
                  {history ? <time className="mt-2 block text-[0.65rem] leading-4 text-muted" dateTime={history.createdAt}>{dateTimeFormatter.format(new Date(history.createdAt))}</time> : null}
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8" aria-labelledby="tracked-items-title">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">Order contents</p>
            <h2 className="mt-3 font-display text-2xl tracking-[-0.03em] text-foreground sm:text-[1.75rem]" id="tracked-items-title">Your dishes</h2>
            <div className="mt-6 divide-y divide-border border-y border-border">
              {order.items.map((item) => (
                <article className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center" key={item.id}>
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
                    <Image alt="" className="object-cover" fill sizes="88px" src={item.productImageUrl || "/images/hero.jpg"} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{item.productName}</h3>
                    <p className="mt-1 text-xs text-muted">{item.variantLabel} · Quantity {item.quantity}</p>
                    {item.modifiers.length ? <p className="mt-1 text-xs leading-5 text-muted">{item.modifiers.map((modifier) => `${modifier.modifierName}: ${modifier.optionLabel}`).join(" · ")}</p> : null}
                  </div>
                  <strong className="col-start-2 text-sm text-gold sm:col-start-auto sm:text-base">{formatMoney(item.lineTotalCents, order.currency)}</strong>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <section className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Delivery</p>
              <dl className="mt-5 space-y-4 text-sm">
                <InfoRow label="Method" value={formatFulfillment(order.fulfillmentMethod)} />
                <InfoRow label="Requested date" value={dateFormatter.format(new Date(order.requestedFulfillmentAt))} />
                {order.deliveryWindowStart && order.deliveryWindowEnd ? <InfoRow label="Window" value={`${timeFormatter.format(new Date(order.deliveryWindowStart))}–${timeFormatter.format(new Date(order.deliveryWindowEnd))}`} /> : null}
              </dl>
              <p className="mt-5 border-t border-border pt-5 text-xs leading-6 text-muted">{order.deliveryRecipientName}<br />{order.deliveryStreetLine1}{order.deliveryStreetLine2 ? <><br />{order.deliveryStreetLine2}</> : null}<br />{order.deliveryCity}, {order.deliveryState} {order.deliveryPostalCode}<br />{order.deliveryCountryCode}</p>
              {order.deliveryNotes ? <p className="mt-4 text-xs leading-6 text-muted"><strong className="text-foreground">Notes:</strong> {order.deliveryNotes}</p> : null}
            </section>

            <section className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Order total</p>
              <dl className="mt-5 space-y-3 text-sm">
                <MoneyRow label="Subtotal" value={order.subtotalCents} currency={order.currency} />
                <MoneyRow label="Delivery" value={order.deliveryFeeCents} currency={order.currency} />
                <MoneyRow label="Tax" value={order.taxCents} currency={order.currency} />
              </dl>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-5"><span className="font-semibold text-foreground">Total</span><strong className="font-display text-2xl text-gold">{formatMoney(order.totalCents, order.currency)}</strong></div>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-6 sm:p-8" aria-labelledby="activity-title">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">Updates</p>
          <h2 className="mt-3 font-display text-2xl tracking-[-0.03em] text-foreground" id="activity-title">Activity history</h2>
          <ol className="mt-6 divide-y divide-border border-y border-border">
            {[...order.statusHistory].reverse().map((entry) => (
              <li className="grid gap-2 py-4 sm:grid-cols-[11rem_1fr]" key={entry.id}>
                <time className="text-xs text-muted" dateTime={entry.createdAt}>{dateTimeFormatter.format(new Date(entry.createdAt))}</time>
                <div><p className="text-sm font-semibold text-foreground">{entry.newStatusLabel}</p>{entry.note ? <p className="mt-1 text-xs leading-5 text-muted">{entry.note}</p> : null}</div>
              </li>
            ))}
          </ol>
        </section>
      </Container>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><dt className="text-muted">{label}</dt><dd className="text-right font-semibold text-foreground">{value}</dd></div>;
}

function MoneyRow({ currency, label, value }: { currency: string; label: string; value: number }) {
  return <div className="flex items-center justify-between"><dt className="text-muted">{label}</dt><dd className="font-semibold text-foreground">{formatMoney(value, currency)}</dd></div>;
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function formatFulfillment(method: string) {
  return method === "OUT_OF_STATE_SHIPPING" ? "Out-of-state shipping" : method === "LOCAL_DELIVERY" ? "Local delivery" : "Pickup";
}
