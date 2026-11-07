"use client";
import { useEffect, useState, type ReactNode } from "react";

// মোবাইল স্লাইড: নতুন কনটেন্ট পুরনোটার ওপর দিয়ে ধীরে ফুটে ওঠে (dissolve)।
// skipPrev = true হলে (ভিডিও চলছে) পুরনোটা আর দেখানো হয় না, যাতে iframe দ্বিতীয়বার চালু না হয়।
export default function CrossfadeSwap({
  itemKey,
  children,
  skipPrev = false,
  fadeMs = 1000,
}: {
  itemKey: string | number;
  count?: number;
  children: ReactNode;
  skipPrev?: boolean;
  fadeMs?: number;
}) {
  const [last, setLast] = useState<{ key: string | number; node: ReactNode }>({
    key: itemKey,
    node: children,
  });
  const [prev, setPrev] = useState<ReactNode>(null);
  const [swapped, setSwapped] = useState(false);

  if (last.key !== itemKey) {
    setPrev(skipPrev ? null : last.node);
    setSwapped(true);
    setLast({ key: itemKey, node: children });
  } else if (last.node !== children) {
    setLast({ key: itemKey, node: children });
  }

  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), fadeMs + 100);
    return () => clearTimeout(t);
  }, [prev, itemKey, fadeMs]);

  return (
    <>
      {prev !== null && (
        <div className="absolute inset-0" style={{ zIndex: 0 }} aria-hidden inert>
          {prev}
        </div>
      )}
      <div
        key={itemKey}
        className={`absolute inset-0${swapped ? " hero-swap-in" : ""}`}
        style={{ zIndex: 1, animationDuration: `${fadeMs}ms` }}
      >
        {children}
      </div>
    </>
  );
}