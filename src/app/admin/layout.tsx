import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { requireCurrentAdmin } from "@/server/admin-auth";
import { getAdminNotificationCenter } from "@/server/admin-workspace";

export const metadata: Metadata = {
  title: "Admin",
  description: "Secure ComEat administration workspace.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireCurrentAdmin("/admin");
  const notifications = await getAdminNotificationCenter();
  return <AdminShell admin={admin} notificationCount={notifications.count}>{children}</AdminShell>;
}
