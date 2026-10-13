"use client";

import AppShell from "@/components/layout/AppShell";
import RouteGuard from "@/components/auth/RouteGuard";

export default function AdminLayout({ children }) {
  return (
    <RouteGuard allowedRoles={["admin"]}>
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}