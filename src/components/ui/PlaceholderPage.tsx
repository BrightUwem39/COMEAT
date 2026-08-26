import { Container } from "@/components/ui/Container";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  message: string;
};

export function PlaceholderPage({ eyebrow, title, message }: PlaceholderPageProps) {
  return (
    <main className="min-h-[70svh] py-20 sm:py-28" id="main-content">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
        <h1 className="mt-5 font-display text-6xl tracking-[-0.04em] sm:text-8xl">{title}</h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-muted">{message}</p>
      </Container>
    </main>
  );
}
