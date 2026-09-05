"use client";
import { useEffect, useState, useCallback } from "react";
import { connectChatSocket } from "@/lib/chatSocket";

// 🔔 কাস্টমার লাইভ চ্যাটে কতগুলো অপঠিত (unread) মেসেজ আছে — Agent/Admin নেভিগেশনে ব্যাজ দেখানোর জন্য
// WebSocket দিয়ে real-time আপডেট + 30s polling fallback (WS ফেইল করলেও ব্যাজ ঠিক থাকবে)
export function useUnreadCustomerChat() {
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat?status=OPEN");
      const data = await res.json();
      if (res.ok) {
        const total = (data.conversations || []).reduce(
          (sum: number, c: { unreadCount: number }) =>
            sum + (c.unreadCount || 0),
          0,
        );
        setUnread(total);
      }
    } catch {
      /* ignore — পরের poll/ws event-এ ঠিক হয়ে যাবে */
    }
  }, []);

  useEffect(() => {
    fetchUnread();

    let poll: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (poll) return;
      poll = setInterval(fetchUnread, 45000);
    }

    function stopPolling() {
      if (poll) {
        clearInterval(poll);
        poll = null;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchUnread();
        startPolling();
      } else {
        stopPolling();
      }
    }

    if (document.visibilityState === "visible") startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let ws: WebSocket | null = null;
    try {
      ws = connectChatSocket({
        onMessage: (data) => {
          const msg = data as { senderType?: string };
          if (msg?.senderType === "CUSTOMER") fetchUnread();
        },
        onConversation: () => fetchUnread(),
      });
    } catch {
      /* ignore — polling fallback চলতেই থাকবে */
    }

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      ws?.close();
    };
  }, [fetchUnread]);

  return unread;
}
