"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSavePercent } from "@/lib/pricing";
import { translateUnit } from "@/lib/unitTranslate";

type Product = {
  id: number;
  name: string;
  nameEn?: string | null;
  slug: string;
  pricePerUnit: number;
  discountPrice: number | null;
  unit: string;
  images: { imageUrl: string; isPrimary: boolean }[];
};

type HeroVideo = {
  id: number;
  youtubeUrl: string;
  title?: string | null;
  titleEn?: string | null;
  thumbnailUrl?: string | null;
};

interface YTMessage {
  event?: string;
  info?: number;
}

function extractYoutubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
  return match ? match[1] : null;
}

function toYoutubeEmbedUrl(url: string) {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&playsinline=1&enablejsapi=1&rel=0`;
}

function startListening(iframe: HTMLIFrameElement | null) {
  if (!iframe || !iframe.contentWindow) return;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: "listening", id: 1 }),
    "*",
  );
  iframe.contentWindow.postMessage(
    JSON.stringify({
      event: "command",
      func: "addEventListener",
      args: ["onStateChange"],
    }),
    "*",
  );
}

type MobileQueueItem =
  | { kind: "video"; videoIdx: number }
  | { kind: "product"; productIdx: number };

const THUMBNAIL_ADVANCE_MS = 3500;

export default function HeroSlider({
  featuredProducts = [],
  heroVideos = [],
}: {
  featuredProducts?: Product[];
  heroVideos?: HeroVideo[];
}) {
  const [pcVideoIndex, setPcVideoIndex] = useState(0);
  const [pcProductIndex, setPcProductIndex] = useState(0);
  const pcIframeRef = useRef<HTMLIFrameElement>(null);
  const [pcPlaying, setPcPlaying] = useState(false);

  const [mobileQueueIndex, setMobileQueueIndex] = useState(0);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const [mobilePlaying, setMobilePlaying] = useState(false);

  const hasVideos = heroVideos.length > 0;

  const mobileQueue: MobileQueueItem[] = [];
  if (hasVideos) {
    heroVideos.forEach((_, vIdx) => {
      mobileQueue.push({ kind: "video", videoIdx: vIdx });
      featuredProducts.forEach((_, pIdx) => {
        mobileQueue.push({ kind: "product", productIdx: pIdx });
      });
    });
  } else {
    featuredProducts.forEach((_, pIdx) =>
      mobileQueue.push({ kind: "product", productIdx: pIdx }),
    );
  }
  const mobileTotal = mobileQueue.length || 1;
  const safeMobileIndex = mobileQueueIndex % mobileTotal;
  const currentMobileItem = mobileQueue[safeMobileIndex];

  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const timer = setInterval(() => {
      setPcProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  useEffect(() => {
    setPcPlaying(false);
  }, [pcVideoIndex]);

  useEffect(() => {
    if (heroVideos.length <= 1 || pcPlaying) return;
    const timer = setTimeout(() => {
      setPcVideoIndex((prev) => (prev + 1) % heroVideos.length);
    }, THUMBNAIL_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [pcVideoIndex, pcPlaying, heroVideos.length]);

  useEffect(() => {
    setMobilePlaying(false);
  }, [safeMobileIndex]);

  useEffect(() => {
    if (!currentMobileItem) return;
    if (currentMobileItem.kind === "product") {
      const timer = setTimeout(() => {
        setMobileQueueIndex((prev) => (prev + 1) % mobileTotal);
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (currentMobileItem.kind === "video" && !mobilePlaying) {
      const timer = setTimeout(() => {
        setMobileQueueIndex((prev) => (prev + 1) % mobileTotal);
      }, THUMBNAIL_ADVANCE_MS);
      return () => clearTimeout(timer);
    }
  }, [safeMobileIndex, currentMobileItem, mobileTotal, mobilePlaying]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== "https://www.youtube.com") return;
      let data: YTMessage;
      try {
        data = JSON.parse(e.data) as YTMessage;
      } catch {
        return;
      }
      if (data.event !== "onStateChange" || data.info !== 0) return;
      if (e.source === pcIframeRef.current?.contentWindow) {
        setPcVideoIndex((prev) => (prev + 1) % (heroVideos.length || 1));
      }
      if (e.source === mobileIframeRef.current?.contentWindow) {
        setMobileQueueIndex((prev) => (prev + 1) % mobileTotal);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [heroVideos.length, mobileTotal]);

  function pcPrevVideo() {
    setPcVideoIndex((p) => (p - 1 + heroVideos.length) % heroVideos.length);
  }
  function pcNextVideo() {
    setPcVideoIndex((p) => (p + 1) % heroVideos.length);
  }
  function pcPrevProduct() {
    setPcProductIndex(
      (p) => (p - 1 + featuredProducts.length) % featuredProducts.length,
    );
  }
  function pcNextProduct() {
    setPcProductIndex((p) => (p + 1) % featuredProducts.length);
  }

  function mobilePrev() {
    setMobileQueueIndex((p) => (p - 1 + mobileTotal) % mobileTotal);
  }
  function mobileNext() {
    setMobileQueueIndex((p) => (p + 1) % mobileTotal);
  }

  const currentPcVideo = hasVideos
    ? heroVideos[pcVideoIndex % heroVideos.length]
    : null;
  const pcYtId = currentPcVideo ? extractYoutubeId(currentPcVideo.youtubeUrl) : null;
  const pcEmbedUrl = currentPcVideo ? toYoutubeEmbedUrl(currentPcVideo.youtubeUrl) : null;
  const pcThumb =
    currentPcVideo?.thumbnailUrl ||
    (pcYtId ? `https://img.youtube.com/vi/${pcYtId}/hqdefault.jpg` : null);

  const currentMobileVideo =
    currentMobileItem?.kind === "video" && hasVideos
      ? heroVideos[currentMobileItem.videoIdx]
      : null;
  const mobileYtId = currentMobileVideo
    ? extractYoutubeId(currentMobileVideo.youtubeUrl)
    : null;
  const mobileEmbedUrl = currentMobileVideo
    ? toYoutubeEmbedUrl(currentMobileVideo.youtubeUrl)
    : null;
  const mobileThumb =
    currentMobileVideo?.thumbnailUrl ||
    (mobileYtId ? `https://img.youtube.com/vi/${mobileYtId}/hqdefault.jpg` : null);

  function renderProductSlide(
    p: Product,
    key: number | string,
    extraClass: string,
  ) {
    const imageUrl =
      p.images?.[0]?.imageUrl || "/uploads/1781611130414-modhu.jpg";
    const savePercent = getSavePercent(p.pricePerUnit, p.discountPrice);
    const displayName = p.nameEn || p.name;
    return (
      <div key={key} className={`absolute inset-0 ${extraClass}`}>
        <Image
          src={imageUrl}
          alt={displayName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        {savePercent !== null && (
          <span className="absolute top-1.5 right-1.5 z-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-save-pop">
            {savePercent}% Save
          </span>
        )}
        <div className="absolute bottom-0 right-0 bg-white/60 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-tl-2xl flex flex-col items-end gap-0.5 md:gap-1 text-right">
          <p className="text-xs md:text-base font-bold text-green-900">
            {displayName}
          </p>
          <p className="text-black text-[10px] md:text-xs font-semibold">
            {translateUnit(p.unit)}
          </p>
          <div className="flex items-baseline gap-1">
            {savePercent !== null && (
              <span className="text-[10px] md:text-xs text-gray-500 line-through">
                ৳ {p.pricePerUnit}
              </span>
            )}
            <p className="text-black text-sm md:text-lg font-extrabold">
              ৳ {savePercent !== null ? p.discountPrice : p.pricePerUnit}
            </p>
          </div>
          <Link
            href={`/en/order?productId=${p.id}`}
            className="bg-yellow-400 hover:bg-yellow-300 text-green-900 px-3 py-1 md:px-6 md:py-2 rounded-xl font-bold text-[10px] md:text-xs transition text-center mt-1"
          >
            🛒 Order Now
          </Link>
        </div>
      </div>
    );
  }

  function renderVideoThumbnail(
    thumb: string | null,
    title: string,
    onPlay: () => void,
  ) {
    return (
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play: ${title}`}
        className="absolute inset-0 w-full h-full group"
      >
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-green-800" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl shadow-lg">
            ▶
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-green-900">
      <h1 className="sr-only">
        Farmer Kamol - Pure honey, ghee, mustard oil, and duck chicks, delivered
        directly from our farm in Raiganj, Sirajganj
      </h1>

      {/* PC LAYOUT */}
      <div className="hidden md:grid md:grid-cols-2 h-[280px]">
        <div className="relative overflow-hidden">
          {pcEmbedUrl ? (
            pcPlaying ? (
              <iframe
                key={pcVideoIndex}
                ref={pcIframeRef}
                src={pcEmbedUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                scrolling="no"
                onLoad={(e) => startListening(e.currentTarget)}
              />
            ) : (
              renderVideoThumbnail(
                pcThumb,
                currentPcVideo?.titleEn || currentPcVideo?.title || "Video",
                () => setPcPlaying(true),
              )
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-green-800">
              <p className="text-green-300 text-sm">No live video available</p>
            </div>
          )}
          {heroVideos.length > 1 && (
            <>
              <button
                onClick={pcPrevVideo}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition"
              >
                ‹
              </button>
              <button
                onClick={pcNextVideo}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition"
              >
                ›
              </button>
            </>
          )}
        </div>

        <div className="relative overflow-hidden">
          {featuredProducts.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-green-800">
              <p className="text-green-300 text-sm">No featured products</p>
            </div>
          ) : (
            renderProductSlide(
              featuredProducts[pcProductIndex],
              featuredProducts[pcProductIndex].id,
              "opacity-100 animate-fadeIn",
            )
          )}
          {featuredProducts.length > 1 && (
            <>
              <button
                onClick={pcPrevProduct}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition"
              >
                ‹
              </button>
              <button
                onClick={pcNextProduct}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="md:hidden">
        <div className="relative" style={{ paddingTop: "56.25%" }}>
          {currentMobileItem?.kind === "video" && mobileEmbedUrl ? (
            mobilePlaying ? (
              <iframe
                key={`m-${safeMobileIndex}`}
                ref={mobileIframeRef}
                src={mobileEmbedUrl}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                scrolling="no"
                onLoad={(e) => startListening(e.currentTarget)}
              />
            ) : (
              renderVideoThumbnail(
                mobileThumb,
                currentMobileVideo?.titleEn ||
                  currentMobileVideo?.title ||
                  "Video",
                () => setMobilePlaying(true),
              )
            )
          ) : currentMobileItem?.kind === "product" &&
            featuredProducts[currentMobileItem.productIdx] ? (
            renderProductSlide(
              featuredProducts[currentMobileItem.productIdx],
              `m-${safeMobileIndex}`,
              "opacity-100",
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-green-800">
              <p className="text-green-300 text-sm">No content available</p>
            </div>
          )}
          {mobileTotal > 1 && (
            <>
              <button
                onClick={mobilePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
              >
                ‹
              </button>
              <button
                onClick={mobileNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}