import type { Metadata } from "next";
import Link from "next/link";

import { inquiryStatusLabels, inquiryStatuses } from "@/lib/admin-inquiry";
import { getAdminInquiries } from "@/server/admin-inquiries";

export const metadata: Metadata = { title: "Enquiries | Admin" };

const statusStyles = {
  NEW: "bg-gold/12 text-gold",
  IN_REVIEW: "bg-orange/12 text-orange",
  CONTACTED: "bg-sky-400/10 text-sky-300",
  CLOSED: "bg-white/7 text-muted",
} as const;

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<{ page?: string | string[]; q?: string | string[]; status?: string | string[]; type?: string | string[] }> }) {
  const params = await searchParams;
  const query = firstValue(params.q);
  const status = firstValue(params.status);
  const type = firstValue(params.type);
  const page = Number.parseInt(firstValue(params.page) || "1", 10);
  const result = await getAdminInquiries({ page, query, status, type });
  const start = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const end = Math.min(result.page * result.pageSize, result.total);

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <header className="hero-reveal">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Inbox</p>
        <h1 className="mt-3 font-display text-[2rem] font-medium leading-none tracking-[-0.045em] sm:text-[2.55rem]">Customer enquiries</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Keep catering requests and customer messages moving in one place.</p>
      </header>

      <form className="hero-reveal hero-reveal-1 mt-7 grid gap-3 rounded-2xl bg-white/[0.04] p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] xl:items-end" method="get">
        <label className="block min-w-0">
          <span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">Search enquiries</span>
          <input className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold" defaultValue={result.query} name="q" placeholder="Customer, email, subject, or venue" type="search" />
        </label>
        <FilterSelect defaultValue={result.type ?? ""} label="Type" name="type" options={[{ label: "All types", value: "" }, { label: "Contact", value: "CONTACT" }, { label: "Catering", value: "CATERING" }]} />
        <FilterSelect defaultValue={result.status ?? ""} label="Status" name="status" options={[{ label: "All statuses", value: "" }, ...inquiryStatuses.map((option) => ({ label: inquiryStatusLabels[option], value: option }))]} />
        <button className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform] duration-300 hover:bg-gold-light active:scale-[0.98] motion-reduce:transform-none" type="submit">Apply filters</button>
      </form>

      <section className="hero-reveal hero-reveal-2 mt-6 overflow-hidden rounded-2xl bg-white/[0.035]" aria-label="Enquiry results">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <p className="text-xs text-muted">Showing <span className="font-semibold text-foreground">{start}–{end}</span> of {result.total}</p>
          {result.query || result.status || result.type ? <Link className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light" href="/admin/inquiries">Clear filters</Link> : null}
        </div>

        {result.inquiries.length ? (
          <div className="border-t border-white/8">
            <div className="hidden grid-cols-[0.7fr_1.2fr_1.1fr_0.8fr_0.8fr] gap-4 px-6 py-3 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted xl:grid">
              <span>Type</span><span>Customer</span><span>Subject</span><span>Status</span><span>Assigned</span>
            </div>
            <div className="divide-y divide-white/8">
              {result.inquiries.map((inquiry) => (
                <Link aria-label={`Open ${inquiry.type.toLowerCase()} enquiry from ${inquiry.customerName}`} className="grid gap-4 px-5 py-5 transition-colors duration-200 hover:bg-white/[0.035] sm:grid-cols-2 sm:px-6 xl:grid-cols-[0.7fr_1.2fr_1.1fr_0.8fr_0.8fr] xl:items-center xl:gap-4" href={`/admin/inquiries/${inquiry.type.toLowerCase()}/${inquiry.id}`} key={`${inquiry.type}-${inquiry.id}`}>
                  <div><span className="rounded-full bg-white/7 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-foreground">{inquiry.type === "CATERING" ? "Catering" : "Contact"}</span><p className="mt-2 text-xs text-muted">{formatDate(inquiry.createdAt)}</p></div>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{inquiry.customerName}</p><p className="mt-1 truncate text-xs text-muted">{inquiry.customerEmail}</p></div>
                  <div className="min-w-0"><p className="truncate text-sm">{inquiry.title}</p>{inquiry.eventDate ? <p className="mt-1 text-xs text-muted">Event {formatDate(inquiry.eventDate)}</p> : null}</div>
                  <div><span className={`inline-flex rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.09em] ${statusStyles[inquiry.status]}`}>{inquiry.statusLabel}</span></div>
                  <p className="truncate text-xs text-muted">{inquiry.assignedName ?? "Unassigned"}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="border-t border-white/8 px-5 py-14 text-center"><p className="text-sm font-semibold">No matching enquiries</p><p className="mt-2 text-xs text-muted">Try a different search, type, or status.</p></div>
        )}
      </section>

      {result.totalPages > 1 ? <nav aria-label="Enquiries pagination" className="mt-6 flex items-center justify-between gap-3">
        {result.page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-xs font-semibold transition-colors hover:border-gold/50 hover:text-gold" href={buildHref(result.page - 1, result.query, result.type, result.status)}>← Previous</Link> : <span />}
        <p className="text-xs text-muted">Page {result.page} of {result.totalPages}</p>
        {result.page < result.totalPages ? <Link className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-xs font-semibold transition-colors hover:border-gold/50 hover:text-gold" href={buildHref(result.page + 1, result.query, result.type, result.status)}>Next →</Link> : <span />}
      </nav> : null}
    </main>
  );
}

function FilterSelect({ defaultValue, label, name, options }: { defaultValue: string; label: string; name: string; options: { label: string; value: string }[] }) {
  return <label className="block"><span className="text-[0.61rem] font-bold uppercase tracking-[0.15em] text-muted">{label}</span><select className="mt-2 h-11 w-full border-b border-white/15 bg-transparent text-sm text-foreground outline-none transition-colors duration-200 focus:border-gold" defaultValue={defaultValue} name={name}>{options.map((option) => <option className="bg-surface" key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></label>;
}

function firstValue(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }

function buildHref(page: number, query: string, type: string | null, status: string | null) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type) params.set("type", type);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return suffix ? `/admin/inquiries?${suffix}` : "/admin/inquiries";
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "America/New_York" }).format(new Date(value)); }
