import Link from "next/link";
import { prisma } from "@/lib/prisma";
export default async function AdminDashboard() {
  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    deliveredCount,
    cancelledCount,
    othersCount,
    pendingCount,
    confirmedCount,
    ongoingCount,
    lifetimeStats,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({
      where: { orderStatus: { in: ["DELIVERED", "PARTIAL_DELIVERY"] } },
    }),
    prisma.order.count({
      where: {
        orderStatus: { in: ["CANCELLED", "RETURNED", "PAID_RETURN"] },
      },
    }),
    prisma.order.count({
      where: {
        orderStatus: { in: ["REFUNDED", "LOST", "DAMAGED"] },
      },
    }),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.order.count({ where: { orderStatus: "CONFIRMED" } }),
    prisma.order.count({ where: { orderStatus: "DELIVERY_ONGOING" } }),
    prisma.lifetimeStats.findUnique({ where: { id: 1 } }),
  ]);

  const activeOrders = pendingCount + confirmedCount + ongoingCount;
  const lifetimeCollected = lifetimeStats?.totalCollected ?? 0;

  const deliveredPct =
    totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;
  const cancelledPct =
    totalOrders > 0 ? Math.round((cancelledCount / totalOrders) * 100) : 0;
    const othersPct =
    totalOrders > 0 ? Math.round((othersCount / totalOrders) * 100) : 0;
  const activePct =
    totalOrders > 0 ? Math.round((activeOrders / totalOrders) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-green-800">অ্যাডমিন ড্যাশবোর্ড</h1>
        <div className="bg-white rounded-xl shadow px-5 py-3 border-l-4 border-emerald-600">
          <p className="text-gray-500 text-xs">লাইফটাইম মোট কালেকশন</p>
          <p className="text-2xl font-bold text-emerald-700">
            ৳{lifetimeCollected.toLocaleString("bn-BD")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10">
        {/* মোট অর্ডার */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-5 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">মোট অর্ডার</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-800 mt-1">{totalOrders}</p>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-gray-100 rounded-full mt-3 overflow-hidden flex">
            <div
              className="h-full bg-green-500"
              style={{ width: `${deliveredPct}%` }}
            />
            <div
              className="h-full bg-red-500"
              style={{ width: `${cancelledPct}%` }}
            />
            <div
              className="h-full bg-yellow-400"
              style={{ width: `${othersPct}%` }}
            />
            <div
              className="h-full bg-blue-400"
              style={{ width: `${activePct}%` }}
            />
          </div>

          <div className="mt-3 space-y-1 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ডেলিভার্ড</span>
              <span className="font-medium">
                {deliveredCount}{" "}
                <span className="text-gray-400">({deliveredPct}%)</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ক্যানসেল</span>
              <span className="font-medium">
                {cancelledCount}{" "}
                <span className="text-gray-400">({cancelledPct}%)</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">অন্যান্য</span>
              <span className="font-medium">
              {othersCount}{" "}
                <span className="text-gray-400">({othersPct}%)</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">চলমান</span>
              <span className="font-medium">
                {activeOrders}{" "}
                <span className="text-gray-400">({activePct}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* অ্যাকটিভ অর্ডার */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-5 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">অ্যাকটিভ অর্ডার</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">
            {activeOrders}
          </p>

          <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium">{pendingCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Confirmed</span>
              <span className="font-medium">{confirmedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">পাঠানো</span>
              <span className="font-medium">{ongoingCount}</span>
            </div>
          </div>
        </div>

        {/* মোট পণ্য */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-5 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">মোট পণ্য</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
            {totalProducts}
          </p>
        </div>

        {/* মোট কাস্টমার */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-5 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">মোট কাস্টমার</p>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">
            {totalCustomers}
          </p>
        </div>
      </div>
      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <Link
          href="/admin/products"
          className="bg-green-700 text-white rounded-xl p-6 hover:bg-green-600 transition"
        >
          <p className="text-2xl mb-2">📦</p>
          <p className="text-lg font-bold">পণ্য ম্যানেজমেন্ট</p>
          <p className="text-green-200 text-sm mt-1">পণ্য যোগ, সম্পাদনা ও মুছুন</p>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-yellow-600 text-white rounded-xl p-6 hover:bg-yellow-500 transition"
        >
          <p className="text-2xl mb-2">🛒</p>
          <p className="text-lg font-bold">অর্ডার ম্যানেজমেন্ট</p>
          <p className="text-yellow-100 text-sm mt-1">অর্ডার দেখুন ও আপডেট করুন</p>
        </Link>
        <Link
          href="/admin/customers"
          className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-500 transition"
        >
          <p className="text-2xl mb-2">👥</p>
          <p className="text-lg font-bold">কাস্টমার ম্যানেজমেন্ট</p>
          <p className="text-blue-100 text-sm mt-1">কাস্টমার লিস্ট ও ওয়ালেট</p>
        </Link>
        <Link
          href="/admin/agents"
          className="bg-purple-600 text-white rounded-xl p-6 hover:bg-purple-500 transition"
        >
          <p className="text-2xl mb-2">🧑‍💼</p>
          <p className="text-lg font-bold">এজেন্ট ম্যানেজমেন্ট</p>
          <p className="text-purple-100 text-sm mt-1">এজেন্ট যোগ ও পরিচালনা</p>
        </Link>
        <Link
          href="/admin/blog"
          className="bg-pink-600 text-white rounded-xl p-6 hover:bg-pink-500 transition"
        >
          <p className="text-2xl mb-2">📝</p>
          <p className="text-lg font-bold">ব্লগ ম্যানেজমেন্ট</p>
          <p className="text-pink-100 text-sm mt-1">ব্লগ লেখা ও সম্পাদনা</p>
        </Link>
        <Link
          href="/admin/videos"
          className="bg-red-600 text-white rounded-xl p-6 hover:bg-red-500 transition"
        >
          <p className="text-2xl mb-2">🎬</p>
          <p className="text-lg font-bold">ভিডিও ম্যানেজমেন্ট</p>
          <p className="text-red-100 text-sm mt-1">ভিডিও যোগ ও সম্পাদনা</p>
        </Link>
        {/* নতুন অর্ডার বুকিং শর্টকাট */}
        <a
          href="/admin/orders/create"
          className="block bg-black p-6 rounded-2xl border border-black hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                নতুন
              </p>
              <h3 className="text-2xl font-bold text-white mt-2">
                নতুন অর্ডার তৈরি করুন
              </h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-300 mt-4 font-bold">
            → প্রোডাক্ট বেছে সরাসরি অর্ডার বুক করুন
          </p>
        </a>
        <a
          href="/tools/thumbnail-maker.html"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-teal-700 text-white rounded-xl p-6 hover:bg-teal-600 transition"
        >
          <p className="text-2xl mb-2">🎨</p>
          <p className="text-lg font-bold">ছবি এডিট করুন</p>
          <p className="text-teal-100 text-sm mt-1">
            থাম্বনেইল / ইমেজ এডিটর খুলুন
          </p>
        </a>
        <a
          href="https://farmer-kamol-video.streamlit.app"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-indigo-700 text-white rounded-xl p-6 hover:bg-indigo-600 transition"
        >
          <p className="text-2xl mb-2">🎬</p>
          <p className="text-lg font-bold">ভিডিও এডিট করুন</p>
          <p className="text-indigo-100 text-sm mt-1">
            সারাদিনের ক্লিপ → ১৬:৯ + ৯:১৬
          </p>
        </a>
        <a
          href="https://farmer-kamol-audio.streamlit.app"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-rose-700 text-white rounded-xl p-6 hover:bg-rose-600 transition"
        >
          <p className="text-2xl mb-2">🎙️</p>
          <p className="text-lg font-bold">অডিও এডিট করুন</p>
          <p className="text-rose-100 text-sm mt-1">
            ভয়েস রেকর্ড → হিস কমানো + স্টুডিও ভাইব
          </p>
        </a>
      </div>
    </div>
  );
}
