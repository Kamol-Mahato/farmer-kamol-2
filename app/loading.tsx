// ✅ হোমপেজ লোড হওয়ার সময় স্ক্রিনে দেখানো "কঙ্কাল" — ইউজারকে সাথে সাথে বোঝায় সাইট চালু হয়ে গেছে,
// আসল ডেটা (প্রোডাক্ট, ছবি) এর মধ্যে এসে জায়গা নিয়ে নেবে। Navbar/Footer আলাদাভাবে সাথে সাথেই দেখা যাবে।
export default function Loading() {
  return (
    <div className="font-[family-name:var(--font-hind-siliguri)] animate-pulse">
      {/* Hero Slider-এর জায়গা */}
      <div className="bg-green-900">
        <div className="hidden md:grid md:grid-cols-2 h-[280px]">
          <div className="bg-green-800" />
          <div className="bg-green-800" />
        </div>
        <div className="md:hidden relative" style={{ paddingTop: "56.25%" }}>
          <div className="absolute inset-0 bg-green-800" />
        </div>
      </div>

      {/* Top Seller-এর জায়গা */}
      <div className="bg-white py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* ফিচার্ড প্রোডাক্ট গ্রিডের জায়গা */}
      <div className="bg-green-50 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-3">
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-center mb-5">
            <div className="h-10 w-48 bg-gray-200 rounded-full" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden">
                <div className="aspect-square bg-gray-200" />
                <div className="p-2 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
