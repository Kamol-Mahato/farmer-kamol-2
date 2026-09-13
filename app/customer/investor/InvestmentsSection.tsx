"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Project {
  id: number;
  name: string;
  description: string | null;
}

interface Transaction {
  id: number;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  slipImageUrl: string | null;
  createdAt: string;
}

interface Investment {
  id: number;
  amount: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  project: { name: string };
  agreement: { agreementNo: string } | null;
  transactions: Transaction[];
}

const investmentStatusLabel: Record<Investment["status"], string> = {
  PENDING: "🕓 জমার অপেক্ষায়",
  ACTIVE: "🌱 চলমান",
  COMPLETED: "✅ সম্পন্ন",
  CANCELLED: "❌ বাতিল",
};

function DepositSlipForm({
  investmentId,
  defaultAmount,
  onUploaded,
}: {
  investmentId: number;
  defaultAmount: number;
  onUploaded: (tx: Transaction) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(defaultAmount));
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!file) {
      setError("স্লিপের ছবি দিন");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("সঠিক পরিমাণ দিন");
      return;
    }
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("amount", amount);
      const res = await fetch(
        `/api/investor/investments/${investmentId}/transactions`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "আপলোড ব্যর্থ");
      } else {
        onUploaded(data.transaction);
        setOpen(false);
        setFile(null);
      }
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-green-700 font-bold text-xs hover:underline mt-2"
      >
        + জমার স্লিপ আপলোড করুন
      </button>
    );
  }

  return (
    <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="পরিমাণ (৳)"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
        />
        <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-100">
          {file ? "ছবি নেওয়া হয়েছে" : "স্লিপের ছবি"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={busy}
          className="bg-green-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-green-600 disabled:opacity-50"
        >
          {busy ? "পাঠানো হচ্ছে..." : "জমা দিন"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-500 text-xs font-bold px-3 py-1.5"
        >
          বাতিল
        </button>
      </div>
    </div>
  );
}

export default function InvestmentsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [termMonths, setTermMonths] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/investor/projects").then((r) => r.json()),
      fetch("/api/investor/investments").then((r) => r.json()),
    ])
      .then(([p, i]) => {
        if (Array.isArray(p)) setProjects(p);
        if (Array.isArray(i)) setInvestments(i);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function createInvestment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!projectId || !amount || parseFloat(amount) <= 0) {
      setError("প্রজেক্ট ও সঠিক পরিমাণ দিন");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/investor/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, amount, termMonths }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "তৈরি করা যায়নি");
      } else {
        setInvestments((prev) => [
          { ...data.investment, transactions: [] },
          ...prev,
        ]);
        setShowForm(false);
        setProjectId("");
        setAmount("");
        setTermMonths("");
      }
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-gray-400 mt-6">বিনিয়োগের তথ্য লোড হচ্ছে...</p>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-green-800 text-base">আপনার বিনিয়োগ</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-green-600"
          >
            + নতুন বিনিয়োগ
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={createInvestment}
          className="bg-white rounded-2xl shadow-sm p-5 space-y-3 mb-5"
        >
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              প্রজেক্ট বেছে নিন
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"
            >
              <option value="">— নির্বাচন করুন —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                পরিমাণ (৳)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                মেয়াদ (মাস, ঐচ্ছিক)
              </label>
              <input
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-green-700 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {creating ? "তৈরি হচ্ছে..." : "চুক্তি তৈরি করুন"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 font-bold text-sm px-3"
            >
              বাতিল
            </button>
          </div>
        </form>
      )}

      {investments.length === 0 ? (
        <p className="text-sm text-gray-400">
          এখনো কোনো বিনিয়োগ শুরু করেননি।
        </p>
      ) : (
        <div className="space-y-3">
          {investments.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    {inv.project.name}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    ৳{inv.amount.toLocaleString("bn-BD")}
                    {inv.agreement && (
                      <> · চুক্তি নং: {inv.agreement.agreementNo}</>
                    )}
                  </p>
                  {inv.agreement && (
                    <Link
                      href={`/agreement/${inv.id}`}
                      target="_blank"
                      className="text-green-700 text-xs font-bold hover:underline mt-1 inline-block"
                    >
                      📄 চুক্তিপত্র দেখুন
                    </Link>
                  )}
                </div>
                <span className="bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded-full text-xs whitespace-nowrap">
                  {investmentStatusLabel[inv.status]}
                </span>
              </div>

              {inv.transactions.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {inv.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-gray-600">
                        ৳{tx.amount.toLocaleString("bn-BD")} —{" "}
                        {new Date(tx.createdAt).toLocaleDateString("bn-BD")}
                      </span>
                      <span
                        className={`font-bold ${
                          tx.status === "CONFIRMED"
                            ? "text-green-700"
                            : tx.status === "REJECTED"
                              ? "text-red-600"
                              : "text-yellow-700"
                        }`}
                      >
                        {tx.status === "CONFIRMED"
                          ? "✅ নিশ্চিত"
                          : tx.status === "REJECTED"
                            ? "❌ বাতিল"
                            : "🕓 পেন্ডিং"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <DepositSlipForm
                investmentId={inv.id}
                defaultAmount={inv.amount}
                onUploaded={(tx) =>
                  setInvestments((prev) =>
                    prev.map((i) =>
                      i.id === inv.id
                        ? { ...i, transactions: [tx, ...i.transactions] }
                        : i,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}