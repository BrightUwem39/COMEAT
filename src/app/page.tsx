import { BrandStory } from "@/components/home/BrandStory";
import { CateringSection } from "@/components/home/CateringSection";
import { FeaturedDishes } from "@/components/home/FeaturedDishes";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { MenuPreview } from "@/components/home/MenuPreview";
import { OrderingSteps } from "@/components/home/OrderingSteps";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <ScrollReveal direction="left">
        <FeaturedDishes />
      </ScrollReveal>
      <ScrollReveal direction="right">
        <BrandStory />
      </ScrollReveal>
      <ScrollReveal direction="left">
        <MenuPreview />
      </ScrollReveal>
      <ScrollReveal direction="right">
        <CateringSection />
      </ScrollReveal>
      <ScrollReveal direction="left">
        <OrderingSteps />
      </ScrollReveal>
      <ScrollReveal direction="left">
        <Testimonials />
      </ScrollReveal>
      <ScrollReveal direction="right">
        <FinalCTA />
      </ScrollReveal>
    </main>
  );
}
