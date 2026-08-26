import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function FinalCTA() {
  return (
    <section className="bg-gold py-20 text-background sm:py-28 lg:py-36">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Your table is waiting</p>
            <h2 className="mt-5 font-display text-[clamp(5rem,14vw,13rem)] leading-[0.72] tracking-[-0.055em]">Hungry yet?</h2>
          </div>
          <Button className="border-background bg-background text-foreground hover:border-surface hover:bg-surface" href="/menu">Order now</Button>
        </div>
      </Container>
    </section>
  );
}
