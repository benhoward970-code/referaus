import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find NDIS Providers",
  description: "Browse and search verified NDIS providers in Newcastle and the Hunter Region. Filter by category, location, and rating.",
  openGraph: {
    title: "Find NDIS Providers | ReferAus — NDIS Provider Directory",
    description: "Browse and search verified NDIS providers in Newcastle and the Hunter Region. Filter by category, location, and rating.",
    url: "https://referaus.com/providers",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find NDIS Providers | ReferAus — NDIS Provider Directory",
    description: "Browse and search verified NDIS providers in Newcastle and the Hunter Region. Filter by category, location, and rating.",
  },
  alternates: { canonical: "https://referaus.com/providers" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
