"use client";

import { useState } from "react";

export default function InvestCalculator() {
  const [amount, setAmount] = useState(50000);

  // সম্ভাব্য নিট লাভের অনুমান (বিনিয়োগের উপর)
  const scenarios = [
    { label: "কম লাভ", rate: 0.35, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "মাঝারি লাভ", rate: 0.60, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "ভালো লাভ", rate: 1.00, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  ];

  const investorSharePercent = 0.35; // ৩৫%

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-green-900 mb-2">
          💰 লাইভ ক্যালকুলেটর
        </h3>
        <p className="text-sm text-gray-500">
          আপনার বিনিয়োগের পরিমাণ লিখুন — সম্ভাব্য রিটার্ন দেখুন
        </p>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          আপনার বিনিয়োগের পরিমাণ (টাকা)
        </label>
        <input
          type="number"
          min={10000}
          step={5000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="w-full px-5 py-3.5 text-xl font-bold text-green-800 border-2 border-green-200 rounded-2xl focus:outline-none focus:border-green-500 transition"
        />

        {/* Quick buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[10000, 20000, 50000, 100000].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                amount === val
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ৳{val.toLocaleString("bn-BD")}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {scenarios.map((item) => {
          const estimatedProfit = amount * item.rate;
          const investorGet = estimatedProfit * investorSharePercent;

          return (
            <div
              key={item.label}
              className={`rounded-2xl border p-4 ${item.bg} ${item.border}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-bold ${item.color}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    নিট লাভ ≈ ৳{estimatedProfit.toLocaleString("bn-BD")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">আপনি পাবেন</p>
                  <p className={`text-xl font-bold ${item.color}`}>
                    ৳{Math.round(investorGet).toLocaleString("bn-BD")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning */}
      <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <p className="text-xs text-amber-900 leading-relaxed">
          ⚠️ <strong>সতর্কতা:</strong> এটি শুধুমাত্র সম্ভাব্য হিসাব। প্রকৃত লাভ
          প্রকৃতি, বাজার দর ও খামার ব্যবস্থাপনার উপর নির্ভর করে। কোনো নির্দিষ্ট
          রিটার্নের গ্যারান্টি নেই।
        </p>
      </div>
    </div>
  );
}