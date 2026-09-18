"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCartButton from "./FloatingCartButton";
import { MobileMenuProvider } from "./MobileMenuContext";
import MobileBottomNav from "./MobileBottomNav";
import AgentModeBanner from "./AgentModeBanner";

// 🚀 প্রথম রেন্ডারে জরুরি না এমন কম্পোনেন্ট — আলাদা chunk-এ lazy load হবে, main-thread work কমবে
const FloatingWhatsAppButton = dynamic(() => import("./FloatingWhatsAppButton"), { ssr: false });
const NotificationPermissionBanner = dynamic(() => import("./NotificationPermissionBanner"), { ssr: false });
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

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

  // ✅ order/cart পেজে floating cart button দরকার নেই — customer ইতিমধ্যে checkout ফ্লো-তে আছে
  const hideFloatingCart =
    pathname === "/order" ||
    pathname === "/en/order" ||
    pathname === "/cart" ||
    pathname === "/en/cart";

  return (
    <MobileMenuProvider>
      <AgentModeBanner />
      <Navbar />
      <NotificationPermissionBanner />
      {!hideFloatingCart && <FloatingCartButton />}
      {!hideFloatingCart && <FloatingWhatsAppButton />}
      <ChatWidget />
      <div className="h-[76px]" />
      <main className="flex-grow">{children}</main>
      <Footer />
      <MobileBottomNav />
      <div className="h-16 md:hidden" />
    </MobileMenuProvider>
  );
}
