"use client";

import AppShell from "@/components/layout/AppShell";
import RouteGuard from "@/components/auth/RouteGuard";

export default function ClientLayout({ children }) {
  return (
    <RouteGuard allowedRoles={["client"]}>
      <AppShell>
        {children}
      </AppShell>
    </RouteGuard>
  );
}