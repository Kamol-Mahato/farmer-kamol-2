// Navbar-এর ব্যাকগ্রাউন্ডে নতুন তৈরি bd-flag-v3.png (ঘন, ধারালো, সিমলেস) — repeat-x করে
export default function FlagRibbonBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `url("/uploads/bd-flag.jpg")`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        backgroundPosition: "left center",
      }}
    />
  )
}