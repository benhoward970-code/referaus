import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your ReferAus account to manage your provider profile or saved searches.",
  openGraph: {
    title: "Log In | ReferAus — NDIS Provider Directory",
    description: "Log in to your ReferAus account to manage your provider profile or saved searches.",
    url: "https://referaus.com/login",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Log In | ReferAus — NDIS Provider Directory",
    description: "Log in to your ReferAus account to manage your provider profile or saved searches.",
  },
  alternates: { canonical: "https://referaus.com/login" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
