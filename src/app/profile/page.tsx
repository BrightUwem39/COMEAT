import type { Metadata } from "next";
import Link from "next/link";

import { AddressManager } from "@/components/auth/AddressManager";
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
  const details = [
    { label: "First name", value: account.firstName },
    { label: "Last name", value: account.lastName },
    { label: "Email address", value: account.email },
    { label: "Phone number", value: account.phone || "Not provided" },
  ];

  return (
    <main className="min-h-[calc(100svh-5rem)] bg-background text-foreground" id="main-content">
      <Container className="py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold">My account</p>
            <h1 className="mt-3 font-display text-[2rem] leading-[1.02] tracking-[-0.045em] sm:text-[2.35rem] lg:text-[2.75rem]">
              Welcome back, {account.firstName}.
            </h1>
            <p className="mt-4 text-sm text-muted">Member since {dateFormatter.format(new Date(account.memberSince))}</p>
          </div>
          <ProfileActions />
        </div>

        <div className="grid gap-7 pt-7 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 lg:pt-8">
          <aside className="lg:border-r lg:border-border lg:pr-6">
            <nav aria-label="Account navigation" className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <a className="flex min-h-12 items-center gap-3 rounded-lg border border-gold/35 bg-gold/10 px-4 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-gold" href="#personal-details">
                <AccountIcon type="user" />
                User information
              </a>
              <Link className="flex min-h-12 items-center gap-3 rounded-lg border border-transparent px-4 text-[0.68rem] font-bold uppercase tracking-[0.13em] transition-colors hover:border-border hover:bg-surface/40 hover:text-gold" href="/profile/orders">
                <AccountIcon type="order" />
                Order history
              </Link>
              <a className="flex min-h-12 items-center gap-3 rounded-lg border border-transparent px-4 text-[0.68rem] font-bold uppercase tracking-[0.13em] transition-colors hover:border-border hover:bg-surface/40 hover:text-gold" href="#saved-addresses">
                <AccountIcon type="pin" />
                Saved addresses
              </a>
            </nav>
          </aside>

          <div className="min-w-0">
            <section className="overflow-hidden rounded-2xl border border-border bg-surface/30" id="personal-details">
              <div className="border-b border-border px-5 py-5 sm:px-6">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">Personal details</p>
                <h2 className="mt-2 font-display text-[1.6rem] leading-none tracking-[-0.035em] sm:text-[1.8rem]">User information</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Your account details are protected by your verified ComEat session.</p>
              </div>

              <div className="grid gap-px bg-border sm:grid-cols-2">
                {details.map((detail) => (
                  <div className="bg-background/75 px-5 py-4 sm:px-6" key={detail.label}>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-muted">{detail.label}</p>
                    <p className="mt-2 break-words text-sm font-semibold text-foreground sm:text-base">{detail.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 border-t border-border pt-7" id="saved-addresses">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold">Delivery</p>
                  <h2 className="mt-2 font-display text-2xl tracking-[-0.03em] sm:text-[1.65rem]">Saved addresses</h2>
                </div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">{account.addressCount} saved</p>
              </div>
              <AddressManager addresses={account.addresses} />
            </section>

            <section className="mt-8 border-t border-border pt-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold">{account.orderCount} total {account.orderCount === 1 ? "order" : "orders"}</p>
                  <h2 className="mt-2 font-display text-2xl tracking-[-0.03em] sm:text-[1.65rem]">Recent orders</h2>
                </div>
                <Link className="text-xs font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light" href="/profile/orders">View all →</Link>
              </div>
              {account.recentOrders.length ? (
                <div className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface/30 px-4 sm:px-5">
                  {account.recentOrders.map((order) => (
                    <div className="flex flex-wrap items-center justify-between gap-3 py-4" key={order.publicReference}>
                      <div>
                        <p className="font-semibold">{order.publicReference}</p>
                        <p className="mt-1 text-xs text-muted">{order.statusLabel}</p>
                      </div>
                      <p className="text-sm font-semibold text-gold">{formatMoney(order.totalCents, order.currency)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 border-y border-border py-6 text-sm text-muted">No account orders yet. Orders placed while signed in will appear here.</p>
              )}
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}

function AccountIcon({ type }: { type: "order" | "pin" | "user" }) {
  if (type === "order") {
    return <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24"><path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  }
  if (type === "pin") {
    return <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.6" /></svg>;
  }
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" /><path d="M5.5 21v-2.5a6.5 6.5 0 0 1 13 0V21" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
