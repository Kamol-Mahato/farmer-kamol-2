"use client";
import { useState, useEffect } from "react";

interface InvestorProfile {
  id: number;
  user: { name: string | null; phone: string };
  email: string | null;
  emailVerified: boolean;
  fatherName: string | null;
  address: string | null;
  nidNumber: string | null;
  nidImageUrl: string | null;
  photoImageUrl: string | null;
  signatureImageUrl: string | null;
  paymentNumber: string | null;
  termsAcceptedAt: string | null;
  profileCompletedAt: string | null;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
}

export default function AdminInvestorsPage() {
  const [profiles, setProfiles] = useState<InvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<InvestorProfile | null>(null);
  const [deciding, setDeciding] = useState(false);

  async function decide(status: "APPROVED" | "REJECTED") {
    if (!viewing) return;
    let reason = "";
    if (status === "REJECTED") {
      reason = prompt("বাতিলের কারণ লিখুন (ঐচ্ছিক):") || "";
    }
    setDeciding(true);
    try {
      const res = await fetch(`/api/admin/investors/${viewing.id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "সমস্যা হয়েছে");
        return;
      }
      setProfiles((prev) =>
        prev.map((p) => (p.id === viewing.id ? { ...p, ...data.profile } : p)),
      );
      setViewing((v) => (v ? { ...v, ...data.profile } : v));
    } catch {
      alert("সার্ভার সমস্যা, আবার চেষ্টা করুন");
    } finally {
      setDeciding(false);
    }
  }

  useEffect(() => {
    fetch("/api/admin/investors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProfiles(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        বিনিয়োগকারী তথ্য লোড হচ্ছে...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      <h1 className="text-3xl font-bold text-green-800 mb-8">
        বিনিয়োগকারী প্রোফাইল
      </h1>

      <p className="text-sm text-gray-500 mb-4">
        মোট: <span className="font-bold text-green-800">{profiles.length}</span>{" "}
        জন
      </p>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-500 min-w-[800px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">নাম</th>
              <th className="px-6 py-4 font-medium">মোবাইল</th>
              <th className="px-6 py-4 font-medium">ইমেইল</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">জমার তারিখ</th>
              <th className="px-6 py-4 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  এখনো কেউ বিনিয়োগকারী প্রোফাইল তৈরি করেননি।
                </td>
              </tr>
            ) : (
              profiles.map((p) => (
                <tr key={p.id} className="transition hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                    {p.user.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {p.user.phone}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {p.email || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {p.verificationStatus === "APPROVED" ? (
                      <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        ✅ অনুমোদিত
                      </span>
                    ) : p.verificationStatus === "REJECTED" ? (
                      <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        ❌ বাতিল
                      </span>
                    ) : p.profileCompletedAt ? (
                      <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        🔎 রিভিউ বাকি
                      </span>
                    ) : p.emailVerified ? (
                      <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        প্রোফাইল অসম্পূর্ণ
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        ইমেইল বাকি
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString("bn-BD")}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setViewing(p)}
                      className="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-green-200 transition"
                    >
                      দেখুন
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-green-800">
                {viewing.user.name || "নাম নেই"}
              </h2>
              <button
                onClick={() => setViewing(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">মোবাইল</p>
                <p className="font-medium text-gray-800">{viewing.user.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">ইমেইল</p>
                <p className="font-medium text-gray-800">{viewing.email || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">পিতার নাম</p>
                <p className="font-medium text-gray-800">
                  {viewing.fatherName || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">এনআইডি নম্বর</p>
                <p className="font-medium text-gray-800">
                  {viewing.nidNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">বিকাশ/ব্যাংক নম্বর</p>
                <p className="font-medium text-gray-800">
                  {viewing.paymentNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">শর্তে সম্মতি</p>
                <p className="font-medium text-gray-800">
                  {viewing.termsAcceptedAt
                    ? new Date(viewing.termsAcceptedAt).toLocaleDateString(
                        "bn-BD",
                      )
                    : "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-xs">ঠিকানা</p>
                <p className="font-medium text-gray-800">
                  {viewing.address || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {viewing.verificationStatus === "APPROVED" ? (
                <span className="bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full text-xs">
                  ✅ অনুমোদিত
                </span>
              ) : viewing.verificationStatus === "REJECTED" ? (
                <span className="bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded-full text-xs">
                  ❌ বাতিল{viewing.rejectionReason ? `: ${viewing.rejectionReason}` : ""}
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 font-bold px-2.5 py-1 rounded-full text-xs">
                  🔎 রিভিউ বাকি
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                ["এনআইডি", viewing.nidImageUrl],
                ["ছবি", viewing.photoImageUrl],
                ["স্বাক্ষর", viewing.signatureImageUrl],
              ].map(([label, url]) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={label as string}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition"
                      />
                    </a>
                  ) : (
                    <div className="w-full h-20 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs">
                      নেই
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => decide("APPROVED")}
                disabled={deciding || viewing.verificationStatus === "APPROVED"}
                className="flex-1 bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50"
              >
                ✅ অনুমোদন করুন
              </button>
              <button
                onClick={() => decide("REJECTED")}
                disabled={deciding || viewing.verificationStatus === "REJECTED"}
                className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 disabled:opacity-50"
              >
                ❌ বাতিল করুন
              </button>
            </div>

            <button
              onClick={() => setViewing(null)}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-200"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
}