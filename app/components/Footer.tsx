"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { getLocaleFromPath, localizeHref } from "@/lib/i18n"
import { siteConfig } from "@/lib/siteConfig"

const dict = {
  bn: {
    description: "সমন্বিত কৃষির মাধ্যমে প্রাকৃতিক ও স্বাস্থ্যকর খাদ্যপণ্য সরাসরি আপনার কাছে পৌঁছে দিচ্ছি।",
    slogan: "খামার থেকে আপনার দরজায়",
    productsHeading: "পণ্য বিভাগ",
    products: ["মধু", "ঘি", "সরিষার তেল", "চীনা হাঁসের বাচ্চা"],
    serviceHeading: "কাস্টমার সেবা",
    trackOrder: "অর্ডার ট্র্যাক",
    returnPolicy: "রিটার্ন পলিসি",
    faq: "প্রশ্ন ও উত্তর",
    contact: "যোগাযোগ",
    paymentHeading: "পেমেন্ট মেথড",
    paymentMethods: ["বিকাশ", "নগদ", "রকেট", "কার্ড"],
    farmHeading: "আমাদের খামার",
    location: `${siteConfig.address.locality}, ${siteConfig.address.region}`,
    businessContact: "ব্যবসায়িক যোগাযোগ",
    copyright: `© ২০২৬ ${siteConfig.brand.name}. সর্বস্বত্ব সংরক্ষিত।`,
    privacyPolicy: "গোপনীয়তা নীতি",
    terms: "শর্তাবলী",
  },
  en: {
    description: "Delivering natural, healthy food straight from our integrated farm to your doorstep.",
    slogan: "From Our Farm To Your Door",
    productsHeading: "Products",
    products: ["Honey", "Ghee", "Mustard Oil", "Duck Chicks"],
    serviceHeading: "Customer Service",
    trackOrder: "Track Order",
    returnPolicy: "Return Policy",
    faq: "FAQ",
    contact: "Contact",
    paymentHeading: "Payment Methods",
    paymentMethods: ["bKash", "Nagad", "Rocket", "Card"],
    farmHeading: "Our Farm",
    location: `${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}`,
    businessContact: "Business Inquiries",
    copyright: `© 2026 ${siteConfig.brand.name}. All rights reserved.`,
    privacyPolicy: "Privacy Policy",
    terms: "Terms & Conditions",
  },
}

const paymentIcons = [
  {
    bg: "bg-pink-600",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
        <path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H9" />
        <circle cx="17" cy="13" r="1" fill="white" stroke="none" />
      </svg>
    ),
  },
  {
    bg: "bg-orange-500",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <line x1="6" y1="12" x2="6.01" y2="12" />
        <line x1="18" y1="12" x2="18.01" y2="12" />
      </svg>
    ),
  },
  {
    bg: "bg-purple-700",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8 5 6 9.5 6 14c0 1.5.3 2.8.8 4H8l1.5-3h5L16 18h1.2c.5-1.2.8-2.5.8-4 0-4.5-2-9-6-12zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM7 17l-2 4 3.5-1.5L9 17H7zm10 0h-2l.5 2.5L19 21l-2-4z" />
      </svg>
    ),
  },
  {
    bg: "bg-blue-600",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
]

