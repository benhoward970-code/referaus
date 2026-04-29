import type { Metadata } from "next";
import ForParticipantsClient from "./ForParticipantsClient";

export const metadata: Metadata = {
  title: "For NDIS Participants | Find Trusted Providers Near You | ReferAus",
  description: "ReferAus is 100% free for NDIS participants. Search verified providers in the Hunter Region, read real reviews, message directly, and find the right support for your plan.",
  openGraph: {
    title: "For NDIS Participants | ReferAus",
    description: "Find trusted NDIS providers near you. Real reviews, direct messaging, 100% free.",
    url: "https://referaus.com/for-participants",
  },
  alternates: { canonical: "https://referaus.com/for-participants" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "For NDIS Participants",
  description: "ReferAus helps NDIS participants find trusted support providers in their area. Free to use, with real reviews and direct messaging.",
  url: "https://referaus.com/for-participants",
};

export default function ForParticipantsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ForParticipantsClient />
    </>
  );
}
