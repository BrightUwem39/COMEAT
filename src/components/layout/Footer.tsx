import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Container } from "@/components/ui/Container";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/catering", label: "Catering" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-14 sm:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <BrandLogo imageClassName="size-36" />
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted">Authentic Nigerian food, made to bring people together.</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Explore</p>
            <nav className="mt-5 grid gap-3" aria-label="Footer navigation">
              {links.map((link) => (
                <Link className="w-fit text-sm text-muted transition-colors hover:text-foreground" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Information</p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted">Delivery, allergen, privacy, terms, and social details will be added after client confirmation.</p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ComEat</p>
          <p>Made for gathering.</p>
        </div>
      </Container>
    </footer>
  );
}
