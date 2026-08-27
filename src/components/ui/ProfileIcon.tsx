import type { SVGProps } from "react";

export function ProfileIcon({ className = "size-6", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 20c.65-4.1 2.82-6.15 6.5-6.15S17.85 15.9 18.5 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}
