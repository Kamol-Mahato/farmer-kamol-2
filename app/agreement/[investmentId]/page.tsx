"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface AgreementData {
  id: number;
  amount: number;
  termMonths: number | null;
  createdAt: string;
  project: { name: string; description: string | null };
  agreement: {
    agreementNo: string;
    profitSharePct: number | null;
    generatedAt: string;
  };
  investorProfile: {
    fatherName: string | null;
    address: string | null;
    nidNumber: string | null;
    photoImageUrl: string | null;
    signatureImageUrl: string | null;
    user: { name: string | null; phone: string };
  };
}

const OWNER_NAME = "কমল কুমার মাহাতো (ফার্মার কমল)";
const OWNER_ADDRESS = "গ্রাম: সরাইল, জেলা: সিরাজগঞ্জ, বাংলাদেশ";
const OWNER_PHOTO = "/uploads/kamol.png";
const OWNER_SIGNATURE = "/uploads/komol-signature.png";

function Signatory({
  photo,
  signature,
  name,
  role,
  extra,
}: {
  photo: string | null;
  signature: string | null;
  name: string;
  role: string;
  extra?: string;
}) {
  return (
    <div className="text-center flex-1">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          className="w-16 h-16 rounded-full object-cover border border-green-200 mx-auto mb-2"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-2" />
      )}
      <div className="h-14 flex items-end justify-center border-b border-gray-400 mb-1 px-4">
        {signature && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={signature} alt="স্বাক্ষর" className="max-h-14 object-contain" />
        )}
      </div>
      <p className="font-bold text-gray-800 text-sm">{name}</p>
      <p className="text-xs text-gray-500">{role}</p>
      {extra && <p className="text-xs text-gray-400">{extra}</p>}
    </div>
  );
}

