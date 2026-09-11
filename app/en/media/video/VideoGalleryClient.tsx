"use client";
import { useState } from "react";

interface Video {
  id: number;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  youtubeUrl: string;
  platform: string;
  thumbnailUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export default function VideoGalleryClient({
  videos,
  youtubeChannelUrl = "https://www.youtube.com/@FarmerKamol",
  facebookPageUrl = "https://www.facebook.com/farmerkamol",
}: {
  videos: Video[];
  youtubeChannelUrl?: string;
  facebookPageUrl?: string;
}) {
  const [secondaryIndex, setSecondaryIndex] = useState(0);
  const [playingId, setPlayingId] = useState<number | null>(null);

  function getYoutubeId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-32 text-gray-500">No videos added yet</div>
    );
  }

  const topVideos = videos.slice(0, 3);
  const restVideos = videos.slice(3);
  const secondaryVideo = restVideos[secondaryIndex] || null;

  function renderVideoFrame(video: Video) {
    const displayTitle = video.titleEn || video.title;

    if (video.platform === "FACEBOOK") {
      return (
        <div
          key={video.id}
          className="relative bg-black rounded-2xl overflow-hidden shadow-xl group"
          style={{ aspectRatio: "16/9" }}
        >
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-0 block"
          >
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={displayTitle}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500 text-sm font-bold">
                📘 Facebook Video
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
              <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center text-white text-2xl">
                ▶
              </div>
            </div>
          </a>
          <a
            href={facebookPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1 bg-[#1877F2] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:bg-[#166FE5] transition"
            onClick={(e) => e.stopPropagation()}
          >
            👍 Follow
          </a>
        </div>
      );
    }

    const ytId = getYoutubeId(video.youtubeUrl);

    if (!ytId) {
      return (
        <div
          key={video.id}
          className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center text-gray-400 text-sm text-center px-4"
          style={{ aspectRatio: "16/9" }}
        >
          Could not load this video — please check the link
        </div>
      );
    }

    const isPlaying = playingId === video.id;
    const thumb =
      video.thumbnailUrl || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    return (
      <div
        key={video.id}
        className="relative bg-black rounded-2xl overflow-hidden shadow-xl"
        style={{ aspectRatio: "16/9" }}
      >
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            title={displayTitle}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlayingId(video.id)}
            aria-label={`Play: ${displayTitle}`}
            className="absolute inset-0 w-full h-full group"
          >
            <img
              src={thumb}
              alt={displayTitle}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl shadow-lg">
                ▶
              </div>
            </div>
          </button>
        )}
        <a
          href={youtubeChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:bg-red-700 transition"
        >
          ▶️ Subscribe
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {topVideos.map((video) => {
          const displayTitle = video.titleEn || video.title;
          const displayDescription = video.descriptionEn || video.description;
          return (
            <div key={video.id} className="flex flex-col gap-3 text-center">
              {renderVideoFrame(video)}
              <div>
                <h2 className="font-bold text-green-800">{displayTitle}</h2>
                {displayDescription && (
                  <p
                    className="text-gray-600 text-xs mt-1"
                    dangerouslySetInnerHTML={{ __html: displayDescription }}
                  />
                )}
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-xs text-blue-600 hover:underline"
                >
                  {video.platform === "FACEBOOK"
                    ? "View on Facebook"
                    : "View on YouTube"}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {restVideos.length > 0 && secondaryVideo && (
        <>
          <h2 className="text-xl font-bold text-green-800 mb-4 text-center">
            More Videos
          </h2>
          {renderVideoFrame(secondaryVideo)}
          <div className="text-center my-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-green-800">
              {secondaryVideo.titleEn || secondaryVideo.title}
            </h3>
            {(secondaryVideo.descriptionEn || secondaryVideo.description) && (
              <p
                className="text-gray-600 text-sm mt-2"
                dangerouslySetInnerHTML={{
                  __html: (secondaryVideo.descriptionEn ||
                    secondaryVideo.description) as string,
                }}
              />
            )}
            <a
              href={secondaryVideo.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              {secondaryVideo.platform === "FACEBOOK"
                ? "View on Facebook"
                : "View on YouTube"}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {restVideos.map((video, index) => {
              const ytId = getYoutubeId(video.youtubeUrl);
              const displayTitle = video.titleEn || video.title;
              return (
                <button
                  key={video.id}
                  onClick={() => {
                    setSecondaryIndex(index);
                    setPlayingId(null);
                  }}
                  className={`rounded-xl overflow-hidden shadow hover:shadow-lg transition group border-2 ${
                    secondaryIndex === index
                      ? "border-green-600"
                      : "border-transparent"
                  }`}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={displayTitle}
                      loading="lazy"
                      className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : video.platform === "YOUTUBE" && ytId ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={displayTitle}
                      loading="lazy"
                      className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-32 bg-blue-50 flex items-center justify-center text-blue-400 text-xs font-bold">
                      📘 Facebook
                    </div>
                  )}
                  <div className="p-2 bg-white text-left">
                    <p className="text-xs font-bold text-green-800 line-clamp-2">
                      {displayTitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
