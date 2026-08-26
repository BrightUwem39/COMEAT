import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  { number: "01", title: "Choose your food", copy: "Explore the menu and pick what belongs on your table." },
  { number: "02", title: "Customize your order", copy: "Select only the available options for each dish." },
  { number: "03", title: "Enter delivery details", copy: "Share the information needed to fulfill your order." },
  { number: "04", title: "Enjoy", copy: "Gather your people and make room at the table." },
];

export function OrderingSteps() {
  return (
    <section className="bg-surface py-20 sm:py-28 lg:py-36">
      <Container>
        <SectionHeading eyebrow="How it works" title="From our kitchen to your table." />
        <ol className="mt-14 grid border-t border-border lg:mt-20 lg:grid-cols-4">
          {steps.map((step) => (
            <li className="border-b border-border py-8 lg:border-b-0 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0" key={step.number}>
              <span className="text-xs font-bold tracking-[0.18em] text-gold">{step.number}</span>
              <h3 className="mt-12 font-display text-3xl leading-none tracking-[-0.025em]">{step.title}</h3>
              <p className="mt-4 text-sm leading-6 text-muted">{step.copy}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
