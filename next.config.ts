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
    // Item 99: CSP Headers
    // Use report-only mode to avoid breaking Next.js inline scripts
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : "*.supabase.co";

    const csp = [
      `default-src 'self'`,
      // Scripts: Next.js requires 'unsafe-inline' and 'unsafe-eval' for dev; in prod 'unsafe-inline' is still needed for inline event handlers
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-analytics.com https://*.vercel-insights.com https://js.stripe.com https://maps.googleapis.com`,
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
