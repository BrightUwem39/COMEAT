import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gold py-20 text-background sm:py-24 lg:py-28">
      <div aria-hidden="true" className="final-cta-orb absolute -right-24 -top-32 size-96 rounded-full bg-gold-light/55 blur-3xl sm:size-[34rem]" />
      <Container className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Your table is waiting</p>
            <h2 className="mt-3 whitespace-nowrap font-display text-[clamp(3rem,14vw,13rem)] leading-[0.72] tracking-[-0.055em]">Hungry yet?</h2>
          </div>
          <Button className="group relative shrink-0 gap-3 overflow-hidden whitespace-nowrap border-background bg-background text-foreground transition-[border-color,background-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:border-surface hover:bg-surface hover:shadow-[0_16px_42px_rgba(5,5,5,0.3)]" href="/menu">
            <span aria-hidden="true" className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-[left] duration-700 ease-out group-hover:left-[140%]" />
            <span className="relative">Order now</span>
            <svg aria-hidden="true" className="relative size-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none" fill="none" viewBox="0 0 20 20">
              <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </Button>
        </div>
      </Container>
    </section>
  );
}
