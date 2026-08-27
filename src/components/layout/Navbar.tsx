import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Container } from "@/components/ui/Container";
import { ProfileIcon } from "@/components/ui/ProfileIcon";
import { MobileMenu } from "./MobileMenu";

const navigation = [
  { href: "/menu", label: "Menu" },
  { href: "/catering", label: "Catering" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-[background-color,box-shadow] duration-300">
      <Container className="flex h-20 items-center justify-between gap-6">
        <div className="hidden lg:block">
          <BrandLogo
            imageClassName="size-16 transition-transform duration-500 ease-out group-hover/logo:-rotate-3 group-hover/logo:scale-110 group-active/logo:scale-95 motion-reduce:transform-none"
            linkClassName="group/logo rounded-full transition-[filter] duration-500 hover:drop-shadow-[0_0_12px_rgba(230,165,26,0.45)]"
            priority
          />
        </div>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link className="relative py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted transition-[color,transform] duration-300 ease-out after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:-translate-y-0.5 hover:text-gold hover:after:scale-x-100 focus-visible:text-gold focus-visible:after:scale-x-100 motion-reduce:transform-none motion-reduce:after:transition-none" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link className="transform-gpu border border-gold bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-background transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-light hover:bg-gold-light hover:shadow-[0_8px_28px_rgba(230,165,26,0.28)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none" href="/menu">
            Order now
          </Link>
          <Link aria-label="View profile" className="group/profile rounded-full p-2 text-foreground transition-[background-color,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-gold/10 hover:text-gold active:scale-90 motion-reduce:transform-none" href="/profile">
            <ProfileIcon className="size-[23px] transition-transform duration-200 ease-out group-hover/profile:scale-105 motion-reduce:transform-none" />
          </Link>
          <Link className="group/cart relative py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-[color,transform] duration-300 ease-out after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:-translate-y-0.5 hover:text-gold hover:after:scale-x-100 focus-visible:text-gold focus-visible:after:scale-x-100 motion-reduce:transform-none motion-reduce:after:transition-none" href="/cart">
            Cart <span className="text-muted transition-colors duration-300 group-hover/cart:text-gold-light">(0)</span>
          </Link>
        </div>

        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center lg:hidden">
          <div className="justify-self-start">
            <MobileMenu navigation={navigation} />
          </div>

          <BrandLogo
            imageClassName="size-16 transition-transform duration-500 ease-out group-hover/logo:-rotate-3 group-hover/logo:scale-110 group-active/logo:scale-95 motion-reduce:transform-none"
            linkClassName="group/logo rounded-full transition-[filter] duration-500 hover:drop-shadow-[0_0_12px_rgba(230,165,26,0.45)]"
            priority
          />

          <div className="flex items-center justify-self-end">
            <Link aria-label="View profile" className="group/profile rounded-full p-2 text-foreground transition-[background-color,color,transform] duration-200 hover:bg-gold/10 hover:text-gold active:scale-90 motion-reduce:transform-none" href="/profile">
              <ProfileIcon className="size-[22px] transition-transform duration-200 ease-out group-hover/profile:scale-105 motion-reduce:transform-none" />
            </Link>
            <Link className="group rounded-full p-2 text-foreground transition-[background-color,color,transform] duration-300 hover:bg-gold/10 hover:text-gold active:scale-90 motion-reduce:transform-none" href="/cart" aria-label="View cart">
              <BagIcon />
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 motion-reduce:transform-none" fill="none" height="23" viewBox="0 0 24 24" width="23">
      <path d="M6.5 8.5h11l1 12h-13l1-12Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
