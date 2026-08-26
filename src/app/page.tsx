import { BrandStory } from "@/components/home/BrandStory";
import { CateringSection } from "@/components/home/CateringSection";
import { FeaturedDishes } from "@/components/home/FeaturedDishes";
import { FinalCTA } from "@/components/home/FinalCTA";
import { FoodGallery } from "@/components/home/FoodGallery";
import { Hero } from "@/components/home/Hero";
import { MenuPreview } from "@/components/home/MenuPreview";
import { OrderingSteps } from "@/components/home/OrderingSteps";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <FeaturedDishes />
      <BrandStory />
      <MenuPreview />
      <CateringSection />
      <OrderingSteps />
      <FoodGallery />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}
