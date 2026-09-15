"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

type LiveOrder = {
  createdAt: string;
  currency: string;
  customerName: string;
  fulfillmentMethod: "LOCAL_DELIVERY" | "OUT_OF_STATE_SHIPPING" | "PICKUP";
  itemCount: number;
  publicReference: string;
  requestedFulfillmentAt: string;
  status: "PENDING_PAYMENT" | "PAID" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  statusLabel: string;
  totalCents: number;
};

const lanes = [
  { description: "Paid and waiting", label: "New orders", status: "PAID" as const },
  { description: "Accepted by the kitchen", label: "Confirmed", status: "CONFIRMED" as const },
  { description: "Being prepared", label: "In the kitchen", status: "PREPARING" as const },
  { description: "Waiting for handoff", label: "Ready", status: "READY" as const },
  { description: "With the customer soon", label: "Out for delivery", status: "OUT_FOR_DELIVERY" as const },
];

const POLL_INTERVAL_MS = 15_000;

export function LiveOrderCommandCenter({
  generatedAt,
  orders,
  totalActiveOrders,
}: {
  generatedAt: string;
  orders: LiveOrder[];
  totalActiveOrders: number;
}) {
  const router = useRouter();
  const [acknowledgedReferences, setAcknowledgedReferences] = useState(() => new Set(orders.map((order) => order.publicReference)));
  const [refreshing, startRefresh] = useTransition();
  const newOrderCount = orders.filter((order) => !acknowledgedReferences.has(order.publicReference)).length;

  const refresh = useCallback(() => {
    startRefresh(() => router.refresh());
  }, [router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_INTERVAL_MS);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  return (
    <section aria-labelledby="live-orders-heading" className="hero-reveal hero-reveal-2 mt-8 overflow-hidden rounded-2xl bg-white/[0.04]">
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            <p className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-emerald-300">Live operations</p>
          </div>
          <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl" id="live-orders-heading">Order command centre</h2>
          <p className="mt-2 text-xs text-muted">{totalActiveOrders} active · Synced {formatSyncTime(generatedAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link className="inline-flex min-h-11 items-center whitespace-nowrap text-[0.62rem] font-bold uppercase tracking-[0.11em] text-gold transition-colors hover:text-gold-light" href="/admin/orders?status=PAID">Pending action</Link>
          <button aria-label="Refresh live orders" className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/12 px-4 text-[0.62rem] font-bold uppercase tracking-[0.11em] transition-[border-color,color,background-color] hover:border-gold/50 hover:bg-gold/8 hover:text-gold disabled:cursor-wait disabled:opacity-60" disabled={refreshing} onClick={refresh} type="button">
            <svg aria-hidden="true" className={`size-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`} fill="none" viewBox="0 0 24 24"><path d="M19 8V4m0 0h-4m4 0-3 3a7 7 0 1 0 2 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      {newOrderCount ? (
        <div aria-live="assertive" className="mx-5 mb-5 flex items-center justify-between gap-4 rounded-xl bg-gold px-4 py-3 text-background sm:mx-6">
          <p className="text-sm font-semibold">{newOrderCount} new paid {newOrderCount === 1 ? "order is" : "orders are"} ready for review.</p>
          <button aria-label="Dismiss new order notification" className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-black/10" onClick={() => setAcknowledgedReferences(new Set(orders.map((order) => order.publicReference)))} type="button">
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>
          </button>
        </div>
      ) : null}

      <div className="grid border-t border-white/8 lg:grid-cols-2 2xl:grid-cols-5">
        {lanes.map((lane) => {
          const laneOrders = orders.filter((order) => order.status === lane.status);
          return (
            <div className="min-w-0 border-b border-white/8 p-4 last:border-b-0 sm:p-5 2xl:border-b-0 2xl:border-r 2xl:last:border-r-0" key={lane.status}>
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="text-sm font-semibold">{lane.label}</h3><p className="mt-1 text-xs text-muted">{lane.description}</p></div>
                <span className="grid min-w-7 place-items-center rounded-full bg-white/8 px-2 py-1 text-xs font-semibold text-gold">{laneOrders.length}</span>
              </div>
              <div className="mt-4 space-y-2">
                {laneOrders.length ? laneOrders.slice(0, 4).map((order) => (
                  <Link aria-label={`Open ${order.statusLabel.toLowerCase()} order ${order.publicReference}`} className="block rounded-xl bg-black/20 p-3.5 transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] motion-reduce:transform-none" href={`/admin/orders/${encodeURIComponent(order.publicReference)}`} key={order.publicReference}>
                    <div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-semibold">{order.publicReference}</p><p className="shrink-0 text-xs font-semibold text-gold">{formatMoney(order.totalCents, order.currency)}</p></div>
                    <p className="mt-2 truncate text-xs text-muted">{order.customerName} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}</p>
                    <p className="mt-2 text-[0.62rem] text-muted">{formatFulfillment(order.fulfillmentMethod)} · {formatFulfillmentTime(order.requestedFulfillmentAt)}</p>
                  </Link>
                )) : <p className="rounded-xl bg-black/15 px-3.5 py-5 text-center text-xs text-muted">No orders here</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatSyncTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", timeZone: "America/New_York" }).format(new Date(value));
}

function formatFulfillmentTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", hour: "numeric", minute: "2-digit", month: "short", timeZone: "America/New_York" }).format(new Date(value));
}

function formatFulfillment(value: LiveOrder["fulfillmentMethod"]) {
  if (value === "PICKUP") return "Pickup";
  if (value === "OUT_OF_STATE_SHIPPING") return "Shipping";
  return "Delivery";
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { currency, maximumFractionDigits: 0, style: "currency" }).format(cents / 100);
}
