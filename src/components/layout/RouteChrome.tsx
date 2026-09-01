"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type RouteChromeProps = {
  children: ReactNode;
  footer: ReactNode;
  header: ReactNode;
};

const standaloneRoutes = new Set(["/forgot-password", "/login", "/register"]);

export function RouteChrome({ children, footer, header }: RouteChromeProps) {
  const pathname = usePathname();
  const standalone = standaloneRoutes.has(pathname);

  return (
    <>
      {standalone ? null : header}
      {children}
      {standalone ? null : footer}
    </>
  );
}
