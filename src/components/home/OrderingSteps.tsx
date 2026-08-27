import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
        <SectionHeading eyebrow="How it works" singleLine title="From our kitchen to your table." />
        <ol className="mt-10 grid border-t border-border lg:mt-14 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li className="relative border-b border-border py-8 lg:border-b-0 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0" key={step.title}>
              <h3 className="font-display text-3xl leading-none tracking-[-0.025em]">{step.title}</h3>
              <p className="mt-4 text-sm leading-6 text-muted">{step.copy}</p>
              {index < steps.length - 1 ? (
                <span aria-hidden="true" className="absolute -bottom-5 left-1/2 z-10 grid size-10 -translate-x-1/2 rotate-90 place-items-center rounded-full border border-orange/50 bg-surface text-orange shadow-[0_8px_24px_rgba(0,0,0,0.3)] lg:-right-5 lg:bottom-auto lg:left-auto lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:rotate-0">
                  <svg className="size-4" fill="none" viewBox="0 0 20 20">
                    <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
