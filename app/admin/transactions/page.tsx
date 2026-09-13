"use client";
import { useState, useEffect } from "react";

interface Transaction {
  id: number;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL";
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  slipImageUrl: string | null;
  note: string | null;
  createdAt: string;
  investment: {
    project: { name: string };
    investorProfile: {
      user: { name: string | null; phone: string };
    };
  };
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");

  useEffect(() => {
    fetch("/api/admin/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTransactions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function decide(tx: Transaction, status: "CONFIRMED" | "REJECTED") {
    let note = "";
    if (status === "REJECTED") {
      note = prompt("বাতিলের কারণ লিখুন (ঐচ্ছিক):") || "";
    }
    setBusyId(tx.id);
    try {
      const res = await fetch(`/api/admin/transactions/${tx.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "সমস্যা হয়েছে");
        return;
      }
      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, ...data.transaction } : t)),
      );
    } catch {
      alert("সার্ভার সমস্যা, আবার চেষ্টা করুন");
    } finally {
      setBusyId(null);
    }
  }

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        লেনদেন লোড হচ্ছে...
      </div>
    );

  const visible =
    filter === "PENDING"
      ? transactions.filter((t) => t.status === "PENDING")
      : transactions;

  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-green-800">
          বিনিয়োগ লেনদেন
        </h1>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              filter === "PENDING"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            পেন্ডিং
          </button>
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              filter === "ALL"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            সব
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
            কোনো লেনদেন নেই।
          </div>
        ) : (
          visible.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              {tx.slipImageUrl && (
                <a
                  href={tx.slipImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tx.slipImageUrl}
                    alt="Deposit slip"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition"
                  />
                </a>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">
                  {tx.investment.investorProfile.user.name || "নাম নেই"}{" "}
                  <span className="text-gray-400 font-normal text-sm">
                    · {tx.investment.investorProfile.user.phone}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  {tx.investment.project.name} — ৳{tx.amount.toLocaleString("bn-BD")}
                </p>
                {tx.note && (
                  <p className="text-xs text-gray-400 mt-1">নোট: {tx.note}</p>
                )}
                <p className="text-xs text-gray-300 mt-1">
                  {new Date(tx.createdAt).toLocaleString("bn-BD")}
                </p>
              </div>
              <div className="shrink-0">
                {tx.status === "CONFIRMED" ? (
                  <span className="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-full text-xs">
                    ✅ নিশ্চিত
                  </span>
                ) : tx.status === "REJECTED" ? (
                  <span className="bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-full text-xs">
                    ❌ বাতিল
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide(tx, "CONFIRMED")}
                      disabled={busyId === tx.id}
                      className="bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-green-600 disabled:opacity-50"
                    >
                      নিশ্চিত করুন
                    </button>
                    <button
                      onClick={() => decide(tx, "REJECTED")}
                      disabled={busyId === tx.id}
                      className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-red-100 disabled:opacity-50"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}