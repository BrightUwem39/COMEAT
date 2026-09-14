"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ProfileActions } from "@/components/auth/ProfileActions";
import { BrandLogo } from "@/components/ui/BrandLogo";
import type { AdminSessionDTO } from "@/server/admin-auth";

const navigation = [
  { href: "/admin", icon: "dashboard" as const, label: "Overview", ready: true },
  { href: "/admin/orders", icon: "orders" as const, label: "Orders", ready: true },
  { href: "/admin/menu", icon: "menu" as const, label: "Menu", ready: true },
  { href: "/admin/inquiries", icon: "messages" as const, label: "Enquiries", ready: true },
  { href: "/admin/customers", icon: "customers" as const, label: "Customers", ready: true },
  { href: "/admin/activity", icon: "activity" as const, label: "Activity", ready: true },
];

export function AdminShell({ admin, children }: { admin: AdminSessionDTO; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeButtonRef.current?.focus();
      return;
    }
    if (wasOpen.current) menuButtonRef.current?.focus();
    wasOpen.current = false;
  }, [open]);

  return (
    <div className="min-h-dvh bg-background text-foreground [\&_a:focus-visible]:outline [\&_a:focus-visible]:outline-2 [\&_a:focus-visible]:outline-offset-2 [\&_a:focus-visible]:outline-gold [\&_button:focus-visible]:outline [\&_button:focus-visible]:outline-2 [\&_button:focus-visible]:outline-offset-2 [\&_button:focus-visible]:outline-gold [\&_input:focus-visible]:border-gold [\&_select:focus-visible]:border-gold [\&_summary:focus-visible]:outline [\&_summary:focus-visible]:outline-2 [\&_summary:focus-visible]:outline-offset-[-2px] [\&_summary:focus-visible]:outline-gold [\&_textarea:focus-visible]:border-gold lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-full bg-gold px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-background transition-transform focus:translate-y-0 motion-reduce:transition-none" href="#main-content">
        Skip to main content
      </a>
      <button
        aria-label="Close admin navigation"
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        tabIndex={open ? 0 : -1}
        type="button"
      />

      <aside
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(19rem,86vw)] flex-col overflow-y-auto border-r border-white/8 bg-[#090909] px-4 py-5 shadow-2xl transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none lg:sticky lg:top-0 lg:z-20 lg:h-dvh lg:w-auto lg:translate-x-0 lg:visible lg:shadow-none ${open ? "visible translate-x-0" : "invisible -translate-x-full"}`}
        id="admin-navigation"
        onKeyDown={(event) => {
          if (event.key !== "Tab" || window.matchMedia("(min-width: 1024px)").matches) return;
          const focusable = navigationRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
          if (!focusable?.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        ref={navigationRef}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <BrandLogo imageClassName="size-11" linkClassName="rounded-full" priority />
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold">ComEat</p>
              <p className="mt-0.5 text-xs text-muted">Admin console</p>
            </div>
          </div>
          <button
            aria-label="Close admin navigation"
            className="grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-white/8 hover:text-foreground lg:hidden"
            onClick={() => setOpen(false)}
            ref={closeButtonRef}
            type="button"
          >
            <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>
          </button>
        </div>

        <nav className="mt-9 space-y-1.5" aria-label="Dashboard sections">
          {navigation.map((item) => {
            const active = item.ready && (pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)));
            const classes = `flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-[background-color,color,transform] duration-200 ${active ? "bg-gold text-background" : "text-muted hover:bg-white/6 hover:text-foreground"}`;
            return item.ready ? (
              <Link aria-current={active ? "page" : undefined} className={classes} href={item.href} key={item.href} onClick={() => setOpen(false)}>
                <AdminNavIcon type={item.icon} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <span aria-disabled="true" className={`${classes} cursor-default opacity-55`} key={item.href}>
                <AdminNavIcon type={item.icon} />
                <span>{item.label}</span>
                <span className="ml-auto text-[0.55rem] font-bold uppercase tracking-[0.13em]">Soon</span>
              </span>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/8 px-2 pt-5">
          <div className="mb-4 flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/12 text-xs font-bold text-gold">
              {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{admin.firstName} {admin.lastName}</p>
              <p className="mt-0.5 truncate text-xs text-muted">Administrator</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ProfileActions />
            <Link className="inline-flex min-h-11 items-center px-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-gold" href="/">
              Storefront
            </Link>
          </div>
        </div>
      </aside>

      <div aria-hidden={open || undefined} className="min-w-0" inert={open || undefined}>
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-white/8 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
          <button
            aria-controls="admin-navigation"
            aria-expanded={open}
            aria-label="Open admin navigation"
            className="grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-white/8"
            onClick={() => setOpen(true)}
            ref={menuButtonRef}
            type="button"
          >
            <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>
          </button>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">Admin console</p>
          <span aria-hidden="true" className="size-11" />
        </header>
        <div className="relative isolate min-h-dvh overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_4%,rgba(230,165,26,0.1),transparent_24%),radial-gradient(circle_at_10%_92%,rgba(242,106,0,0.055),transparent_26%)]" />
          {children}
        </div>
      </div>
    </div>
  );
}

function AdminNavIcon({ type }: { type: "activity" | "customers" | "dashboard" | "menu" | "messages" | "orders" }) {
  const className = "size-[1.15rem] shrink-0";
  if (type === "activity") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "orders") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "menu") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M5 6h14M5 12h14M5 18h9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
  if (type === "messages") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M4 5.5h16v11H9l-5 4v-15Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "customers") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2m1-10a3 3 0 0 1 3 3m2 7v-2a5.5 5.5 0 0 0-3.2-5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
  return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
}
