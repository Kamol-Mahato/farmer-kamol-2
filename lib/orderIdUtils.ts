import { siteConfig } from "@/lib/siteConfig";

export function generateCustomId(createdAt: string | Date, dailySeq: number) {
  const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
  const bdDate = new Date(new Date(createdAt).getTime() + BD_OFFSET_MS);
  const year = bdDate.getUTCFullYear();
  const month = String(bdDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(bdDate.getUTCDate()).padStart(2, "0");
  return `${siteConfig.business.orderIdPrefix}${year}${month}${day}${String(dailySeq).padStart(1, "0")}`;
}
