"use client";
import { useState, useEffect, useCallback, useRef, type TouchEvent } from "react";

import type { TestimonialItem } from "@/lib/placeholderReviews";

type Review = TestimonialItem;

export default function TestimonialSlider({
  reviews,
  locale = "bn",
}: {
  reviews: Review[];
  locale?: "bn" | "en";
}) {
  const isEn = locale === "en";
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    function updatePerView() {
      setPerView(window.innerWidth < 768 ? 1 : 3);
    }
    updatePerView();
    window.addEventListener("resize", updatePerView);
    return () => window.removeEventListener("resize", updatePerView);
  }, []);

  const maxIndex = Math.max(0, reviews.length - perView);
  const canSlide = reviews.length > perView;

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  function goPrev() {
    setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start !== null && canSlide) {
      const dx = e.changedTouches[0].clientX - start;
      if (dx <= -40) goNext();
      else if (dx >= 40) goPrev();
    }
    setPaused(false);
  }

  useEffect(() => {
    if (!canSlide || paused) return;
    const timer = setInterval(goNext, 7000); // প্রতি ৭ সেকেন্ডে অটো স্লাইড
    return () => clearInterval(timer);
  }, [canSlide, paused, goNext]);

  if (reviews.length === 0) return null;

  return (
    <div
      className="relative"
      style={{ touchAction: "pan-y" }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        touchStartX.current = null;
        setPaused(false);
      }}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="px-3"
              style={{ flex: `0 0 ${100 / perView}%` }}
            >
              <div className="relative flex flex-col h-full bg-white rounded-2xl p-6 border border-green-200/80 border-t-4 border-t-green-600 shadow-md shadow-green-900/5 transition-all duration-500 ease-out hover:shadow-lg hover:border-green-300">
                <span
                  aria-hidden="true"
                  className="absolute top-3 right-5 text-6xl leading-none font-serif text-green-100 select-none"
                >
                  ”
                </span>
                {review.productLabel && (
                  <span className="self-start text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full mb-3">
                    {review.productLabel}
                  </span>
                )}
                {review.rating > 0 && (
                  <div className="text-yellow-500 mb-2 text-lg">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                )}
                {review.comment && (
                  <p className="relative text-gray-700 text-sm leading-relaxed mb-5">
                    {review.comment}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-green-100">
                  <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-white font-bold">
                    {Array.from((review.user.name || (isEn ? "Customer" : "গ্রাহক")).trim())[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-green-800 truncate">
                      {review.user.name || (isEn ? "Our Happy Customer" : "আমাদের সন্তুষ্ট গ্রাহক")}
                    </p>
                    {review.verified && (
                      <p className="text-[11px] font-medium text-green-700">
                        ✓ {isEn ? "Verified order" : "যাচাইকৃত অর্ডার"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {canSlide && (
        <>
          <button
            onClick={goPrev}
            aria-label={isEn ? "Previous review" : "আগের রিভিউ"}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 items-center justify-center rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-md text-green-800 transition-all duration-300 hover:bg-white/70"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={goNext}
            aria-label={isEn ? "Next review" : "পরের রিভিউ"}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 items-center justify-center rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-md text-green-800 transition-all duration-300 hover:bg-white/70"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
