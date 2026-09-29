"use client";

import { useState } from "react";

export default function InvestCalculator() {
  const [amount, setAmount] = useState(50000);

  // Estimated net profit (on the investment)
  const scenarios = [
    { label: "Year 1", note: "While the farm is being set up, so profit is lower", min: 0.07, max: 0.10, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "Year 2", note: "Once the farm is established", min: 0.25, max: 0.30, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "Year 3", note: "At a stable stage", min: 0.30, max: 0.35, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  ];

  const investorSharePercent = 0.35; // 35%

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-green-900 mb-2">
          💰 Live Calculator
        </h3>
        <p className="text-sm text-gray-500">
          Enter your investment amount — see the possible return
        </p>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your investment amount (BDT)
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
              ৳{val.toLocaleString("en-US")}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {scenarios.map((item) => {
          const profitMin = Math.round(amount * item.min);
          const profitMax = Math.round(amount * item.max);
          const getMin = Math.round(amount * item.min * investorSharePercent);
          const getMax = Math.round(amount * item.max * investorSharePercent);

          return (
            <div
              key={item.label}
              className={`rounded-2xl border p-4 ${item.bg} ${item.border}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-sm font-bold ${item.color}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.note}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Farm net profit ≈ ৳{profitMin.toLocaleString("en-US")} – ৳{profitMax.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">Your possible profit</p>
                  <p className={`text-lg md:text-xl font-bold ${item.color}`}>
                    ৳{getMin.toLocaleString("en-US")} – ৳{getMax.toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loss scenario */}
        <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-700">If there is a loss</p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            No profit will be paid. We will try to return the remaining capital, but there is no assurance that the full capital will be returned.
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <p className="text-xs text-amber-900 leading-relaxed">
          ⚠️ <strong>Caution:</strong> This is only an estimate. Actual profit
          depends on nature, market rates and farm management. There is no
          guarantee of any fixed return.
        </p>
      </div>
    </div>
  );
}