import type { Metadata } from "next";

import { BrandStory } from "@/components/home/BrandStory";
import { CateringSection } from "@/components/home/CateringSection";
import { FeaturedDishes } from "@/components/home/FeaturedDishes";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { MenuPreview } from "@/components/home/MenuPreview";
import { OrderingSteps } from "@/components/home/OrderingSteps";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Testimonials } from "@/components/home/Testimonials";

export const metadata: Metadata = {
  title: "Nigerian Food Trays & Catering",
  description: "Order Nigerian dishes by the tray from ComEat or send details for catering a wedding, birthday, office event, or family gathering.",
};

export default function Home() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://comeat-drab.vercel.app";
  const siteUrl = (configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`).replace(/\/+$/, "");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FoodEstablishment",
        "@id": `${siteUrl}/#business`,
        name: "ComEat",
        url: siteUrl,
        logo: `${siteUrl}/images/comeat-logo.png`,
        telephone: "+1-404-518-2891",
        slogan: "Flavorful, Unforgettable Experience",
        servesCuisine: "Nigerian",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "ComEat",
        url: siteUrl,
        publisher: {
          "@id": `${siteUrl}/#business`,
        },
      },
    ],
  };

  return (
    <main id="main-content">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
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
