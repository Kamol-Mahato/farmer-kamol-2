"use client";

export type SizeRow = {
  label: string;
  labelEn: string;
  stockKg: string;
  price: string;
  discountPrice: string;
  isActive: boolean;
};

const MAX_SIZES = 6;
const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500";

export default function SizeEditor({
  sizes,
  onChange,
}: {
  sizes: SizeRow[];
  onChange: (next: SizeRow[]) => void;
}) {
  function update(i: number, patch: Partial<SizeRow>) {
    onChange(sizes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function remove(i: number) {
    onChange(sizes.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([
      ...sizes,
      {
        label: "",
        labelEn: "",
        stockKg: "",
        price: "",
        discountPrice: "",
        isActive: true,
      },
    ]);
  }

  return (
    <div className="mb-8 rounded-xl border border-green-200 bg-green-50/40 p-4">
      <h3 className="text-base font-bold text-green-800 mb-1">
        অতিরিক্ত প্যাক সাইজ (ঐচ্ছিক)
      </h3>
      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
        উপরের মূল দাম ও একক (যেমন ১ কেজি) ডিফল্ট সাইজ হিসেবে থাকবে। এখানে
        ছোট প্যাক যোগ করুন, যেমন ৩০০ গ্রাম। স্টক আলাদা না, মূল স্টক থেকেই
        কমবে। তাই ৩০০ গ্রামের জন্য &quot;স্টক থেকে কমবে&quot; ঘরে{" "}
        <b>0.3</b> লিখুন।
      </p>

      {sizes.map((s, i) => (
        <div
          key={i}
          className="mb-3 rounded-lg border border-gray-200 bg-white p-3"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                নাম (বাংলা) *
              </label>
              <input
                type="text"
                value={s.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="৩০০ গ্রাম"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Name (English)
              </label>
              <input
                type="text"
                value={s.labelEn}
                onChange={(e) => update(i, { labelEn: e.target.value })}
                placeholder="300 gm"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                স্টক থেকে কমবে (কেজি/লিটার) *
              </label>
              <input
                type="number"
                step="0.001"
                value={s.stockKg}
                onChange={(e) => update(i, { stockKg: e.target.value })}
                placeholder="0.3"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                দাম (৳) *
              </label>
              <input
                type="number"
                value={s.price}
                onChange={(e) => update(i, { price: e.target.value })}
                placeholder="450"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                সেল দাম (৳)
              </label>
              <input
                type="number"
                value={s.discountPrice}
                onChange={(e) => update(i, { discountPrice: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="flex items-end justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={s.isActive}
                  onChange={(e) => update(i, { isActive: e.target.checked })}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-sm text-gray-700">চালু</span>
              </label>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-600 text-sm font-medium border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50"
              >
                মুছুন
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={sizes.length >= MAX_SIZES}
        className="text-sm font-bold text-green-700 border border-green-300 bg-white rounded-lg px-4 py-2 hover:bg-green-50 disabled:opacity-50"
      >
        + নতুন সাইজ যোগ করুন
      </button>
    </div>
  );
}