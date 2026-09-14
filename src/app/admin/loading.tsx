export default function AdminLoading() {
  return (
    <main aria-busy="true" aria-label="Loading administrator workspace" className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9" id="main-content">
      <span className="sr-only" role="status">Loading administrator workspace.</span>
      <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
        <div className="h-3 w-24 rounded-full bg-gold/20" />
        <div className="mt-4 h-9 w-52 max-w-full rounded-lg bg-white/8" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/5" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div className="h-24 rounded-2xl bg-white/[0.04]" key={index} />)}
        </div>
        <div className="mt-8 h-72 rounded-2xl bg-white/[0.035]" />
      </div>
    </main>
  );
}