export default function AgreementPage() {
  const params = useParams();
  const investmentId = params.investmentId as string;
  const [data, setData] = useState<AgreementData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/agreement/${investmentId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "লোড করা যায়নি");
        } else {
          setData(json);
        }
      })
      .catch(() => setError("সমস্যা হয়েছে"));
  }, [investmentId]);

  if (error)
    return (
      <div className="text-center py-20 text-red-500 font-medium">{error}</div>
    );
  if (!data)
    return (
      <div className="text-center py-20 text-gray-400 font-medium">
        লোড হচ্ছে...
      </div>
    );

  const investorName = data.investorProfile.user.name || "—";

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto mb-4 flex justify-end gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition"
        >
          🖨️ প্রিন্ট / PDF ডাউনলোড
        </button>
      </div>

      <div className="agreement-doc max-w-3xl mx-auto bg-white p-10 rounded-xl shadow border border-gray-200 text-gray-800">
        {/* Letterhead */}
        <div className="flex items-center justify-between border-b-2 border-green-700 pb-4 mb-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uploads/kamol.png"
              alt="Farmer Kamol"
              className="w-14 h-14 rounded-full object-cover border-2 border-green-700"
            />
            <div>
              <h1 className="text-xl font-extrabold text-green-800">
                Farmer Kamol
              </h1>
              <p className="text-xs text-yellow-600 font-semibold">
                প্রকৃতির খাঁটি উপহার, সরাসরি কৃষকের কাছ থেকে
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-gray-700">বিনিয়োগ চুক্তিপত্র</p>
            <p className="text-sm font-bold text-green-700">
              {data.agreement.agreementNo}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(data.agreement.generatedAt).toLocaleDateString(
                "bn-BD",
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-6 text-gray-700">
          এই চুক্তিপত্রটি নিম্নবর্ণিত দুই পক্ষের মধ্যে সম্পাদিত হলো —
        </p>

        {/* দুই পক্ষের তথ্য */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-bold text-green-700 uppercase mb-2">
              প্রথম পক্ষ (খামার পরিচালক)
            </p>
            <p className="font-bold text-gray-800">{OWNER_NAME}</p>
            <p className="text-gray-600 mt-1">{OWNER_ADDRESS}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-bold text-green-700 uppercase mb-2">
              দ্বিতীয় পক্ষ (বিনিয়োগকারী)
            </p>
            <p className="font-bold text-gray-800">{investorName}</p>
            {data.investorProfile.fatherName && (
              <p className="text-gray-600">
                পিতা: {data.investorProfile.fatherName}
              </p>
            )}
            <p className="text-gray-600">{data.investorProfile.address}</p>
            <p className="text-gray-600">
              এনআইডি: {data.investorProfile.nidNumber}
            </p>
            <p className="text-gray-600">
              মোবাইল: {data.investorProfile.user.phone}
            </p>
          </div>
        </div>

        {/* বিনিয়োগের বিবরণ */}
        <div className="bg-green-50 rounded-lg p-4 mb-6 text-sm">
          <p className="text-xs font-bold text-green-700 uppercase mb-2">
            বিনিয়োগের বিবরণ
          </p>
          <div className="grid grid-cols-2 gap-2">
            <p>
              প্রজেক্ট: <span className="font-bold">{data.project.name}</span>
            </p>
            <p>
              বিনিয়োগের পরিমাণ:{" "}
              <span className="font-bold">
                ৳ {data.amount.toLocaleString("bn-BD")}
              </span>
            </p>
            <p>
              চুক্তির তারিখ:{" "}
              {new Date(data.createdAt).toLocaleDateString("bn-BD")}
            </p>
            <p>
              মেয়াদ:{" "}
              {data.termMonths ? `${data.termMonths} মাস` : "অনির্দিষ্ট"}
            </p>
          </div>
        </div>

        {/* শর্তাবলী */}
        <div className="mb-8 text-sm">
          <p className="text-xs font-bold text-green-700 uppercase mb-3">
            শর্তাবলী
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
            <li>
              এই বিনিয়োগ লাভ-ভাগাভাগি (Profit-Sharing) ভিত্তিতে সম্পাদিত —
              কোনো নির্দিষ্ট হারে রিটার্নের নিশ্চয়তা এখানে দেওয়া হচ্ছে না।
            </li>
            <li>
              প্রকৃত লাভ বা ক্ষতি খামারের বাস্তব ফলাফলের উপর নির্ভরশীল, এবং তা
              উভয় পক্ষের মধ্যে ন্যায্যভাবে ভাগ হবে
              {data.agreement.profitSharePct
                ? ` (দ্বিতীয় পক্ষের অংশ: ${data.agreement.profitSharePct}%)।`
                : " — সুনির্দিষ্ট অনুপাত উভয় পক্ষের পারস্পরিক সম্মতিক্রমে পরবর্তীতে লিখিতভাবে নির্ধারিত হবে।"}
            </li>
            <li>
              সকল আর্থিক লেনদেন (জমা/উত্তোলন) farmerkamol.com-এর
              বিনিয়োগকারী প্যানেলের মাধ্যমে রেকর্ড ও নিশ্চিত করা হবে।
            </li>
            <li>
              মূলধন উত্তোলনের ইচ্ছা থাকলে দ্বিতীয় পক্ষকে যুক্তিসঙ্গত সময়
              আগে প্রথম পক্ষকে জানাতে হবে, যাতে খামারের কার্যক্রম ব্যাহত না
              হয়।
            </li>
            <li>
              এই চুক্তিতে উভয় পক্ষের ইলেকট্রনিক স্বাক্ষর (আপলোডকৃত স্বাক্ষরের
              ছবি) চূড়ান্ত ও বাধ্যতামূলক হিসেবে গণ্য হবে।
            </li>
            <li>
              কোনো মতবিরোধ দেখা দিলে তা প্রথমে উভয় পক্ষের পারস্পরিক
              আলোচনার মাধ্যমে সমাধানের চেষ্টা করা হবে।
            </li>
          </ol>
        </div>

        {/* স্বাক্ষর */}
        <div className="flex gap-8 border-t pt-6">
          <Signatory
            photo={OWNER_PHOTO}
            signature={OWNER_SIGNATURE}
            name={OWNER_NAME}
            role="প্রথম পক্ষ"
          />
          <Signatory
            photo={data.investorProfile.photoImageUrl}
            signature={data.investorProfile.signatureImageUrl}
            name={investorName}
            role="দ্বিতীয় পক্ষ"
          />
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .agreement-doc { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}