import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { label: "Providers", href: "/providers" },
      { label: "Compare", href: "/compare" },
      { label: "Pricing", href: "/pricing" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Preferences", href: "/cookie-preferences" },
    ],
  },
  {
    heading: "More",
    links: [
      { label: "For Providers", href: "/for-providers" },
      { label: "For Participants", href: "/for-participants" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-10">
          {/* Brand blurb */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-3">
              <Logo size="small" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connecting NDIS participants with trusted providers in Newcastle and the Hunter Region.
            </p>
            <p className="text-sm text-gray-400 mt-1.5 font-medium">Free for participants. Always.</p>
          </div>

          {/* Link columns */}
          {COLUMNS.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{heading}</h4>
              <ul className="flex flex-col gap-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} ReferAus. Built in the Hunter Region.
          </p>
        </div>
      </div>
    </footer>
  );
}

