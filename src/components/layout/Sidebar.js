"use client";

import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { logout, getCurrentUser } from "@/lib/auth";
import { useEffect, useState } from "react";

const adminNavigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Invoices",
    icon: FileText,
    href: "/admin/invoices",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/admin/clients",
  },
  {
    label: "Revenue",
    icon: BarChart3,
    href: "/admin/revenue",
  },
];

const clientNavigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/client",
  },
  {
    label: "Invoices",
    icon: FileText,
    href: "/client/invoices",
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const navigation =
    user?.role === "admin"
      ? adminNavigation
      : clientNavigation;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="hidden w-[250px] shrink-0 border-r border-white/[0.07] bg-[#090e18]/90 lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-white/[0.07] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-[0_8px_30px_rgba(109,93,252,0.25)]">
          <WalletCards size={21} />
        </div>

        <div>
          <p className="font-semibold tracking-tight text-white">
            VaultPay
          </p>

          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Financial Core
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? "bg-violet-500/[0.12] text-white"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition ${
                    isActive
                      ? "text-violet-400"
                      : "group-hover:text-violet-400"
                  }`}
                />

                {item.label}
              </button>
            );
          })}
        </nav>

        {/* System */}
        <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          System
        </p>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
              pathname === "/settings"
                ? "bg-violet-500/[0.12] text-white"
                : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <Settings
              size={18}
              className="transition group-hover:text-violet-400"
            />

            Settings
          </button>
        </nav>
      </div>

      {/* User / Security */}
      <div className="border-t border-white/[0.07] p-4">
        {/* Secure environment */}
        <div className="mb-3 rounded-xl bg-emerald-500/[0.06] p-3">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-emerald-400"
            />

            <span className="text-xs font-medium text-emerald-300">
              Secure Environment
            </span>
          </div>

          <p className="mt-1 text-[11px] text-slate-500">
            Protected financial workspace
          </p>
        </div>

        {/* Current user */}
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-semibold text-violet-300">
              {user.name
                ?.split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">
                {user.name}
              </p>

              <p className="mt-0.5 truncate text-[10px] capitalize text-slate-500">
                {user.role} account
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-rose-500/[0.06] hover:text-rose-300"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}