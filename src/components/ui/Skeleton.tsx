type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`skeleton-shimmer ${className}`} />;
}

export function LoadingIndicator({ className = "" }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={`loading-indicator ${className}`}>
      <span className="loading-indicator-ring">
        <span className="loading-indicator-core" />
      </span>
      <span className="loading-indicator-label">Loading</span>
    </div>
  );
}
