import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center px-4 py-12 sm:px-6 lg:min-h-dvh" id="main-content">
      <section aria-labelledby="admin-not-found-heading" className="hero-reveal w-full max-w-xl rounded-2xl bg-white/[0.04] p-6 text-center sm:p-8">
        <p className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-gold">Record unavailable</p>
        <h1 className="mt-3 font-display text-2xl font-medium tracking-[-0.04em] sm:text-3xl" id="admin-not-found-heading">We could not find that admin record.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">It may have been removed, or the link may no longer be valid.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform] duration-300 hover:bg-gold-light active:scale-[0.98] motion-reduce:transform-none" href="/admin">Dashboard</Link>
          <Link className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-white/12 px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] transition-colors hover:border-gold/50 hover:text-gold" href="/admin/orders">View orders</Link>
        </div>
      </section>
    </main>
  );
}
