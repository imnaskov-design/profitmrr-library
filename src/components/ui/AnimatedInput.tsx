"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, icon, className = "", type = "text", ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const handleFocus = () => setFocused(true);
    const handleBlur = () => {
      setFocused(false);
      setHasValue(!!(props.value || (ref as React.RefObject<HTMLInputElement>)?.current?.value));
    };

    return (
      <div className={`relative ${className}`}>
        <div
          className={`
            relative rounded-xl border transition-all duration-200
            ${
              error
                ? "border-red-300 bg-red-50/50 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-500/20"
                : focused
                ? "border-indigo-300 bg-white shadow-lg shadow-indigo-500/10 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/20"
                : "border-zinc-200/60 bg-white/80 hover:border-zinc-300 hover:bg-white"
            }
          `}
        >
          {/* Icon */}
          {icon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0);
              props.onChange?.(e);
            }}
            className={`
              peer w-full rounded-xl bg-transparent px-4 py-3.5
              text-sm text-zinc-900 placeholder-transparent
              transition-all duration-200
              focus:outline-none
              ${icon ? "pl-11" : ""}
              ${error ? "placeholder:text-red-300" : "placeholder:text-zinc-400"}
            `}
            placeholder={label}
            {...props}
          />

          {/* Floating Label */}
          <label
            className={`
              pointer-events-none absolute left-4 top-1/2 -translate-y-1/2
              origin-left transition-all duration-200
              ${
                icon ? "left-11" : "left-4"
              }
              ${
                focused || hasValue
                  ? "-translate-y-7 scale-90 text-xs font-medium"
                  : "text-sm text-zinc-500"
              }
              ${
                error
                  ? "text-red-500"
                  : focused
                  ? "text-indigo-600"
                  : "text-zinc-500"
              }
            `}
          >
            {label}
          </label>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 animate-fade-in-up text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";
