"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { siteConfig } from "@/lib/siteConfig";

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

const OWNER_NAME = "কমল কুমার মাহাতো (Farmer Kamol)";
const OWNER_ADDRESS = "গ্রাম: সরাইল, জেলা: সিরাজগঞ্জ, বাংলাদেশ";
const OWNER_PHOTO = "/uploads/kamol-mahato-own.jpg";
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
          className="w-24 h-24 rounded-lg object-cover border border-green-200 mx-auto mb-2"
        />
      ) : (
        <div className="w-24 h-24 rounded-lg bg-gray-100 mx-auto mb-2" />
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
  const [qrUrl, setQrUrl] = useState("");

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

  useEffect(() => {
    if (!data) return;
    QRCode.toDataURL(
      `${siteConfig.domain.url}/verify/${data.agreement.agreementNo}`,
      { width: 96, margin: 1 },
    ).then(setQrUrl);
  }, [data]);

  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const buildPrintHTML = () => {
    const docEl = document.querySelector(".agreement-doc");
    const footerEl = document.querySelector(".agreement-footer");
    const styleLinks = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    )
      .map(
        (link) =>
          `<link rel="stylesheet" href="${(link as HTMLLinkElement).href}">`,
      )
      .join("\n");

    return `
      <html>
        <head>
          <title>বিনিয়োগ চুক্তিপত্র - ${data?.agreement.agreementNo ?? ""}</title>
          ${styleLinks}
          <style>
            * { box-sizing: border-box; }
            html, body { padding: 0; margin: 0; background: #fff; }
            @media print {
              @page { size: A4; margin: 12mm; }
              body { -webkit-print-color-adjust: exact; }
            }
            .agreement-doc {
              box-shadow: none !important;
              border: none !important;
              max-width: 100% !important;
              margin: 0 !important;
            }
            .agreement-footer {
              display: block !important;
              text-align: center;
              font-size: 9px;
              color: #9CA3AF;
              padding: 10px 0;
            }
          </style>
        </head>
        <body>
          ${docEl ? docEl.outerHTML : ""}
          ${footerEl ? footerEl.outerHTML : ""}
        </body>
      </html>
    `;
  };

  const printAgreement = () => {
    const iframe = printIframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) return;
    doc.open();
    doc.write(buildPrintHTML());
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 500);
  };

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
          onClick={printAgreement}
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
              খামার থেকে আপনার দরজায়
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
              প্রকৃত লাভ খামারের বাস্তব ফলাফলের উপর নির্ভরশীল এবং তা প্রথম পক্ষ{" "}
              {100 - (data.agreement.profitSharePct ?? 35)}% ও দ্বিতীয় পক্ষ{" "}
              {data.agreement.profitSharePct ?? 35}% অনুপাতে ভাগ হবে। কোনো
              নির্দিষ্ট মেয়াদে প্রকৃত লাভ না হলে সেই মেয়াদে কোনো অর্থ বণ্টন হবে না।
            </li>
            <li>
              প্রকল্পে প্রকৃত ক্ষতি হলে, সেই মুহূর্তে অবশিষ্ট মূলধন (সম্পূর্ণ
              মূলধনের নিশ্চয়তা ছাড়াই, বাস্তবে যা অবশিষ্ট থাকে) দ্বিতীয় পক্ষকে
              ফেরত দেওয়া হবে। উভয় পক্ষ স্বীকার করছে যে কৃষিভিত্তিক ব্যবসায়
              ক্ষতির ঝুঁকি স্বাভাবিক এবং তা অগ্রিম নিশ্চিতভাবে এড়ানো সম্ভব নয়।
            </li>
            <li>
              কোনো নির্দিষ্ট মেয়াদে প্রত্যাশিত লাভের চেয়ে বাস্তব লাভ বেশি হলে,
              প্রথম পক্ষ তার একক সিদ্ধান্তে দ্বিতীয় পক্ষকে অতিরিক্ত অংশ (বোনাস)
              দিতে পারে — এই অতিরিক্ত অংশ সংশ্লিষ্ট Settlement Statement-এ
              উল্লেখ থাকবে।
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
              আলোচনার মাধ্যমে সমাধানের চেষ্টা করা হবে। তা সম্ভব না হলে, এই
              চুক্তি বাংলাদেশের প্রচলিত আইন দ্বারা পরিচালিত হবে এবং এখতিয়ার
              থাকবে সিরাজগঞ্জ জেলার আদালতে।
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

        {/* সাক্ষী */}
        <div className="grid grid-cols-2 gap-8 border-t pt-6 mt-6 text-sm">
          <div>
            <p className="text-xs font-bold text-green-700 uppercase mb-4">
              সাক্ষী ১
            </p>
            <div className="h-10 border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-400">নাম, ঠিকানা ও স্বাক্ষর</p>
          </div>
          <div>
            <p className="text-xs font-bold text-green-700 uppercase mb-4">
              সাক্ষী ২
            </p>
            <div className="h-10 border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-400">নাম, ঠিকানা ও স্বাক্ষর</p>
          </div>
        </div>

        {/* যাচাই QR */}
        <div className="flex items-center justify-center gap-4 border-t pt-6 mt-6">
          {qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="যাচাই QR কোড" className="w-20 h-20" />
          )}
          <div className="text-left">
            <p className="text-xs font-bold text-gray-600">
              এই চুক্তি যাচাই করতে QR স্ক্যান করুন
            </p>
            <p className="text-[11px] text-gray-400 break-all">
              {siteConfig.domain.url}/verify/{data.agreement.agreementNo}
            </p>
          </div>
        </div>
      </div>
      <div className="agreement-footer">
        Farmer Kamol · {data.agreement.agreementNo} · গোপনীয় নথি
      </div>

      <style>{`
        .agreement-footer { display: none; }
      `}</style>
      <iframe ref={printIframeRef} title="print-frame" style={{ display: "none" }} />
    </div>
  );
}