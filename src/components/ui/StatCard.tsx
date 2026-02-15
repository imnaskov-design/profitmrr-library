"use client";

import { ReactNode, useEffect, useState, useRef } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  trend?: {
    value: number;
    positive?: boolean;
  };
  delay?: number;
}

export function StatCard({ label, value, icon, trend, delay = 0 }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  // Count up animation
  useEffect(() => {
    if (!isVisible || typeof value !== "number") return;

    const duration = 1000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      ref={cardRef}
      className={`
        group relative overflow-hidden rounded-2xl
        border border-white/40 bg-white/60 backdrop-blur-sm
        shadow-[0_4px_20px_rgba(0,0,0,0.06)]
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]
        hover:border-indigo-100/60
        ${isVisible ? "animate-fade-in-up" : "opacity-0"}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-violet-50/0 transition-all duration-300 group-hover:from-indigo-50/50 group-hover:to-violet-50/50" />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              {typeof value === "number" ? displayValue.toLocaleString() : value}
            </p>
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`
                    inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                    ${trend.positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}
                  `}
                >
                  <svg
                    className={`mr-0.5 h-3 w-3 ${trend.positive ? "" : "rotate-180"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-zinc-400">vs last period</span>
              </div>
            )}
          </div>

          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-indigo-200">
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
