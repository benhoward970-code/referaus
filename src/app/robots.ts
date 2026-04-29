import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/providers",
          "/pricing",
          "/about",
          "/services",
          "/faq",
          "/blog",
          "/contact",
          "/for-participants",
          "/for-providers",
          "/for-coordinators",
          "/resources",
          "/compare",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/admin",
          "/dashboard",
          "/api/",
          "/onboarding",
          "/verify",
          "/reset-password",
          "/forgot-password",
          "/register",
          "/login",
        ],
      },
    ],
    sitemap: "https://referaus.com/sitemap.xml",
    host: "https://referaus.com",
  };
}
