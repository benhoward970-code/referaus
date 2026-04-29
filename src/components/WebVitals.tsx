"use client";

// @ts-ignore - internal Next.js export for web vitals
import { useReportWebVitals } from "next/dist/client/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric: { name: string; value: number; rating: string }) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[WebVitals] ${metric.name}:`, metric.value.toFixed(2), metric.rating);
    } else {
      // Production: log to console (replace with real analytics endpoint as needed)
      console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    }
  });

  return null;
}
