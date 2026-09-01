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
      <Container className="py-9 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-7 border-b border-border pb-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold">My account</p>
            <h1 className="mt-3 font-display text-[2rem] leading-[1.02] tracking-[-0.045em] sm:text-[2.5rem] lg:text-5xl">
              Welcome back, {account.firstName}.
            </h1>
            <p className="mt-4 text-sm text-muted">Member since {dateFormatter.format(new Date(account.memberSince))}</p>
          </div>
          <ProfileActions />
        </div>

        <div className="grid gap-9 pt-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12 lg:pt-10">
          <aside className="lg:border-r lg:border-border lg:pr-9">
            <nav aria-label="Account navigation" className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <a className="flex min-h-14 items-center gap-4 bg-foreground px-5 text-xs font-bold uppercase tracking-[0.16em] text-background" href="#personal-details">
                <AccountIcon type="user" />
                User information
              </a>
              <Link className="flex min-h-14 items-center gap-4 border border-transparent px-5 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:border-border hover:text-gold" href="/profile/orders">
                <AccountIcon type="order" />
                Order history
              </Link>
              <a className="flex min-h-14 items-center gap-4 border border-transparent px-5 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:border-border hover:text-gold" href="#saved-addresses">
                <AccountIcon type="pin" />
                Saved addresses
              </a>
            </nav>
          </aside>

          <div className="min-w-0">
            <section id="personal-details">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold">Personal details</p>
              <h2 className="mt-3 font-display text-[1.75rem] leading-none tracking-[-0.035em] sm:text-[2rem] lg:text-4xl">User information</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Your account details are protected by your verified ComEat session.</p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {details.map((detail) => (
                  <div className="min-h-28 border border-border bg-surface/40 p-5 sm:p-6" key={detail.label}>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.17em] text-muted">{detail.label}</p>
                    <p className="mt-4 break-words text-base font-semibold text-foreground sm:text-lg">{detail.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 border-t border-border pt-8" id="saved-addresses">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold">Delivery</p>
                  <h2 className="mt-3 font-display text-2xl tracking-[-0.03em] sm:text-[1.75rem]">Saved addresses</h2>
                </div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">{account.addressCount} saved</p>
              </div>
              <AddressManager addresses={account.addresses} />
            </section>

            <section className="mt-10 border-t border-border pt-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold">{account.orderCount} total {account.orderCount === 1 ? "order" : "orders"}</p>
                  <h2 className="mt-3 font-display text-2xl tracking-[-0.03em] sm:text-[1.75rem]">Recent orders</h2>
                </div>
                <Link className="text-xs font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light" href="/profile/orders">View all →</Link>
              </div>
              {account.recentOrders.length ? (
                <div className="mt-5 divide-y divide-border border-y border-border">
                  {account.recentOrders.map((order) => (
                    <div className="flex flex-wrap items-center justify-between gap-3 py-5" key={order.publicReference}>
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
