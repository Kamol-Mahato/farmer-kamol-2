// lib/seoLandingsEn.ts
// কীওয়ার্ড-ল্যান্ডিং পেজের ইংরেজি (EN) কনটেন্ট। slug অবশ্যই lib/seoLandings.ts-এর সঙ্গে হুবহু মিলতে হবে।
// productMatch ইচ্ছা করেই বাংলা রাখা হয়েছে, কারণ ডাটাবেসে পণ্যের নাম বাংলায়, ওই শব্দ দিয়েই পণ্য খোঁজা হয়।
// related-এর href বাংলা পাথেই লেখা (যেমন /shop); EN পেজে সেটা আপনা-আপনি /en/shop হয়ে যাবে।

import type { SeoLanding } from "@/lib/seoLandings";

export const seoLandingsEn: SeoLanding[] = [
  {
    slug: "khejurer-gur",
    updatedAt: "2026-10-19",
    h1: "Pure Date Palm Jaggery (Khejurer Gur) — Liquid and Granular, Delivered Across Bangladesh",
    title: "Buy Pure Date Palm Jaggery (Khejurer Gur) – Liquid & Granular | Farmer Kamol",
    description:
      "Liquid (jhola) and granular (danadar) date palm jaggery made from sap collected from local tappers (gachis) in Sirajganj. 1 kg and half-kg packs delivered across Bangladesh, with process videos.",
    keywords: [
      "date palm jaggery",
      "khejurer gur",
      "pure khejurer gur",
      "liquid date palm jaggery",
      "granular date palm jaggery",
      "buy date palm jaggery Bangladesh",
      "Sirajganj date palm jaggery",
      "date palm jaggery online Bangladesh",
    ],
    productMatch: ["গুড়"],
    intro:
      "Date palm jaggery is one of the most loved flavours of a Bengali winter. At Farmer Kamol, we collect date palm sap from the tappers (gachis) of our own area, Sirajganj, and supply liquid (jhola) and granular (danadar) jaggery made from that sap. You can watch the whole process, from collection to preparation, in the videos on our YouTube channel. We deliver in 1 kg and half-kg packs across Bangladesh.",
    sections: [
      {
        heading: "Liquid Jaggery and Granular Jaggery: What’s the Difference",
        body: [
          "Liquid (jhola) jaggery is thick and syrupy. Many people choose it to eat with flatbread, pitha, payesh or rice.",
          "Granular (danadar) jaggery is grainy or crumbly. It is easier to use and store, which makes it convenient to send over long distances or to keep stocked in the kitchen.",
          "Both are made from the same date palm sap; the difference is mainly in the process and the texture.",
        ],
      },
      {
        heading: "Where This Jaggery Comes From",
        body: [
          "We do not buy from unknown suppliers. We collect date palm sap from familiar tappers in our own area. We film and publish videos of which tapper it is, how the sap is collected and how the jaggery is made, so you can see the source with your own eyes.",
        ],
      },
      {
        heading: "Packaging and Delivery",
        body: [
          "Date palm jaggery is available in 1 kg and half-kg (500 g) packs. We deliver across Bangladesh, and the delivery charge is shown when you place your order. If you have any questions before ordering, you can contact us directly on WhatsApp.",
        ],
      },
      {
        heading: "What to Check Before Buying Pure Jaggery",
        body: [
          "Check whether the seller can show the source, meaning there are videos of the collection and preparation process or a way to contact them directly. A price that is unusually low compared with the market is also a reason to be careful. Supply is limited at the very start of the season and outside it, so it is best to order in advance.",
        ],
      },
      {
        heading: "How to Store Jaggery",
        body: [
          "Keep jaggery in an airtight container in a dry, cool place. Always use a dry spoon, because water can spoil it.",
        ],
      },
    ],
    faqs: [
      {
        q: "Where can I find pure date palm jaggery?",
        a: "You can order date palm jaggery online from Farmer Kamol at farmerkamol.com and get it anywhere in Bangladesh. We collect the sap from tappers in Sirajganj and supply the jaggery.",
      },
      {
        q: "What is the difference between liquid and granular jaggery?",
        a: "Liquid jaggery is thick and syrupy, while granular jaggery is grainy or crumbly. Both are made from date palm sap; the difference is in the process and texture.",
      },
      {
        q: "What pack sizes does date palm jaggery come in?",
        a: "It is available in 1 kg and half-kg (500 g) packs.",
      },
      {
        q: "Do you deliver all over Bangladesh?",
        a: "Yes, we deliver across Bangladesh. The delivery charge is shown when you place your order.",
      },
      {
        q: "What is the price of date palm jaggery?",
        a: "The price can change with the season and the type. Please see the latest price in the product list on this page or on the shop page.",
      },
      {
        q: "Where do you collect the jaggery from?",
        a: "We collect date palm sap from the tappers (gachis) of our own area, Sirajganj. Videos of the collection and preparation process are available on our YouTube channel.",
      },
      {
        q: "How should I store date palm jaggery?",
        a: "Keep it in an airtight container in a dry, cool place, and always use a dry spoon.",
      },
    ],
    related: [
      { label: "Browse All Products", href: "/shop" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: "Return Policy", href: "/return-policy" },
    ],
  },
  {
    slug: "khati-modhu",
    updatedAt: "2026-10-19",
    h1: "Pure Mustard Flower Honey — From Our Own Beehives, Delivered Across Bangladesh",
    title: "Buy Pure Honey – Mustard Flower Honey from Our Own Beehives | Farmer Kamol",
    description:
      "Pure mustard flower honey from our own beehives. Collected with an extractor, no heat, nothing added, bottled as it is. 1 kg and half-kg packs delivered across Bangladesh.",
    keywords: [
      "pure honey",
      "mustard flower honey",
      "mustard honey Bangladesh",
      "Sirajganj honey",
      "beekeeper honey",
      "natural honey",
      "buy pure honey Bangladesh",
      "honey online Bangladesh",
    ],
    productMatch: ["মধু"],
    intro:
      "Farmer Kamol’s honey comes from our own beehives. In the mustard fields around our farm in Sirajganj, the bees collect nectar from the flowers, and we extract the honey ourselves, strain it and bottle it. No heat is applied and nothing is added. You can watch the whole process in the videos on our YouTube and Facebook pages. We deliver in 1 kg and half-kg packs across Bangladesh.",
    sections: [
      {
        heading: "What Is Mustard Flower Honey",
        body: [
          "During the mustard season (usually winter), bees collect nectar from mustard flowers, and the result is called mustard flower honey. This honey is usually light in colour and tends to crystallise faster than many other kinds of honey.",
        ],
      },
      {
        heading: "Where Our Honey Is Made",
        body: [
          "Our beehives are in Sarail village, Raiganj, Sirajganj, close to our farm. Mustard is grown on roughly 60-70 bigha of land within 3 kilometres of the farm, and the bees collect nectar from those flowers.",
          "We started with 15-20 boxes, so supply is limited. As the number of customers grows, we will increase the number of boxes.",
        ],
      },
      {
        heading: "How We Collect and Bottle the Honey",
        body: [
          "We use an extractor, a drum-like machine. The honeycomb frames are placed inside and turned with a handle, and the honey flows out of the comb. It is drawn off through a tap at the bottom of the drum, strained, and then bottled.",
          "No heat is applied to the honey and nothing is mixed into it during this process. Videos of everything, from collection to bottling, are published on our YouTube and Facebook pages.",
        ],
      },
      {
        heading: "What to Do When Honey Crystallises",
        body: [
          "Honey naturally contains glucose and fructose. When the glucose content is high, honey slowly forms grains and sets, which is called crystallisation. Mustard flower honey usually has more glucose, so it can crystallise quickly. Crystallised honey is not necessarily fake. At the same time, crystallisation alone does not prove honey is pure; checking the source and the process is the most reliable way.",
          "To make crystallised honey liquid again, keep the tightly closed jar in lukewarm water for a while. Do not heat it directly on a flame or in a microwave, because too much heat can damage the quality of the honey.",
        ],
      },
      {
        heading: "What to Check Before Buying Pure Honey",
        body: [
          "Check whether the seller can show the source of the honey, meaning there are videos of the collection and process or a way to contact them directly. Home tests (such as dropping honey in water) are not always reliable, so knowing the source is the best approach.",
        ],
      },
      {
        heading: "Packaging and Delivery",
        body: [
          "Honey is available in 1 kg and half-kg (500 g) packs in plastic jars. We deliver across Bangladesh, and the delivery charge is shown when you place your order. If you have any questions before ordering, you can contact us directly on WhatsApp.",
        ],
      },
      {
        heading: "How to Store Honey",
        body: [
          "Keep the lid tightly closed and store it in a dry place away from direct sunlight. Always use a dry spoon. There is usually no need to refrigerate honey; in fact, refrigeration can make it crystallise faster.",
        ],
      },
    ],
    faqs: [
      {
        q: "Where can I find pure honey?",
        a: "You can order honey online from Farmer Kamol at farmerkamol.com and get it anywhere in Bangladesh. This is mustard flower honey collected from our own beehives.",
      },
      {
        q: "Which flower is the honey from?",
        a: "Our honey is mainly mustard flower honey. During the mustard season, the bees collect nectar from the mustard fields around our farm.",
      },
      {
        q: "How do you collect the honey?",
        a: "With an extractor. The honeycomb is placed in the drum and turned with a handle, and the honey is drawn off through a tap at the bottom of the drum, strained and bottled.",
      },
      {
        q: "Is the honey heated or mixed with anything?",
        a: "No. We do not heat the honey and we do not add anything to it. Videos of the collection and bottling are available on our YouTube and Facebook pages.",
      },
      {
        q: "Is honey fake if it crystallises?",
        a: "No, crystallisation is a natural process. Mustard flower honey in particular can crystallise quickly. You can make it liquid again by keeping the closed jar in lukewarm water.",
      },
      {
        q: "What pack sizes does the honey come in?",
        a: "It is available in 1 kg and half-kg (500 g) packs.",
      },
      {
        q: "Do you deliver all over Bangladesh?",
        a: "Yes, we deliver across Bangladesh. The delivery charge is shown when you place your order.",
      },
      {
        q: "What is the price of the honey?",
        a: "Please see the latest price in the product list on this page or on the shop page.",
      },
      {
        q: "Why is the honey supply limited?",
        a: "We started with 15-20 beehive boxes. As the number of customers grows, we will increase the number of boxes.",
      },
      {
        q: "Does your honey have BSTI approval or a lab report?",
        a: "Not yet. When approval or testing is completed, we will announce it on our YouTube and Facebook pages. Until then, you can verify the source through our collection and process videos and by contacting us directly.",
      },
    ],
    related: [
      { label: "Browse All Products", href: "/shop" },
      { label: "Date Palm Jaggery", href: "/khejurer-gur" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    slug: "khati-sorisha-tel",
    updatedAt: "2026-10-19",
    h1: "Pure Mustard Oil — 500 g, 1 kg and 5 kg, Home Delivery Across Bangladesh",
    title: "Buy Pure Mustard Oil – 500 g, 1 kg, 5 kg | Farmer Kamol",
    description:
      "Mustard oil pressed at a mill from mustard grown on our own land and in the Sirajganj area. Bottles of 500 g, 1 kg and 5 kg with home delivery across Bangladesh.",
    keywords: [
      "mustard oil",
      "pure mustard oil",
      "buy mustard oil Bangladesh",
      "Sirajganj mustard oil",
      "mustard oil online Bangladesh",
      "5 kg mustard oil",
      "mill-pressed mustard oil",
      "sorisha tel",
    ],
    productMatch: ["তেল"],
    intro:
      "Farmer Kamol’s mustard oil is made from mustard, part of which is grown on our own land and the rest bought from our own area. The mustard is pressed at a mill to make the oil, and nothing is adulterated or mixed in. We deliver to your home across Bangladesh in plastic bottles of 500 g, 1 kg and 5 kg.",
    sections: [
      {
        heading: "Where Our Mustard Comes From",
        body: [
          "We grow part of our mustard on our own land. The rest we buy from our own area in Sirajganj. So the source of the oil is familiar and close to us, not brought in from a distant, unknown supplier.",
        ],
      },
      {
        heading: "Mill-Pressed Oil vs Ghani Oil: What’s the Difference",
        body: [
          "The ghani is the traditional method of extracting oil from mustard. In a mill, machines are used to press the mustard and extract the oil. Our oil is mill-pressed. What really matters when you buy is whether the seller clearly tells you which method was used to make the oil.",
        ],
      },
      {
        heading: "How to Use Mustard Oil",
        body: [
          "Mustard oil is widely used in Bengali cooking: for cooking fish and vegetables, for bhorta, pickles and mashed dishes. Mustard oil has a natural pungency. Many people heat the oil before cooking, which reduces the pungency a little.",
        ],
      },
      {
        heading: "Packaging and Delivery",
        body: [
          "Mustard oil is available in plastic bottles of 500 g, 1 kg and 5 kg. The 5 kg pack is convenient for a family’s monthly use. We offer home delivery across Bangladesh, and the delivery charge is shown when you place your order. If you have any questions before ordering, you can contact us directly on WhatsApp.",
        ],
      },
      {
        heading: "What to Check Before Buying Pure Mustard Oil",
        body: [
          "Pure mustard oil has the natural aroma and pungency of mustard. But instead of deciding on smell alone, check whether the seller clearly states the source of the mustard and the method of making the oil, and whether you can contact them directly.",
        ],
      },
      {
        heading: "How to Store Mustard Oil",
        body: [
          "Keep the bottle cap tightly closed and store it in a cool, dry place away from direct sunlight. Make sure water or a wet spoon does not get into the bottle.",
        ],
      },
    ],
    faqs: [
      {
        q: "Where can I find pure mustard oil?",
        a: "You can order mustard oil online from Farmer Kamol at farmerkamol.com and get it anywhere in Bangladesh.",
      },
      {
        q: "Where does your mustard come from?",
        a: "Part of it is from our own land, and the rest is bought from our own area in Sirajganj.",
      },
      {
        q: "Is the oil pressed in a ghani or at a mill?",
        a: "Our mustard oil is pressed at a mill.",
      },
      {
        q: "Is anything mixed into the mustard oil?",
        a: "No. Nothing is adulterated or mixed into our mustard oil.",
      },
      {
        q: "What is the difference between ghani oil and mill oil?",
        a: "The ghani is the traditional method of extracting oil from mustard, while in a mill the mustard is pressed with machines. We use a mill, and we state this clearly.",
      },
      {
        q: "What pack sizes does the mustard oil come in?",
        a: "It is available in plastic bottles of 500 g, 1 kg and 5 kg.",
      },
      {
        q: "Do you offer home delivery all over Bangladesh?",
        a: "Yes, we offer home delivery across Bangladesh. The delivery charge is shown when you place your order.",
      },
      {
        q: "What is the price of the mustard oil?",
        a: "Please see the latest price in the product list on this page or on the shop page.",
      },
      {
        q: "How can I reduce the pungency of mustard oil?",
        a: "Heating the oil before using it in cooking reduces the pungency a little.",
      },
      {
        q: "How should I store mustard oil?",
        a: "Keep the cap tightly closed and store it in a cool, dry place away from sunlight.",
      },
    ],
    related: [
      { label: "Browse All Products", href: "/shop" },
      { label: "Pure Honey", href: "/khati-modhu" },
      { label: "Date Palm Jaggery", href: "/khejurer-gur" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    slug: "khati-ghee",
    updatedAt: "2026-10-19",
    h1: "Pure Cow Ghee — Made from Milk of Farms in Pabna and Sirajganj",
    title: "Buy Pure Ghee – Cow Ghee from Pabna & Sirajganj Milk | Farmer Kamol",
    description:
      "Cow ghee made from milk collected from farms in Pabna and Sirajganj. Detailed information on how ghee is made, the technical criteria for judging pure ghee, and how to store it.",
    keywords: [
      "ghee",
      "pure ghee",
      "buy pure ghee",
      "ghee online Bangladesh",
      "how ghee is made",
      "how to identify pure ghee",
      "why ghee crystallises",
      "Sirajganj ghee",
      "Pabna ghee",
      "cow ghee",
      "pure cow ghee",
      "2 kg ghee",
    ],
    productMatch: ["ঘি"],
    intro:
      "Farmer Kamol’s ghee is cow ghee, made from milk collected from farms in Pabna and Sirajganj. We source this ghee from a trusted supplier and supply it to you. This page explains what ghee is, how it is made, how pure ghee can be judged and how to store it, so you can decide for yourself before buying.",
    sections: [
      {
        heading: "What Is Ghee",
        body: [
          "Ghee is milk fat (butterfat), obtained by separating the water and other milk components from butter or cream. Ghee is almost entirely fat and contains very little water. Because of the low water content, properly stored ghee stays good for a relatively long time.",
        ],
      },
      {
        heading: "How Ghee Is Made (The General Method)",
        body: [
          "The general steps of the traditional method are as follows. First, the cream is separated from the milk. Butter is then made by churning that cream. After that, the butter is simmered over low heat.",
          "During simmering, the water in the butter evaporates and the milk solids settle at the bottom and turn slightly brown. These browned solids give ghee its distinctive aroma and flavour. Finally, the ghee is strained, cooled and stored in a container.",
        ],
      },
      {
        heading: "The Source of Our Ghee",
        body: [
          "Our ghee is cow ghee. The milk comes from farms in Pabna and Sirajganj, and the ghee is made from that milk. We source this ghee from a trusted supplier and supply it to you. We plan to make ghee on our own farm in the future, and this page will be updated then.",
        ],
      },
      {
        heading: "Technical Characteristics of Ghee",
        body: [
          "Colour: The colour of ghee can vary with the source of the milk. Cow ghee is usually yellowish, while buffalo ghee is comparatively whiter.",
          "Crystallisation: Ghee can become grainy in the cold or when it cools slowly. This is the result of the fat crystallising and is a natural process. Graininess alone does not make ghee good or bad.",
          "Stability at high heat: Because the water and milk solids have been removed, the smoke point of ghee is usually much higher than that of butter. This is why ghee stays relatively stable for frying and high-heat cooking.",
        ],
      },
      {
        heading: "Technical Criteria for Judging Pure Ghee",
        body: [
          "Home tests, such as looking only at colour, smell or how it sets in the fridge, cannot confirm whether ghee is pure. Certain laboratory tests are used for reliable verification, such as moisture content, free fatty acid level, Reichert-Meissl value (the amount of specific fatty acids in milk fat) and butyro-refractometer reading.",
          "So when buying ghee, the most practical approach is to see whether the seller gives clear information about the source and answers your questions directly.",
        ],
      },
      {
        heading: "Packaging and Delivery",
        body: [
          "Ghee is available in 500 g, 1 kg and 2 kg packs. We deliver across Bangladesh, and the delivery charge is shown when you place your order. If you have any questions before ordering, you can contact us directly on WhatsApp.",
        ],
      },
      {
        heading: "How to Store Ghee",
        body: [
          "Keep ghee in an airtight, dry container. Use a dry spoon every time, because even a little water increases the risk of ghee spoiling. It is best to keep ghee in a cool place away from direct sunlight and heat.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is ghee made from?",
        a: "Ghee is made by simmering cream or butter from milk. As it simmers, the water evaporates and the milk fat, or butterfat, remains as ghee.",
      },
      {
        q: "Where does your ghee come from?",
        a: "It is cow ghee made from milk collected from farms in Pabna and Sirajganj. We source it from a trusted supplier and supply it to you.",
      },
      {
        q: "What pack sizes does the ghee come in?",
        a: "It is available in 500 g, 1 kg and 2 kg packs.",
      },
      {
        q: "Do you deliver all over Bangladesh?",
        a: "Yes, we deliver across Bangladesh. The delivery charge is shown when you place your order.",
      },
      {
        q: "What is the difference between ghee and butter?",
        a: "Butter contains water and milk solids along with the fat. In ghee these are removed, leaving almost only fat. This is why ghee has a longer shelf life and usually a higher smoke point.",
      },
      {
        q: "Has ghee gone bad if it becomes grainy?",
        a: "No. Graininess is a natural result of fat crystallising, which happens in the cold or when ghee cools slowly. When you heat the ghee, it turns liquid again.",
      },
      {
        q: "How can I identify pure ghee?",
        a: "Home tests cannot confirm it. Laboratory tests look at moisture, free fatty acids, Reichert-Meissl value and butyro-refractometer reading. When buying, check how clear the seller is about the source and whether you can contact them directly.",
      },
      {
        q: "How should I store ghee?",
        a: "Keep it in an airtight, dry container away from direct sunlight and heat, and always use a dry spoon.",
      },
      {
        q: "What is the price of the ghee?",
        a: "Please see the latest price in the product list on this page or on the shop page.",
      },
    ],
    related: [
      { label: "Browse All Products", href: "/shop" },
      { label: "Pure Honey", href: "/khati-modhu" },
      { label: "Pure Mustard Oil", href: "/khati-sorisha-tel" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    slug: "hasher-bacha",
    updatedAt: "2026-10-19",
    h1: "Ducklings for Sale — All Breeds Including Chinese Ducks, 1 Day to 1 Month Old",
    title: "Buy Ducklings – All Breeds Including Chinese Ducklings | Farmer Kamol",
    description:
      "Ducklings of all breeds including Chinese ducks, from 1 day to 1 month old. Sourced from our own farm and from hatcheries, sent in boxes. Minimum 50 pieces. Orders and bookings by phone.",
    keywords: [
      "ducklings",
      "ducklings for sale Bangladesh",
      "Chinese ducklings",
      "buy ducklings",
      "1 day old ducklings",
      "ducklings Sirajganj",
      "where to buy ducklings",
      "duckling price Bangladesh",
    ],
    productMatch: ["হাঁস"],
    intro:
      "You can get ducklings of all breeds from Farmer Kamol, including Chinese ducks. Ducklings from 1 day to 1 month old are sent in special boxes. The ducklings are sourced from our own farm and from other hatcheries. Orders and all details are settled over the phone, so please read the rules below before you buy.",
    sections: [
      {
        heading: "Which Breeds and Ages Are Available",
        body: [
          "We supply ducklings of all breeds, including Chinese ducks, aged from 1 day up to 1 month. We will tell you over the phone which breeds and ages are currently in stock.",
        ],
      },
      {
        heading: "Where the Ducklings Come From",
        body: [
          "Our ducklings come from two sources: our own farm and other hatcheries. You can ask which source the ducklings are coming from when you place your order.",
        ],
      },
      {
        heading: "Minimum Order",
        body: [
          "Ducklings are sold in a minimum of 50 pieces. For buyers in our nearby area, 20-30 pieces are also possible. For distant areas, a minimum of 50 pieces is required.",
        ],
      },
      {
        heading: "Booking and Payment",
        body: [
          "To confirm a booking for ducklings, you need to pay at least 60-70 percent in advance. A booking is considered confirmed only after the advance payment.",
        ],
      },
      {
        heading: "Ordering and Delivery Rules",
        body: [
          "All details of a duckling order are settled over the phone: which breed, what age, how many, and where they need to be delivered. Next-day delivery is not available, so you cannot order today and receive the ducklings tomorrow. The supply date is decided by discussion over the phone.",
          "The ducklings are packed and sent in special boxes. In most cases, we or our own person deliver the ducklings.",
        ],
      },
      {
        heading: "First Care After You Receive the Ducklings",
        body: [
          "As soon as you receive the ducklings, open the box without delay and place them in a warm, dry, well-ventilated spot. Keeping the ducklings warm in the early days is very important, so keep them away from cold drafts.",
          "Give clean water first, and give feed after they have rested a little. The water container should let the ducklings dip their beaks but not get wet all over. If you have any problem with the condition of the ducklings, you can tell us directly.",
        ],
      },
    ],
    faqs: [
      {
        q: "Where can I buy ducklings?",
        a: "You can get ducklings of all breeds from Farmer Kamol. Orders and details are settled over the phone or on WhatsApp.",
      },
      {
        q: "Are Chinese ducklings available?",
        a: "Yes, we supply ducklings of all breeds, including Chinese ducks. Please check by phone which breeds are currently in stock.",
      },
      {
        q: "What age of ducklings is available?",
        a: "Ducklings from 1 day up to 1 month old are available.",
      },
      {
        q: "What is the minimum number of ducklings I have to buy?",
        a: "The minimum is 50 pieces. For buyers in the nearby area, 20-30 pieces are also possible, but for distant areas a minimum of 50 pieces is required.",
      },
      {
        q: "How much advance payment is needed to book ducklings?",
        a: "To confirm a booking, you need to pay at least 60-70 percent in advance.",
      },
      {
        q: "If I order today, can I get the ducklings tomorrow?",
        a: "No. The supply date is decided by discussion over the phone, so delivery takes some time.",
      },
      {
        q: "How are the ducklings sent?",
        a: "They are packed and sent in special boxes. In most cases, we or our own person deliver the ducklings.",
      },
      {
        q: "Where do you get the ducklings from?",
        a: "From our own farm and from other hatcheries.",
      },
      {
        q: "What is the price of ducklings?",
        a: "The price depends on breed, age and quantity, and is told over the phone.",
      },
    ],
    related: [
      { label: "Invest in Chinese Duck Farming", href: "/invest/livestock/china-hash" },
      { label: "Browse All Products", href: "/shop" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function getLandingEn(slug: string): SeoLanding | undefined {
  return seoLandingsEn.find((l) => l.slug === slug);
}