import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "referaus.com" },
    ],
  },
  headers: async () => {
    const isDev = process.env.NODE_ENV === "development";

    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : "*.supabase.co";

    // unsafe-eval is only needed in development (Next.js / Turbopack HMR).
    // Remove it in production to prevent XSS via eval().
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      isDev ? "'unsafe-eval'" : "",
      "https://vercel.live",
      "https://*.vercel-analytics.com",
      "https://*.vercel-insights.com",
      "https://js.stripe.com",
      "https://maps.googleapis.com",
    ]
      .filter(Boolean)
      .join(" ");

    const csp = [
      `default-src 'self'`,
      `script-src ${scriptSrc}`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' data: https://fonts.gstatic.com`,
      `img-src 'self' data: blob: https://*.supabase.co https://${supabaseHost} https://api.qrserver.com https://referaus.com https://vercel.com https://*.stripe.com`,
      `connect-src 'self' https://*.supabase.co https://${supabaseHost} https://vercel.live https://*.vercel-analytics.com https://*.vercel-insights.com wss://*.supabase.co https://api.stripe.com`,
      `frame-src https://js.stripe.com https://hooks.stripe.com`,
      `frame-ancestors 'none'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Restrict access to browser features we don't use
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), usb=(), display-capture=(), payment=(self)",
          },
          // Prevent cross-origin window takeovers while allowing OAuth popups
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
