"use client";
import { useState, useEffect } from "react";

interface Project {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  isAcceptingFunds: boolean;
  createdAt: string;
  _count: { investments: number };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");

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
        body: JSON.stringify({ name, description, startDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "সেভ করা যায়নি");
        return;
      }
      setName("");
      setDescription("");
      setStartDate("");
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
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">শুরুর তারিখ</th>
              <th className="px-6 py-4 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
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
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAccepting(p)}
                      className={`font-bold px-3 py-1.5 rounded-lg text-xs transition ${
                        p.isAcceptingFunds
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {p.isAcceptingFunds
                        ? "বিনিয়োগ বন্ধ করুন"
                        : "বিনিয়োগ চালু করুন"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}