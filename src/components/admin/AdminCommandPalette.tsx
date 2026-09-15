"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type FormEvent } from "react";

import type { AdminPermission } from "@/server/admin-auth";

const quickLinks = [
  { href: "/admin/orders", label: "View active orders", permission: "ORDERS_VIEW" as const },
  { href: "/admin/menu", label: "Manage menu", permission: "MENU_MANAGE" as const },
  { href: "/admin/inventory", label: "Check inventory", permission: "INVENTORY_MANAGE" as const },
  { href: "/admin/analytics", label: "Open analytics", permission: "ANALYTICS_VIEW" as const },
  { href: "/admin/promotions", label: "Manage promotions", permission: "PROMOTIONS_MANAGE" as const },
  { href: "/admin/reports", label: "Export reports", permission: "REPORTS_EXPORT" as const },
];

export function AdminCommandPalette({ onClose, open, permissions }: { onClose: () => void; open: boolean; permissions: AdminPermission[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => { cancelAnimationFrame(frame); document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", close); previousFocusRef.current?.focus(); };
  }, [onClose, open]);
  if (!open) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const query = String(data.get("q") ?? "").trim(); if (query.length < 2) return; onClose(); router.push(`/admin/search?q=${encodeURIComponent(query)}`); };
  const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key !== "Tab") return; const elements = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'); if (!elements?.length) return; const first = elements[0]; const last = elements[elements.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } };
  return <div aria-label="Search admin workspace" aria-modal="true" className="fixed inset-0 z-[80] grid items-start justify-items-center overflow-y-auto bg-black/75 px-4 pb-10 pt-[12vh] backdrop-blur-sm" onKeyDown={trapFocus} role="dialog"><button aria-label="Close search" className="fixed inset-0 cursor-default" onClick={onClose} tabIndex={-1} type="button" /><div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#101010] shadow-2xl" ref={panelRef}><form className="flex items-center gap-3 border-b border-white/8 px-4" onSubmit={submit}><svg aria-hidden="true" className="size-5 shrink-0 text-gold" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" /><path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg><label className="sr-only" htmlFor="admin-command-search">Search orders, customers, menu, and operations</label><input autoComplete="off" className="h-16 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted" id="admin-command-search" name="q" placeholder="Search the workspace…" ref={inputRef} /><button className="min-h-11 whitespace-nowrap text-[0.62rem] font-bold uppercase tracking-[0.1em] text-gold" type="submit">Search</button></form><div className="p-3"><p className="px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.15em] text-muted">Quick actions</p>{quickLinks.filter((item) => permissions.includes(item.permission)).map((item) => <Link className="flex min-h-12 items-center justify-between rounded-xl px-3 text-sm transition-colors hover:bg-white/[0.055] hover:text-gold" href={item.href} key={item.href} onClick={onClose}><span>{item.label}</span><span aria-hidden="true" className="text-muted">→</span></Link>)}</div><p className="border-t border-white/8 px-5 py-3 text-[0.62rem] text-muted">Press Esc to close · Enter to search</p></div></div>;
}
