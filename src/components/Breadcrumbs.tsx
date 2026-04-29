"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ──────────────────────────────────────────────
   Breadcrumbs — auto-generates from URL path
   Includes JSON-LD BreadcrumbList schema
────────────────────────────────────────────── */

const LABEL_MAP: Record<string, string> = {
  providers: "Providers",
  blog: "Blog",
  pricing: "Pricing",
  services: "Services",
  faq: "FAQ",
  about: "About",
  contact: "Contact",
  register: "Register",
  login: "Login",
  dashboard: "Dashboard",
  "for-providers": "For Providers",
  "for-participants": "For Participants",
  "for-coordinators": "For Coordinators",
  resources: "Resources",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  "registered-providers": "Registered Providers",
};

function toLabel(segment: string): string {
  if (LABEL_MAP[segment]) return LABEL_MAP[segment];
  // Slug-style: replace hyphens, title-case
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  /** Override the auto-generated crumbs (optional) */
  items?: BreadcrumbItem[];
  /** Extra label for the last segment (e.g. provider name) */
  currentLabel?: string;
  className?: string;
}

export function Breadcrumbs({ items, currentLabel, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate crumbs from URL path
  const crumbs: BreadcrumbItem[] = items ?? (() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, idx) => ({
      label: idx === segments.length - 1 && currentLabel ? currentLabel : toLabel(seg),
      href: "/" + segments.slice(0, idx + 1).join("/"),
    }));
  })();

  const allCrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...crumbs];

  // JSON-LD schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allCrumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `https://referaus.com${c.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className={`text-xs text-gray-400 mb-4 ${className}`}>
        <ol className="flex flex-wrap items-center gap-1">
          {allCrumbs.map((crumb, i) => {
            const isLast = i === allCrumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1">
                {i > 0 && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-gray-300 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
                {isLast ? (
                  <span className="text-gray-600 font-medium truncate max-w-[200px]">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-gray-600 transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
