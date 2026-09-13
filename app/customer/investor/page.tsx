"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InvestmentsSection from "./InvestmentsSection";

interface InvestorProfile {
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
}

function DocUpload({
  label,
  kind,
  currentUrl,
  onUploaded,
}: {
  label: string;
  kind: "nid" | "photo" | "signature";
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const res = await fetch("/api/investor/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "আপলোড ব্যর্থ");
      } else {
        onUploaded(data.url);
      }
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt={label}
            className="w-16 h-16 rounded-lg object-cover border border-green-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs">
            নেই
          </div>
        )}
        <label className="cursor-pointer bg-white border border-green-200 text-green-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-50 transition">
          {uploading
            ? "আপলোড হচ্ছে..."
            : currentUrl
              ? "পরিবর্তন করুন"
              : "ছবি দিন"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function InvestorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<InvestorProfile | null>(null);

  // OTP state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMsg, setOtpMsg] = useState("");

  // Profile form state
  const [fatherName, setFatherName] = useState("");
  const [address, setAddress] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/investor/profile");
      const data = await res.json();
      if (res.ok) {
        const p: InvestorProfile | null = data.profile;
        setProfile(p);
        if (p) {
          setFatherName(p.fatherName || "");
          setAddress(p.address || "");
          setNidNumber(p.nidNumber || "");
          setPaymentNumber(p.paymentNumber || "");
          setAcceptTerms(Boolean(p.termsAcceptedAt));
        }
      } else {
        router.replace("/login");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function requestOtp() {
    setOtpError("");
    setOtpMsg("");
    if (!email.includes("@")) {
      setOtpError("সঠিক ইমেইল দিন");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch("/api/investor/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "কোড পাঠানো যায়নি");
      } else {
        setOtpSent(true);
        setOtpMsg(data.message || "কোড পাঠানো হয়েছে");
      }
    } catch {
      setOtpError("সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setOtpBusy(false);
    }
  }

  async function verifyOtp() {
    setOtpError("");
    setOtpMsg("");
    if (!otp) {
      setOtpError("কোড দিন");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch("/api/investor/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "ভেরিফাই করা যায়নি");
      } else {
        await loadProfile();
      }
    } catch {
      setOtpError("সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setOtpBusy(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaveMsg("");
    if (!acceptTerms) {
      setSaveError("চুক্তির শর্তে সম্মতি দিতে হবে");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/investor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fatherName,
          address,
          nidNumber,
          paymentNumber,
          acceptTerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "সেভ করা যায়নি");
      } else {
        setProfile(data.profile);
        setSaveMsg("সেভ হয়েছে");
      }
    } catch {
      setSaveError("সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        লোড হচ্ছে...
      </div>
    );
  }

  const emailVerified = Boolean(profile?.emailVerified);
  const profileComplete = Boolean(profile?.profileCompletedAt);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/customer/dashboard"
          className="text-sm text-gray-500 hover:text-green-700"
        >
          ← ড্যাশবোর্ডে ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-green-800 mt-2">
          বিনিয়োগকারী প্রোফাইল
        </h1>
      </div>

      {profileComplete && (
        <div
          className={`border rounded-2xl p-5 mb-6 ${
            profile?.verificationStatus === "APPROVED"
              ? "bg-green-50 border-green-200"
              : profile?.verificationStatus === "REJECTED"
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
          }`}
        >
          {profile?.verificationStatus === "APPROVED" ? (
            <>
              <p className="text-green-800 font-bold text-sm">
                ✅ আপনার প্রোফাইল অনুমোদিত হয়েছে
              </p>
              <p className="text-gray-600 text-sm mt-1">
                শীঘ্রই এখান থেকেই সরাসরি বিনিয়োগ করা যাবে — সেই অংশটি এখনো তৈরি
                হচ্ছে।
              </p>
            </>
          ) : profile?.verificationStatus === "REJECTED" ? (
            <>
              <p className="text-red-700 font-bold text-sm">
                ❌ আপনার প্রোফাইল বাতিল হয়েছে
              </p>
              {profile.rejectionReason && (
                <p className="text-gray-600 text-sm mt-1">
                  কারণ: {profile.rejectionReason}
                </p>
              )}
              <p className="text-gray-600 text-sm mt-1">
                নিচের তথ্য/ছবি ঠিক করে আবার সেভ করুন।
              </p>
            </>
          ) : (
            <>
              <p className="text-yellow-800 font-bold text-sm">
                🔎 আপনার প্রোফাইল রিভিউ হচ্ছে
              </p>
              <p className="text-gray-600 text-sm mt-1">
                আমরা যাচাই করে শীঘ্রই জানাব।
              </p>
            </>
          )}
        </div>
      )}

      {/* ধাপ ১: ইমেইল OTP ভেরিফিকেশন */}
      {!emailVerified && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-green-800 text-base">
            ধাপ ১ — ইমেইল ভেরিফাই করুন
          </h2>
          {!otpSent ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <button
                onClick={requestOtp}
                disabled={otpBusy}
                className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {otpBusy ? "পাঠানো হচ্ছে..." : "কোড পাঠান"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="৬ সংখ্যার কোড"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <button
                onClick={verifyOtp}
                disabled={otpBusy}
                className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {otpBusy ? "যাচাই হচ্ছে..." : "ভেরিফাই করুন"}
              </button>
            </div>
          )}
          {otpSent && (
            <button
              onClick={requestOtp}
              disabled={otpBusy}
              className="text-xs text-green-700 font-bold hover:underline"
            >
              আবার কোড পাঠান
            </button>
          )}
          {otpError && <p className="text-red-500 text-sm">{otpError}</p>}
          {otpMsg && !otpError && (
            <p className="text-green-700 text-sm">{otpMsg}</p>
          )}
        </div>
      )}

      {/* ধাপ ২: প্রোফাইল সম্পূর্ণ করুন */}
      {emailVerified && (
        <form
          onSubmit={saveProfile}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-5 mt-6"
        >
          <h2 className="font-bold text-green-800 text-base">
            ধাপ ২ — প্রোফাইল সম্পূর্ণ করুন
          </h2>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              পিতার নাম
            </label>
            <input
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              বর্তমান ঠিকানা
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              এনআইডি নম্বর
            </label>
            <input
              type="text"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              বিকাশ/ব্যাংক নম্বর (টাকা লেনদেনের জন্য)
            </label>
            <input
              type="text"
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <DocUpload
              label="এনআইডি-র ছবি"
              kind="nid"
              currentUrl={profile?.nidImageUrl ?? null}
              onUploaded={(url) =>
                setProfile((p) => (p ? { ...p, nidImageUrl: url } : p))
              }
            />
            <DocUpload
              label="পাসপোর্ট সাইজ ছবি"
              kind="photo"
              currentUrl={profile?.photoImageUrl ?? null}
              onUploaded={(url) =>
                setProfile((p) => (p ? { ...p, photoImageUrl: url } : p))
              }
            />
            <DocUpload
              label="স্বাক্ষরের ছবি"
              kind="signature"
              currentUrl={profile?.signatureImageUrl ?? null}
              onUploaded={(url) =>
                setProfile((p) => (p ? { ...p, signatureImageUrl: url } : p))
              }
            />
          </div>

          <label className="flex items-start gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-600">
              আমি বিনিয়োগের শর্তাবলীর সাথে সম্মত এবং এই তথ্য সঠিক বলে
              নিশ্চিত করছি।
            </span>
          </label>

          {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
          {saveMsg && !saveError && (
            <p className="text-green-700 text-sm">{saveMsg}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? "সেভ হচ্ছে..." : "প্রোফাইল সেভ করুন"}
          </button>
        </form>
      )}

      {profile?.verificationStatus === "APPROVED" && <InvestmentsSection />}
    </div>
  );
}