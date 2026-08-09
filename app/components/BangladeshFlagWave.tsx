"use client"
import { useId } from "react"

// একটা একক পতাকা — সঠিক অনুপাতে (স্ট্রেচ হয় না), হালকা waving ইফেক্টসহ
// seed ও delay দিয়ে একাধিক পতাকা পাশাপাশি বসালে প্রতিটা আলাদা ছন্দে দুলবে (রোবটিক না লেগে স্বাভাবিক লাগবে)
export default function BangladeshFlagWave({
  className = "",
  seed = 4,
  delay = 0,
}: {
  className?: string
  seed?: number
  delay?: number
}) {
  const rawId = useId().replace(/:/g, "")
  const filterId = `bd-flag-wave-${rawId}`

  return (
    <svg
      className={className}
      viewBox="0 0 100 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="2" seed={seed} result="turb">
            <animate
              attributeName="baseFrequency"
              dur="5s"
              begin={`${delay}s`}
              values="0.02 0.08;0.03 0.1;0.02 0.08"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <rect width="100" height="60" rx="4" fill="#006a4e" />
        <ellipse cx="45" cy="30" rx="18" ry="18" fill="#f42a41" />
      </g>
    </svg>
  )
}