import Link from "next/link";
import type { ContestPost } from "@prisma/client";
import { safeJsonLd } from "@/lib/jsonLd";
import { siteConfig } from "@/lib/siteConfig";
import { localizeHref, type Locale } from "@/lib/i18n";
import {
  T,
  getContestStatus,
  statusClass,
  isImageUrl,
  formatDhaka,
} from "@/lib/contestPublic";

export default function ContestDetail({
  item,
  locale,
}: {
  item: ContestPost;
  locale: Locale;
}) {
  const t = T[locale];
  const isEn = locale === "en";
  const title = isEn ? item.titleEn || item.title : item.title;
  const content = isEn ? item.contentEn || item.content : item.content;
  const winners = isEn ? item.winnersEn || item.winners : item.winners;
  const status = getContestStatus(item);
  const showStatus = !!(item.startsAt || item.endsAt);
  const listHref = localizeHref("/contests", locale);
  const pageUrl = `${siteConfig.domain.url}${localizeHref(`/contests/${item.slug}`, locale)}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.home,
        item: `${siteConfig.domain.url}${localizeHref("/", locale)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.section,
        item: `${siteConfig.domain.url}${listHref}`,
      },
      { "@type": "ListItem", position: 3, name: title, item: pageUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <div className="max-w-3xl mx-auto px-4 py-6 pt-8 md:pt-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href={localizeHref("/", locale)} className="hover:text-green-700">
            {t.home}
          </Link>
          <span className="mx-1.5">/</span>
          <Link href={listHref} className="hover:text-green-700">
            {t.section}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700 font-medium">{title}</span>
        </nav>

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
        </div>

        <h1 className="text-3xl font-bold text-green-800 mt-3 mb-3">{title}</h1>

        {(item.startsAt || item.endsAt) && (
          <p className="text-gray-500 text-sm mb-6">
            {item.startsAt && (
              <span className="mr-4">
                {t.starts}: {formatDhaka(item.startsAt, locale)}
              </span>
            )}
            {item.endsAt && (
              <span>
                {t.ends}: {formatDhaka(item.endsAt, locale)}
              </span>
            )}
          </p>
        )}

        {/* পোস্টারের লেখা যাতে ধারালো থাকে, তাই আসল ছবি সরাসরি দেখানো হচ্ছে (রিসাইজ/কমপ্রেস ছাড়া) */}
        {isImageUrl(item.posterImage) && (
          <a
            href={item.posterImage as string}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.posterImage as string}
              alt={`${title} - ${t.posterAlt}`}
              className="w-full h-auto rounded-xl shadow"
            />
          </a>
        )}

        <div
          className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {(item.facebookUrl || item.youtubeUrl) && (
          <div className="flex flex-wrap gap-3 mt-8">
            {item.facebookUrl && (
              <a
                href={item.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                {t.watchFb}
              </a>
            )}
            {item.youtubeUrl && (
              <a
                href={item.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 transition"
              >
                {t.watchYt}
              </a>
            )}
          </div>
        )}

        {winners && (
          <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <h2 className="text-xl font-bold text-green-800 mb-3">
              {t.winners}
            </h2>
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: winners }}
            />
          </div>
        )}

        {item.type === "CONTEST" && (
          <p className="mt-8 text-xs text-gray-500 border-t pt-4">
            {t.contestNote}
          </p>
        )}
      </div>
    </>
  );
}