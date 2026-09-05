import { prisma } from "@/lib/prisma";

const HOME_SLOTS = 6;

// PIN করা আইটেম আগে তার নির্দিষ্ট পজিশনে বসানো হয়, বাকি খালি স্লট filler দিয়ে ভরাট হয়
function fillHomeSlots(pinned: any[], filler: any[]) {
  const slots: any[] = new Array(HOME_SLOTS).fill(null);
  for (const item of pinned) {
    if (
      item.homeOrder >= 1 &&
      item.homeOrder <= HOME_SLOTS &&
      !slots[item.homeOrder - 1]
    ) {
      slots[item.homeOrder - 1] = item;
    }
  }
  let fi = 0;
  for (let i = 0; i < HOME_SLOTS; i++) {
    if (!slots[i] && fi < filler.length) {
      slots[i] = filler[fi];
      fi++;
    }
  }
  return slots.filter(Boolean);
}

// আমাদের পণ্য সমূহ
export async function getHomeProducts() {
  const [pinned, filler] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, homeOrder: { not: null } },
      include: { images: true, category: true },
      orderBy: { homeOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, homeOrder: null },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
      take: HOME_SLOTS,
    }),
  ]);
  return fillHomeSlots(pinned, filler);
}

// আমাদের কৃষি বিষয়ক ব্লগ — lang="en" দিলে যেসব ব্লগের ইংরেজি অনুবাদ নেই সেগুলো বাদ পড়বে
export async function getHomeBlogs(lang: "bn" | "en" = "bn") {
  const langFilter =
    lang === "en"
      ? {
          titleEn: { not: null },
          slugEn: { not: null },
          contentEn: { not: null },
        }
      : {};

  const [pinned, filler] = await Promise.all([
    prisma.blog.findMany({
      where: { isPublished: true, homeOrder: { not: null }, ...langFilter },
      orderBy: { homeOrder: "asc" },
    }),
    prisma.blog.findMany({
      where: { isPublished: true, homeOrder: null, ...langFilter },
      orderBy: { createdAt: "desc" },
      take: HOME_SLOTS,
    }),
  ]);
  return fillHomeSlots(pinned, filler);
}
