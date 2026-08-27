import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ProfileIcon } from "@/components/ui/ProfileIcon";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your ComEat profile, delivery details, preferences, and order history.",
};

const accountSections = [
  {
    title: "Personal details",
    status: "Not added yet",
    description: "Your name, email, and phone number will appear here after account access is configured.",
  },
  {
    title: "Saved addresses",
    status: "No saved addresses",
    description: "Save frequently used delivery locations for a faster checkout experience.",
  },
  {
    title: "Order history",
    status: "No orders yet",
    description: "Completed and active orders will be available here when ordering is connected.",
  },
  {
    title: "Food preferences",
    status: "No preferences saved",
    description: "Keep dietary requirements and allergy notes ready for future orders.",
  },
] as const;

export default function ProfilePage() {
  return (
    <main className="min-h-[calc(100svh-5rem)] bg-background" id="main-content">
      <section className="border-b border-border py-12 sm:py-16 lg:py-20">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Your account</p>
          <h1 className="mt-5 max-w-5xl font-display text-[clamp(3rem,8vw,7rem)] leading-[0.85] tracking-[-0.045em] text-foreground">Your ComEat profile.</h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-muted sm:text-base">A single place for delivery details, food preferences, and order history. Secure account access will be connected when the authentication provider is confirmed.</p>
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-5 lg:grid-cols-12">
            <aside className="border border-border bg-surface p-6 sm:p-8 lg:col-span-4">
              <div className="grid size-16 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                <ProfileIcon className="size-8" />
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-gold">Profile setup</p>
              <h2 className="mt-3 font-display text-4xl leading-none tracking-[-0.03em] text-foreground">Account access pending.</h2>
              <p className="mt-5 text-sm leading-6 text-muted">This frontend profile structure is ready for secure authentication and customer data in a later backend phase.</p>
            </aside>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {accountSections.map((section) => (
                <article className="border border-border bg-surface p-6 transition-[border-color,background-color,transform] duration-200 ease-out hover:-translate-y-1 hover:border-gold/50 hover:bg-surface-elevated motion-reduce:transform-none sm:p-8" key={section.title}>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange">{section.status}</p>
                  <h2 className="mt-4 font-display text-3xl leading-none tracking-[-0.025em] text-foreground">{section.title}</h2>
                  <p className="mt-5 text-sm leading-6 text-muted">{section.description}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
