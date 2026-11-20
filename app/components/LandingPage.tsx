// app/components/LandingPage.tsx
import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import ProductCard from "@/app/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { safeJsonLd } from "@/lib/jsonLd";
import { siteConfig } from "@/lib/siteConfig";
import type { SeoLanding } from "@/lib/seoLandings";
import ProductCardEn from "@/app/en/components/ProductCard";
import { localizeHref, type Locale } from "@/lib/i18n";
import Image from "next/image";
import { parseDuckPrices, DUCK_BREEDS, DUCK_AGE_TIERS } from "@/lib/duckPrices";

async function getData(terms: string[]) {
  try {
    const [products, settings] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: terms.flatMap((t) => [
            { name: { contains: t } },
            { nameBanglish: { contains: t } },
          ]),
        },
        include: { images: true, category: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.systemControlCenter.findUnique({ where: { id: 1 } }),
    ]);
    return {
      products,
      deliveryMode: (settings?.deliveryChargeMode ?? "NORMAL") as
        "NORMAL" | "FREE" | "HALF",
      duckData: parseDuckPrices(settings?.duckChickPrices),
      farmLocation: settings?.farmLocation ?? null,
      farmLocationEn: settings?.farmLocationEn ?? null,
    };
  } catch {
    return {
      products: [],
      deliveryMode: "NORMAL" as const,
      duckData: parseDuckPrices(null),
      farmLocation: null,
      farmLocationEn: null,
    };
  }
}

export default async function LandingPage({
  landing,
  locale = "bn",
}: {
  landing: SeoLanding;
  locale?: Locale;
}) {
  const { products, deliveryMode, duckData, farmLocation, farmLocationEn } =
    await getData(landing.productMatch);
  const isEn = locale === "en";
  const pageUrl = `${siteConfig.domain.url}${isEn ? "/en" : ""}/${landing.slug}`;
  const shopBase = `${siteConfig.domain.url}${isEn ? "/en" : ""}/shop`;

  const productSchemas = products.map((p) => {
    const img = p.images?.[0]?.imageUrl;
    return {
      "@type": "Product",
      name: isEn ? p.nameEn || p.name : p.name,
      description: landing.description,
      image: img
        ? img.startsWith("http")
          ? img
          : `${siteConfig.domain.url}${img.startsWith("/") ? "" : "/"}${img}`
        : undefined,
      url: `${shopBase}/${p.slug}`,
      brand: { "@type": "Brand", name: "Farmer Kamol" },
      ...(p.priceType === "FIXED" && {
        offers: {
          "@type": "Offer",
          priceCurrency: "BDT",
          price:
            p.discountPrice && p.discountPrice < p.pricePerUnit
              ? p.discountPrice
              : p.pricePerUnit,
          availability:
            p.stockQty <= 0
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          url: `${shopBase}/${p.slug}`,
        },
      }),
    };
  });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(isEn ? "en-GB" : "bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    });
  const hasDuckPrices =
    !!landing.showDuckPrices &&
    DUCK_BREEDS.some((b) =>
      DUCK_AGE_TIERS.some((t) => duckData.prices[b.key]?.[t.key] != null),
    );
    const farmPlace = isEn ? farmLocationEn : farmLocation;
    const productImages = new Map<string, { src: string; alt: string }>();
    if (landing.useProductImages) {
      for (const p of products) {
        const name = isEn ? p.nameEn || p.name : p.name;
        (p.images ?? []).forEach((img, i) => {
          if (!productImages.has(img.imageUrl)) {
            productImages.set(img.imageUrl, {
              src: img.imageUrl,
              alt: `${name} ${i + 1}`,
            });
          }
        });
      }
    }
    const galleryItems: { src: string; alt: string }[] =
      landing.gallery && landing.gallery.length > 0
        ? landing.gallery
        : Array.from(productImages.values()).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: landing.title,
        description: landing.description,
        inLanguage: isEn ? "en" : "bn-BD",
        dateModified: landing.updatedAt,
        author: { "@type": "Person", name: "Kamol Kumar Mahato" },
        isPartOf: { "@type": "WebSite", url: siteConfig.domain.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: isEn ? "Home" : "হোম",
            item: isEn ? `${siteConfig.domain.url}/en` : siteConfig.domain.url,
          },
          { "@type": "ListItem", position: 2, name: landing.h1, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: landing.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      ...productSchemas,
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: isEn ? "Home" : "হোম", href: isEn ? "/en" : "/" },
          { label: landing.h1 },
        ]}
      />

      <div className="max-w-5xl mx-auto px-3 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-3">
          {landing.h1}
        </h1>
        <p className="text-gray-700 leading-relaxed mb-6">{landing.intro}</p>

        {products.length > 0 && (
          <section className="mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {products.map((product) =>
                isEn ? (
                  <ProductCardEn
                    key={product.id}
                    product={product}
                    deliveryMode={deliveryMode}
                  />
                ) : (
                  <ProductCard
                    key={product.id}
                    product={product}
                    deliveryMode={deliveryMode}
                  />
                ),
              )}
            </div>
          </section>
        )}

