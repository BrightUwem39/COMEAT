"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type RouteChromeProps = {
  children: ReactNode;
  footer: ReactNode;
  header: ReactNode;
};

const standaloneRoutes = new Set([
  "/forgot-password",
  "/login",
  "/register",
  "/reset-password",
  "/verify-email",
]);

export function RouteChrome({ children, footer, header }: RouteChromeProps) {
  const pathname = usePathname();
  const standalone = standaloneRoutes.has(pathname) || pathname.startsWith("/admin");

  if (standalone) {
    return children;
  }

  return (
    <div className="brand-shell">
      <div aria-hidden="true" className="brand-backdrop">
        <span className="brand-watermark" />
      </div>
      <div className="brand-content">
        {header}
        {children}
        {footer}
      </div>
    </div>
  );
}
