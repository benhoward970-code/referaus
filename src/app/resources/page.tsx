import type { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";

export const metadata: Metadata = {
  title: "NDIS Resources Hub | ReferAus",
  description:
    "Free NDIS resources for participants and providers in Australia. Price guides, complaint forms, glossary of NDIS terms (SIL, SDA, STA, Core, Capacity Building), and official NDIS links.",
  keywords: [
    "NDIS resources",
    "NDIS price guide",
    "NDIS glossary",
    "NDIS complaints",
    "NDIS provider registration",
    "SIL SDA STA NDIS",
    "NDIS participant rights",
    "NDIS forms",
  ],
  openGraph: {
    title: "NDIS Resources Hub | ReferAus",
    description:
      "Essential NDIS resources for participants and providers - guides, forms, glossary, and official links.",
    url: "https://referaus.com/resources",
    type: "website",
  },
};

export default function ResourcesPage() {
  return <ResourcesClient />;
}