{hasDuckPrices && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-2">
              {isEn
                ? "Duckling prices by breed and age (per piece)"
                : "জাত ও বয়স অনুযায়ী হাঁসের বাচ্চার দাম (প্রতি পিস)"}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-green-200">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-green-100 text-green-900">
                  <tr>
                    <th className="text-left p-2 font-semibold">
                      {isEn ? "Breed" : "জাত"}
                    </th>
                    {DUCK_AGE_TIERS.map((t) => (
                      <th
                        key={t.key}
                        className="p-2 font-semibold whitespace-nowrap"
                      >
                        {isEn ? t.en : t.bn}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DUCK_BREEDS.map((b) => (
                    <tr key={b.key} className="border-t border-green-100">
                      <th className="text-left p-2 font-semibold text-green-900 whitespace-nowrap">
                        {isEn ? b.en : b.bn}
                      </th>
                      {DUCK_AGE_TIERS.map((t) => {
                        const v = duckData.prices[b.key]?.[t.key];
                        return (
                          <td
                            key={t.key}
                            className="p-2 text-center text-gray-800 whitespace-nowrap"
                          >
                            {v != null
                              ? `৳ ${v}`
                              : isEn
                                ? "Call"
                                : "ফোনে জানুন"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-2">
              {isEn
                ? "Prices may change. Please confirm the current price by phone before booking."
                : "দাম পরিবর্তন হতে পারে। বুকিংয়ের আগে ফোনে বর্তমান দাম নিশ্চিত করে নিন।"}
              {duckData.updatedAt && (
                <>
                  {" "}
                  {isEn ? "Prices last updated: " : "দাম সর্বশেষ আপডেট: "}
                  {fmtDate(duckData.updatedAt)}
                </>
              )}
            </p>
          </section>
        )}

        {landing.steps && landing.steps.items.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-3">
              {landing.steps.heading}
            </h2>
            <ol className="space-y-2">
              {landing.steps.items.map((s, i) => (
                <li
                  key={s.title}
                  className="flex gap-3 border border-green-200 rounded-lg p-3 bg-white"
                >
                  <span className="flex-none w-7 h-7 rounded-full bg-green-700 text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-green-900">{s.title}</p>
                    <p className="text-gray-700 leading-relaxed">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {landing.sections.map((s) => (
          <section key={s.heading} className="mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-2">
              {s.heading}
            </h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-2">
                {p}
              </p>
            ))}
          </section>
        ))}

{landing.gallery && landing.gallery.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-3">
            {isEn ? "Photos" : "ছবি"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {galleryItems.map((g) => (
                <div
                  key={g.src}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={g.src}
                    alt={g.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-3">
            {isEn ? "Frequently Asked Questions" : "সাধারণ প্রশ্ন ও উত্তর"}
          </h2>
          <div className="space-y-2">
            {landing.faqs.map((f) => (
              <details
                key={f.q}
                className="border border-green-200 rounded-lg p-3 bg-green-50"
              >
                <summary className="font-semibold text-green-900 cursor-pointer">
                  {f.q}
                </summary>
                <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-6 border border-green-200 rounded-lg p-3 bg-green-50 text-sm text-gray-700">
          <p>
            <span className="font-semibold text-green-900">
              {isEn ? "Written by: " : "লিখেছেন: "}
            </span>
            {isEn
              ? "Kamol Kumar Mahato, Farmer Kamol"
              : "কমল কুমার মাহাতো, কৃষক কমল"}
            {farmPlace ? ` — ${farmPlace}` : ""}
          </p>
          <p className="mt-1">
            {isEn ? "Last updated: " : "সর্বশেষ আপডেট: "}
            {fmtDate(landing.updatedAt)}
          </p>
        </section>

        <section className="mb-4 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            {landing.whatsappLabel ??
              (isEn ? "Order on WhatsApp" : "WhatsApp-এ অর্ডার করুন")}
          </a>
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="bg-green-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-900"
          >
            {isEn ? "Call Us" : "ফোনে কথা বলুন"}
          </a>
          {landing.related.map((r) => (
            <Link
              key={r.href}
              href={localizeHref(r.href, locale)}
              className="border border-green-600 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50"
            >
              {r.label}
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
