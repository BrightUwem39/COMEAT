import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PrintReceiptButton } from "@/components/admin/PrintReceiptButton";
import { getAdminOrderDetail } from "@/server/admin-orders";

export const metadata: Metadata = { title: "Kitchen receipt | Admin" };

export default async function KitchenReceiptPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const order = await getAdminOrderDetail(reference);
  if (!order) notFound();

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9 print:fixed print:inset-0 print:z-[100] print:overflow-auto print:bg-white print:p-0 print:text-black" id="main-content">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden"><Link className="inline-flex min-h-11 items-center text-[0.64rem] font-bold uppercase tracking-[0.14em] text-gold" href={`/admin/orders/${encodeURIComponent(order.publicReference)}`}>← Order details</Link><PrintReceiptButton /></div>
        <article className="rounded-2xl bg-white/[0.04] p-5 sm:p-8 print:rounded-none print:bg-white print:p-8">
          <header className="flex items-start justify-between gap-6 border-b border-white/10 pb-6 print:border-black/20"><div><p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold print:text-black">ComEat kitchen</p><h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.04em]">{order.publicReference}</h1><p className="mt-2 text-sm text-muted print:text-black/65">Placed {formatDateTime(order.createdAt)}</p></div><div className="text-right"><p className="text-xs font-bold uppercase tracking-[0.12em]">{order.statusLabel}</p><p className="mt-2 text-xs text-muted print:text-black/65">{formatFulfillment(order.fulfillmentMethod)}</p></div></header>

          <section className="grid gap-5 border-b border-white/10 py-6 text-sm sm:grid-cols-2 print:grid-cols-2 print:border-black/20"><div><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted print:text-black/60">Customer</p><p className="mt-2 font-semibold">{order.customerFirstName} {order.customerLastName}</p><p className="mt-1">{order.customerPhone}</p></div><div><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted print:text-black/60">Required time</p><p className="mt-2 font-semibold">{formatDateTime(order.requestedFulfillmentAt)}</p>{order.estimatedReadyAt ? <p className="mt-1">Estimated ready: {formatDateTime(order.estimatedReadyAt)}</p> : null}</div></section>

          {order.allergyDeclared ? <section className="my-5 rounded-xl bg-orange/10 px-4 py-4 print:border-2 print:border-black print:bg-white"><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange print:text-black">Allergy alert</p><p className="mt-2 text-sm font-semibold">{order.allergyNotes || "Customer declared a food allergy."}</p></section> : null}

          <section className="py-6"><h2 className="text-xs font-bold uppercase tracking-[0.14em]">Items · {order.items.reduce((sum, item) => sum + item.quantity, 0)}</h2><ol className="mt-4 divide-y divide-white/10 print:divide-black/20">{order.items.map((item) => <li className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-4" key={item.id}><strong className="text-lg">{item.quantity}×</strong><div><p className="font-semibold">{item.productName} · {item.variantLabel}</p>{item.modifiers.length ? <ul className="mt-2 space-y-1 text-sm text-muted print:text-black/70">{item.modifiers.map((modifier) => <li key={modifier.id}>{modifier.modifierName}: <strong className="text-foreground print:text-black">{modifier.optionLabel}</strong></li>)}</ul> : <p className="mt-2 text-sm text-muted print:text-black/70">No customizations</p>}</div></li>)}</ol></section>

          <footer className="border-t border-white/10 pt-5 text-sm print:border-black/20"><p className="font-semibold">Customer notes</p><p className="mt-2 whitespace-pre-wrap text-muted print:text-black/70">{order.deliveryNotes || "No delivery or kitchen notes."}</p></footer>
        </article>
      </div>
    </main>
  );
}

function formatDateTime(value: string) { return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(value)); }
function formatFulfillment(value: string) { return value === "PICKUP" ? "Pickup" : value === "OUT_OF_STATE_SHIPPING" ? "Out-of-state shipping" : "Local delivery"; }
