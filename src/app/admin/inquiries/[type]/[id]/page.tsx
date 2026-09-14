import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InquiryUpdateForm } from "@/components/admin/InquiryUpdateForm";
import { getAdminInquiryDetail } from "@/server/admin-inquiries";

export const metadata: Metadata = { title: "Enquiry details | Admin" };

const statusStyles = { NEW: "bg-gold/12 text-gold", IN_REVIEW: "bg-orange/12 text-orange", CONTACTED: "bg-sky-400/10 text-sky-300", CLOSED: "bg-white/7 text-muted" } as const;

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string; type: string }> }) {
  const { id, type } = await params;
  const inquiry = await getAdminInquiryDetail(type, id);
  if (!inquiry) notFound();

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <Link className="hero-reveal inline-flex min-h-11 items-center text-[0.64rem] font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light" href="/admin/inquiries">← All enquiries</Link>
      <header className="hero-reveal hero-reveal-1 mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0"><p className="text-[0.63rem] font-bold uppercase tracking-[0.19em] text-muted">{inquiry.type === "CATERING" ? "Catering request" : "Contact message"}</p><h1 className="mt-3 max-w-3xl font-display text-[2rem] font-medium leading-[1.04] tracking-[-0.045em] sm:text-[2.55rem]">{inquiry.title}</h1><p className="mt-3 text-sm text-muted">Received {formatDateTime(inquiry.createdAt)}</p></div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-[0.63rem] font-bold uppercase tracking-[0.1em] ${statusStyles[inquiry.status]}`}>{inquiry.statusLabel}</span>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="space-y-6">
          <section className="hero-reveal hero-reveal-2 rounded-2xl bg-white/[0.035] p-5 sm:p-6">
            <p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Customer</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]">Contact details</h2>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><Detail label="Name" value={inquiry.customerName} /><Detail label="Email" value={inquiry.customerEmail} /><Detail label="Phone" value={inquiry.customerPhone || "Not provided"} /><Detail label="Assigned" value={inquiry.assignedName || "Unassigned"} /></dl>
            <div className="mt-5 flex flex-wrap gap-2"><ContactLink href={`mailto:${inquiry.customerEmail}`} label="Send email" />{inquiry.customerPhone ? <ContactLink href={`tel:${inquiry.customerPhone}`} label="Call customer" /> : null}</div>
          </section>

          {inquiry.type === "CATERING" ? <section className="hero-reveal hero-reveal-2 rounded-2xl bg-white/[0.035] p-5 sm:p-6"><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Event</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]">Gathering details</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><Detail label="Event type" value={inquiry.eventType || "Not provided"} /><Detail label="Date" value={inquiry.eventDate ? formatDate(inquiry.eventDate) : "Not provided"} /><Detail label="Guests" value={inquiry.guestCount ? inquiry.guestCount.toLocaleString("en-US") : "Not provided"} /><Detail label="Venue" value={inquiry.venue || "Not provided"} /></dl></section> : null}

          <section className="hero-reveal hero-reveal-3 rounded-2xl bg-white/[0.035] p-5 sm:p-6"><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Message</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]">What they shared</h2><p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-foreground">{inquiry.message}</p></section>
        </div>

        <aside className="hero-reveal hero-reveal-3 xl:sticky xl:top-6">
          <section className="rounded-2xl bg-white/[0.045] p-5"><p className="text-[0.61rem] font-bold uppercase tracking-[0.17em] text-gold">Manage</p><h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em]">Enquiry workflow</h2><p className="mt-3 text-xs leading-5 text-muted">Update progress, ownership, and private notes.</p><div className="mt-5"><InquiryUpdateForm assignedName={inquiry.assignedName} id={inquiry.id} internalNote={inquiry.internalNote} key={inquiry.updatedAt} status={inquiry.status} type={inquiry.type} updatedAt={inquiry.updatedAt} /></div></section>
        </aside>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/[0.025] px-4 py-3"><dt className="text-[0.58rem] font-bold uppercase tracking-[0.13em] text-muted">{label}</dt><dd className="mt-2 break-words font-medium text-foreground">{value}</dd></div>; }
function ContactLink({ href, label }: { href: string; label: string }) { return <a className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-[0.63rem] font-bold uppercase tracking-[0.11em] transition-[border-color,color,background-color] duration-300 hover:border-gold/50 hover:bg-gold/8 hover:text-gold" href={href}>{label}</a>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(value)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(value)); }
