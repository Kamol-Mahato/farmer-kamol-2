// ✅ পণ্যের একক (unit) অনুযায়ী কত KG-এর সমান — pure ফাংশন, সার্ভার ও ক্লায়েন্ট দুই জায়গাতেই ব্যবহার করা যায়
export function getUnitToKgMultiplier(unit: string): number {
    const map: Record<string, number> = {
      কেজি: 1,
      "৫০০ গ্রাম": 0.5,
      "২৫০ গ্রাম": 0.25,
      গ্রাম: 0.001,
      লিটার: 1,
      মিলি: 0.001,
      পিস: 1,
      ডজন: 1,
    };
    return map[unit] ?? 1;
  }