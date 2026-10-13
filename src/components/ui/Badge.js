"use client";

import { cn } from "@/lib/utils";

const statusStyles = {
  paid: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  processing: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  failed: "border-red-400/20 bg-red-400/10 text-red-300",
  overdue: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  draft: "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

export function Badge({
  children,
  status,
  className,
}) {
  const normalizedStatus = String(status || children || "")
    .toLowerCase()
    .trim();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
        statusStyles[normalizedStatus] ||
          "border-white/10 bg-white/[0.05] text-white/60",
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;