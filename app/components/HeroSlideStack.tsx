"use client";
import { useEffect, useState, type ReactNode } from "react";

// PC-র প্রোডাক্ট স্লাইড: সব স্লাইড একটার ওপর একটা সাজানো থাকে,
// নতুনটা পুরনোটার ওপর দিয়ে ধীরে ফুটে ওঠে (মাঝখানে ফাঁকা সবুজ দেখায় না)।
// আশপাশের স্লাইডের ছবি আগে থেকে লোড হয়ে থাকে।
export default function HeroSlideStack({
  count,
  index,
  renderSlide,
  fadeMs = 800,
}: {
  count: number;
  index: number;
  renderSlide: (i: number) => ReactNode;
  fadeMs?: number;
}) {
  const [ready, setReady] = useState(false);
  const [tracked, setTracked] = useState(index);
  const [prev, setPrev] = useState<number | null>(null);

  // index বদলালে আগেরটাকে "prev" হিসেবে ধরে রাখা (fade শেষ হওয়া পর্যন্ত নিচে থাকবে)
  if (tracked !== index) {
    setPrev(tracked);
    setTracked(index);
  }

  // প্রথম স্লাইড দেখানোর পর আশপাশের স্লাইড প্রি-লোড (LCP-কে ধীর করবে না)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), fadeMs + 100);
    return () => clearTimeout(t);
  }, [prev, index, fadeMs]);

  const visible = new Set<number>([index]);
  if (prev !== null) visible.add(prev);
  if (ready && count > 1) {
    visible.add((index + 1) % count);
    visible.add((index - 1 + count) % count);
  }

  return (
    <div className="absolute inset-0">
      {Array.from(visible)
        .sort((a, b) => a - b)
        .map((i) => {
          const isActive = i === index;
          const isPrev = i === prev;
          return (
            <div
              key={i}
              className={`hero-slide absolute inset-0 transition-opacity ease-in-out${isActive ? " is-active" : ""}${isPrev ? " is-prev" : ""}`}
              style={{
                opacity: isActive || isPrev ? 1 : 0,
                zIndex: isActive ? 2 : isPrev ? 1 : 0,
                transitionDuration: `${fadeMs}ms`,
              }}
              aria-hidden={!isActive}
              inert={!isActive}
            >
              {renderSlide(i)}
            </div>
          );
        })}
    </div>
  );
}