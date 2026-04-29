import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | ReferAus",
  description: "Find answers to common questions about ReferAus, the NDIS provider directory for Newcastle and the Hunter Region. Free for participants, affordable for providers.",
  openGraph: {
    title: "Frequently Asked Questions | ReferAus",
    description: "Everything you need to know about ReferAus and the NDIS.",
    url: "https://referaus.com/faq",
    siteName: "ReferAus",
    type: "website",
  },
  alternates: { canonical: "https://referaus.com/faq" },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
