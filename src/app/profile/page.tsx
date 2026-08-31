import type { Metadata } from "next";
import Link from "next/link";

import { ProfileActions } from "@/components/auth/ProfileActions";
import { Container } from "@/components/ui/Container";
import { getCustomerAccountOverview } from "@/server/customer-account";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your ComEat profile, delivery details, and order history.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export default async function ProfilePage() {
  const account = await getCustomerAccountOverview();
  const detailCards = [
    {
      eyebrow: "Contact details",
      title: `${account.firstName} ${account.lastName}`,
      lines: [account.email, account.phone || "No phone number saved"],
    },
    {
      eyebrow: `${account.addressCount} saved ${account.addressCount === 1 ? "address" : "addresses"}`,
      title: account.defaultAddress?.label || "Delivery addresses",
      lines: [account.defaultAddress ? `${account.defaultAddress.city}, ${account.defaultAddress.state}` : "No default delivery address yet"],
    },
  ];

  return (
    <main className="min-h-[calc(100svh-5rem)] bg-background" id="main-content">
      <section className="relative overflow-hidden border-b border-border py-10 sm:py-14 lg:py-18">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-0 size-80 rounded-full bg-gold/[0.07] blur-3xl" />
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Your account</p>
              <h1 className="mt-4 max-w-4xl font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.86] tracking-[-0.045em] text-foreground">Welcome, {account.firstName}.</h1>
              <p className="mt-5 text-sm leading-7 text-muted">Member since {dateFormatter.format(new Date(account.memberSince))}</p>
            </div>
            <ProfileActions />
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14 lg:py-18">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="rounded-[1.75rem] border border-gold/20 bg-surface p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-8">
              <div className="grid size-16 place-items-center rounded-full bg-gold text-lg font-bold tracking-[0.08em] text-background">{account.initials}</div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-gold">Account overview</p>
              <h2 className="mt-3 font-display text-4xl leading-none tracking-[-0.03em] text-foreground">Everything in one place.</h2>
              <p className="mt-5 text-sm leading-7 text-muted">Your private details and order history are available only through your verified ComEat session.</p>
              <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-5 text-xs font-bold uppercase tracking-[0.15em] text-background transition-colors hover:bg-gold-light" href="/profile/orders">View order history</Link>
            </aside>

            <div className="grid gap-5 sm:grid-cols-2">
              {detailCards.map((card) => (
                <article className="rounded-[1.4rem] border border-border bg-surface p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-gold/40 motion-reduce:transform-none sm:p-7" key={card.eyebrow}>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-orange">{card.eyebrow}</p>
                  <h2 className="mt-4 font-display text-3xl leading-none tracking-[-0.025em] text-foreground">{card.title}</h2>
                  <div className="mt-5 space-y-1 text-sm leading-6 text-muted">{card.lines.map((line) => <p key={line}>{line}</p>)}</div>
                </article>
              ))}

              <article className="rounded-[1.4rem] border border-border bg-surface p-6 sm:col-span-2 sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-orange">{account.orderCount} total {account.orderCount === 1 ? "order" : "orders"}</p>
                    <h2 className="mt-3 font-display text-3xl leading-none tracking-[-0.025em] text-foreground">Recent orders</h2>
                  </div>
                  <Link className="text-xs font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-light" href="/profile/orders">View all →</Link>
                </div>
                {account.recentOrders.length ? (
                  <div className="mt-6 divide-y divide-border">
                    {account.recentOrders.map((order) => (
                      <div className="flex flex-wrap items-center justify-between gap-3 py-4" key={order.publicReference}>
                        <div><p className="font-semibold text-foreground">{order.publicReference}</p><p className="mt-1 text-xs text-muted">{order.statusLabel}</p></div>
                        <p className="text-sm font-semibold text-gold">{formatMoney(order.totalCents, order.currency)}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-6 text-sm leading-7 text-muted">No account orders yet. Orders placed while signed in will appear here.</p>}
              </article>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
