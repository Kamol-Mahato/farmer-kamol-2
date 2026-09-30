"use client";
import { useState, useEffect } from "react";
import { upazilas, upazilasEn } from "@/lib/bd-locations";

// 🌐 EN (/en) পেজের জন্য জেলা/উপজেলা সার্চ — শুধু ইংরেজি নাম দেখায়।
// props BN-এর app/components/LocationSearch.tsx-এর মতোই, তাই page-এ import বদলালেই চলবে।

type District = { id: number; name: string; en_name: string };

/** English upazila list — ঢাকায় BN/EN list মেলে না, তখন "ডেমরা (Demra)" থেকে ইংরেজি অংশ বের করা হয় */
export function getEnglishUpazilas(districtId: number): string[] {
  const bn = upazilas[districtId] || [];
  const en = upazilasEn[districtId] || [];
  if (bn.length === en.length && en.length > 0) return en;
  return bn.map((u) => {
    const m = u.match(/\(([^)]+)\)\s*$/);
    return m ? m[1].trim() : u;
  });
}

export function DistrictSearch({
  districts,
  value,
  onSelect,
  inputRef,
  onEnterNext,
}: {
  districts: District[];
  value: string;
  onSelect: (d: District) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  onEnterNext?: () => void;
}) {
  const [text, setText] = useState(value);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  const filtered = districts.filter((d) =>
    d.en_name.toLowerCase().includes(text.toLowerCase().trim()),
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (show && filtered.length > 0) {
              setText(filtered[0].en_name);
              setShow(false);
              onSelect(filtered[0]);
            }
            onEnterNext?.();
          }
        }}
        placeholder="Type or search district"
        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
              onMouseDown={() => {
                setText(d.en_name);
                setShow(false);
                onSelect(d);
              }}
            >
              {d.en_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function UpazilaSearch({
  upazilas: list,
  value,
  onSelect,
  disabled,
  inputRef,
  onEnterNext,
}: {
  upazilas: string[]; // getEnglishUpazilas(districtId) পাঠাতে হবে
  value: string;
  onSelect: (u: string) => void;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onEnterNext?: () => void;
}) {
  const [text, setText] = useState(value);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  const q = text.toLowerCase().trim();
  const filtered = list.filter((u) => u.toLowerCase().includes(q));

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (show && filtered.length > 0) {
              setText(filtered[0]);
              setShow(false);
              onSelect(filtered[0]);
            }
            onEnterNext?.();
          }
        }}
        placeholder={
          disabled ? "Select district first" : "Type or search upazila / area"
        }
        disabled={disabled}
        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 disabled:bg-gray-100"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
          {filtered.map((u) => (
            <div
              key={u}
              className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
              onMouseDown={() => {
                setText(u);
                setShow(false);
                onSelect(u);
              }}
            >
              {u}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
