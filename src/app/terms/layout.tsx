import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ReferAus terms of service — the rules and conditions for using the ReferAus platform.",
  openGraph: {
    title: "Terms of Service | ReferAus — NDIS Provider Directory",
    description: "ReferAus terms of service — the rules and conditions for using the ReferAus platform.",
    url: "https://referaus.com/terms",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | ReferAus — NDIS Provider Directory",
    description: "ReferAus terms of service — the rules and conditions for using the ReferAus platform.",
  },
  alternates: { canonical: "https://referaus.com/terms" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
