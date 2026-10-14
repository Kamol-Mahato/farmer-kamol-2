// হোমপেজের রিভিউ সেকশনের জন্য — আসল approved রিভিউ কম থাকলে পরিচিত ক্রেতাদের এই মতামত পূরণ করে।
// আসল রিভিউ আসার সাথে সাথে একটি করে এখান থেকে সরে যায়।
// এগুলো ডাটাবেসে বা SEO স্কিমায় যায় না — শুধু হোমপেজের ভিজ্যুয়াল সেকশনে দেখায়।

export type TestimonialItem = {
    id: number;
    rating: number; // 0 হলে তারকা দেখাবে না
    comment: string | null;
    user: { name: string | null };
    productLabel?: string | null;
    verified?: boolean;
  };
  
  export type RealReview = {
    id: number;
    rating: number;
    comment: string | null;
    user: { name: string | null };
    product?: { name: string; nameEn: string | null } | null;
  };
  
  // মোট এতগুলো কার্ড দেখাতে আসল রিভিউয়ের সাথে নিচের তালিকা থেকে পূরণ হবে
  const TARGET_COUNT = 5;
  
  type Placeholder = {
    id: number;
    nameBn: string;
    nameEn: string;
    productBn: string;
    productEn: string;
    commentBn: string;
    commentEn: string;
  };
  
  // ক্রম গুরুত্বপূর্ণ — আসল রিভিউ এলে তালিকার শেষেরটি আগে সরে যায়
  const PLACEHOLDERS: Placeholder[] = [
    {
      id: -1,
      nameBn: "মামুন বিশ্বাস",
      nameEn: "Mr. Mamun Biswas",
      productBn: "ঘি",
      productEn: "Ghee",
      commentBn:
        "ঘী এর স্বাদ আর ঘ্রান আসলেই অনেক সুন্দর ছিলো। যেমন ভিডিওতে বলছিলেন তেমনই ছিলো।",
      commentEn:
        "The taste and aroma of the ghee were truly wonderful. It was exactly as described in the video.",
    },
    {
      id: -2,
      nameBn: "নার্গিস খাতুন",
      nameEn: "Nargis Khatun",
      productBn: "সরিষার তেল",
      productEn: "Mustard Oil",
      commentBn:
        "সরিষা তেলের ৫ লিটার টা নিয়েছিলাম প্যাকেট টা সুন্দর ভাবে করা ছিলো , শুধু স্বাদ এই আলাদা না, পণ্য পাঠানোর ব্যবস্থাও টাও অনেক ভালো। ধন্যবাদ Farmer Kamol টিম কে।",
      commentEn:
        "I took the 5-litre mustard oil. The packaging was neat, and it's not just the taste that's different — the delivery arrangement is also very good. Thank you, Farmer Kamol team.",
    },
    {
      id: -3,
      nameBn: "রহিমা বেগম",
      nameEn: "Rahima Begum",
      productBn: "সরিষার তেল",
      productEn: "Mustard Oil",
      commentBn:
        "সরিষা তেল এর ভিডিও দেখে নিয়েছিলাম , রান্নায় আসলেই আলাদা একটা স্বাদ নিয়ে আসছে। পরের বার এখন থেকেই নেবো।",
      commentEn:
        "I bought it after watching the mustard oil video, and it really brings a distinct flavour to cooking. From now on, I'll get it from here next time.",
    },
    {
      id: -4,
      nameBn: "করিম শেখ",
      nameEn: "Karim Shekh",
      productBn: "চিনা হাঁস",
      productEn: "Chinese Ducks",
      commentBn:
        "১০ টা চীনা হাঁসের বাচ্চা নিয়েছিলাম , বাচ্চা গুলো আলহামদুল্লিহা ভালো আছে এখনো পর্যন্ত।",
      commentEn:
        "I bought 10 Chinese ducklings, and thankfully (Alhamdulillah) they are doing well so far.",
    },
    {
      id: -5,
      nameBn: "মো. রাশেদ বিন আহমেদ",
      nameEn: "MD Rashid Bin Ahmed",
      productBn: "ঘি",
      productEn: "Ghee",
      commentBn:
        "ঘী এর প্যাকেট টা আরো ভালো করে প্যাক করতে হবে , অল্পের জন্য ভেঙে যাও নাই। তবে স্বাদ টা ছিল অসাধারন 😍",
      commentEn:
        "The ghee packet needs to be packed more carefully — it almost broke. But the taste was wonderful 😍",
    },
  ];
  
  export function buildTestimonials(
    real: RealReview[],
    locale: "bn" | "en" = "bn",
  ): TestimonialItem[] {
    const isEn = locale === "en";
  
    const realItems: TestimonialItem[] = real.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      user: r.user,
      productLabel: r.product
        ? isEn
          ? r.product.nameEn || r.product.name
          : r.product.name
        : null,
      verified: true,
    }));
  
    const needed = Math.max(0, TARGET_COUNT - realItems.length);
  
    const fillers: TestimonialItem[] = PLACEHOLDERS.slice(0, needed).map((p) => ({
      id: p.id,
      rating: 0,
      comment: isEn ? p.commentEn : p.commentBn,
      user: { name: isEn ? p.nameEn : p.nameBn },
      productLabel: isEn ? p.productEn : p.productBn,
      verified: false,
    }));
  
    return [...realItems, ...fillers];
  }