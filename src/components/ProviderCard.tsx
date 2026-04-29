import Image from "next/image";
import type { Provider } from "@/lib/providers";
import { PrefetchLink } from "@/components/PrefetchOnHover";

function isNewProvider(provider: Provider): boolean {
  // Check created_at if available (DB providers may have it)
  const createdAt = (provider as any).created_at;
  if (!createdAt) return false;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() > thirtyDaysAgo;
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const isNew = isNewProvider(provider);
  const isTopRated = provider.reviewCount >= 5;

  return (
    <PrefetchLink href={`/providers/${provider.slug}`}>
      <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 pt-5 pb-8">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{provider.name}</h3>
              <p className="text-blue-100 text-sm">{provider.category}</p>
              {/* Provider Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {provider.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500 text-white">
                    ✓ Verified
                  </span>
                )}
                {isTopRated && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                    ★ Top Rated
                  </span>
                )}
                {isNew && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-400 text-white">
                    ✦ New
                  </span>
                )}
              </div>
            </div>
            {provider.verified && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Verified
              </span>
            )}
            {provider.registrationReady && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-100 border border-green-400/30 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
                Reg Ready
              </span>
            )}
          </div>
        </div>

        {/* Logo avatar overlapping header/body boundary */}
        <div className="px-5 -mt-5 mb-1">
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-white">
            {provider.logo_url ? (
              <Image
                src={provider.logo_url}
                alt={provider.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAF0lEQVR4nGNkYGD4z8BQDwAAAf8A/ob0qgAAAABJRU5ErkJggg=="
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {provider.name[0]}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-1 pb-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= Math.round(provider.rating) ? "#f97316" : "#e5e7eb"}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{provider.rating}</span>
            <span className="text-xs text-gray-400">({provider.reviewCount} reviews)</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {provider.services.slice(0, 3).map((s) => (
              <span key={s} className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">{s}</span>
            ))}
            {provider.services.length > 3 && (
              <span className="text-[11px] px-2 py-1 text-gray-400">+{provider.services.length - 3}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span className="text-sm text-gray-500">{provider.location}</span>
          </div>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-xs text-gray-400">🌐 {((provider as any).languages as string[] | undefined)?.join(", ") || "English"}</span>
          </div>

          <div className="mt-auto">
            {provider.verified ? (
              <div className="text-center">
                <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                  View Profile &amp; Connect &rarr;
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                  View Profile &rarr;
                </span>
                <span
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 font-medium hover:bg-orange-100 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/register";
                  }}
                >
                  Claim listing
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrefetchLink>
  );
}
