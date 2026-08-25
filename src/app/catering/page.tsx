import { Container } from "@/components/ui/Container";

export default function CateringPage() {
  return (
    <main className="py-20">
      <Container>
        <p className="text-sm uppercase tracking-[0.2em] text-gold">ComEat</p>
        <h1 className="mt-4 font-display text-6xl sm:text-8xl">Catering</h1>
        <p className="mt-6 text-muted">
          Catering information will be added after client confirmation.
        </p>
      </Container>
    </main>
  );
}
