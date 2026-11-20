"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSavePercent } from "@/lib/pricing";
import HeroSlideStack from "@/app/components/HeroSlideStack";
import CrossfadeSwap from "@/app/components/CrossfadeSwap";
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
  { kind: "video"; videoIdx: number } | { kind: "product"; productIdx: number };

  const THUMBNAIL_ADVANCE_MS = 3500;

  // ⏱ সময় বদলাতে চাইলে শুধু নিচের ৩টা সংখ্যা বদলান (১০০০ = ১ সেকেন্ড)
  const PC_PRODUCT_MS = 5000; // PC: প্রতিটা প্রোডাক্ট কতক্ষণ থাকবে
  const MOBILE_PRODUCT_MS = 4500; // মোবাইল: প্রতিটা প্রোডাক্ট কতক্ষণ থাকবে
  const FADE_MS = 1300; // এক ছবি থেকে আরেক ছবিতে মিশে যাওয়ার সময়

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
  const currentMobileKind = currentMobileItem?.kind;

  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const timer = setInterval(() => {
      setPcProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }, PC_PRODUCT_MS);
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
    if (!currentMobileKind) return;
    if (currentMobileKind === "product") {
      const timer = setTimeout(() => {
        setMobileQueueIndex((prev) => (prev + 1) % mobileTotal);
      }, MOBILE_PRODUCT_MS);
      return () => clearTimeout(timer);
    }
    if (currentMobileKind === "video" && !mobilePlaying) {
      const timer = setTimeout(() => {
        setMobileQueueIndex((prev) => (prev + 1) % mobileTotal);
      }, THUMBNAIL_ADVANCE_MS);
      return () => clearTimeout(timer);
    }
  }, [safeMobileIndex, currentMobileKind, mobileTotal, mobilePlaying]);

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

  // মোবাইলে আঙুল দিয়ে বাঁ-ডানে টানলে স্লাইড বদলায়
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const currentPcVideo = hasVideos
    ? heroVideos[pcVideoIndex % heroVideos.length]
    : null;
  const pcYtId = currentPcVideo
    ? extractYoutubeId(currentPcVideo.youtubeUrl)
    : null;
  const pcEmbedUrl = currentPcVideo
    ? toYoutubeEmbedUrl(currentPcVideo.youtubeUrl)
    : null;
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
    (mobileYtId
      ? `https://img.youtube.com/vi/${mobileYtId}/hqdefault.jpg`
      : null);

  function renderProductSlide(
    p: Product,
    key: number | string,
    extraClass: string,
    isPriority: boolean = false,
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
          priority={isPriority}
          fetchPriority={isPriority ? "high" : "auto"}
          quality={isPriority ? 80 : 70}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        {savePercent !== null && (
          <span className="absolute top-1.5 right-1.5 z-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-save-pop">
            {savePercent}% Save
          </span>
        )}
        <div className="hero-panel absolute bottom-0 right-0 bg-white/60 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-tl-2xl flex flex-col items-end gap-0.5 md:gap-1 text-right">
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

  function renderChannelLink(
    url: string,
    thumb: string | null,
    title: string,
    isPriority: boolean = false,
  ) {
    const label = /facebook\.com|fb\.watch/.test(url)
    ? "Visit our Facebook page"
    : extractYoutubeId(url)
      ? "Watch on YouTube"
      : "Visit our YouTube channel";
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label}: ${title}`}
        className="absolute inset-0 w-full h-full group"
      >
        {thumb ? (
          <Image
            src={thumb}
            alt={title}
            fill
            priority={isPriority}
            fetchPriority={isPriority ? "high" : "auto"}
            quality={isPriority ? 80 : 70}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-green-800" />
        )}
        <div className="absolute inset-0 flex items-end justify-center pb-4 bg-black/20 group-hover:bg-black/35 transition">
          <span className="bg-red-600 text-white text-xs md:text-sm font-bold px-4 py-2 rounded-full shadow-lg">
            ▶ {label}
          </span>
        </div>
      </a>
    );
  }

  function renderVideoThumbnail(
    thumb: string | null,
    title: string,
    onPlay: () => void,
    isPriority: boolean = false,
  ) {
    return (
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play: ${title}`}
        className="absolute inset-0 w-full h-full group"
      >
        {thumb ? (
          <Image
            src={thumb}
            alt={title}
            fill
            priority={isPriority}
            fetchPriority={isPriority ? "high" : "auto"}
            quality={isPriority ? 80 : 70}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
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
    <div className="bg-green-50 pt-3 pb-1 px-4 px-3 md:px-6 pt-3 md:pt-5 pb-4 md:pb-6">
      <h1 className="sr-only">
        Farmer Kamol – কৃষক কমল | Pure honey, ghee, mustard oil, and duck chicks,
        delivered directly from our farm in Raiganj, Sirajganj
      </h1>

      {/* PC LAYOUT */}
      <div className="hidden md:grid md:grid-cols-2 gap-4 h-[300px] max-w-7xl mx-auto">
      <div className="relative isolate overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 bg-green-900">
      {currentPcVideo ? (
            renderChannelLink(
              currentPcVideo.youtubeUrl,
              pcThumb,
              currentPcVideo.titleEn || currentPcVideo.title || "Channel",
              pcVideoIndex === 0,
            )
          ) : pcEmbedUrl ? (
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
                pcVideoIndex === 0,
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

        <div className="relative isolate overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 bg-green-900">
          {featuredProducts.length > 1 && (
            <div
              className="absolute bottom-3 left-4 z-10 flex items-center gap-1.5 drop-shadow"
              aria-hidden
            >
              {featuredProducts.map((item, i) => (
                <span
                  key={item.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === pcProductIndex % featuredProducts.length
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/55"
                  }`}
                />
              ))}
            </div>
          )}
          {featuredProducts.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-green-800">
              <p className="text-green-300 text-sm">No featured products</p>
            </div>
          ) : (
            <HeroSlideStack
              count={featuredProducts.length}
              index={pcProductIndex}
              fadeMs={FADE_MS}
              renderSlide={(i) =>
                renderProductSlide(
                  featuredProducts[i],
                  featuredProducts[i].id,
                  "",
                  i === 0,
                )
              }
            />
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
      <div
          className="relative isolate overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5"
          style={{ paddingTop: "56.25%" }}>
          <CrossfadeSwap
            itemKey={safeMobileIndex}
            count={mobileTotal}
            skipPrev={mobilePlaying}
            fadeMs={FADE_MS}
          >
            {currentMobileItem?.kind === "video" &&
            currentMobileVideo ? (
              renderChannelLink(
                currentMobileVideo.youtubeUrl,
                mobileThumb,
                currentMobileVideo.titleEn ||
                  currentMobileVideo.title ||
                  "Channel",
                safeMobileIndex === 0,
              )
            ) : currentMobileItem?.kind === "video" && mobileEmbedUrl ? (
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
                  safeMobileIndex === 0,
                )
              )
            ) : currentMobileItem?.kind === "product" &&
              featuredProducts[currentMobileItem.productIdx] ? (
              renderProductSlide(
                featuredProducts[currentMobileItem.productIdx],
                `m-${safeMobileIndex}`,
                "opacity-100",
                safeMobileIndex === 0,
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-green-800">
                <p className="text-green-300 text-sm">No content available</p>
              </div>
            )}
          </CrossfadeSwap>
          {mobileTotal > 1 && (
            <div
              className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1.5 drop-shadow"
              aria-hidden
            >
              {Array.from({ length: mobileTotal }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === safeMobileIndex ? "w-4 bg-white" : "w-1.5 bg-white/55"
                  }`}
                />
              ))}
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
