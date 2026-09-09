"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getLocaleFromPath, localizeHref } from "@/lib/i18n";

const HISTORY_KEY = "fk_search_history";
const MAX_HISTORY = 10;

type SearchResult = {
  type: "product" | "blog" | "video" | "gallery";
  id: number;
  title: string;
  titleEn?: string | null;
  subtitle?: string | null;
  image?: string | null;
  url: string;
  urlEn?: string;
  externalUrl?: string;
};

const typeLabel: Record<
  SearchResult["type"],
  { bn: string; en: string; emoji: string }
> = {
  product: { bn: "পণ্য", en: "Product", emoji: "🛒" },
  blog: { bn: "ব্লগ", en: "Blog", emoji: "📝" },
  video: { bn: "ভিডিও", en: "Video", emoji: "🎬" },
  gallery: { bn: "গ্যালারি", en: "Gallery", emoji: "🖼️" },
};

const ui = {
  bn: {
    placeholder: "পণ্য, ব্লগ, ভিডিও খুঁজুন...",
    recent: "সাম্প্রতিক সার্চ",
    clear: "মুছুন",
    noResult: "কিছু পাওয়া যায়নি",
    searching: "খুঁজছি...",
  },
  en: {
    placeholder: "Search products, blogs, videos...",
    recent: "Recent searches",
    clear: "Clear",
    noResult: "No results found",
    searching: "Searching...",
  },
};

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(query: string) {
  const q = query.trim();
  if (!q) return;
  const prev = loadHistory().filter((x) => x.toLowerCase() !== q.toLowerCase());
  const next = [q, ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

type Props = {
  variant: "navbar" | "mobile";
  onClose?: () => void;
  autoFocus?: boolean;
};

export default function GlobalSearch({ variant, onClose, autoFocus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = ui[locale];
  const href = (path: string) => localizeHref(path, locale);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q.trim())}&limit=8`,
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function onQueryChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 300);
  }

  function goToResult(item: SearchResult) {
    saveHistory(query || item.title);
    setHistory(loadHistory());
    setOpen(false);
    onClose?.();

    const path =
      locale === "en" && item.urlEn
        ? item.urlEn
        : item.url.startsWith("/en")
          ? item.url
          : href(item.url);

    if (item.type === "video" && item.externalUrl) {
      router.push(path);
      return;
    }
    router.push(path);
  }

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    saveHistory(q);
    setHistory(loadHistory());
    setOpen(false);
    onClose?.();
    router.push(`${href("/shop")}?search=${encodeURIComponent(q)}`);
  }

  function pickHistory(h: string) {
    setQuery(h);
    setOpen(true);
    fetchResults(h);
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  const showDropdown = open && (query.trim().length > 0 || history.length > 0);
  const showHistory = open && query.trim().length === 0 && history.length > 0;

  const inputClass =
    variant === "navbar"
      ? "bg-green-800 text-white placeholder-white/70 px-2 py-0.5 rounded-l-full text-[11px] outline-none w-20 md:w-28 lg:w-36 h-6 border border-r-0 border-white/20"
      : "flex-1 bg-white text-green-900 placeholder-green-700 px-4 py-3 rounded-full text-sm outline-none";

  return (
    <div
      ref={wrapRef}
      className={`relative ${variant === "mobile" ? "w-full" : ""}`}
    >
      <form onSubmit={submitSearch} className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={t.placeholder}
          className={inputClass}
          autoComplete="off"
        />
        {variant === "navbar" && (
          <button
            type="submit"
            aria-label="Search"
            className="bg-yellow-400 text-green-900 px-2 py-0.5 rounded-r-full text-[10px] font-bold h-6 flex items-center justify-center"
          >
            🔍
          </button>
        )}
        {variant === "mobile" && (
          <button
            type="submit"
            className="ml-2 bg-yellow-400 text-green-900 p-3 rounded-full flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>
        )}
      </form>

      {showDropdown && (
        <div
          className={`absolute z-[100] mt-1 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 overflow-hidden ${
            variant === "navbar"
              ? "right-0 w-72 md:w-80"
              : "left-0 right-0 w-full mt-2"
          }`}
        >
          {showHistory && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-semibold text-gray-500">
                  {t.recent}
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  {t.clear}
                </button>
              </div>
              {history.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => pickHistory(h)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 rounded-lg flex items-center gap-2"
                >
                  <span className="text-gray-500">⏱</span>
                  <span className="truncate">{h}</span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length > 0 && (
            <div className="max-h-72 overflow-y-auto">
              {loading && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {t.searching}
                </div>
              )}
              {!loading && results.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {t.noResult}
                </div>
              )}
              {!loading &&
                results.map((item) => {
                  const label = typeLabel[item.type];
                  const title =
                    locale === "en" && item.titleEn ? item.titleEn : item.title;
                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onClick={() => goToResult(item)}
                      className="w-full text-left px-3 py-2.5 hover:bg-green-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-lg shrink-0">
                          {label.emoji}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {title}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                          <span>
                            {label.emoji}{" "}
                            {locale === "bn" ? label.bn : label.en}
                          </span>
                          {item.subtitle && (
                            <>
                              <span>·</span>
                              <span className="truncate">{item.subtitle}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
