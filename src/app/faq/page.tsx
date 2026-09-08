import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Ordering & Catering FAQs",
  description: "Find ComEat information about tray orders, delivery, catering, food allergies, and payments.",
};

export default function FaqPage() {
  return <PlaceholderPage eyebrow="FAQ" title="Good questions deserve clear answers." message="Confirmed ordering, delivery, catering, allergy, and payment policies will be published here when supplied by the client." />;
}
