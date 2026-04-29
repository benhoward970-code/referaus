import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about ReferAus — the NDIS provider directory built for Newcastle and the Hunter Region. Our mission, values, and team.",
  openGraph: {
    title: "About Us | ReferAus — NDIS Provider Directory",
    description: "Learn about ReferAus — the NDIS provider directory built for Newcastle and the Hunter Region. Our mission, values, and team.",
    url: "https://referaus.com/about",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | ReferAus — NDIS Provider Directory",
    description: "Learn about ReferAus — the NDIS provider directory built for Newcastle and the Hunter Region. Our mission, values, and team.",
  },
  alternates: { canonical: "https://referaus.com/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
