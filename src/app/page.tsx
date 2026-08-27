import { BrandStory } from "@/components/home/BrandStory";
import { CateringSection } from "@/components/home/CateringSection";
import { FeaturedDishes } from "@/components/home/FeaturedDishes";
import { FinalCTA } from "@/components/home/FinalCTA";
import { FoodGallery } from "@/components/home/FoodGallery";
import { Hero } from "@/components/home/Hero";
import { MenuPreview } from "@/components/home/MenuPreview";
import { OrderingSteps } from "@/components/home/OrderingSteps";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <ScrollReveal>
        <FeaturedDishes />
      </ScrollReveal>
      <ScrollReveal>
        <BrandStory />
      </ScrollReveal>
      <ScrollReveal>
        <MenuPreview />
      </ScrollReveal>
      <ScrollReveal>
        <CateringSection />
      </ScrollReveal>
      <OrderingSteps />
      <FoodGallery />
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </main>
  );
}
