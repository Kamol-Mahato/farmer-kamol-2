"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { connectChatSocket } from "@/lib/chatSocket";
import {
  CHAT_WELCOME_TEXT,
  CHAT_WELCOME_TEXT_EN,
} from "@/lib/chatWelcomeMessage";

interface Message {
  id: number;
  conversationId?: number;
  senderType: "SYSTEM" | "CUSTOMER" | "ADMIN" | "AGENT";
  senderName?: string | null;
  text: string;
  createdAt: string;
}

/* ─── Soft notify sound (autoplay-safe after first tap) ─── */
let audioCtx: AudioContext | null = null;

async function unlockVisitorAudio() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") await audioCtx.resume();
  } catch {
    /* ignore */
  }
}

function playVisitorNotify() {
  void (async () => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") await audioCtx.resume();
      const now = audioCtx.currentTime;
      const beep = (freq: number, start: number, dur: number) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.2, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      };
      beep(988, 0, 0.16);
      beep(1319, 0.14, 0.2);
    } catch {
      /* blocked */
    }
  })();
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5 inline-block align-[-2px] mr-1 shrink-0"
    >
      <path
        fill="#1877F2"
        d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"
      />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5 inline-block align-[-2px] mr-1 shrink-0"
    >
      <path
        fill="#FF0000"
        d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.47 20.5 12 20.5 12 20.5s7.53 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8Z"
      />
      <path fill="#fff" d="M9.75 15.5v-7l6.25 3.5-6.25 3.5Z" />
    </svg>
  );
}

const CHAT_EXP_KEY = "fk_chat_exp_at"; // খোলা (expanded) অবস্থার শুরুর সময়
const CHAT_EXP_MS = 24 * 60 * 60 * 1000; // ২৪ ঘণ্টা

