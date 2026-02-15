"use client";

import { ReactNode, useEffect, useState } from "react";

interface StaggerRevealProps {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export function StaggerReveal({
  children,
  delay = 0,
  stagger = 50,
  direction = "up",
  className = "",
}: StaggerRevealProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    up: "translate-y-4",
    down: "-translate-y-4",
    left: "translate-x-4",
    right: "-translate-x-4",
    none: "",
  };

  const childArray = Array.isArray(children) ? children : [children];

  return (
    <div className={`${className}`}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className={`
            transition-all duration-500 ease-out
            ${isVisible ? "opacity-100 translate-none" : `opacity-0 ${directionClasses[direction]}`}
          `}
          style={{
            transitionDelay: `${index * stagger}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Simple reveal component for single items
interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-none translate-y-0" : "opacity-0 translate-y-4"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
