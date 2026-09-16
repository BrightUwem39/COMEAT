type LoadingSpinnerProps = {
  className?: string;
};

export function LoadingSpinner({ className = "size-4" }: LoadingSpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none ${className}`}
    />
  );
}
