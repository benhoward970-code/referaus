import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Providers",
  description: "Compare NDIS providers side by side. Services, ratings, location, and more — all in one place.",
  openGraph: {
    title: "Compare Providers | ReferAus — NDIS Provider Directory",
    description: "Compare NDIS providers side by side. Services, ratings, location, and more — all in one place.",
    url: "https://referaus.com/compare",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Providers | ReferAus — NDIS Provider Directory",
    description: "Compare NDIS providers side by side. Services, ratings, location, and more — all in one place.",
  },
  alternates: { canonical: "https://referaus.com/compare" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
