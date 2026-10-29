/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
];

const CACHE_IMMUTABLE = "public, max-age=31536000, immutable";
const CACHE_STATIC = "public, max-age=31536000, immutable";

const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 420, 768, 980, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: CACHE_IMMUTABLE }] },
      { source: "/logo/:path*", headers: [{ key: "Cache-Control", value: CACHE_IMMUTABLE }] },
      { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: CACHE_STATIC }] },
      { source: "/_next/image/:path*", headers: [{ key: "Cache-Control", value: CACHE_STATIC }] },
      { source: "/:path*.woff2", headers: [{ key: "Cache-Control", value: CACHE_STATIC }] },
    ];
  },
};

export default nextConfig;
