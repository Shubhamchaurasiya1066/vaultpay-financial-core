"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070a] px-6 text-white">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-400/20 bg-red-400/10">
          <ShieldAlert className="h-9 w-9 text-red-400" />
        </div>

        <p className="mt-8 text-sm font-medium text-red-400">
          ACCESS RESTRICTED
        </p>

        <h1 className="mt-3 text-5xl font-semibold tracking-tight">
          403
        </h1>

        <h2 className="mt-3 text-xl font-medium">
          Unauthorized access
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/40">
          Your current account does not have permission to access this
          financial workspace.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium transition hover:bg-white/[0.05]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>

          <button
            onClick={() => router.push("/login")}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <LockKeyhole className="h-4 w-4" />
            Return to login
          </button>
        </div>
      </div>
    </main>
  );
}