import { Container } from "@/components/ui/Container";

export function Testimonials() {
  return (
    <section className="border-y border-border bg-surface py-16 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">From the community</p>
          <div>
            <h2 className="font-display text-4xl leading-none tracking-[-0.03em] sm:text-6xl">Real words, from real tables.</h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted">Verified customer stories will appear here when they are provided. No placeholder reviews will be published.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
