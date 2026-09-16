"use client";

import { useEffect, useRef, useState } from "react";

// ✅ স্ক্রল করে ভিউতে এলে fade+slide করে ভেসে ওঠে — left/right/up তিন দিক থেকে আসতে পারে
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenState =
    direction === "left"
      ? "opacity-0 -translate-x-10"
      : direction === "right"
        ? "opacity-0 translate-x-10"
        : "opacity-0 translate-y-8";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-x-0 translate-y-0" : hiddenState
      } ${className}`}
    >
      {children}
    </div>
  );
}