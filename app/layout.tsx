import type { Metadata } from "next";
import { Suspense } from "react";
import { Hind_Siliguri } from "next/font/google";
import ConditionalLayout from "./components/ConditionalLayout";
import RootOrgSchema from "./components/RootOrgSchema";
import EnterKeyNav from "./components/EnterKeyNav";
import TopLoadingBar from "./components/TopLoadingBar";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { siteConfig } from "@/lib/siteConfig";
import Script from "next/script";

const hindSiliguri = Hind_Siliguri({
  weight: ["400", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain.url),
  title: siteConfig.seo.defaultTitle,
  description: siteConfig.seo.description,
  manifest: "/manifest.webmanifest",
  keywords: [...siteConfig.seo.keywords],
  openGraph: {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.description,
    url: siteConfig.domain.url,
    siteName: siteConfig.brand.name,
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: siteConfig.domain.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.seo.defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.description,
    images: [siteConfig.domain.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.weserv.nl" />
        <link rel="dns-prefetch" href="https://images.weserv.nl" />
        <link
          rel="preconnect"
          href="https://pvixtqqcegfbxkhxogww.supabase.co"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://pvixtqqcegfbxkhxogww.supabase.co"
        />
      </head>
      <body
        className={`${hindSiliguri.variable} ${hindSiliguri.className} antialiased bg-gray-50 flex flex-col min-h-screen`}
      >
        <RootOrgSchema />
        <Suspense fallback={null}>
          <TopLoadingBar />
        </Suspense>
        <EnterKeyNav />
        <ConditionalLayout>{children}</ConditionalLayout>
        {/* GA — lazyOnload দিয়ে প্রথম লোডে ব্লক করবে না */}
        <GoogleAnalytics gaId="G-8ZRHT134HL" />

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "zgo65o5zfw");
          `}
        </Script>
      </body>
    </html>
  );
}