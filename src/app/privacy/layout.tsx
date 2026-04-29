import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ReferAus privacy policy — how we collect, use, and protect your personal information.",
  openGraph: {
    title: "Privacy Policy | ReferAus — NDIS Provider Directory",
    description: "ReferAus privacy policy — how we collect, use, and protect your personal information.",
    url: "https://referaus.com/privacy",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | ReferAus — NDIS Provider Directory",
    description: "ReferAus privacy policy — how we collect, use, and protect your personal information.",
  },
  alternates: { canonical: "https://referaus.com/privacy" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
