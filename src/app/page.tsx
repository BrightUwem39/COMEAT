import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center py-20 sm:py-28">
      <Container>
        <div className="max-w-4xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Nigerian food, made with intention
          </p>
          <h1 className="font-display text-6xl leading-[0.88] tracking-[-0.035em] text-foreground sm:text-8xl lg:text-[8.5rem]">
            A taste that
            <br />
            feels like home.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-muted sm:text-lg">
            The ComEat ordering experience is being prepared. Our full menu and
            catering pages are coming next.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/menu">Explore menu</Button>
            <Button href="/catering" variant="secondary">
              Catering
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
