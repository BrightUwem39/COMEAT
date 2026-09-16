import { Skeleton } from "@/components/ui/Skeleton";

export default function SiteLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading page"
      className="min-h-[70dvh] bg-background px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8"
      id="main-content"
    >
      <span className="sr-only" role="status">
        Loading page.
      </span>

      <div className="mx-auto w-full max-w-7xl" aria-hidden="true">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="mt-5 h-10 w-3/4 max-w-xl rounded-xl sm:h-12" />
        <div className="mt-4 max-w-2xl space-y-2.5">
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-4/6 rounded-full" />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div className={index > 2 ? "hidden sm:block" : "block"} key={index}>
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              <Skeleton className="mt-4 h-5 w-3/5 rounded-full" />
              <Skeleton className="mt-2.5 h-3.5 w-4/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
