"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InvestmentsSection from "./InvestmentsSection";
import { districts, upazilas } from "@/lib/bd-locations";
import {
  DistrictSearch,
  UpazilaSearch,
  getEnglishUpazilas,
} from "@/app/en/components/LocationSearchEn";
import { normalizePhone, isValidBDPhone } from "@/lib/phone";

interface InvestorProfile {
  email: string | null;
  emailVerified: boolean;
  user?: { name: string | null; phone: string } | null;
  fatherName: string | null;
  motherName: string | null;
  district: string | null;
  upazila: string | null;
  address: string | null;
  nidNumber: string | null;
  nidImageUrl: string | null;
  photoImageUrl: string | null;
  signatureImageUrl: string | null;
  paymentNumber: string | null;
  nomineeName: string | null;
  nomineePhone: string | null;
  nomineeRelation: string | null;
  nomineeNid: string | null;
  nomineeImageUrl: string | null;
  termsAcceptedAt: string | null;
  profileCompletedAt: string | null;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
}

// API-তে EN ভাষার header (API message গুলো এই header দেখে ইংরেজি/বাংলা বেছে নেয়)
const JSON_HEADERS = { "Content-Type": "application/json", "x-locale": "en" };

// BN পেজ থেকে সেভ হওয়া বাংলা জেলা/উপজেলাও যেন EN পেজে ইংরেজিতে দেখায়
function toEnDistrict(name: string | null): string {
  if (!name) return "";
  const m = districts.find((d) => d.name === name || d.en_name === name);
  return m ? m.en_name : name;
}

function toEnUpazila(district: string | null, upazila: string | null): string {
  if (!upazila) return "";
  const dm = districts.find(
    (d) => d.name === district || d.en_name === district,
  );
  if (!dm) return upazila;
  const bnList = upazilas[dm.id] || [];
  const enList = getEnglishUpazilas(dm.id);
  const idx = bnList.indexOf(upazila);
  return idx >= 0 && enList[idx] ? enList[idx] : upazila;
}

