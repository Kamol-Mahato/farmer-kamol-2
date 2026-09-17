"use client";
import { useState, useEffect } from "react";

interface Project {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  isAcceptingFunds: boolean;
  isFeaturedOnInvestPage: boolean;
  targetAmount: number | null;
  ownContributionAmount: number | null;
  fundUsage: string | null;
  timeline: string | null;
  risks: string | null;
  profitShareNote: string | null;
  durationMonths: number | null;
  investorProfitPct: number | null;
  totalLots: number | null;
  lotUnitName: string | null;
  createdAt: string;
  _count: { investments: number };
  // ✅ ধাপ ১ — লাইভ সংগ্রহ
  raisedAmount: number;
  pendingAmount: number;
  progressPct: number | null;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // এডিট ফর্মের state
  const [eName, setEName] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eStartDate, setEStartDate] = useState("");
  const [eTargetAmount, setETargetAmount] = useState("");
  const [eOwnContribution, setEOwnContribution] = useState("");
  const [eFundUsage, setEFundUsage] = useState("");
  const [eTimeline, setETimeline] = useState("");
  const [eRisks, setERisks] = useState("");
  const [eProfitShareNote, setEProfitShareNote] = useState("");
  const [eDurationMonths, setEDurationMonths] = useState("");
  const [eInvestorProfitPct, setEInvestorProfitPct] = useState("");
  const [eTotalLots, setETotalLots] = useState("");
  const [eLotUnitName, setELotUnitName] = useState("");
  const [viewing, setViewing] = useState<Project | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [ownContributionAmount, setOwnContributionAmount] = useState("");
  const [fundUsage, setFundUsage] = useState("");
  const [timeline, setTimeline] = useState("");
  const [risks, setRisks] = useState("");
  const [profitShareNote, setProfitShareNote] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [investorProfitPct, setInvestorProfitPct] = useState("");
  const [totalLots, setTotalLots] = useState("");
  const [lotUnitName, setLotUnitName] = useState("");

  function loadProjects() {
    setLoading(true);
    fetch("/api/admin/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("প্রজেক্টের নাম দিন");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          startDate,
          targetAmount: targetAmount ? Number(targetAmount) : null,
          ownContributionAmount: ownContributionAmount
            ? Number(ownContributionAmount)
            : null,
          fundUsage,
          timeline,
          risks,
          profitShareNote,
          durationMonths: durationMonths ? Number(durationMonths) : null,
          investorProfitPct: investorProfitPct
            ? Number(investorProfitPct)
            : null,
          totalLots: totalLots ? Number(totalLots) : null,
          lotUnitName: lotUnitName.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "সেভ করা যায়নি");
        return;
      }
      setName("");
      setDescription("");
      setStartDate("");
      setTargetAmount("");
      setOwnContributionAmount("");
      setFundUsage("");
      setTimeline("");
      setRisks("");
      setProfitShareNote("");
      setDurationMonths("");
      setInvestorProfitPct("");
      setTotalLots("");
      setLotUnitName("");
      setShowForm(false);
      loadProjects();
    } catch {
      setError("সার্ভার সমস্যা, আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAccepting(project: Project) {
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAcceptingFunds: !project.isAcceptingFunds,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? data.project : p)),
        );
      }
    } catch {
      // ignore
    }
  }

  // ✅ /invest পেজে "বিস্তারিত"সহ কোন প্রজেক্ট দেখাবে সেটা এখান থেকে সেট করুন
  async function toggleFeatured(project: Project) {
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFeaturedOnInvestPage: !project.isFeaturedOnInvestPage,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        loadProjects();
      }
    } catch {
      // ignore
    }
  }

  function openEdit(project: Project) {
    setEditing(project);
    setEditError("");
    setEName(project.name || "");
    setEDescription(project.description || "");
    setEStartDate(
      project.startDate
        ? new Date(project.startDate).toISOString().slice(0, 10)
        : "",
    );
    setETargetAmount(
      project.targetAmount != null ? String(project.targetAmount) : "",
    );
    setEOwnContribution(
      project.ownContributionAmount != null
        ? String(project.ownContributionAmount)
        : "",
    );
    setEFundUsage(project.fundUsage || "");
    setETimeline(project.timeline || "");
    setERisks(project.risks || "");
    setEProfitShareNote(project.profitShareNote || "");
    setEDurationMonths(
      project.durationMonths != null ? String(project.durationMonths) : "",
    );
    setEInvestorProfitPct(
      project.investorProfitPct != null
        ? String(project.investorProfitPct)
        : "",
    );
    setETotalLots(
      project.totalLots != null ? String(project.totalLots) : "",
    );
    setELotUnitName(project.lotUnitName || "");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setEditError("");
    if (!eName.trim()) {
      setEditError("প্রজেক্টের নাম দিন");
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eName.trim(),
          description: eDescription,
          startDate: eStartDate || null,
          targetAmount: eTargetAmount ? Number(eTargetAmount) : null,
          ownContributionAmount: eOwnContribution
            ? Number(eOwnContribution)
            : null,
          fundUsage: eFundUsage,
          timeline: eTimeline,
          risks: eRisks,
          profitShareNote: eProfitShareNote,
          durationMonths: eDurationMonths ? Number(eDurationMonths) : null,
          investorProfitPct: eInvestorProfitPct
            ? Number(eInvestorProfitPct)
            : null,
          totalLots: eTotalLots ? Number(eTotalLots) : null,
          lotUnitName: eLotUnitName.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "আপডেট করা যায়নি");
        return;
      }
      setEditing(null);
      loadProjects();
    } catch {
      setEditError("সার্ভার সমস্যা, আবার চেষ্টা করুন");
    } finally {
      setEditSaving(false);
    }
  }

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        প্রজেক্ট লোড হচ্ছে...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-2">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-green-800">
          বিনিয়োগ প্রজেক্ট
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition"
        >
          {showForm ? "বাতিল" : "+ নতুন প্রজেক্ট"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              প্রজেক্টের নাম
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="যেমন: ১০০টি চিনা হাঁস প্রজনন খামার"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              বিবরণ
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              শুরুর তারিখ (ঐচ্ছিক)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                মোট প্রয়োজন (৳)
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                নিজের বিনিয়োগ (৳)
              </label>
              <input
                type="number"
                value={ownContributionAmount}
                onChange={(e) => setOwnContributionAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              টাকা কোথায় খরচ হবে
            </label>
            <textarea
              value={fundUsage}
              onChange={(e) => setFundUsage(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              সময়সীমা
            </label>
            <input
              type="text"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="যেমন: আগস্ট–ডিসেম্বর ২০২৭"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              ঝুঁকি
            </label>
            <textarea
              value={risks}
              onChange={(e) => setRisks(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              লাভ/ক্ষতি বণ্টন নোট (ঐচ্ছিক)
            </label>

            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                মেয়াদ (মাস)
              </label>
              <input
                type="number"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                placeholder="যেমন: ১২"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                অংশীদারের লাভ %
              </label>
              <input
                type="number"
                value={investorProfitPct}
                onChange={(e) => setInvestorProfitPct(e.target.value)}
                placeholder="যেমন: ৩৫"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                মোট লট / শেয়ার
              </label>
              <input
                type="number"
                value={totalLots}
                onChange={(e) => setTotalLots(e.target.value)}
                placeholder="যেমন: ২০০"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                লট ইউনিট নাম
              </label>
              <input
                type="text"
                value={lotUnitName}
                onChange={(e) => setLotUnitName(e.target.value)}
                placeholder="যেমন: শেয়ার / গরু"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

            <textarea
              value={profitShareNote}
              onChange={(e) => setProfitShareNote(e.target.value)}
              rows={2}
              placeholder="খালি রাখলে ডিফল্ট ৬৫/৩৫ ভাগ দেখাবে"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? "সেভ হচ্ছে..." : "প্রজেক্ট তৈরি করুন"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-500 min-w-[700px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
          <tr>
              <th className="px-6 py-4 font-medium">নাম</th>
              <th className="px-6 py-4 font-medium">বিনিয়োগকারী</th>
              <th className="px-6 py-4 font-medium">সংগ্রহ / টার্গেট</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">শুরুর তারিখ</th>
              <th className="px-6 py-4 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  কোনো প্রজেক্ট নেই — উপরের বাটনে ক্লিক করে একটা তৈরি করুন।
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {p.name}
                    {p.description && (
                      <p className="text-xs text-gray-400 mt-0.5 max-w-sm">
                        {p.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                      {p._count.investments} জন
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 min-w-[140px]">
                      <p className="text-xs font-semibold text-gray-800">
                        ৳{(p.raisedAmount ?? 0).toLocaleString("bn-BD")}
                        {p.targetAmount != null && (
                          <span className="text-gray-400 font-normal">
                            {" "}
                            / ৳{p.targetAmount.toLocaleString("bn-BD")}
                          </span>
                        )}
                      </p>
                      {p.progressPct != null && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full"
                              style={{ width: `${p.progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-green-700 whitespace-nowrap">
                            {p.progressPct}%
                          </span>
                        </div>
                      )}
                      {(p.pendingAmount ?? 0) > 0 && (
                        <p className="text-[10px] text-amber-600">
                          পেন্ডিং: ৳{p.pendingAmount.toLocaleString("bn-BD")}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.isAcceptingFunds ? (
                      <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        চলমান
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        বন্ধ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {p.startDate
                      ? new Date(p.startDate).toLocaleDateString("bn-BD")
                      : "—"}
                  </td>
                  <td className="px-6 py-4 space-y-1.5">
                  <button
                      onClick={() => setViewing(p)}
                      className="block w-full font-bold px-3 py-1.5 rounded-lg text-xs transition bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      বিস্তারিত দেখুন
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="block w-full font-bold px-3 py-1.5 rounded-lg text-xs transition bg-amber-50 text-amber-700 hover:bg-amber-100"
                    >
                      এডিট করুন
                    </button>
                    <button
                      onClick={() => toggleAccepting(p)}
                      className={`block w-full font-bold px-3 py-1.5 rounded-lg text-xs transition ${
                        p.isAcceptingFunds
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {p.isAcceptingFunds
                        ? "বিনিয়োগ বন্ধ করুন"
                        : "বিনিয়োগ চালু করুন"}
                    </button>
                    <button
                      onClick={() => toggleFeatured(p)}
                      className={`block w-full font-bold px-3 py-1.5 rounded-lg text-xs transition ${
                        p.isFeaturedOnInvestPage
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {p.isFeaturedOnInvestPage
                        ? "★ /invest-এ ফিচার্ড"
                        : "/invest-এ ফিচার করুন"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
      </div>

      {/* ========== ভিউ পপআপ ========== */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-green-800">প্রজেক্ট বিস্তারিত</h2>
              <button
                onClick={() => setViewing(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">নাম</p>
                <p className="font-bold text-gray-900 text-base">{viewing.name}</p>
                {viewing.description && (
                  <p className="text-gray-500 mt-1 text-xs leading-relaxed">
                    {viewing.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 mb-0.5">সংগ্রহ</p>
                  <p className="font-bold text-green-700">
                    ৳{(viewing.raisedAmount ?? 0).toLocaleString("bn-BD")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 mb-0.5">টার্গেট</p>
                  <p className="font-bold text-gray-800">
                    {viewing.targetAmount != null
                      ? `৳${viewing.targetAmount.toLocaleString("bn-BD")}`
                      : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 mb-0.5">পেন্ডিং</p>
                  <p className="font-bold text-amber-600">
                    ৳{(viewing.pendingAmount ?? 0).toLocaleString("bn-BD")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 mb-0.5">অগ্রগতি</p>
                  <p className="font-bold text-gray-800">
                    {viewing.progressPct != null ? `${viewing.progressPct}%` : "—"}
                  </p>
                </div>
              </div>

              {viewing.progressPct != null && (
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${viewing.progressPct}%` }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 border-t pt-4">
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">মেয়াদ</p>
                  <p className="font-semibold text-gray-800">
                    {viewing.durationMonths != null
                      ? `${viewing.durationMonths} মাস`
                      : viewing.timeline || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">লাভ বণ্টন</p>
                  <p className="font-semibold text-gray-800">
                    {viewing.investorProfitPct != null
                      ? `প্রফিটের ${viewing.investorProfitPct}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">লট</p>
                  <p className="font-semibold text-gray-800">
                    {viewing.totalLots != null
                      ? `${viewing.totalLots} ${viewing.lotUnitName || "শেয়ার"}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">বিনিয়োগকারী</p>
                  <p className="font-semibold text-gray-800">
                    {viewing._count?.investments ?? 0} জন
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">নিজের বিনিয়োগ</p>
                  <p className="font-semibold text-gray-800">
                    {viewing.ownContributionAmount != null
                      ? `৳${viewing.ownContributionAmount.toLocaleString("bn-BD")}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">স্ট্যাটাস</p>
                  <p className="font-semibold text-gray-800">
                    {viewing.isAcceptingFunds ? "চলমান" : "বন্ধ"}
                    {viewing.isFeaturedOnInvestPage ? " · ফিচার্ড" : ""}
                  </p>
                </div>
              </div>

              {viewing.fundUsage && (
                <div className="border-t pt-3">
                  <p className="text-[10px] text-gray-500 mb-0.5">টাকা কোথায় খরচ হবে</p>
                  <p className="text-gray-700 text-xs leading-relaxed">{viewing.fundUsage}</p>
                </div>
              )}
              {viewing.risks && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">ঝুঁকি</p>
                  <p className="text-gray-700 text-xs leading-relaxed">{viewing.risks}</p>
                </div>
              )}
              {(viewing.profitShareNote || viewing.investorProfitPct != null) && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">লাভ/ক্ষতি বণ্টন নোট</p>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {viewing.profitShareNote ||
                      `লাভ হলে খামারি ${100 - (viewing.investorProfitPct ?? 35)}% ও অংশীদার ${viewing.investorProfitPct ?? 35}%`}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-5 py-3 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setViewing(null)}
                className="bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-green-600"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== এডিট পপআপ ========== */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-green-800">প্রজেক্ট এডিট</h2>
              <button
                onClick={() => setEditing(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  প্রজেক্টের নাম *
                </label>
                <input
                  type="text"
                  value={eName}
                  onChange={(e) => setEName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  বিবরণ
                </label>
                <textarea
                  value={eDescription}
                  onChange={(e) => setEDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  শুরুর তারিখ
                </label>
                <input
                  type="date"
                  value={eStartDate}
                  onChange={(e) => setEStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    মোট প্রয়োজন (৳)
                  </label>
                  <input
                    type="number"
                    value={eTargetAmount}
                    onChange={(e) => setETargetAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    নিজের বিনিয়োগ (৳)
                  </label>
                  <input
                    type="number"
                    value={eOwnContribution}
                    onChange={(e) => setEOwnContribution(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    মেয়াদ (মাস)
                  </label>
                  <input
                    type="number"
                    value={eDurationMonths}
                    onChange={(e) => setEDurationMonths(e.target.value)}
                    placeholder="১২"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    অংশীদারের লাভ %
                  </label>
                  <input
                    type="number"
                    value={eInvestorProfitPct}
                    onChange={(e) => setEInvestorProfitPct(e.target.value)}
                    placeholder="৩৫"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    মোট লট / শেয়ার
                  </label>
                  <input
                    type="number"
                    value={eTotalLots}
                    onChange={(e) => setETotalLots(e.target.value)}
                    placeholder="২০০"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    লট ইউনিট নাম
                  </label>
                  <input
                    type="text"
                    value={eLotUnitName}
                    onChange={(e) => setELotUnitName(e.target.value)}
                    placeholder="শেয়ার"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  সময়সীমা (টেক্সট)
                </label>
                <input
                  type="text"
                  value={eTimeline}
                  onChange={(e) => setETimeline(e.target.value)}
                  placeholder="যেমন: আগস্ট–ডিসেম্বর ২০২৭"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  টাকা কোথায় খরচ হবে
                </label>
                <textarea
                  value={eFundUsage}
                  onChange={(e) => setEFundUsage(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  ঝুঁকি
                </label>
                <textarea
                  value={eRisks}
                  onChange={(e) => setERisks(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  লাভ/ক্ষতি বণ্টন নোট
                </label>
                <textarea
                  value={eProfitShareNote}
                  onChange={(e) => setEProfitShareNote(e.target.value)}
                  rows={2}
                  placeholder="খালি রাখলে % থেকে অটো টেক্সট"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              {editError && (
                <p className="text-red-500 text-sm">{editError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  {editSaving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}