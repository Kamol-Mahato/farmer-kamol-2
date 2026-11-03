// lib/siteConfig.ts
// এই ফাইলটাই siteConfig — প্রতিটা ক্লায়েন্ট সাইটের জন্য শুধু এই একটা ফাইল বদলালেই হবে

export const siteConfig = {
  // ব্র্যান্ড পরিচিতি
  brand: {
    name: "Farmer Kamol",
    nameEn: "Farmer Kamol",
    nameBn: "কৃষক কমল",
    displayName: "Farmer Kamol – কৃষক কমল",
    alternateNames: ["Krishok Kamol", "Krishak Kamal"],
    slogan: "খামার থেকে আপনার দরজায়",
    sloganEn: "From the Farm to Your Door",
    founderName: "Kamol Kumar Mahato",
    founderNameBn: "কমল কুমার মাহাতো",
    youtubeHandle: "@FarmerKamol",
    foundingYear: "2026",
  },

  // পেমেন্ট সংক্রান্ত তথ্য
  payment: {
    bkashNumber: "01737939688",
    nagadNumber: "01737939688",
    bank: {
      accountName: "", // এখনো যোগ করা হয়নি
      accountNumber: "", // এখনো যোগ করা হয়নি
      bankName: "", // এখনো যোগ করা হয়নি
      branch: "", // এখনো যোগ করা হয়নি
    },
  },

  // ডোমেইন ও URL
  domain: {
    url: "https://farmerkamol.com",
    host: "farmerkamol.com",
    ogImage: "/uploads/og-image.jpg",
    logo: "/uploads/logo.png",
  },

  // যোগাযোগ তথ্য
  contact: {
    phone: "+8801737939688",
    phoneDisplay: "01737939688",
    whatsapp: "8801737939688",
    email: "contact@farmerkamol.com",
  },

  // ঠিকানা
  address: {
    locality: "রায়গঞ্জ",
    localityEn: "Raiganj",
    region: "সিরাজগঞ্জ",
    regionEn: "Sirajganj",
    village: "সারইল",
    villageEn: "Sarail",
    country: "BD",
    latitude: 24.53776236620221,
    longitude: 89.40731198780867,
  },

  // সোশ্যাল লিংক
  social: {
    facebook: "https://www.facebook.com/farmerkamol",
    youtube: "https://youtube.com/@FarmerKamol",
    instagram: "https://www.instagram.com/farmer.kamol",
    tiktok: "https://www.tiktok.com/@farmer.kamol",
  },

  // মেটাডেটা / SEO
  seo: {
    defaultTitle: "Farmer Kamol – কৃষক কমল | খামার থেকে আপনার দরজায়",
    titleTemplate: "%s | Farmer Kamol",
    description:
    "Farmer Kamol – কৃষক কমল: সিরাজগঞ্জের নিজস্ব খামার থেকে সরাসরি খাঁটি মধু, খাঁটি গরুর ঘি, ভেজালমুক্ত সরিষার তেল, খেজুরের গুড় ও হাঁসের বাচ্চা — সারা বাংলাদেশে হোম ডেলিভারি। ঢাকার মধ্যে ২৪ ঘন্টায়, ঢাকার বাইরে ৪৮ ঘন্টায় পৌঁছে দিই। মধ্যস্থতাকারী ছাড়া কৃষকের কাছ থেকে সরাসরি কিনুন, অর্ডার বা যেকোনো জিজ্ঞাসায় WhatsApp অথবা কল করুন।",
    descriptionEn:
    "Farmer Kamol – কৃষক কমল: Pure honey, pure cow ghee, adulteration-free mustard oil, date palm jaggery and duck chicks, straight from our own farm in Sirajganj, with home delivery across Bangladesh. We deliver within 24 hours inside Dhaka and within 48 hours outside Dhaka. Buy directly from the farmer with no middlemen, and for orders or any inquiry, WhatsApp or call us.",
    keywords: [
      "খাঁটি মধু",
      "সরিষার তেল",
      "দেশি ঘি",
      "চীন হাঁসের বাচ্চা",
      "সিরাজগঞ্জ খামার",
      "Farmer Kamol",
      "কৃষক কমল",
      "Farmer Kamol কৃষক কমল",
    ],
  },

  // ব্যবসায়িক তথ্য
  business: {
    priceRange: "৳50-৳3000",
    paymentAccepted: "Cash on Delivery, bKash, Nagad",
    currenciesAccepted: "BDT",
    orderIdPrefix: "FK", // FK-YYYY-MM-DD-00001
    openingHours: {
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  },

  // অ্যানালিটিক্স
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
