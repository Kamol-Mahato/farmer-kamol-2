"use client";

import { useState } from "react";

interface Video {
  id: number;
  title: string;
  description: string | null;
  youtubeUrl: string;
  platform: string;
  thumbnailUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}

const PC_INITIAL = 9; // 3 columns x 3 rows
const MOBILE_INITIAL = 6; // 2 columns x 3 rows

export default function VideoGalleryClient({
  videos,
  youtubeChannelUrl = "https://www.youtube.com/@FarmerKamol",
  facebookPageUrl = "https://www.facebook.com/farmerkamol",
}: {
  videos: Video[];
  youtubeChannelUrl?: string;
  facebookPageUrl?: string;
}) {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  function getYoutubeId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-32 text-gray-500">
        এখনো কোনো ভিডিও যোগ করা হয়নি
      </div>
    );
  }

  // ✅ mobile-এ ৬টা, PC-তে ৯টা — CSS দিয়ে দুই সাইজে আলাদা slice দেখানো হচ্ছে
  const mobileVideos = showAll ? videos : videos.slice(0, MOBILE_INITIAL);
  const pcVideos = showAll ? videos : videos.slice(0, PC_INITIAL);
  const hasMore = videos.length > PC_INITIAL || videos.length > MOBILE_INITIAL;

  function renderVideoCard(video: Video) {
    const isPlaying = playingId === video.id;

    return (
      <div key={video.id} className="flex flex-col gap-2">
        <div
          className="relative bg-black rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
          style={{ aspectRatio: "16/9" }}
        >
          {video.platform === "FACEBOOK" ? (
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-0 block"
            >
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center text-blue-500 gap-2">
                  <span className="text-3xl">📘</span>
                  <span className="text-xs font-bold">Facebook ভিডিও</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
                <div className="w-12 h-12 rounded-full bg-black/70 flex items-center justify-center text-white text-xl">
                  ▶
                </div>
              </div>
              <span className="absolute bottom-2 left-2 z-20 inline-flex items-center gap-1 bg-[#1877F2] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                📘 Facebook
              </span>
            </a>
          ) : (
            (() => {
              const ytId = getYoutubeId(video.youtubeUrl);
              if (!ytId) {
                return (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center px-3">
                    ভিডিও লোড করা যায়নি
                  </div>
                );
              }
              const thumb =
                video.thumbnailUrl ||
                `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

              return isPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                  title={video.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlayingId(video.id)}
                  aria-label={`প্লে করুন: ${video.title}`}
                  className="absolute inset-0 w-full h-full group"
                >
                  <img
                    src={thumb}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white text-xl shadow-lg">
                      ▶
                    </div>
                  </div>
                  <span className="absolute bottom-2 left-2 z-20 inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                    ▶️ YouTube
                  </span>
                </button>
              );
            })()
          )}
        </div>

        <div className="px-0.5">
          <h2 className="font-bold text-green-800 text-sm line-clamp-2">
            {video.title}
          </h2>
          {video.description && (
            <p
              className="text-gray-500 text-xs mt-1 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: video.description }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: 2 columns */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        {mobileVideos.map(renderVideoCard)}
      </div>

      {/* PC/Tablet: 3 columns */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {pcVideos.map(renderVideoCard)}
      </div>

      {hasMore && !showAll && (
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-full shadow transition"
          >
            আরও দেখুন
          </button>
        </div>
      )}

      <div className="text-center mt-10 flex flex-wrap justify-center gap-3">
        <a
          href={youtubeChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow hover:bg-red-700 transition"
        >
          ▶️ Subscribe
        </a>
        <a
          href={facebookPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-[#1877F2] text-white text-sm font-bold px-4 py-2 rounded-full shadow hover:bg-[#166FE5] transition"
        >
          👍 Follow
        </a>
      </div>
    </div>
  );
}
