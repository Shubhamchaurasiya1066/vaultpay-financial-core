"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import { login, getCurrentUser, getRedirectPath } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();

    if (user) {
      router.replace(getRedirectPath(user.role));
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    const result = login(form.email, form.password);

    if (!result.success) {
      toast.error(result.message);
      setLoading(false);
      return;
    }

    toast.success(`Welcome back, ${result.user.name}`);

    router.replace(getRedirectPath(result.user.role));
  };

  const fillDemo = (role) => {
    if (role === "admin") {
      setForm({
        email: "admin@vaultpay.com",
        password: "admin123",
      });
    } else {
      setForm({
        email: "client@vaultpay.com",
        password: "client123",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.12),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.10),transparent_35%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="mb-12 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                  <WalletCards className="h-5 w-5 text-emerald-400" />
                </div>

                <div>
                  <p className="text-lg font-semibold tracking-tight">
                    VaultPay
                  </p>
                  <p className="text-xs text-white/40">
                    Financial Infrastructure
                  </p>
                </div>
              </div>

              <div className="max-w-xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Secure financial operations
                </div>

                <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                  One secure workspace for every financial decision.
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-white/50">
                  Manage invoices, clients, payments and financial activity
                  through a unified workspace designed for modern businesses.
                </p>
              </div>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-4">
              {[
                ["99.99%", "Platform uptime"],
                ["256-bit", "Data encryption"],
                ["24/7", "Monitoring"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl"
                >
                  <p className="text-lg font-semibold">{value}</p>
                  <p className="mt-1 text-xs text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                  <WalletCards className="h-5 w-5 text-emerald-400" />
                </div>

                <div>
                  <p className="font-semibold">VaultPay</p>
                  <p className="text-xs text-white/40">
                    Financial Infrastructure
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-emerald-400">
                Welcome back
              </p>

              <h2 className="text-3xl font-semibold tracking-tight">
                Sign in to VaultPay
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Access your financial workspace securely.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Email address
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        email: event.target.value,
                      })
                    }
                    placeholder="you@company.com"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/50 focus:bg-white/[0.04]"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-white/80">
                      Password
                    </label>

                    <span className="text-xs text-white/30">
                      Demo environment
                    </span>
                  </div>

                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          password: event.target.value,
                        })
                      }
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/50 focus:bg-white/[0.04]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] uppercase tracking-widest text-white/25">
                  Demo access
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => fillDemo("admin")}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium">Admin</span>
                  </div>

                  <p className="mt-1 text-xs text-white/30">
                    Full financial access
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemo("client")}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-blue-400/30 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">Client</span>
                  </div>

                  <p className="mt-1 text-xs text-white/30">
                    Billing workspace
                  </p>
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-white/25">
              VaultPay Demo Environment · Authentication layer
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}