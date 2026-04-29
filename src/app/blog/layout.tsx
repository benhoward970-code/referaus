import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "NDIS news, guides, and resources for participants and providers in Newcastle and the Hunter Region.",
  openGraph: {
    title: "Blog | ReferAus — NDIS Provider Directory",
    description: "NDIS news, guides, and resources for participants and providers in Newcastle and the Hunter Region.",
    url: "https://referaus.com/blog",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | ReferAus — NDIS Provider Directory",
    description: "NDIS news, guides, and resources for participants and providers in Newcastle and the Hunter Region.",
  },
  alternates: { canonical: "https://referaus.com/blog" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
