/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com ${isDev ? "'unsafe-eval'" : ""};
  script-src-elem 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://pvixtqqcegfbxkhxogww.supabase.co https://images.weserv.nl https://*.google-analytics.com https://*.googletagmanager.com;
  font-src 'self' data:;
  connect-src 'self' ws: wss: https://pvixtqqcegfbxkhxogww.supabase.co https://*.google-analytics.com https://*.googletagmanager.com https://doubleclick.net ${isDev ? "ws://localhost:*" : ""};
  frame-src 'self' https://youtube.com https://youtube.com;
  media-src 'self' blob:;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig = {
  allowedDevOrigins: [
    "3000-firebase-farmer-kamolgit-1781445602919.cluster-edb2jv34dnhjisxuq5m7l37ccy.cloudworkstations.dev",
  ],
  poweredByHeader: false,
  reactStrictMode: true, // ✅ রিঅ্যাক্ট মোড পারফর্মেন্স ট্র্যাকিং
  
  // ✅ ১. CSS ও প্যাকেজ বান্ডল অপ্টিমাইজেশন (Render-blocking ও Legacy JS কমাবে)
  experimental: {
    optimizeCss: true, // Critical CSS ইনলাইন করবে এবং রেন্ডার ব্লকিং কমাবে
    optimizePackageImports: ['lucide-react', 'react-icons', 'framer-motion'], // আনইউজড আইকন/প্যাকেজ বাদ দেবে
  },
  
  // ✅ ২. প্রোডাকশন বিল্ডে অপ্রয়োজনীয় console.log তুলে ফেলা (কোড সাইজ ছোট করবে)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts", // Render-এর বদলে images.weserv.nl দিয়ে resize/WebP হবে — সার্ভারে কোনো লোড নেই
    minimumCacheTTL: 86400, // ২৪ ঘণ্টা image cache
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: cspHeader },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // ✅ স্ট্যাটিক ফন্ট, ছবি এবং সিএসএস/জেএস ফাইল ১ বছর ব্রাউজারে ক্যাশ থাকবে
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // ✅ পুরনো uploads ও static tool ফাইলগুলো ব্রাউজারে ১ বছর cache থাকবে
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/tools/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;