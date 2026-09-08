import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function BrandStory() {
  return (
    <section className="bg-foreground py-8 sm:py-10 lg:py-12">
      <Container>
        <div className="grid items-center gap-12 xl:grid-cols-12 xl:gap-16">
          <div className="xl:col-span-6">
            <div className="xl:[&_h2]:text-8xl">
              <SectionHeading
                description="Food with warmth, depth, and a place at the center of the table. ComEat brings familiar Nigerian dishes into a modern, generous dining experience."
                eyebrow="Our point of view"
                light
                title={<><span className="whitespace-nowrap">Nigerian food.</span><br /><span className="whitespace-nowrap">No shortcuts.</span></>}
              />
            </div>
            {/* <div className="mt-10 flex items-center gap-5 text-background">
              <span className="font-display text-5xl text-orange">17</span>
              <span className="max-w-40 text-xs font-bold uppercase leading-5 tracking-[0.16em]">confirmed dishes across three menu categories</span>
            </div> */}
          </div>
          <div className="relative min-h-[520px] overflow-hidden xl:col-span-6 xl:min-h-[700px]">
            <Image alt="ComEat efo riro with meat" className="object-cover" fill sizes="(min-width: 1024px) 50vw, 100vw" src="/images/menu/efo-riro.webp" />
          </div>
        </div>
      </Container>
    </section>
  );
}
