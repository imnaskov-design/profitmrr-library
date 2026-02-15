"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className = "",
  hover = false,
  glow = false,
  padding = "md",
}: GlassCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`
        relative overflow-hidden
        rounded-2xl border border-white/20
        bg-white/70 backdrop-blur-md
        shadow-[0_8px_32px_rgba(0,0,0,0.08)]
        ${hover ? "transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]" : ""}
        ${glow ? "shadow-[0_0_20px_rgba(99,102,241,0.15),0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_0_30px_rgba(99,102,241,0.25),0_12px_40px_rgba(0,0,0,0.12)]" : ""}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
