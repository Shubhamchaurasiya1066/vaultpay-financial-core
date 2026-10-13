"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default function RouteGuard({
  children,
  allowedRoles = [],
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();

    // No authenticated session
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // User exists but doesn't have permission
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      router.replace("/403");
      return;
    }

    setChecking(false);
  }, [router, pathname, allowedRoles]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070a] text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

          <p className="mt-4 text-sm text-white/40">
            Verifying secure access...
          </p>
        </div>
      </div>
    );
  }

  return children;
}