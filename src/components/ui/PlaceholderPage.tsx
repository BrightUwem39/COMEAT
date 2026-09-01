import { Container } from "@/components/ui/Container";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  message: string;
};

export function PlaceholderPage({ eyebrow, title, message }: PlaceholderPageProps) {
  return (
    <main className="min-h-[70svh] py-12 sm:py-16 lg:py-20" id="main-content">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-[2rem] leading-[1.02] tracking-[-0.04em] sm:text-[2.5rem] lg:text-5xl">{title}</h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">{message}</p>
      </Container>
    </main>
  );
}
