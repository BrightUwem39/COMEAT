"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ProfileActions } from "@/components/auth/ProfileActions";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { BrandLogo } from "@/components/ui/BrandLogo";
import type { AdminPermission, AdminSessionDTO } from "@/server/admin-auth";

const navigation = [
  { href: "/admin", icon: "dashboard" as const, label: "Overview", permission: "OVERVIEW_VIEW" as const },
  { href: "/admin/orders", icon: "orders" as const, label: "Orders", permission: "ORDERS_VIEW" as const },
  { href: "/admin/menu", icon: "menu" as const, label: "Menu", permission: "MENU_MANAGE" as const },
  { href: "/admin/inquiries", icon: "messages" as const, label: "Enquiries", permission: "INQUIRIES_MANAGE" as const },
  { href: "/admin/customers", icon: "customers" as const, label: "Customers", permission: "CUSTOMERS_VIEW" as const },
  { href: "/admin/analytics", icon: "analytics" as const, label: "Analytics", permission: "ANALYTICS_VIEW" as const },
  { href: "/admin/promotions", icon: "promotions" as const, label: "Promotions", permission: "PROMOTIONS_MANAGE" as const },
  { href: "/admin/inventory", icon: "inventory" as const, label: "Inventory", permission: "INVENTORY_MANAGE" as const },
  { href: "/admin/staff", icon: "staff" as const, label: "Staff", permission: "STAFF_MANAGE" as const },
  { href: "/admin/reports", icon: "reports" as const, label: "Reports", permission: "REPORTS_EXPORT" as const },
  { href: "/admin/activity", icon: "activity" as const, label: "Activity", permission: "AUDIT_VIEW" as const },
];

export function AdminShell({ admin, children, notificationCount }: { admin: AdminSessionDTO; children: ReactNode; notificationCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const openPalette = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", openPalette);
    return () => window.removeEventListener("keydown", openPalette);
  }, []);

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
        aria-hidden={paletteOpen || undefined}
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(19rem,86vw)] flex-col overflow-y-auto border-r border-white/8 bg-[#090909] px-4 py-5 shadow-2xl transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none lg:sticky lg:top-0 lg:z-20 lg:h-dvh lg:w-auto lg:translate-x-0 lg:visible lg:shadow-none ${open ? "visible translate-x-0" : "invisible -translate-x-full"}`}
        id="admin-navigation"
        inert={paletteOpen || undefined}
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

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_3rem] gap-2 px-1">
          <button className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl bg-white/[0.045] px-3.5 text-left text-sm text-muted transition-colors hover:bg-white/[0.07] hover:text-foreground" onClick={() => setPaletteOpen(true)} type="button"><SearchIcon /><span className="truncate">Search workspace</span><kbd className="ml-auto hidden rounded-md bg-white/7 px-1.5 py-1 text-[0.56rem] font-semibold text-muted xl:inline">⌘K</kbd></button>
          <NotificationLink count={notificationCount} />
        </div>

        <nav className="mt-4 space-y-1.5" aria-label="Dashboard sections">
          {navigation.filter((item) => admin.permissions.includes(item.permission as AdminPermission)).map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
            const classes = `flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-[background-color,color,transform] duration-200 ${active ? "bg-gold text-background" : "text-muted hover:bg-white/6 hover:text-foreground"}`;
            return (
              <Link aria-current={active ? "page" : undefined} className={classes} href={item.href} key={item.href} onClick={() => setOpen(false)}>
                <AdminNavIcon type={item.icon} />
                <span>{item.label}</span>
              </Link>
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
              <p className="mt-0.5 truncate text-xs text-muted">{admin.roleLabel}</p>
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

      <div aria-hidden={open || paletteOpen || undefined} className="min-w-0" inert={open || paletteOpen || undefined}>
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
          <NotificationLink count={notificationCount} />
        </header>
        <div className="relative isolate min-h-dvh overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_4%,rgba(230,165,26,0.1),transparent_24%),radial-gradient(circle_at_10%_92%,rgba(242,106,0,0.055),transparent_26%)]" />
          {children}
        </div>
      </div>
      <AdminCommandPalette onClose={() => setPaletteOpen(false)} open={paletteOpen} permissions={admin.permissions} />
    </div>
  );
}

function AdminNavIcon({ type }: { type: "activity" | "analytics" | "customers" | "dashboard" | "inventory" | "menu" | "messages" | "orders" | "promotions" | "reports" | "staff" }) {
  const className = "size-[1.15rem] shrink-0";
  if (type === "activity") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "orders") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "menu") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M5 6h14M5 12h14M5 18h9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
  if (type === "messages") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M4 5.5h16v11H9l-5 4v-15Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "customers") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2m1-10a3 3 0 0 1 3 3m2 7v-2a5.5 5.5 0 0 0-3.2-5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
  if (type === "analytics") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "promotions") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M20 13 13 20 4 11V4h7l9 9Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /><circle cx="8.5" cy="8.5" r="1" fill="currentColor" /></svg>;
  if (type === "inventory") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9ZM4 7.5l8 4.5 8-4.5M12 12v9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  if (type === "staff") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2m3-13v6m-3-3h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
  if (type === "reports") return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6V3Zm9 0v4h4M9 12h6m-6 4h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
  return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24"><path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
}

function SearchIcon() { return <svg aria-hidden="true" className="size-[1.15rem] shrink-0" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" /><path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>; }
function NotificationLink({ count }: { count: number }) { return <Link aria-label={`Notifications${count ? `, ${count} requiring attention` : ""}`} className="relative grid size-12 place-items-center rounded-xl bg-white/[0.045] text-muted transition-colors hover:bg-white/[0.07] hover:text-gold" href="/admin/notifications"><svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 6 2.5 6 2.5 7H4c0-1 2.5-1 2.5-7ZM10 20h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>{count ? <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-orange px-1 text-[0.5rem] font-bold leading-none text-white">{count > 99 ? "99+" : count}</span> : null}</Link>; }
