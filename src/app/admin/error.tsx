"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Admin workspace error", error);
  }, [error]);

  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center px-4 py-12 sm:px-6 lg:min-h-dvh" id="main-content">
      <section aria-labelledby="admin-error-heading" className="hero-reveal w-full max-w-xl rounded-2xl bg-white/[0.04] p-6 text-center sm:p-8">
        <span aria-hidden="true" className="mx-auto grid size-12 place-items-center rounded-full bg-orange/10 text-orange">
          <svg className="size-5" fill="none" viewBox="0 0 24 24"><path d="M12 8v5m0 3.5v.1M12 3.5 21 20H3L12 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>
        </span>
        <p className="mt-5 text-[0.63rem] font-bold uppercase tracking-[0.18em] text-orange">Unable to load</p>
        <h1 className="mt-3 font-display text-2xl font-medium tracking-[-0.04em] sm:text-3xl" id="admin-error-heading">The admin workspace hit a problem.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">No changes were made. Try loading this section again or return to the dashboard.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform] duration-300 hover:bg-gold-light active:scale-[0.98] motion-reduce:transform-none" onClick={() => retry()} type="button">Try again</button>
          <Link className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-white/12 px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] transition-colors hover:border-gold/50 hover:text-gold" href="/admin">Dashboard</Link>
        </div>
        {error.digest ? <p className="mt-5 text-[0.65rem] text-muted">Reference: {error.digest}</p> : null}
      </section>
    </main>
  );
}
