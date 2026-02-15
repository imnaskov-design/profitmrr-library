"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}: GlassButtonProps) {
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-indigo-500 to-indigo-600 
      hover:from-indigo-600 hover:to-violet-600
      text-white shadow-lg shadow-indigo-500/25
      hover:shadow-indigo-500/40 hover:shadow-xl
      border-0
    `,
    secondary: `
      bg-white/80 hover:bg-white
      text-zinc-800 border border-zinc-200/60
      hover:border-zinc-300 hover:shadow-lg
      backdrop-blur-sm
    `,
    ghost: `
      bg-transparent hover:bg-zinc-100/80
      text-zinc-700 hover:text-zinc-900
      border-0
    `,
    outline: `
      bg-transparent hover:bg-indigo-50
      text-indigo-600 border border-indigo-200/60
      hover:border-indigo-300 hover:shadow-sm
    `,
  };

  const sizeClasses = {
    sm: "h-9 px-3.5 text-xs gap-1.5",
    md: "h-10.5 px-4.5 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-xl font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
