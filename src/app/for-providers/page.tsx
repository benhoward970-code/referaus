import type { Metadata } from "next";
import ForProvidersClient from "./ForProvidersClient";

export const metadata: Metadata = {
  title: "For NDIS Providers | List Your Business on ReferAus",
  description: "Grow your NDIS business on ReferAus. Get discovered by participants searching for support in Newcastle and the Hunter Region. Verified badge, analytics, direct enquiries.",
  openGraph: {
    title: "For NDIS Providers | ReferAus",
    description: "List your NDIS business on Australia's growing provider directory. Reach participants actively searching for support in your area.",
    url: "https://referaus.com/for-providers",
  },
  alternates: { canonical: "https://referaus.com/for-providers" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "For NDIS Providers",
  description: "Grow your NDIS business on ReferAus. Get discovered by participants searching for support in Newcastle and the Hunter Region.",
  url: "https://referaus.com/for-providers",
};

export default function ForProvidersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ForProvidersClient />
    </>
  );
}
