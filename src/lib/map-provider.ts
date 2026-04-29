import type { Provider } from "./providers";

/**
 * Maps a Supabase DB row to the Provider interface.
 * Handles both the new schema columns and legacy column names.
 */
export function mapDbProvider(row: Record<string, unknown>): Provider {
  // Handle services: prefer 'services' column, fall back to 'categories'
  const services = (row.services as string[])?.length
    ? (row.services as string[])
    : (row.categories as string[]) ?? [];

  // Handle plan: prefer 'plan' column, fall back to 'tier' mapping
  let plan = (row.plan as string) || "free";
  if (!row.plan && row.tier) {
    const tierMap: Record<string, string> = {
      free: "free",
      starter: "starter",
      basic: "starter",
      professional: "pro",
      pro: "pro",
      premium: "premium",
      enterprise: "premium",
    };
    plan = tierMap[(row.tier as string).toLowerCase()] || "free";
  }

  // Handle gallery: prefer 'gallery_urls', fall back to 'photos'
  const galleryUrls = (row.gallery_urls as string[])?.length
    ? (row.gallery_urls as string[])
    : (row.photos as string[]) ?? [];

  // Handle location: prefer 'location', fall back to 'suburb'
  const location = (row.location as string) || (row.suburb as string) || "";

  // Handle description: prefer 'description', fall back to 'short_description'
  const description =
    (row.description as string) || (row.short_description as string) || "";

  // Handle slug: generate from name if missing
  const slug =
    (row.slug as string) ||
    ((row.name as string) || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return {
    slug,
    name: (row.name as string) || "",
    category: (row.category as string) || (services[0] as string) || "Daily Living",
    description,
    location,
    suburb: (row.suburb as string) || location,
    postcode: (row.postcode as string) || "",
    rating: Number(row.rating) || 0,
    reviewCount:
      (row.review_count as number) ?? (row.reviewCount as number) ?? 0,
    verified: (row.verified as boolean) ?? false,
    registrationReady:
      (row.registration_ready as boolean) ??
      (row.registrationReady as boolean) ??
      false,
    services,
    phone: (row.phone as string) || "",
    email: (row.email as string) || "",
    image: (row.image as string) || (row.logo_url as string) || "",
    plan: plan as Provider["plan"],
    bio: (row.bio as string) || undefined,
    brand_color: (row.brand_color as string) || undefined,
    logo_url: (row.logo_url as string) || undefined,
    cover_image_url: (row.cover_image_url as string) || undefined,
    gallery_urls: galleryUrls.length ? galleryUrls : undefined,
    website: (row.website as string) || undefined,
    state: (row.state as string) || "NSW",
  };
}
