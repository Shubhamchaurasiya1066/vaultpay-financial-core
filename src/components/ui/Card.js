"use client";

import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = false,
  ...props
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl",
        "shadow-[0_12px_40px_rgba(0,0,0,0.12)]",
        hover &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;