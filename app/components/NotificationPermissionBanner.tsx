"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// ✅ Base64 public key কে ব্রাউজারের বোঝার মতো ফরম্যাটে কনভার্ট করে
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const DISMISS_KEY = "notification_dismissed_at";
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const SHOW_AFTER_MS = 2 * 60 * 1000; // সাইটে ২ মিনিট থাকলে দেখাবে
const SHOW_FOR_MS = 15 * 1000; // ১৫ সেকেন্ড পর নিজে চলে যাবে
const VISIT_KEY = "fk_visit_started_at";

export default function NotificationPermissionBanner() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ EN পেজ কিনা চেক
  const isEn = pathname?.startsWith("/en") ?? false;

  useEffect(() => {
    // ✅ ব্রাউজার push সাপোর্ট না করলে কিছুই দেখাবে না
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // ✅ ইউজার আগেই Allow/Block করে ফেললে ব্রাউজার নিজেই মনে রাখে — আর দেখানোর দরকার নেই
    if (Notification.permission !== "default") return;

    // ✅ আগে এড়িয়ে/বন্ধ করে থাকলে, ২৪ ঘণ্টা পার না হলে দেখাবে না
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < TWENTY_FOUR_HOURS) return;
    }

    // ✅ সাইটে আসার সময় মনে রাখো (রিলোড/পেজ বদলালেও গোনা চলবে)
    let started = Date.now();
    try {
      const s = sessionStorage.getItem(VISIT_KEY);
      if (s) started = parseInt(s, 10);
      else sessionStorage.setItem(VISIT_KEY, started.toString());
    } catch {}
    const delay = Math.max(0, SHOW_AFTER_MS - (Date.now() - started));

    // ✅ ২ মিনিট পর দেখাবে, ১৫ সেকেন্ড পর নিজে সরে যাবে, ২৪ ঘণ্টায় একবারই
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const showTimer = setTimeout(() => {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), SHOW_FOR_MS);
    }, delay);
    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  function markDismissed() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  }

  async function handleAllow() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string;
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        await fetch("/api/push/customer-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });
      }
    } catch (err) {
      console.error("Notification enable error:", err);
    } finally {
      setVisible(false);
      // ✅ locale অনুযায়ী about পেজে নিয়ে যাও
      router.push(isEn ? "/en/about" : "/about");
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed top-[76px] left-0 w-full z-[70] px-3 md:px-0 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full md:w-auto max-w-xl bg-green-800 text-white rounded-xl shadow-lg mt-2 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleAllow}
          className="flex-1 text-left text-sm font-bold hover:text-yellow-400 transition"
        >
          {isEn
            ? "🔔 Learn everything about Farmer Kamol here"
            : "🔔 Farmer Kamol এর সব কিছু জানুন এখানে"}
        </button>
        <button
          onClick={markDismissed}
          aria-label={isEn ? "Close" : "বন্ধ করুন"}
          className="text-white/70 hover:text-white text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
