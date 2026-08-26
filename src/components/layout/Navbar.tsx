import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MobileMenu } from "./MobileMenu";

const navigation = [
  { href: "/menu", label: "Menu" },
  { href: "/catering", label: "Catering" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link className="font-display text-3xl tracking-[-0.04em] text-foreground" href="/" aria-label="ComEat home">
          ComEat<span className="text-gold">.</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link className="text-xs font-semibold uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link className="border border-gold bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-background transition-colors hover:border-gold-light hover:bg-gold-light" href="/menu">
            Order now
          </Link>
          <Link className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-gold" href="/cart">
            Cart <span className="text-muted">(0)</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <Link className="p-2 text-foreground" href="/cart" aria-label="View cart">
            <BagIcon />
          </Link>
          <MobileMenu navigation={navigation} />
        </div>
      </Container>
    </header>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="23" viewBox="0 0 24 24" width="23">
      <path d="M6.5 8.5h11l1 12h-13l1-12Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
