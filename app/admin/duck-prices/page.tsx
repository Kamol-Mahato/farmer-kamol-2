"use client";
import { useState, useEffect } from "react";
import {
  DUCK_BREEDS,
  DUCK_AGE_TIERS,
  emptyDuckPrices,
  type DuckPrices,
} from "@/lib/duckPrices";

type FormState = Record<string, Record<string, string>>;

function toForm(prices: DuckPrices): FormState {
  const out: FormState = {};
  for (const b of DUCK_BREEDS) {
    out[b.key] = {};
    for (const t of DUCK_AGE_TIERS) {
      const v = prices[b.key]?.[t.key];
      out[b.key][t.key] = v === null || v === undefined ? "" : String(v);
    }
  }
  return out;
}

export default function AdminDuckPricesPage() {
  const [form, setForm] = useState<FormState>(toForm(emptyDuckPrices()));
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/duck-prices");
        const data = await res.json();
        if (res.ok) {
          setForm(toForm(data.prices));
          setUpdatedAt(data.updatedAt);
        } else {
          setError(data.error || "লোড করা যায়নি");
        }
      } catch {
        setError("লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function setValue(breed: string, tier: string, value: string) {
    setSuccess(false);
    setForm((f) => ({ ...f, [breed]: { ...f[breed], [tier]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/duck-prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: form }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm(toForm(data.prices));
        setUpdatedAt(data.updatedAt);
        setSuccess(true);
      } else {
        setError(data.error || "সংরক্ষণ করা যায়নি");
      }
    } catch {
      setError("সংরক্ষণ করা যায়নি");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-4 text-gray-600">লোড হচ্ছে...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold text-green-800 mb-1">
        হাঁসের বাচ্চার দাম
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        প্রতিটি দাম প্রতি পিসের (টাকা)। ঘর ফাঁকা রাখলে পেজে &quot;ফোনে
        জানুন&quot; দেখাবে।
        {updatedAt && (
          <>
            {" "}
            সর্বশেষ আপডেট:{" "}
            {new Date(updatedAt).toLocaleString("bn-BD", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </>
        )}
      </p>

      <div className="space-y-4">
        {DUCK_BREEDS.map((b) => (
          <div
            key={b.key}
            className="border border-green-200 rounded-xl p-3 bg-green-50"
          >
            <h2 className="font-bold text-green-900 mb-2">{b.bn}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DUCK_AGE_TIERS.map((t) => (
                <label key={t.key} className="text-sm text-gray-700">
                  {t.bn}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={form[b.key][t.key]}
                    onChange={(e) => setValue(b.key, t.key, e.target.value)}
                    className="mt-1 w-full border rounded-lg px-2 py-1.5"
                    placeholder="৳"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
      {success && (
        <p className="mt-3 text-green-700 text-sm">
          সেভ হয়েছে। পেজে দাম সঙ্গে সঙ্গে বদলে যাবে।
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-60"
      >
        {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
      </button>
    </div>
  );
}