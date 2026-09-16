"use client";

import { useEffect, useRef, useState } from "react";

// ✅ স্ক্রল করে ভিউতে এলে একবার fade + ছোট slide — প্রফেশনাল, হালকা মোশন
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
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // ছোট দূরত্ব = বেশি প্রফেশনাল (আগের -translate-x-10 / y-8 কমানো)
  const hiddenState =
    direction === "left"
      ? "opacity-0 -translate-x-6"
      : direction === "right"
        ? "opacity-0 translate-x-6"
        : "opacity-0 translate-y-5";

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: reduceMotion ? "0ms" : `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={`transition-all duration-500 ${
        visible ? "opacity-100 translate-x-0 translate-y-0" : hiddenState
      } ${className}`}
    >
      {children}
    </div>
  );
}