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
        | "NORMAL"
        | "FREE"
        | "HALF",
    };
  } catch {
    return { products: [], deliveryMode: "NORMAL" as const };
  }
}

export default async function LandingPage({
  landing,
  locale = "bn",
}: {
  landing: SeoLanding;
  locale?: Locale;
}) {
  const { products, deliveryMode } = await getData(landing.productMatch);
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
              {products.map((product) => (
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
                )
              ))}
            </div>
          </section>
        )}

        {landing.sections.map((s) => (
          <section key={s.heading} className="mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-2">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-2">
                {p}
              </p>
            ))}
          </section>
        ))}

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

        <section className="mb-4 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            {isEn ? "Order on WhatsApp" : "WhatsApp-এ অর্ডার করুন"}
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