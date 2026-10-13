"use client";

import {
  Bell,
  ChevronDown,
  Search,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";

export default function Topbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "VP";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/[0.07] bg-[#070b12]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Search */}
      <div className="relative hidden w-full max-w-md md:block">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
        />

        <input
          type="text"
          placeholder="Search invoices, clients..."
          className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/40 focus:bg-white/[0.04]"
        />

        <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.08] px-2 py-1 text-[10px] text-slate-600 sm:block">
          ⌘ K
        </div>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3">
        {/* Security */}
        <div className="hidden items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2 sm:flex">
          <ShieldCheck
            size={14}
            className="text-emerald-400"
          />

          <span className="text-[11px] font-medium text-emerald-300">
            Secure
          </span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <Bell size={17} />

          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
        </button>

        {/* Profile */}
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-2.5 py-2 transition hover:bg-white/[0.05]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-[11px] font-semibold text-violet-300">
            {initials}
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-[120px] truncate text-xs font-medium text-white">
              {user?.name || "VaultPay User"}
            </p>

            <p className="text-[10px] capitalize text-slate-500">
              {user?.role || "Account"}
            </p>
          </div>

          <ChevronDown
            size={14}
            className="hidden text-slate-600 sm:block"
          />
        </button>
      </div>
    </header>
  );
}