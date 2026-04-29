"use client";

/* ──────────────────────────────────────────────
   Reusable skeleton loading components
   Theme: light (gray-100 / gray-200 pulse)
────────────────────────────────────────────── */

// Base pulse element
export function GenericSkeleton({
  className = "",
  height = "h-4",
  width = "w-full",
}: {
  className?: string;
  height?: string;
  width?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${height} ${width} ${className}`}
    />
  );
}

// Matches ProviderCard layout
export function ProviderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
      {/* Header: avatar + name/category */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      {/* Rating row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-10" />
      </div>
      {/* Description lines */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
      {/* Service tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-24" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </div>
      {/* CTA button */}
      <div className="h-10 bg-gray-200 rounded-xl w-full" />
    </div>
  );
}

// Grid of provider card skeletons
export function ProviderGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProviderCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Profile page skeleton (for /providers/[slug])
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 animate-pulse">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex gap-2 mb-6">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-100 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-100 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-7 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 bg-gray-100 rounded-full w-20" />
                <div className="h-6 bg-gray-100 rounded-full w-24" />
              </div>
            </div>
          </div>
        </div>
        {/* Two-column content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-4/6" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/4" />
              <div className="flex flex-wrap gap-2">
                {[24, 28, 20, 32, 22].map((w, i) => (
                  <div key={i} className={`h-7 bg-gray-100 rounded-full w-${w}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-orange-100 rounded-xl w-full" />
              <div className="h-10 bg-gray-100 rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple card skeleton (blog, generic cards)
export function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-6 space-y-4 animate-pulse">
      <GenericSkeleton height="h-5" width="w-3/4" />
      <GenericSkeleton height="h-4" width="w-1/2" />
      <GenericSkeleton height="h-20" width="w-full" />
      <div className="flex gap-2">
        <GenericSkeleton height="h-6" width="w-16" className="rounded-full" />
        <GenericSkeleton height="h-6" width="w-20" className="rounded-full" />
      </div>
      <GenericSkeleton height="h-10" width="w-full" />
    </div>
  );
}
