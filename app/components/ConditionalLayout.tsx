"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "./Navbar";
import Footer from "./Footer";
// FloatingCartButton এখন dynamic — উপরের dynamic() দেখো
import { MobileMenuProvider } from "./MobileMenuContext";
import MobileBottomNav from "./MobileBottomNav";
import AgentModeBanner from "./AgentModeBanner";

// 🚀 প্রথম রেন্ডারে জরুরি না — আলাদা chunk + ssr:false → LCP/TBT ভালো হয়
const FloatingWhatsAppButton = dynamic(() => import("./FloatingWhatsAppButton"), {
  ssr: false,
  loading: () => null,
});
const FloatingCartButton = dynamic(() => import("./FloatingCartButton"), {
  ssr: false,
  loading: () => null,
});
const NotificationPermissionBanner = dynamic(() => import("./NotificationPermissionBanner"), {
  ssr: false,
  loading: () => null,
});
const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
});

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const isPanelRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname === "/me" ||
    pathname.startsWith("/me/");

  if (isPanelRoute) {
    return <main className="flex-grow">{children}</main>;
  }

  // ✅ order/cart পেজে floating cart দরকার নেই
  const hideFloatingCart =
    pathname === "/order" ||
    pathname === "/en/order" ||
    pathname === "/cart" ||
    pathname === "/en/cart";

  // ✅ invest-related পেজে cart + live chat লুকাবে — শুধু WhatsApp থাকবে
  const isInvestPage =
    pathname === "/invest" ||
    pathname.startsWith("/invest/") ||
    pathname === "/en/invest" ||
    pathname.startsWith("/en/invest/");

  return (
    <MobileMenuProvider>
      <AgentModeBanner />
      <Navbar />
      <NotificationPermissionBanner />
      {!hideFloatingCart && !isInvestPage && <FloatingCartButton />}
      <FloatingWhatsAppButton />
      {!isInvestPage && <ChatWidget />}
      <div className="h-[76px]" />
      <main className="flex-grow">{children}</main>
      <Footer />
      <MobileBottomNav />
      <div className="h-16 md:hidden" />
    </MobileMenuProvider>
  );
}
