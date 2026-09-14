import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusUpdateForm } from "@/components/admin/OrderStatusUpdateForm";
import { adminOrderStatusLabels, getAdminOrderDetail } from "@/server/admin-orders";

export const metadata: Metadata = { title: "Order details | Admin" };

const statusStyles = {
  PENDING_PAYMENT: "bg-white/7 text-muted",
  PAID: "bg-gold/12 text-gold",
  PREPARING: "bg-orange/12 text-orange",
  READY: "bg-emerald-400/10 text-emerald-300",
  OUT_FOR_DELIVERY: "bg-sky-400/10 text-sky-300",
  COMPLETED: "bg-white/7 text-foreground",
  CANCELLED: "bg-red-400/10 text-red-300",
  REFUNDED: "bg-violet-400/10 text-violet-300",
} as const;

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const order = await getAdminOrderDetail(reference);
  if (!order) notFound();

  const payment = order.payments[0] ?? null;
  const transitionOptions = order.allowedTransitions.map((status) => ({
    label: adminOrderStatusLabels[status],
    value: status,
  }));

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <Link className="hero-reveal inline-flex min-h-11 items-center text-[0.64rem] font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light" href="/admin/orders">← All orders</Link>

      <header className="hero-reveal hero-reveal-1 mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.63rem] font-bold uppercase tracking-[0.19em] text-muted">Order details</p>
          <h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">{order.publicReference}</h1>
          <p className="mt-3 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-[0.63rem] font-bold uppercase tracking-[0.1em] ${statusStyles[order.status]}`}>{order.statusLabel}</span>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="min-w-0 space-y-6">
          <section className="hero-reveal hero-reveal-2 rounded-2xl bg-white/[0.035] p-5 sm:p-6" aria-labelledby="order-items-heading">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Order contents</p>
                <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl" id="order-items-heading">Dishes</h2>
              </div>
              <p className="text-xs text-muted">{order.items.length} {order.items.length === 1 ? "line" : "lines"}</p>
            </div>
            <div className="mt-5 divide-y divide-white/8">
              {order.items.map((item) => (
                <article className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[4.75rem_minmax(0,1fr)_auto] sm:items-center" key={item.id}>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                    <Image alt="" className="object-cover transition-transform duration-500 hover:scale-105 motion-reduce:transform-none" fill sizes="76px" src={item.productImageUrl || "/images/hero.jpg"} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold sm:text-base">{item.productName}</h3>
                    <p className="mt-1 text-xs text-muted">{item.variantLabel} · Quantity {item.quantity}</p>
                    {item.modifiers.length ? <p className="mt-1 text-xs leading-5 text-muted">{item.modifiers.map((modifier) => `${modifier.modifierName}: ${modifier.optionLabel}`).join(" · ")}</p> : null}
                  </div>
                  <p className="col-start-2 text-sm font-semibold text-gold sm:col-start-auto">{formatMoney(item.lineTotalCents, order.currency)}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="hero-reveal hero-reveal-2 rounded-2xl bg-white/[0.035] p-5 sm:p-6" aria-labelledby="customer-heading">
              <p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Customer</p>
              <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]" id="customer-heading">Contact details</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <DetailRow label="Name" value={`${order.customerFirstName} ${order.customerLastName}`} />
                <DetailRow label="Email" value={order.customerEmail} />
                <DetailRow label="Phone" value={order.customerPhone} />
              </dl>
            </section>

            <section className="hero-reveal hero-reveal-3 rounded-2xl bg-white/[0.035] p-5 sm:p-6" aria-labelledby="fulfillment-heading">
              <p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Fulfillment</p>
              <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]" id="fulfillment-heading">Delivery details</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <DetailRow label="Method" value={formatFulfillment(order.fulfillmentMethod)} />
                <DetailRow label="Requested" value={formatDate(order.requestedFulfillmentAt)} />
                <DetailRow label="Recipient" value={order.deliveryRecipientName || `${order.customerFirstName} ${order.customerLastName}`} />
              </dl>
              {order.deliveryStreetLine1 ? <address className="mt-5 border-t border-white/8 pt-5 text-xs not-italic leading-6 text-muted">{order.deliveryStreetLine1}{order.deliveryStreetLine2 ? <><br />{order.deliveryStreetLine2}</> : null}<br />{order.deliveryCity}, {order.deliveryState} {order.deliveryPostalCode}<br />{order.deliveryCountryCode}</address> : null}
              {order.deliveryNotes ? <p className="mt-4 text-xs leading-5 text-muted"><strong className="text-foreground">Instructions:</strong> {order.deliveryNotes}</p> : null}
            </section>
          </div>

          <section className={`hero-reveal hero-reveal-3 rounded-2xl p-5 sm:p-6 ${order.allergyDeclared ? "bg-orange/8" : "bg-white/[0.035]"}`} aria-labelledby="allergy-heading">
            <p className={`text-[0.61rem] font-bold uppercase tracking-[0.17em] ${order.allergyDeclared ? "text-orange" : "text-gold"}`}>Allergy information</p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]" id="allergy-heading">{order.allergyDeclared ? "Allergies declared" : "No known allergies declared"}</h2>
            {order.allergyNotes ? <p className="mt-3 text-sm leading-6 text-foreground">{order.allergyNotes}</p> : null}
            <p className="mt-3 text-xs leading-5 text-muted">Cross-contact warning acknowledged {formatDateTime(order.crossContactAcknowledgedAt)}.</p>
          </section>

          <section className="hero-reveal hero-reveal-3 rounded-2xl bg-white/[0.035] p-5 sm:p-6" aria-labelledby="history-heading">
            <p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Audit trail</p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]" id="history-heading">Status history</h2>
            <ol className="mt-6">
              {order.statusHistory.map((entry, index) => (
                <li className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 pb-6 last:pb-0" key={entry.id}>
                  {index < order.statusHistory.length - 1 ? <span aria-hidden="true" className="absolute bottom-0 left-[0.35rem] top-3 w-px bg-white/12" /> : null}
                  <span aria-hidden="true" className="relative z-10 mt-1 size-3 rounded-full border-2 border-background bg-gold shadow-[0_0_0_1px_rgba(230,165,26,0.35)]" />
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{entry.newStatusLabel}</p><time className="text-xs text-muted" dateTime={entry.createdAt}>{formatDateTime(entry.createdAt)}</time></div>
                    <p className="mt-1 text-xs text-muted">Updated by {entry.actorName}</p>
                    {entry.note ? <p className="mt-2 text-xs leading-5 text-muted">{entry.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="hero-reveal hero-reveal-3 space-y-5 xl:sticky xl:top-6">
          <section className="rounded-2xl bg-white/[0.045] p-5">
            <p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Update progress</p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]">Order status</h2>
            <p className="mt-3 text-xs leading-5 text-muted">Customers see approved updates in their order tracking.</p>
            <div className="mt-5"><OrderStatusUpdateForm key={order.status} options={transitionOptions} publicReference={order.publicReference} /></div>
          </section>

          <section className="rounded-2xl bg-white/[0.035] p-5">
            <p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Payment</p>
            <dl className="mt-4 space-y-3 text-sm">
              <DetailRow label="Status" value={payment ? formatPaymentStatus(payment.status) : "No payment"} />
              {payment ? <DetailRow label="Method" value={formatPaymentMethod(payment.paymentMethodType)} /> : null}
              {payment?.paidAt ? <DetailRow label="Paid" value={formatDateTime(payment.paidAt)} /> : null}
            </dl>
          </section>

          <section className="rounded-2xl bg-white/[0.035] p-5">
            <p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Order total</p>
            <dl className="mt-4 space-y-3 text-sm">
              <MoneyRow currency={order.currency} label="Subtotal" value={order.subtotalCents} />
              <MoneyRow currency={order.currency} label="Delivery" value={order.deliveryFeeCents} />
              <MoneyRow currency={order.currency} label="Tax" value={order.taxCents} />
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-white/8 pt-4"><span className="text-sm font-semibold">Total</span><strong className="font-display text-2xl font-medium text-gold">{formatMoney(order.totalCents, order.currency)}</strong></div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><dt className="text-muted">{label}</dt><dd className="min-w-0 break-words text-right font-medium text-foreground">{value}</dd></div>;
}

function MoneyRow({ currency, label, value }: { currency: string; label: string; value: number }) {
  return <div className="flex items-center justify-between gap-4"><dt className="text-muted">{label}</dt><dd className="font-medium">{formatMoney(value, currency)}</dd></div>;
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { currency, style: "currency" }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "America/New_York" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(value));
}

function formatFulfillment(value: string) {
  if (value === "OUT_OF_STATE_SHIPPING") return "Out-of-state shipping";
  if (value === "PICKUP") return "Pickup";
  return "Local delivery";
}

function formatPaymentMethod(value: string | null) {
  if (!value) return "Not recorded";
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatPaymentStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
