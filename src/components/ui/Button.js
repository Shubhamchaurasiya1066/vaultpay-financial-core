"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-500 shadow-[0_10px_30px_rgba(109,93,252,0.20)]",

  secondary:
    "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]",

  ghost:
    "text-slate-400 hover:bg-white/[0.05] hover:text-white",

  danger:
    "bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/15",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  className,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2
          size={17}
          className="animate-spin"
        />
      )}

      {children}
    </button>
  );
}