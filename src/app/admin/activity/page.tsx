import type { Metadata } from "next";
import Link from "next/link";

import {
  adminAuditActionLabels,
  adminAuditEntityLabels,
  getAdminAuditLogs,
} from "@/server/admin-audit";

export const metadata: Metadata = { title: "Activity | Admin" };

export default async function AdminActivityPage({ searchParams }: { searchParams: Promise<{ action?: string | string[]; entityType?: string | string[]; page?: string | string[]; q?: string | string[] }> }) {
  const params = await searchParams;
  const query = firstValue(params.q);
  const action = firstValue(params.action);
  const entityType = firstValue(params.entityType);
  const page = Number.parseInt(firstValue(params.page) || "1", 10);
  const result = await getAdminAuditLogs({ action, entityType, page, query });
  const start = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const end = Math.min(result.page * result.pageSize, result.total);

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <header className="hero-reveal">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Security</p>
        <h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">Admin activity</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">A permanent record of sensitive operational changes.</p>
      </header>

      <div className="hero-reveal hero-reveal-1 mt-7 flex items-start gap-3 rounded-2xl bg-gold/[0.07] px-4 py-4 sm:max-w-3xl sm:px-5">
        <svg aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gold" fill="none" viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.8 2.8 8.2 7 10 4.2-1.8 7-5.2 7-10V6l-7-3Zm-3 9 2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>
        <p className="text-xs leading-5 text-muted"><strong className="text-foreground">Transactional audit protection is active.</strong> Menu, order, enquiry, and customer-access changes cannot complete without their matching activity record.</p>
      </div>

      <form className="hero-reveal hero-reveal-2 mt-7 grid gap-3 rounded-2xl bg-white/[0.04] p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1fr)_14rem_13rem_auto] xl:items-end" method="get">
        <label className="block min-w-0"><span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Search activity</span><input className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold" defaultValue={result.query} name="q" placeholder="Administrator or record ID" type="search" /></label>
        <AuditSelect defaultValue={result.action ?? ""} label="Action" name="action" options={[{ label: "All actions", value: "" }, ...Object.entries(adminAuditActionLabels).map(([value, label]) => ({ label, value }))]} />
        <AuditSelect defaultValue={result.entityType ?? ""} label="Record type" name="entityType" options={[{ label: "All records", value: "" }, ...Object.entries(adminAuditEntityLabels).map(([value, label]) => ({ label, value }))]} />
        <button className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform] duration-300 hover:bg-gold-light active:scale-[0.98] motion-reduce:transform-none" type="submit">Apply filters</button>
      </form>

      <section className="hero-reveal hero-reveal-3 mt-6 overflow-hidden rounded-2xl bg-white/[0.035]" aria-label="Administrator activity records">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"><p className="text-xs text-muted">Showing <span className="font-semibold text-foreground">{start}–{end}</span> of {result.total}</p>{result.query || result.action || result.entityType ? <Link className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light" href="/admin/activity">Clear filters</Link> : null}</div>
        {result.logs.length ? <div className="divide-y divide-white/8 border-t border-white/8">{result.logs.map((log) => <article className="grid gap-4 px-5 py-5 transition-colors duration-200 hover:bg-white/[0.035] sm:px-6 lg:grid-cols-[1.15fr_1fr_1fr_auto] lg:items-center" key={log.id}>
          <div><p className="text-sm font-semibold">{log.actionLabel}</p><p className="mt-1 text-xs text-muted">{formatDateTime(log.createdAt)}</p></div>
          <div className="min-w-0"><p className="truncate text-sm">{log.actorName}</p><p className="mt-1 truncate text-xs text-muted">{log.actor.email}</p></div>
          <div className="min-w-0"><p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-gold">{log.entityLabel}</p><p className="mt-1 truncate text-xs text-muted" title={log.entityId}>{log.entityId}</p><p className="mt-2 text-xs text-foreground">{log.summary}</p></div>
          {log.targetHref ? <Link className="inline-flex min-h-11 w-fit items-center whitespace-nowrap rounded-full border border-white/12 px-4 text-[0.61rem] font-bold uppercase tracking-[0.1em] transition-[border-color,color,background-color] hover:border-gold/50 hover:bg-gold/8 hover:text-gold" href={log.targetHref}>Open record</Link> : null}
        </article>)}</div> : <div className="border-t border-white/8 px-5 py-14 text-center"><p className="text-sm font-semibold">No activity recorded</p><p className="mt-2 text-xs text-muted">Administrator changes will appear here automatically.</p></div>}
      </section>

      {result.totalPages > 1 ? <nav aria-label="Activity pagination" className="mt-6 flex items-center justify-between gap-3">{result.page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-xs font-semibold transition-colors hover:border-gold/50 hover:text-gold" href={buildHref(result.page - 1, result.query, result.action, result.entityType)}>← Previous</Link> : <span />}<p className="text-xs text-muted">Page {result.page} of {result.totalPages}</p>{result.page < result.totalPages ? <Link className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-xs font-semibold transition-colors hover:border-gold/50 hover:text-gold" href={buildHref(result.page + 1, result.query, result.action, result.entityType)}>Next →</Link> : <span />}</nav> : null}
    </main>
  );
}

function AuditSelect({ defaultValue, label, name, options }: { defaultValue: string; label: string; name: string; options: { label: string; value: string }[] }) { return <label className="block"><span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">{label}</span><select className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 focus:border-gold" defaultValue={defaultValue} name={name}>{options.map((option) => <option className="bg-surface" key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></label>; }
function firstValue(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }
function buildHref(page: number, query: string, action: string | null, entityType: string | null) { const params = new URLSearchParams(); if (query) params.set("q", query); if (action) params.set("action", action); if (entityType) params.set("entityType", entityType); if (page > 1) params.set("page", String(page)); const suffix = params.toString(); return suffix ? `/admin/activity?${suffix}` : "/admin/activity"; }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(value)); }
