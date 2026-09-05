"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileAvatarUpload from "@/app/components/ProfileAvatarUpload";

export default function AgentLogoutButton() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatar, setShowAvatar] = useState(false);

  useEffect(() => {
    fetch("/api/profile/avatar")
      .then((r) => r.json())
      .then((data) => {
        if (data?.avatarUrl) setAvatarUrl(data.avatarUrl);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/agent/logout", { method: "POST" });
    router.push("/agent/login");
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAvatar(!showAvatar)}
          className="w-8 h-8 rounded-full overflow-hidden border border-green-200 bg-green-50 flex items-center justify-center"
          title="প্রোফাইল ছবি"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-green-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          )}
        </button>
        {showAvatar && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
            <ProfileAvatarUpload
              currentUrl={avatarUrl}
              onUploaded={(url) => {
                setAvatarUrl(url);
                setShowAvatar(false);
              }}
              size={80}
            />
          </div>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="text-sm font-bold text-red-600 hover:text-red-700 transition px-2 py-1.5 md:px-3 rounded-lg hover:bg-red-50"
      >
        <span className="md:hidden">🔒</span>
        <span className="hidden md:inline">🔒লগআউট</span>
      </button>
    </div>
  );
}
