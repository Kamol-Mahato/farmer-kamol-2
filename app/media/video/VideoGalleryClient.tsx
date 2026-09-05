"use client";
import { useState, useRef } from "react";

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
  const [unmutedId, setUnmutedId] = useState<number | null>(null);
  const iframeRefs = useRef<Record<number, HTMLIFrameElement | null>>({});

  function handleUnmute(id: number) {
    const iframe = iframeRefs.current[id];
    const willUnmute = unmutedId !== id;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: willUnmute ? "unMute" : "mute",
          args: [],
        }),
        "*",
      );
    }
    setUnmutedId(willUnmute ? id : null);
  }

  function getYoutubeId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  }

  function getEmbedUrl(video: Video) {
    if (video.platform === "FACEBOOK") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.youtubeUrl)}&autoplay=true&mute=1`;
    }
    const id = getYoutubeId(video.youtubeUrl);
    if (!id) return "";
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&rel=0&modestbranding=1&enablejsapi=1`;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-32 text-gray-400">
        এখনো কোনো ভিডিও যোগ করা হয়নি
      </div>
    );
  }

  const topVideos = videos.slice(0, 3);
  const restVideos = videos.slice(3);
  const secondaryVideo = restVideos[secondaryIndex] || null;

  function renderVideoFrame(video: Video) {
    const isUnmuted = unmutedId === video.id;

    // Facebook → thumbnail + Follow বাটন ভিডিওর ভিতরে
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
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500 text-sm font-bold">
                📘 Facebook ভিডিও
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

    // YouTube → embed + Subscribe (বাম) + Mute (ডান)
    return (
      <div
        key={video.id}
        className="relative bg-black rounded-2xl overflow-hidden shadow-xl"
        style={{ aspectRatio: "16/9" }}
      >
        <iframe
          ref={(el) => {
            iframeRefs.current[video.id] = el;
          }}
          src={getEmbedUrl(video)}
          title={video.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full h-full"
        />
        <a
          href={youtubeChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:bg-red-700 transition"
        >
          ▶️ Subscribe
        </a>
        <button
          onClick={() => handleUnmute(video.id)}
          className="absolute bottom-3 right-3 z-20 bg-white/90 text-green-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:bg-white transition border border-green-700"
        >
          {isUnmuted ? "🔊 Mute" : "🔇 Unmute"}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {topVideos.map((video) => (
          <div key={video.id} className="flex flex-col gap-3 text-center">
            {renderVideoFrame(video)}
            <div>
              <h2 className="font-bold text-green-800">{video.title}</h2>
              {video.description && (
                <p
                  className="text-gray-600 text-xs mt-1"
                  dangerouslySetInnerHTML={{ __html: video.description }}
                />
              )}
              <a
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-xs text-blue-600 hover:underline"
              >
                {video.platform === "FACEBOOK"
                  ? "Facebook-এ দেখুন"
                  : "YouTube-এ দেখুন"}
              </a>
            </div>
          </div>
        ))}
      </div>

      {restVideos.length > 0 && secondaryVideo && (
        <>
          <h2 className="text-xl font-bold text-green-800 mb-4 text-center">
            আরও ভিডিও
          </h2>
          {renderVideoFrame(secondaryVideo)}
          <div className="text-center my-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-green-800">
              {secondaryVideo.title}
            </h3>
            {secondaryVideo.description && (
              <p
                className="text-gray-600 text-sm mt-2"
                dangerouslySetInnerHTML={{ __html: secondaryVideo.description }}
              />
            )}
            <a
              href={secondaryVideo.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              {secondaryVideo.platform === "FACEBOOK"
                ? "Facebook-এ দেখুন"
                : "YouTube-এ দেখুন"}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {restVideos.map((video, index) => {
              const ytId = getYoutubeId(video.youtubeUrl);
              return (
                <button
                  key={video.id}
                  onClick={() => setSecondaryIndex(index)}
                  className={`rounded-xl overflow-hidden shadow hover:shadow-lg transition group border-2 ${
                    secondaryIndex === index
                      ? "border-green-600"
                      : "border-transparent"
                  }`}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : video.platform === "YOUTUBE" && ytId ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-32 bg-blue-50 flex items-center justify-center text-blue-400 text-xs font-bold">
                      📘 Facebook
                    </div>
                  )}
                  <div className="p-2 bg-white text-left">
                    <p className="text-xs font-bold text-green-800 line-clamp-2">
                      {video.title}
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
