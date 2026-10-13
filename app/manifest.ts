import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Farmer Kamol - খামার থেকে আপনার দরজায়",
    short_name: "Farmer Kamol",
    description:
      "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি দেশি পণ্য, ন্যায্য মূল্যে।",
      id: "/",
      lang: "bn",
      dir: "ltr",
      scope: "/",
      start_url: "/",
      display: "standalone",
      orientation: "portrait",
      background_color: "#ffffff",
      theme_color: "#16a34a",
      categories: ["shopping", "food"],
      icons: [
        {
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      shortcuts: [
        { name: "পণ্য দেখুন", short_name: "পণ্য", url: "/shop" },
        { name: "আমার কার্ট", short_name: "কার্ট", url: "/cart" },
        { name: "যোগাযোগ", short_name: "যোগাযোগ", url: "/contact" },
      ],
  };
}