function DocUpload({
  label,
  kind,
  currentUrl,
  onUploaded,
  round,
}: {
  label: string;
  kind: "nid" | "photo" | "signature" | "nominee";
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  round?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    // সাথে সাথে লোকাল প্রিভিউ
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const res = await fetch("/api/investor/upload", {
        method: "POST",
        headers: { "x-locale": "en" },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        setLocalPreview(null);
      } else {
        onUploaded(data.url);
        setLocalPreview(null);
      }
    } catch {
      setError("Something went wrong, please try again");
      setLocalPreview(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const displayUrl = localPreview || currentUrl;

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt={label}
            className={`w-16 h-16 object-cover border border-green-200 ${
              round ? "rounded-full" : "rounded-lg"
            } ${uploading ? "opacity-60" : ""}`}
          />
        ) : (
          <div
            className={`w-16 h-16 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs ${
              round ? "rounded-full" : "rounded-lg"
            }`}
          >
            None
          </div>
        )}
        <label className="cursor-pointer bg-white border border-green-200 text-green-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-50 transition">
          {uploading
            ? "Uploading..."
            : currentUrl
              ? "Change"
              : "Add photo"}
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
  const [motherName, setMotherName] = useState("");
  const [district, setDistrict] = useState("");
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [upazila, setUpazila] = useState("");
  const [address, setAddress] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineePhone, setNomineePhone] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");
  const [nomineeNid, setNomineeNid] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editOtpStep, setEditOtpStep] = useState(false); // OTP স্ক্রিন দেখাবে
  const [editOtp, setEditOtp] = useState("");
  const [editOtpSent, setEditOtpSent] = useState(false);
  const [editOtpBusy, setEditOtpBusy] = useState(false);
  const [editOtpError, setEditOtpError] = useState("");
  const [editOtpMsg, setEditOtpMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/en/login");
      return;
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/investor/profile", {
        headers: { "x-locale": "en" },
      });
      const data = await res.json();
      if (res.ok) {
        const p: InvestorProfile | null = data.profile;
        setProfile(p);
        if (p) {
          setFatherName(p.fatherName || "");
          setMotherName(p.motherName || "");
          const dMatch = districts.find(
            (d) => d.name === p.district || d.en_name === p.district,
          );
          setDistrict(dMatch ? dMatch.en_name : p.district || "");
          setDistrictId(dMatch?.id ?? null);
          setUpazila(toEnUpazila(p.district, p.upazila));
          setAddress(p.address || "");
          setNidNumber(p.nidNumber || "");
          setPaymentNumber(p.paymentNumber || "");
          setNomineeName(p.nomineeName || "");
          setNomineePhone(p.nomineePhone || "");
          setNomineeRelation(p.nomineeRelation || "");
          setNomineeNid(p.nomineeNid || "");
          setAcceptTerms(Boolean(p.termsAcceptedAt));
        }
      } else {
        router.replace("/en/login");
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
      setOtpError("Enter a valid email");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch("/api/investor/request-otp", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Could not send the code");
      } else {
        setOtpSent(true);
        setOtpMsg(data.message || "Code sent");
      }
    } catch {
      setOtpError("Something went wrong, please try again");
    } finally {
      setOtpBusy(false);
    }
  }

  async function verifyOtp() {
    setOtpError("");
    setOtpMsg("");
    if (!otp) {
      setOtpError("Enter the code");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch("/api/investor/verify-otp", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Could not verify");
      } else {
        await loadProfile();
      }
    } catch {
      setOtpError("Something went wrong, please try again");
    } finally {
      setOtpBusy(false);
    }
  }

  async function startEdit() {
    // এডিট বাটন → আগে OTP স্টেপ
    setEditOtpStep(true);
    setEditOtp("");
    setEditOtpSent(false);
    setEditOtpError("");
    setEditOtpMsg("");
    setEditing(false);
  }

  async function requestEditOtp() {
    setEditOtpError("");
    setEditOtpMsg("");
    if (!profile?.email) {
      setEditOtpError("Email not found");
      return;
    }
    setEditOtpBusy(true);
    try {
      const res = await fetch("/api/investor/request-otp", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email: profile.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditOtpError(data.error || "Could not send the code");
      } else {
        setEditOtpSent(true);
        setEditOtpMsg(data.message || "Code sent");
      }
    } catch {
      setEditOtpError("Something went wrong, please try again");
    } finally {
      setEditOtpBusy(false);
    }
  }

  async function verifyEditOtp() {
    setEditOtpError("");
    setEditOtpMsg("");
    if (!editOtp.trim()) {
      setEditOtpError("Enter the code");
      return;
    }
    setEditOtpBusy(true);
    try {
      const res = await fetch("/api/investor/verify-otp", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ otp: editOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditOtpError(data.error || "Could not verify");
      } else {
        setEditOtpStep(false);
        setEditing(true);
        setEditOtp("");
        setEditOtpSent(false);
      }
    } catch {
      setEditOtpError("Something went wrong, please try again");
    } finally {
      setEditOtpBusy(false);
    }
  }

  function cancelEditFlow() {
    setEditOtpStep(false);
    setEditing(false);
    setEditOtp("");
    setEditOtpSent(false);
    setEditOtpError("");
    setEditOtpMsg("");
    loadProfile();
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaveMsg("");

    if (!fatherName.trim()) {
      setSaveError("Enter your father's name");
      return;
    }
    if (!motherName.trim()) {
      setSaveError("Enter your mother's name");
      return;
    }
    if (!district.trim()) {
      setSaveError("Select your district");
      return;
    }
    if (!upazila.trim()) {
      setSaveError("Select your upazila");
      return;
    }
    if (!address.trim()) {
      setSaveError("Enter your full address");
      return;
    }
    if (!nidNumber.trim()) {
      setSaveError("Enter your NID number");
      return;
    }
    const payPhone = normalizePhone(paymentNumber);
    if (!isValidBDPhone(payPhone)) {
      setSaveError("Enter a valid bKash/mobile number (01XXXXXXXXX)");
      return;
    }
    if (!profile?.nidImageUrl) {
      setSaveError("Upload your NID photo");
      return;
    }
    if (!profile?.photoImageUrl) {
      setSaveError("Upload your passport-size photo");
      return;
    }
    if (!profile?.signatureImageUrl) {
      setSaveError("Upload your signature photo");
      return;
    }
    if (!nomineeName.trim()) {
      setSaveError("Enter the nominee's name");
      return;
    }
    const nomPhone = normalizePhone(nomineePhone);
    if (!isValidBDPhone(nomPhone)) {
      setSaveError("Enter a valid nominee mobile number (01XXXXXXXXX)");
      return;
    }
    if (!nomineeRelation.trim()) {
      setSaveError("Enter your relationship with the nominee");
      return;
    }
    if (!nomineeNid.trim()) {
      setSaveError("Enter the nominee's NID number");
      return;
    }
    if (!profile?.nomineeImageUrl) {
      setSaveError("Upload the nominee's photo");
      return;
    }
    if (!acceptTerms) {
      setSaveError("You must agree to the terms of the agreement");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/investor/profile", {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          fatherName: fatherName.trim(),
          motherName: motherName.trim(),
          district: district.trim(),
          upazila: upazila.trim(),
          address: address.trim(),
          nidNumber: nidNumber.trim(),
          paymentNumber: payPhone,
          nomineeName: nomineeName.trim(),
          nomineePhone: nomPhone,
          nomineeRelation: nomineeRelation.trim(),
          nomineeNid: nomineeNid.trim(),
          acceptTerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Could not save");
      } else {
        setProfile(data.profile);
        setSaveMsg("Saved");
        setEditing(false);
        setEditOtpStep(false);
        setEditOtp("");
        setEditOtpSent(false);
      }
    } catch {
      setSaveError("Something went wrong, please try again");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Loading...
      </div>
    );
  }

  const emailVerified = Boolean(profile?.emailVerified);
  const profileComplete = Boolean(profile?.profileCompletedAt);

  // সেভ করা জেলা/উপজেলা ইংরেজিতে দেখানোর জন্য
  const shownDistrict = toEnDistrict(profile?.district ?? null);
  const shownUpazila = toEnUpazila(
    profile?.district ?? null,
    profile?.upazila ?? null,
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/en/customer/dashboard"
          className="text-sm text-gray-500 hover:text-green-700"
        >
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-green-800 mt-2">
          Investor Profile
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
                ✅ Your profile has been approved
              </p>
              <p className="text-gray-600 text-sm mt-1">
                You will soon be able to invest directly from here — that
                section is still being built.
              </p>
            </>
          ) : profile?.verificationStatus === "REJECTED" ? (
            <>
              <p className="text-red-700 font-bold text-sm">
                ❌ Your profile was rejected
              </p>
              {profile.rejectionReason && (
                <p className="text-gray-600 text-sm mt-1">
                  Reason: {profile.rejectionReason}
                </p>
              )}
              <p className="text-gray-600 text-sm mt-1">
                Please correct the details/photos below and save again.
              </p>
            </>
          ) : (
            <>
              <p className="text-yellow-800 font-bold text-sm">
                🔎 Your profile is under review
              </p>
              <p className="text-gray-600 text-sm mt-1">
                We will verify it and let you know shortly.
              </p>
            </>
          )}
        </div>
      )}

      {/* —— প্রোফাইল হেডার (রাউন্ড ছবি উপরের ডানে) —— */}
      {emailVerified && profile && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Investor Profile</p>
            <p className="font-bold text-green-800 text-base truncate">
              {profile.user?.name || "Profile"}
            </p>
            {profile.emailVerified && profile.email && (
              <p className="text-xs text-green-700 mt-0.5 flex items-center gap-1">
                <span>✓</span>
                <span className="truncate">{profile.email}</span>
              </p>
            )}
            {(profile.district || profile.upazila) && (
              <p className="text-xs text-gray-500 mt-1">
                {[shownUpazila, shownDistrict].filter(Boolean).join(", ")}
              </p>
            )}
            {profileComplete && !editing && !editOtpStep && (
              <button
                type="button"
                onClick={startEdit}
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition"
              >
                ✎ Edit
              </button>
            )}
            {(editing || editOtpStep) && (
              <button
                type="button"
                onClick={cancelEditFlow}
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
          {/* উপরের ডানে রাউন্ড পাসপোর্ট ছবি */}
          <div className="shrink-0">
            {profile.photoImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoImageUrl}
                alt="Passport"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-green-200 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs">
                Photo
              </div>
            )}
          </div>
        </div>
      )}

      {/* —— এডিট OTP স্টেপ —— */}
      {emailVerified && editOtpStep && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 mb-6 space-y-4">
          <h2 className="font-bold text-green-800 text-base">
            Verify your email to edit
          </h2>
          <p className="text-sm text-gray-600">
            For security, a code will be sent to your verified email (
            <span className="font-semibold text-green-700">
              {profile?.email}
            </span>
            ).
          </p>

          {!editOtpSent ? (
            <button
              type="button"
              onClick={requestEditOtp}
              disabled={editOtpBusy}
              className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {editOtpBusy ? "Sending..." : "Send code"}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={editOtp}
                onChange={(e) => setEditOtp(e.target.value)}
                placeholder="6-digit code"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <button
                type="button"
                onClick={verifyEditOtp}
                disabled={editOtpBusy}
                className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {editOtpBusy ? "Checking..." : "Verify"}
              </button>
            </div>
          )}

          {editOtpMsg && (
            <p className="text-green-700 text-sm">{editOtpMsg}</p>
          )}
          {editOtpError && (
            <p className="text-red-500 text-sm">{editOtpError}</p>
          )}
        </div>
      )}

      {/* —— View মোড: লকড সারাংশ —— */}
      {emailVerified && profileComplete && !editing && !editOtpStep && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 space-y-4 text-sm">
          <h2 className="font-bold text-green-800 text-base">
            Profile Summary
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-gray-500">Name</p>
              <p className="font-semibold text-gray-800">
                {profile?.user?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Verified email</p>
              <p className="font-semibold text-gray-800 text-xs">
                {profile?.emailVerified && profile?.email ? (
                  <span className="text-green-700">✓ {profile.email}</span>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Father&apos;s name</p>
              <p className="font-semibold text-gray-800">
                {profile?.fatherName || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Mother&apos;s name</p>
              <p className="font-semibold text-gray-800">
                {profile?.motherName || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">District / Upazila</p>
              <p className="font-semibold text-gray-800">
                {[shownUpazila, shownDistrict].filter(Boolean).join(", ") ||
                  "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Full address</p>
              <p className="font-semibold text-gray-800">
                {profile?.address || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">NID</p>
              <p className="font-semibold text-gray-800">
                {profile?.nidNumber || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Payment number</p>
              <p className="font-semibold text-gray-800">
                {profile?.paymentNumber || "—"}
              </p>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-[10px] text-gray-500 mb-1">Nominee</p>
            <p className="font-semibold text-gray-800">
              {profile?.nomineeName || "—"}
              {profile?.nomineeRelation ? ` (${profile.nomineeRelation})` : ""}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {profile?.nomineePhone || ""}
              {profile?.nomineeNid ? ` · NID: ${profile.nomineeNid}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {profile?.nidImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.nidImageUrl}
                alt="NID"
                className="w-14 h-14 rounded-lg object-cover border"
              />
            )}
            {profile?.photoImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoImageUrl}
                alt="Photo"
                className="w-14 h-14 rounded-full object-cover border"
              />
            )}
            {profile?.signatureImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.signatureImageUrl}
                alt="Signature"
                className="w-14 h-14 rounded-lg object-cover border"
              />
            )}
            {profile?.nomineeImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.nomineeImageUrl}
                alt="Nominee"
                className="w-14 h-14 rounded-full object-cover border"
              />
            )}
          </div>
        </div>
      )}

      {/* ধাপ ১: ইমেইল OTP ভেরিফিকেশন */}
      {!emailVerified && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-green-800 text-base">
            Step 1 — Verify your email
          </h2>
          {!otpSent ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <button
                onClick={requestOtp}
                disabled={otpBusy}
                className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {otpBusy ? "Sending..." : "Send code"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <button
                onClick={verifyOtp}
                disabled={otpBusy}
                className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {otpBusy ? "Verifying..." : "Verify"}
              </button>
            </div>
          )}
          {otpSent && (
            <button
              onClick={requestOtp}
              disabled={otpBusy}
              className="text-xs text-green-700 font-bold hover:underline"
            >
              Resend code
            </button>
          )}
          {otpError && <p className="text-red-500 text-sm">{otpError}</p>}
          {otpMsg && !otpError && (
            <p className="text-green-700 text-sm">{otpMsg}</p>
          )}
        </div>
      )}

      {/* ধাপ ২: প্রোফাইল সম্পূর্ণ করুন */}
      {emailVerified && (!profileComplete || editing) && (
        <form
          onSubmit={saveProfile}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-5 mt-6"
        >
          <h2 className="font-bold text-green-800 text-base">
            Step 2 — Complete your profile
          </h2>
          <p className="text-xs text-gray-500 -mt-2">
            All fields marked with * are required
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Father&apos;s name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Mother&apos;s name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                District <span className="text-red-500">*</span>
              </label>
              <DistrictSearch
                districts={districts}
                value={district}
                onSelect={(d) => {
                  setDistrict(d.en_name);
                  setDistrictId(d.id);
                  setUpazila("");
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Upazila <span className="text-red-500">*</span>
              </label>
              <UpazilaSearch
                upazilas={districtId ? getEnglishUpazilas(districtId) : []}
                value={upazila}
                onSelect={(u) => setUpazila(u)}
                disabled={!districtId}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Full address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Village/road, house no., etc."
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                NID number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                bKash/Bank number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={paymentNumber}
                onChange={(e) => setPaymentNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <DocUpload
              label="NID photo *"
              kind="nid"
              currentUrl={profile?.nidImageUrl ?? null}
              onUploaded={(url) =>
                setProfile((p) => (p ? { ...p, nidImageUrl: url } : p))
              }
            />
            <DocUpload
              label="Passport photo *"
              kind="photo"
              round
              currentUrl={profile?.photoImageUrl ?? null}
              onUploaded={(url) =>
                setProfile((p) => (p ? { ...p, photoImageUrl: url } : p))
              }
            />
            <DocUpload
              label="Signature photo *"
              kind="signature"
              currentUrl={profile?.signatureImageUrl ?? null}
              onUploaded={(url) =>
                setProfile((p) => (p ? { ...p, signatureImageUrl: url } : p))
              }
            />
          </div>

          {/* —— নমিনি —— */}
          <div className="border-t border-gray-100 pt-5 mt-2 space-y-4">
            <h3 className="font-bold text-green-800 text-sm">
              Nominee details <span className="text-red-500">*</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nominee&apos;s name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nominee&apos;s mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={nomineePhone}
                  onChange={(e) => setNomineePhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  placeholder="e.g. Wife / Son / Daughter"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nominee&apos;s NID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomineeNid}
                  onChange={(e) => setNomineeNid(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <DocUpload
              label="Nominee's photo *"
              kind="nominee"
              round
              currentUrl={profile?.nomineeImageUrl ?? null}
              onUploaded={(url) =>
                setProfile((p) => (p ? { ...p, nomineeImageUrl: url } : p))
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
              I agree to the investment terms and confirm that the information
              provided is correct.
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
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      )}

      {profile?.verificationStatus === "APPROVED" && <InvestmentsSection />}
    </div>
  );
}