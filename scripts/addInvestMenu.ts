import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

// --run না দিলে কিছু লেখা হবে না (dry-run)
const RUN = process.argv.includes("--run");

// এই url-এর মেনুর ঠিক পরে বসবে। null দিলে সবার শেষে বসবে।
const AFTER_URL: string | null = "/blog";

const PARENT = {
  title: "কৃষিতে বিনিয়োগ",
  titleEn: "Agriculture Investment",
  url: "/invest",
};

const CHILDREN = [
  { title: "কৃষিতে ইনভেস্ট", titleEn: "Agriculture Invest", url: "/invest" },
  { title: "চিনা হাঁস বিনিয়োগ", titleEn: "Chinese Duck Farming", url: "/invest/livestock/china-hash" },
  { title: "গরু পালন বিনিয়োগ", titleEn: "Cattle Rearing", url: "/invest/livestock/goru-palon" },
  { title: "ফসল চাষ বিনিয়োগ", titleEn: "Crop Farming", url: "/invest/crop/fosol-chas" },
  { title: "মাছ চাষ বিনিয়োগ", titleEn: "Fish Farming", url: "/invest/aquaculture/mach-chas" },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);

async function main() {
  let host = "অজানা";
  try {
    host = new URL(process.env.DATABASE_URL ?? "").host;
  } catch {}
  console.log("ডাটাবেস হোস্ট:", host);
  console.log(RUN ? "মোড: WRITE (ডাটাবেসে লেখা হবে)" : "মোড: DRY-RUN (কিছু লেখা হবে না)");

  const tops = await prisma.navigationMenu.findMany({
    where: { parentId: null },
    orderBy: { displayOrder: "asc" },
  });
  console.log("\nবর্তমান মূল মেনু:");
  tops.forEach((m) => console.log(`  ${m.displayOrder}. ${m.title} → ${m.url} (id ${m.id})`));

  const existingParent = tops.find((m) => m.url === PARENT.url);
  const anchor = AFTER_URL ? tops.find((m) => m.url === AFTER_URL) : undefined;
  if (AFTER_URL && !anchor) console.log(`\n⚠️ ${AFTER_URL} মেনু পাওয়া যায়নি, সবার শেষে বসবে।`);

  const lastOrder = tops.length ? tops[tops.length - 1].displayOrder : 0;
  const newOrder = anchor ? anchor.displayOrder + 1 : lastOrder + 1;
  const toShift = !existingParent && anchor ? tops.filter((m) => m.displayOrder > anchor.displayOrder) : [];

  console.log("\nপরিকল্পনা:");
  if (existingParent) {
    console.log(`  মূল মেনু আগে থেকেই আছে (id ${existingParent.id}), নতুন করে বানানো হবে না।`);
  } else {
    console.log(`  নতুন মূল মেনু: ${PARENT.title} (displayOrder ${newOrder})`);
    toShift.forEach((m) => console.log(`  সরবে: ${m.title} ${m.displayOrder} → ${m.displayOrder + 1}`));
  }
  const existingKids = existingParent
    ? await prisma.navigationMenu.findMany({ where: { parentId: existingParent.id } })
    : [];
  CHILDREN.forEach((c) => {
    const has = existingKids.some((k) => k.title === c.title);
    console.log(`  সাব-মেনু: ${c.title} → ${c.url} ${has ? "(আগে থেকেই আছে, বাদ)" : "(নতুন)"}`);
  });

  if (!RUN) {
    console.log("\nসব ঠিক থাকলে আবার চালান: npx tsx scripts/addInvestMenu.ts --run");
    return;
  }

  await prisma.$transaction(async (tx) => {
    let parentId = existingParent?.id;
    if (!parentId) {
      for (const m of toShift) {
        await tx.navigationMenu.update({
          where: { id: m.id },
          data: { displayOrder: m.displayOrder + 1 },
        });
      }
      const created = await tx.navigationMenu.create({
        data: { ...PARENT, displayOrder: newOrder, isVisible: true },
      });
      parentId = created.id;
    }
    const kids = await tx.navigationMenu.findMany({ where: { parentId } });
    for (let i = 0; i < CHILDREN.length; i++) {
      const c = CHILDREN[i];
      if (kids.some((k) => k.title === c.title)) continue;
      await tx.navigationMenu.create({
        data: { ...c, displayOrder: i + 1, isVisible: true, parentId },
      });
    }
  });
  console.log("\n✅ সম্পন্ন");
}

main()
  .catch((e) => {
    console.error("❌ ব্যর্থ:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });