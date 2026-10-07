import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.brand.nameEn}`,
  description: `Contact ${siteConfig.brand.nameEn} via phone, WhatsApp, Facebook, or YouTube. Our farm: ${siteConfig.address.villageEn}, ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}.`,
  alternates: {
    canonical: "/en/contact",
    languages: {
      bn: "/contact",
      en: "/en/contact",
    },
  },
};

const mapsLink =
  "https://www.google.com/maps/place/Farmer+Kamol-+%E0%A6%95%E0%A7%83%E0%A6%B7%E0%A6%95+%E0%A6%95%E0%A6%AE%E0%A6%B2/@24.5374938,89.4060368,16.64z/data=!4m6!3m5!1s0x39fdb50ed997e315:0x6bd4f0a5545bc197!8m2!3d24.5375866!4d89.4074174!16s%2Fg%2F11nc5qlkdf?entry=ttu";

const contactItems = [
  {
    label: "Facebook",
    href: siteConfig.social.facebook,
    aria: "Facebook",
    external: true,
    bg: "bg-blue-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="white">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.95 8.44-9.94z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: siteConfig.social.youtube,
    aria: "YouTube",
    external: true,
    bg: "bg-red-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="white">
        <path d="M9.5 16.5v-9l7 4.5-7 4.5z" />
      </svg>
    ),
  },
  {
    label: "Call",
    href: `tel:${siteConfig.contact.phone}`,
    aria: "Call us",
    external: false,
    bg: "bg-slate-800",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5 sm:w-6 sm:h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97a1.125 1.125 0 0 0 .417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/${siteConfig.contact.whatsapp}`,
    aria: "WhatsApp",
    external: true,
    bg: "bg-green-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="white">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.84.5 3.56 1.36 5.03L2 22l5.25-1.38a9.84 9.84 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.93C21.95 6.45 17.5 2 12.04 2zm0 18.06c-1.5 0-2.91-.4-4.13-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.27-4.28c0-4.53 3.69-8.22 8.2-8.22 4.5 0 8.18 3.69 8.18 8.22 0 4.53-3.68 8.15-8.19 8.15zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-1.48-.74-2.45-1.32-3.43-3-.26-.45.26-.42.74-1.4.08-.16.04-.3-.04-.42-.08-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.56-.42-.14 0-.3 0-.46 0s-.42.06-.64.3c-.22.25-.85.83-.85 2.02 0 1.2.87 2.35 1 2.52.12.16 1.66 2.55 4.05 3.47 2 .76 2.4.6 2.83.55.43-.05 1.4-.57 1.6-1.13.2-.55.2-1.02.14-1.13-.06-.1-.22-.16-.47-.27z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: siteConfig.social.instagram,
    aria: "Instagram",
    external: true,
    bg: "bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5 sm:w-6 sm:h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h.001M3.75 6.75c0-1.657 1.343-3 3-3h10.5c1.657 0 3 1.343 3 3v10.5c0 1.657-1.343 3-3 3H6.75c-1.657 0-3-1.343-3-3V6.75ZM15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: siteConfig.social.tiktok,
    aria: "TikTok",
    external: true,
    bg: "bg-black",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="white">
        <path d="M16.5 3c.3 1.8 1.5 3.2 3.5 3.5v2.6c-1.4 0-2.6-.4-3.5-1.2v6.4c0 2.8-2.3 5-5.1 5-2.8 0-5.1-2.2-5.1-5s2.3-5 5.1-5c.3 0 .6 0 .9.1v2.7c-.3-.1-.6-.2-.9-.2-1.3 0-2.4 1-2.4 2.4 0 1.3 1 2.4 2.4 2.4 1.3 0 2.4-1 2.4-2.4V3h2.7z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: `mailto:${siteConfig.contact.email}`,
    aria: "Email Us",
    external: false,
    bg: "bg-emerald-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5 sm:w-6 sm:h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
];

function LeafDecoration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 70 C30 40, 50 20, 95 8 C70 25, 55 45, 48 70 C35 55, 22 58, 10 70Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M25 72 C40 48, 58 28, 105 12 C82 30, 68 50, 60 72 C48 58, 35 60, 25 72Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}

export default function ContactPageEn() {
  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-white via-green-50/40 to-white min-h-[70vh]">
      {/* Decorative leaves */}
      <LeafDecoration className="absolute top-4 left-0 w-24 sm:w-36 text-green-200/70 pointer-events-none select-none -translate-x-2" />
      <LeafDecoration className="absolute top-4 right-0 w-24 sm:w-36 text-green-200/70 pointer-events-none select-none translate-x-2 scale-x-[-1]" />

      <div className="relative max-w-3xl mx-auto px-4 pt-10 sm:pt-14 pb-16 flex flex-col items-center text-center">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-900 tracking-tight">
          Ways to Reach Us
        </h1>

        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 max-w-xl leading-relaxed">
          Have a question, suggestion, order, or need help?
          <br className="hidden sm:block" />
          We are always ready for you. Reach us easily through the options below.
        </p>

        {/* Location badge */}
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 sm:mt-8 inline-flex items-center gap-2.5 rounded-full bg-green-50 border border-green-200 px-4 py-2.5 shadow-sm hover:bg-green-100 hover:border-green-300 transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 2C7.6 2 4 5.6 4 10c0 5.3 6.4 11.1 7.3 11.9.4.3 1 .3 1.4 0C13.6 21.1 20 15.3 20 10c0-4.4-3.6-8-8-8zm0 11.5c-1.9 0-3.5-1.6-3.5-3.5S10.1 6.5 12 6.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" />
            </svg>
          </span>
          <span className="text-left">
            <span className="block text-xs font-semibold text-green-700">Our Address</span>
            <span className="block text-sm font-bold text-green-900">
              {siteConfig.address.villageEn}, {siteConfig.address.localityEn}, {siteConfig.address.regionEn}
            </span>
          </span>
        </a>

        {/* Contact icons row */}
        <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6">
          {contactItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              aria-label={item.aria}
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${item.bg} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-200`}
              >
                {item.icon}
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-green-800 transition-colors">
                {item.label}
              </span>
            </a>
          ))}
        </div>

        {/* Bottom contact bar */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm">
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-green-800 transition-colors"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </span>
            <span className="font-semibold">{siteConfig.contact.email}</span>
          </a>

          <span className="hidden sm:inline text-green-300">|</span>

          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-green-800 transition-colors"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.84.5 3.56 1.36 5.03L2 22l5.25-1.38a9.84 9.84 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.93C21.95 6.45 17.5 2 12.04 2z" />
              </svg>
            </span>
            <span className="font-semibold">{siteConfig.contact.phoneDisplay}</span>
          </a>
        </div>
      </div>

      {/* Soft green wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none" aria-hidden="true">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 sm:h-16">
          <path
            d="M0 40 C240 80, 480 0, 720 40 C960 80, 1200 0, 1440 40 L1440 80 L0 80 Z"
            fill="#166534"
            opacity="0.12"
          />
          <path
            d="M0 55 C240 90, 480 20, 720 55 C960 90, 1200 20, 1440 55 L1440 80 L0 80 Z"
            fill="#166534"
            opacity="0.18"
          />
        </svg>
      </div>
    </main>
  );
}