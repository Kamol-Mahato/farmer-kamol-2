/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production"

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://googletagmanager.com https://google-analytics.com ${isDev ? "'unsafe-eval'" : ""};
  script-src-elem 'self' 'unsafe-inline' https://googletagmanager.com https://google-analytics.com https://*.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://supabase.co https://weserv.nl https://google-analytics.com https://googletagmanager.com https://*.google-analytics.com;
  font-src 'self' data:;
  connect-src 'self' https://supabase.co https://google-analytics.com https://*.google-analytics.com https://doubleclick.net ${isDev ? "ws://localhost:* ws:" : ""};
  frame-src 'self' https://youtube.com https://youtube.com;
  media-src 'self' blob:;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim()

const nextConfig = {
  allowedDevOrigins: ['3000-firebase-farmer-kamolgit-1781445602919.cluster-edb2jv34dnhjisxuq5m7l37ccy.cloudworkstations.dev'],
  poweredByHeader: false,
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts', // Render-এর বদলে images.weserv.nl দিয়ে resize/WebP হবে — সার্ভারে কোনো লোড নেই
    minimumCacheTTL: 86400, // ২৪ ঘণ্টা image cache
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};
export default nextConfig;
// force redeploy fixed