export default function Footer() {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)
  const t = dict[locale]
  const href = (path: string) => localizeHref(path, locale)

  return (
    <footer className="bg-green-50 text-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-6">

        {/* ========================================== */}
        {/* ১. ব্র্যান্ড এবং সোশ্যাল সেকশন (মোবাইলে ফুল উইডথ, পিসিতে ১ম কলাম) */}
        {/* ========================================== */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-6 items-start">
          
          <div className="mb-4 lg:mb-0 lg:col-span-1 flex flex-col items-start">
            <Link href={href("/")} className="flex items-center gap-2 mb-1">
              <Image
                src="/uploads/kamol.png"
                alt={siteConfig.brand.name}
                width={36}
                height={36}
                className="rounded-full shrink-0"
              />
              <span className="text-base font-bold text-green-900 leading-tight">{siteConfig.brand.name}</span>
            </Link>
            <p className="text-xs text-amber-700 font-semibold mb-1">{t.slogan}</p>
            <p className="text-xs text-gray-700 leading-snug mb-3">
              {t.description}
            </p>

            {/* সোশ্যাল আইকনসমূহ */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full flex-wrap lg:flex-nowrap">
              <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-7 h-7 rounded-full bg-blue-600 hover:opacity-90 flex items-center justify-center shrink-0 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>

              <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                className="w-7 h-7 rounded-full bg-red-600 hover:opacity-90 flex items-center justify-center shrink-0 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                </svg>
              </a>

              <a href={`tel:${siteConfig.contact.phone}`} aria-label="Call"
                className="w-7 h-7 rounded-full bg-gray-800 hover:opacity-90 flex items-center justify-center shrink-0 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>

              <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-7 h-7 rounded-full bg-green-500 hover:opacity-90 flex items-center justify-center shrink-0 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.845L.057 23.428a.5.5 0 0 0 .609.63l5.703-1.476A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.523-5.168-1.432l-.361-.214-3.807.985.999-3.715-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </a>

              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-7 h-7 rounded-full bg-pink-600 hover:opacity-90 flex items-center justify-center shrink-0 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>

              

              <a href={`mailto:${siteConfig.contact.email}`} aria-label="Email Us"
                className="w-7 h-7 rounded-full bg-emerald-600 hover:opacity-90 flex items-center justify-center shrink-0 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                </svg>
              </a>
            </div>
          </div>

          {/* সেপারেটর লাইন (শুধুমাত্র মোবাইলেই দেখাবে) */}
          <hr className="border-green-200 my-4 lg:hidden" />

          {/* ========================================== */}
          {/* ২. ৩ টি সেকশন (Products | Customer Service | Payment) */}
          {/* ========================================== */}
          <div className="lg:col-span-3 grid grid-cols-3 gap-2 sm:gap-4 items-start">

            {/* পণ্য বিভাগ */}
            <div>
              <h4 className="font-bold mb-2 text-xs text-green-900 whitespace-nowrap">{t.productsHeading}</h4>
              <div className="flex flex-col gap-1.5 text-xs text-black">
                {t.products.map((p) => (
                  <Link key={p} href={href("/shop")} className="hover:text-green-700 transition leading-tight">{p}</Link>
                ))}
              </div>
            </div>

            {/* কাস্টমার সেবা */}
            <div>
              <h4 className="font-bold mb-2 text-xs text-green-900 whitespace-nowrap">{t.serviceHeading}</h4>
              <div className="flex flex-col gap-1.5 text-xs text-black">
                <Link href={href("/customer/dashboard")} className="hover:text-green-700 transition leading-tight">{t.trackOrder}</Link>
                <Link href={href("/return-policy")} className="hover:text-green-700 transition leading-tight">{t.returnPolicy}</Link>
                <Link href={href("/faq")} className="hover:text-green-700 transition leading-tight">{t.faq}</Link>
                <Link href={href("/contact")} className="hover:text-green-700 transition leading-tight">{t.contact}</Link>
              </div>
            </div>

            {/* পেমেন্ট মেথড */}
            <div>
              <h4 className="font-bold mb-2 text-xs text-green-900 whitespace-nowrap">{t.paymentHeading}</h4>
              <div className="flex flex-col gap-1.5">
                {paymentIcons.map((p, i) => (
                  <div key={t.paymentMethods[i]} className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded-full ${p.bg} flex items-center justify-center shrink-0`}>
                      {p.svg}
                    </div>
                    <span className="text-xs text-black font-medium leading-tight whitespace-nowrap">{t.paymentMethods[i]}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ========================================== */}
          {/* ৩. আমাদের খামার সেকশন (মোবাইলে নিচে, পিসিতে ৫ম কলাম হিসেবে) */}
          {/* ========================================== */}
          <div className="mt-5 pt-4 border-t border-green-100 lg:mt-0 lg:pt-0 lg:border-t-0 lg:col-span-1">
            <h4 className="font-bold mb-2 text-xs text-green-900 whitespace-nowrap">{t.farmHeading}</h4>
            <div className="flex flex-col gap-1.5 text-xs text-black">
              <a href="https://www.google.com/maps/place/Farmer+Kamol-+%E0%A6%95%E0%A7%83%E0%A6%B7%E0%A6%95+%E0%A6%95%E0%A6%AE%E0%A6%B2/@24.5374938,89.4060368,16.64z/data=!4m6!3m5!1s0x39fdb50ed997e315:0x6bd4f0a5545bc197!8m2!3d24.5375866!4d89.4074174!16s%2Fg%2F11nc5qlkdf?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="hover:text-green-700 transition leading-snug">
                🏡 {t.location}
              </a>
              <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-green-700 transition leading-snug">📞 {siteConfig.contact.phoneDisplay}</a>
              <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-700 transition leading-snug">💬 {siteConfig.contact.phoneDisplay}</a>
              <a href="https://wa.me/8801521406139" target="_blank" rel="noopener noreferrer" className="hover:text-green-700 transition leading-snug">💼 {t.businessContact}: 01521406139</a>
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-green-700 transition break-all leading-snug">✉️ {siteConfig.contact.email}</a>
            </div>
          </div>

        </div>

      </div>

      {/* কপিরাইট বার */}
      <div className="bg-green-800 text-white border-t border-green-700 py-3 mt-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-green-200 gap-2">
          <p>{t.copyright}</p>
          <div className="flex gap-3">
            <Link href={href("/privacy-policy")} className="hover:text-yellow-400 transition">{t.privacyPolicy}</Link>
            <Link href={href("/terms")} className="hover:text-yellow-400 transition">{t.terms}</Link>
            <Link href={href("/return-policy")} className="hover:text-yellow-400 transition">{t.returnPolicy}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}