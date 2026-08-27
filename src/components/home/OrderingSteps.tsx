import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { OrderingStep } from "@/components/home/OrderingStep";

const steps = [
  { title: "Choose your food", copy: "Explore the menu and pick what belongs on your table." },
  { title: "Customize your order", copy: "Select only the available options for each dish." },
  { title: "Enter delivery details", copy: "Share the information needed to fulfill your order." },
  { title: "Enjoy", copy: "Gather your people and make room at the table." },
];

export function OrderingSteps() {
  return (
    <section className="bg-surface py-12 sm:py-16 lg:py-20">
      <Container>
        <ScrollReveal>
          <SectionHeading eyebrow="How it works" singleLine title="From our kitchen to your table." />
        </ScrollReveal>
        <ol className="mt-10 grid border-t border-border lg:mt-14 lg:grid-cols-4">
          {steps.map((step, index) => <OrderingStep {...step} index={index} key={step.title} showArrow={index < steps.length - 1} />)}
        </ol>
      </Container>
    </section>
  );
}