export default function ChatWidget() {
  const pathname = usePathname();
  const isEn = pathname?.startsWith("/en") ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [typing, setTyping] = useState(false);
  const [minimized, setMinimized] = useState<boolean | null>(null);
  const minimizedRef = useRef(false);
  const [live, setLive] = useState(false);
  const [unread, setUnread] = useState(0);
  const bubbleVisible = (showTooltip || unread > 0) && !isOpen;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpenRef = useRef(false);
  const conversationIdRef = useRef<number | null>(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // 💬 স্পিচ বাবল: ৩.৫ সেকেন্ড পর আসবে, টাইপিং "..." তারপর লেখা, ৭ সেকেন্ডে মিলিয়ে যাবে,
  // প্রতি ৩০ সেকেন্ডে আবার। চ্যাট খুললে/বাবলে ক্লিক করলে এই সেশনে আর আসবে না।
  useEffect(() => {
    const isOff = () => {
      try {
        return sessionStorage.getItem("fk_chat_bubble_off") === "1";
      } catch {
        return false;
      }
    };
    if (isOff()) return;

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (!alive || isOff() || isOpenRef.current) return;
      setTyping(true);
      setShowTooltip(true);
      timers.push(setTimeout(() => setTyping(false), 1300));
      timers.push(setTimeout(() => setShowTooltip(false), 7500));
      timers.push(setTimeout(run, 30000));
    };

    timers.push(setTimeout(run, 3500));
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const unlock = () => {
      void unlockVisitorAudio();
    };
    window.addEventListener("pointerdown", unlock, {
      once: true,
      capture: true,
    });
    window.addEventListener("touchstart", unlock, {
      once: true,
      capture: true,
    });
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
    };
  }, []);

  const toggleChat = () => {
    void unlockVisitorAudio();
    if (!isOpen) {
      setShowTooltip(false);
      setTyping(false);
      try {
        sessionStorage.setItem("fk_chat_bubble_off", "1");
      } catch {}
      setUnread(0);
      // ⏱️ ৩ সেকেন্ডের deferred timer শেষ হওয়ার আগেই user চ্যাট খুললে সাথে সাথে init করা
      if (!initialized) {
        void fetchInitChat();
      }
    }
    setIsOpen(!isOpen);
  };

  // ➖ মিনিমাইজ: ✕ চাপলে ২৪ ঘণ্টার জন্য ডান কিনারায় ছোট ট্যাব হয়ে থাকবে
  const minimizeChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    setTyping(false);
    setMinimized(true);
    try {
      localStorage.removeItem(CHAT_EXP_KEY);
    } catch {}
  };

  const restoreChat = () => {
    setMinimized(false);
    try {
      localStorage.setItem(CHAT_EXP_KEY, Date.now().toString());
    } catch {}
  };

  useEffect(() => {
    minimizedRef.current = minimized === true;
  }, [minimized]);

  useEffect(() => {
    let initial = true; // ডিফল্ট: মিনিমাইজ
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const saved = localStorage.getItem(CHAT_EXP_KEY);
      if (saved) {
        const left = CHAT_EXP_MS - (Date.now() - parseInt(saved, 10));
        if (left > 0) {
          initial = false;
          timer = setTimeout(() => {
            if (!isOpenRef.current) setMinimized(true);
          }, left);
        } else {
          localStorage.removeItem(CHAT_EXP_KEY);
        }
      }
    } catch {}
    setMinimized(initial);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const fetchInitChat = useCallback(async () => {
    try {
      // 🔒 ক্যাশড init = দুই ডিভাইসে একই visitorId — আটকানো
      const res = await fetch("/api/chat/init", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.conversationId) {
        conversationIdRef.current = Number(data.conversationId);
      }
      if (data.messages) {
        setMessages(
          data.messages.length > 0
            ? data.messages
            : [
                {
                  id: -1,
                  senderType: "SYSTEM",
                  text: isEn ? CHAT_WELCOME_TEXT_EN : CHAT_WELCOME_TEXT,
                  createdAt: new Date().toISOString(),
                },
              ],
        );
        setInitialized(true);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  }, [isEn]);

  // 🚀 পেজ লোডের সাথে সাথে চ্যাট init/WebSocket যুক্ত না করে, ৩ সেকেন্ড পর ব্যাকগ্রাউন্ডে যুক্ত হচ্ছে —
  // যাতে প্রথম রেন্ডার/LCP-তে এক্সট্রা নেটওয়ার্ক কল বাধা না দেয়
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchInitChat();
    }, 3000);
    return () => clearTimeout(timer);
  }, [fetchInitChat]);

  useEffect(() => {
    if (!initialized) return;

    let closedByUs = false;

    const connect = () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* ignore */
        }
      }

      const ws = connectChatSocket({
        onConnected: () => setLive(true),
        onMessage: (data) => {
          const msg = data as Message;
          // 🔒 অন্য কনভারসেশনের মেসেজ ক্লায়েন্টেও ফেলে দাও (সার্ভার ফিল্টারের ব্যাকআপ)
          if (
            msg.conversationId != null &&
            conversationIdRef.current != null &&
            Number(msg.conversationId) !== conversationIdRef.current
          ) {
            return;
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            const withoutTemp = prev.filter(
              (m) =>
                !(
                  m.id > 1e12 &&
                  m.senderType === "CUSTOMER" &&
                  m.text === msg.text
                ),
            );
            return [...withoutTemp, msg];
          });

          const isStaff =
            msg.senderType === "ADMIN" ||
            msg.senderType === "AGENT" ||
            msg.senderType === "SYSTEM";

          if (isStaff && !isOpenRef.current) {
            setUnread((n) => n + 1);
            playVisitorNotify();
            setShowTooltip(true);
            restoreChat();
          }
        },
        onError: () => setLive(false),
        onClose: () => {
          setLive(false);
          if (!closedByUs) {
            reconnectTimer.current = setTimeout(connect, 2000);
          }
        },
      });
      wsRef.current = ws;
    };

    connect();

    return () => {
      closedByUs = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
      setLive(false);
    };
  }, [initialized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText;
    setInputText("");

    const tempMessage: Message = {
      id: Date.now(),
      senderType: "CUSTOMER",
      text: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-locale": isEn ? "en" : "bn",
        },
        body: JSON.stringify({ text: userText }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      if (data?.conversationId) {
        conversationIdRef.current = Number(data.conversationId);
      }
    } catch (err) {
      console.error("Message send failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageText = (text: string, isCustomer: boolean) => {
    // [লেবেল](url) ফরম্যাট আর সাধারণ বেয়ার URL — দুটোই চিনবে
    const linkRegex =
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
    const linkClass = `underline font-medium break-all transition-colors ${
      isCustomer
        ? "text-emerald-100 hover:text-white"
        : "text-blue-600 hover:text-blue-800"
    }`;

    const renderLine = (line: string, lineKey: number) => {
      const nodes: (string | ReactNode)[] = [];
      let lastIndex = 0;
      let partIndex = 0;
      let match: RegExpExecArray | null;
      linkRegex.lastIndex = 0;
      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          nodes.push(line.slice(lastIndex, match.index));
        }
        const [, label, labeledUrl, bareUrl] = match;
        const url = labeledUrl || bareUrl;
        const lower = (label || url).toLowerCase();
        nodes.push(
          <a
            key={`${lineKey}-${partIndex++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} inline-flex items-center`}
          >
            {lower.includes("facebook") && <FacebookIcon />}
            {lower.includes("youtube") && <YoutubeIcon />}
            {label || url}
          </a>,
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) nodes.push(line.slice(lastIndex));
      return nodes;
    };

    return text.split("\n").map((line, i) => (
      <span key={i}>
        {renderLine(line, i)}
        <br />
      </span>
    ));
  };

  if (minimized === null) return null;

  if (minimized) {
    return (
      <div className="fixed right-0 bottom-36 md:bottom-20 z-[60] flex items-center justify-end">
        {/* 💬 মিনিমাইজ থাকলেও বাবল দেখাবে; চাপলে চ্যাট খুলে যাবে */}
        <button
          type="button"
          onClick={() => {
            restoreChat();
            toggleChat();
          }}
          aria-hidden={!bubbleVisible}
          tabIndex={bubbleVisible ? 0 : -1}
          className={`absolute right-full mr-3 whitespace-nowrap bg-gray-900 text-white text-[11px] sm:text-xs py-2 px-3 rounded-2xl shadow-lg flex items-center gap-1.5 border border-gray-700 cursor-pointer transition-all duration-500 motion-reduce:transition-none ${
            bubbleVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          {typing && unread === 0 ? (
            <span className="flex items-center gap-1 px-1 py-0.5" aria-label="typing">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce motion-reduce:animate-none" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:150ms] motion-reduce:animate-none" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:300ms] motion-reduce:animate-none" />
            </span>
          ) : unread > 0 ? (
            <span>
              {isEn
                ? `💬 New reply (${unread})`
                : `💬 নতুন রিপ্লাই এসেছে (${unread})`}
            </span>
          ) : (
            <>
              <span className="hidden sm:inline">
                {isEn ? "💬 Live Chat – Need any help?" : "💬 লাইভ চ্যাট – কিছু জানতে চান?"}
              </span>
              <span className="sm:hidden">
                {isEn ? "Live Chat 💬" : "লাইভ চ্যাট 💬"}
              </span>
            </>
          )}
          <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-gray-900" />
        </button>

        <button
          type="button"
          onClick={restoreChat}
          aria-label={isEn ? "Show live chat" : "লাইভ চ্যাট দেখান"}
          className="flex h-11 w-7 md:h-12 items-center justify-center rounded-l-full bg-[#055a36] text-white shadow-lg cursor-pointer transition-all duration-200 hover:w-9 motion-reduce:transition-none"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 bottom-36 md:bottom-20 z-[60]">
      {isOpen && (
        <div className="bg-white w-[300px] sm:w-[340px] h-[430px] rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden mb-3 transition-all duration-300">
          <div className="bg-[#055a36] text-white p-3 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${live ? "bg-green-400 animate-pulse" : "bg-yellow-300"}`}
              />
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-wide">
                  Farmer Kamol Support
                </h3>
                <p className="text-[9px] sm:text-[10px] text-emerald-100">
                  {live
                    ? isEn
                      ? "Live · WebSocket"
                      : "লাইভ · WebSocket"
                    : isEn
                      ? "Connecting..."
                      : "সংযোগ হচ্ছে..."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2.5 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isCustomer = msg.senderType === "CUSTOMER";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-[12px] sm:text-[12.5px] leading-relaxed ${
                      isCustomer
                        ? "bg-[#055a36] text-white rounded-br-none shadow-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {(msg.senderType === "ADMIN" ||
                      msg.senderType === "AGENT") && (
                      <span className="block text-[10px] font-semibold text-green-700 mb-0.5">
                        {msg.senderName ||
                          (msg.senderType === "AGENT"
                            ? isEn
                              ? "Agent"
                              : "এজেন্ট"
                            : isEn
                              ? "Support"
                              : "সাপোর্ট")}
                      </span>
                    )}
                    {renderMessageText(msg.text, isCustomer)}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-2 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isEn ? "Type your question..." : "আপনার প্রশ্নটি লিখুন..."
              }
              className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#055a36] text-gray-800 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="bg-[#055a36] text-white p-2 rounded-xl hover:bg-[#034026] disabled:opacity-50 transition cursor-pointer hover:scale-105 active:scale-95"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform rotate-90"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <div className="relative flex items-center justify-end">
        {/* ✨ ঘুরন্ত সোনালি রিং */}
        {!isOpen && (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-[3px] h-[50px] w-[50px] md:h-[54px] md:w-[54px] rounded-full bg-[conic-gradient(from_0deg,rgba(251,191,36,0.18)_0deg,#fbbf24_70deg,rgba(251,191,36,0.18)_130deg,rgba(251,191,36,0.18)_360deg)] animate-[spin_4s_linear_infinite] motion-reduce:animate-none"
          />
        )}

        {/* 💬 স্পিচ বাবল */}
        <button
          type="button"
          onClick={toggleChat}
          aria-hidden={!bubbleVisible}
          tabIndex={bubbleVisible ? 0 : -1}
          className={`absolute right-full mr-3 whitespace-nowrap bg-gray-900 text-white text-[11px] sm:text-xs py-2 px-3 rounded-2xl shadow-lg flex items-center gap-1.5 border border-gray-700 cursor-pointer transition-all duration-500 motion-reduce:transition-none ${
            bubbleVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          {typing && unread === 0 ? (
            <span className="flex items-center gap-1 px-1 py-0.5" aria-label="typing">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce motion-reduce:animate-none" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:150ms] motion-reduce:animate-none" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:300ms] motion-reduce:animate-none" />
            </span>
          ) : unread > 0 ? (
            <span>
              {isEn
                ? `💬 New reply (${unread})`
                : `💬 নতুন রিপ্লাই এসেছে (${unread})`}
            </span>
          ) : (
            <>
              <span className="hidden sm:inline">
                {isEn ? "💬 Live Chat – Need any help?" : "💬 লাইভ চ্যাট – কিছু জানতে চান?"}
              </span>
              <span className="sm:hidden">
                {isEn ? "Live Chat 💬" : "লাইভ চ্যাট 💬"}
              </span>
            </>
          )}
          <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-gray-900" />
        </button>

        <button
          onClick={toggleChat}
          className="group relative bg-[#055a36] hover:bg-[#034026] text-white h-11 min-w-11 md:h-12 md:min-w-12 md:hover:px-4 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Toggle Chat"
        >
          {isOpen ? (
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {!isOpen && (
            <span className="hidden md:block max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[110px] group-hover:ml-2 group-hover:opacity-100">
              {isEn ? "Live Chat" : "লাইভ চ্যাট"}
            </span>
          )}
          {!isOpen && (
            <span
              aria-hidden
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"
            />
          )}
          {!isOpen && unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

{/* ✕ মিনিমাইজ বাটন (ছোট দেখায়, কিন্তু টাচ এরিয়া বড়) */}
{!isOpen && (
  <button
    type="button"
    onClick={minimizeChat}
    aria-label={isEn ? "Minimize chat" : "চ্যাট ছোট করুন"}
    className="absolute -top-2.5 right-6 md:right-7 z-10 flex h-7 w-7 items-center justify-center cursor-pointer"
  >
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-700/90 text-white shadow">
      <svg
        className="h-2.5 w-2.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </span>
  </button>
)}
</div>
</div>
);
}
