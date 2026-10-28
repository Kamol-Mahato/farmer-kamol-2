import Link from "next/link";
import Image from "next/image";
import type { ContestPost } from "@prisma/client";
import Breadcrumb from "@/app/components/Breadcrumb";
import { localizeHref, type Locale } from "@/lib/i18n";
import {
  T,
  CONTEST_TYPE_KEYS,
  getContestStatus,
  statusClass,
  isImageUrl,
  formatDhaka,
} from "@/lib/contestPublic";

export default function ContestList({
  items,
  locale,
  activeType,
}: {
  items: ContestPost[];
  locale: Locale;
  activeType: string;
}) {
  const t = T[locale];
  const base = localizeHref("/contests", locale);

  const tabs = [
    { key: "", label: t.all },
    ...CONTEST_TYPE_KEYS.map((k) => ({ key: k, label: t.types[k] })),
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: t.home, href: localizeHref("/", locale) },
          { label: t.section },
        ]}
      />
      <div className="max-w-6xl mx-auto px-3 py-16 pt-8 text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">{t.heading}</h1>
        <p className="text-gray-500 mb-8">{t.sub}</p>

        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {tabs.map((tab) => (
            <Link
              key={tab.key || "all"}
              href={tab.key ? `${base}?type=${tab.key}` : base}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeType === tab.key
                  ? "bg-green-700 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500">{t.empty}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item) => {
              const title = locale === "en" ? item.titleEn || item.title : item.title;
              const summary =
                locale === "en" ? item.summaryEn || item.summary : item.summary;
              const cover = item.image || item.posterImage;
              const status = getContestStatus(item);
              const showStatus = !!(item.startsAt || item.endsAt);
              return (
                <Link
                  key={item.id}
                  href={localizeHref(`/contests/${item.slug}`, locale)}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group"
                >
                  {isImageUrl(cover) && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <Image
                        src={cover as string}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-top group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4 text-left">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {t.types[item.type] || item.type}
                      </span>
                      {showStatus && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${statusClass(status)}`}
                        >
                          {t.status[status]}
                        </span>
                      )}
                      {item.isPinned && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {t.pinned}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-green-800 mt-2 group-hover:text-green-600 transition">
                      {title}
                    </h2>
                    {summary && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-3">
                        {summary}
                      </p>
                    )}
                    {item.endsAt && (
                      <p className="text-gray-500 text-xs mt-2">
                        {t.ends}: {formatDhaka(item.endsAt, locale)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}