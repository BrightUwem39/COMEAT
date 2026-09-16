import { LoadingIndicator, Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading administrator workspace"
      className="px-4 pb-12 pt-6 sm:px-6 sm:pt-8 xl:px-9"
      id="main-content"
    >
      <span className="sr-only" role="status">
        Loading administrator workspace.
      </span>
      <div aria-hidden="true">
        <LoadingIndicator className="mb-7" />
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="mt-4 h-9 w-52 max-w-full rounded-lg" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full rounded-full" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-24 rounded-2xl" key={index} />
          ))}
        </div>
        <div className="mt-8 grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
