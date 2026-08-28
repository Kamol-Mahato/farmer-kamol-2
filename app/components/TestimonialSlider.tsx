"use client"
import { useState, useEffect, useCallback } from "react"

type Review = {
  id: number
  rating: number
  comment: string | null
  user: { name: string | null }
}

export default function TestimonialSlider({ reviews }: { reviews: Review[] }) {
  const [perView, setPerView] = useState(3)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    function updatePerView() {
      setPerView(window.innerWidth < 768 ? 1 : 3)
    }
    updatePerView()
    window.addEventListener("resize", updatePerView)
    return () => window.removeEventListener("resize", updatePerView)
  }, [])

  const maxIndex = Math.max(0, reviews.length - perView)
  const canSlide = reviews.length > perView

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex))
  }, [maxIndex])

  const goNext = useCallback(() => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1))
  }, [maxIndex])

  function goPrev() {
    setIndex((i) => (i <= 0 ? maxIndex : i - 1))
  }

  useEffect(() => {
    if (!canSlide) return
    const timer = setInterval(goNext, 4500) // প্রতি ৪.৫ সেকেন্ডে অটো স্লাইড
    return () => clearInterval(timer)
  }, [canSlide, goNext])

  if (reviews.length === 0) return null

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
        >
          {reviews.map((review) => (
            <div key={review.id} className="px-3" style={{ flex: `0 0 ${100 / perView}%` }}>
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="text-yellow-500 mb-2 text-lg">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm mb-4">{review.comment}</p>
                )}
                <p className="font-bold text-green-800">{review.user.name || "আমাদের সন্তুষ্ট গ্রাহক"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {canSlide && (
        <>
          <button
            onClick={goPrev}
            aria-label="আগের রিভিউ"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-white shadow rounded-full w-9 h-9 flex items-center justify-center text-green-700 font-bold hover:bg-green-50 transition"
          >
            {"<"}
          </button>
          <button
            onClick={goNext}
            aria-label="পরের রিভিউ"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-white shadow rounded-full w-9 h-9 flex items-center justify-center text-green-700 font-bold hover:bg-green-50 transition"
          >
            {">"}
          </button>
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`রিভিউ স্লাইড ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition ${i === index ? "bg-green-700" : "bg-green-200"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}