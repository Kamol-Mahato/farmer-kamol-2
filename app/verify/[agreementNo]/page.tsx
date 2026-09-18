import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/siteConfig";

// লগইন ছাড়াই যে কেউ খুলতে পারবে — তাই এখানে শুধু নন-সেনসিটিভ তথ্য দেখানো হয়
function maskName(fullName: string | null | undefined): string {
  if (!fullName) return "—";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return [parts[0], ...parts.slice(1).map((p) => p[0] + ".")].join(" ");
}

export default async function VerifyAgreementPage({
  params,
}: {
  params: Promise<{ agreementNo: string }>;
}) {
  const { agreementNo } = await params;

  const agreement = await prisma.agreement.findUnique({
    where: { agreementNo },
    include: {
      investment: {
        include: {
          project: { select: { name: true } },
          investorProfile: {
            select: { user: { select: { name: true } } },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        {agreement ? (
          <>
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h1 className="text-lg font-extrabold text-green-800 mb-1">
              বৈধ চুক্তি নথি
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              এই agreementNo Farmer Kamol-এর রেকর্ডে নিশ্চিতভাবে বিদ্যমান।
            </p>

            <div className="text-left bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p>
                <span className="text-gray-500">চুক্তি নম্বর: </span>
                <span className="font-bold text-gray-800">
                  {agreement.agreementNo}
                </span>
              </p>
              <p>
                <span className="text-gray-500">প্রকল্প: </span>
                <span className="font-bold text-gray-800">
                  {agreement.investment.project.name}
                </span>
              </p>
              <p>
                <span className="text-gray-500">দ্বিতীয় পক্ষ: </span>
                <span className="font-bold text-gray-800">
                  {maskName(agreement.investment.investorProfile.user.name)}
                </span>
              </p>
              <p>
                <span className="text-gray-500">তারিখ: </span>
                <span className="font-bold text-gray-800">
                  {agreement.generatedAt.toLocaleDateString("bn-BD", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              সম্পূর্ণ চুক্তির বিস্তারিত তথ্য শুধুমাত্র সংশ্লিষ্ট বিনিয়োগকারী ও
              Farmer Kamol কর্তৃপক্ষ দেখতে পারেন।
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              ✕
            </div>
            <h1 className="text-lg font-extrabold text-red-700 mb-1">
              নথি যাচাই করা যায়নি
            </h1>
            <p className="text-sm text-gray-500">
              এই agreementNo Farmer Kamol-এর রেকর্ডে পাওয়া যায়নি।{" "}
              <Link
                href={siteConfig.domain.url}
                className="text-green-700 underline"
              >
                farmerkamol.com
              </Link>{" "}
              এর সাথে সরাসরি যোগাযোগ করুন।
            </p>
          </>
        )}
      </div>
    </div>
  );
}