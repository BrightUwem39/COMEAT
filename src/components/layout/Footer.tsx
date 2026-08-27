import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Container } from "@/components/ui/Container";

const exploreLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/catering", label: "Catering" },
  { href: "/about", label: "About" },
];

const helpfulLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/profile", label: "Profile" },
  { href: "/cart", label: "Cart" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#080808]">
      <Container className="py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pb-8 lg:grid-cols-[1.5fr_0.65fr_0.65fr] lg:gap-12 lg:pb-10">
          <div className="col-span-2 lg:col-span-1">
            <BrandLogo
              imageClassName="size-20 transition-transform duration-300 ease-out group-hover/footer-logo:scale-105 motion-reduce:transform-none sm:size-24"
              linkClassName="group/footer-logo rounded-full"
            />
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted">Authentic Nigerian food, made to bring people together.</p>
            <a className="mt-3 inline-flex text-sm font-semibold text-foreground transition-colors duration-200 hover:text-gold" href="tel:+14045182891">
              404-518-2891
            </a>
          </div>

          <FooterLinks ariaLabel="Explore ComEat" links={exploreLinks} title="Explore" />
          <FooterLinks ariaLabel="Account and help" links={helpfulLinks} title="Helpful" />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p>© {new Date().getFullYear()} ComEat</p>
            <span aria-hidden="true" className="hidden size-1 rounded-full bg-gold sm:block" />
            <p>Flavorful, Unforgettable Experience</p>
          </div>

          <Link className="inline-flex w-fit items-center gap-2 font-bold uppercase tracking-[0.14em] text-foreground transition-colors duration-200 hover:text-gold" href="#main-content">
            <span>Back to top</span>
            <span aria-hidden="true">↑</span>
          </Link>
        </div>
      </Container>
    </footer>
  );
}

type FooterLinksProps = {
  ariaLabel: string;
  links: readonly { href: string; label: string }[];
  title: string;
};

function FooterLinks({ ariaLabel, links, title }: FooterLinksProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{title}</p>
      <nav aria-label={ariaLabel} className="mt-4 grid gap-2">
        {links.map((link) => (
          <Link className="w-fit py-0.5 text-sm text-muted transition-colors duration-200 hover:text-foreground" href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
