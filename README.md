# ReferAus

**Australia's NDIS Provider Directory** — Search, compare, and connect with trusted NDIS providers in the Hunter Region.

## Live

- **Production:** [referaus.vercel.app](https://referaus.vercel.app)
- **Domain:** [referaus.com](https://referaus.com) (DNS pending)

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Database:** Supabase (Postgres + Auth + RLS)
- **Payments:** Stripe (Checkout + Webhooks)
- **Email:** Resend
- **Hosting:** Vercel

## Pages

| Route | Description |
|-------|-------------|
| / | Homepage — hero search, how-it-works, featured providers, testimonials, pricing |
| /providers | Provider directory — search, filter by service/area, sort by rating |
| /providers/[slug] | Provider profile — reviews, contact form, breadcrumbs |
| /compare | Side-by-side provider comparison (up to 3) |
| /pricing | 4-tier pricing with monthly/yearly toggle |
| /blog | Blog with NDIS articles |
| /blog/[slug] | Individual blog posts with SEO |
| /resources | NDIS resource hub + 25-term glossary |
| /dashboard | Provider dashboard — stats, enquiries, reviews |
| /admin | Admin panel — provider management, stats |
| /onboarding | 4-step provider onboarding wizard |
| /login | Login with Supabase Auth |
| /register | Plan-aware registration |
| /about | Mission, values, team |
| /contact | Contact form + FAQ |
| /privacy | Privacy policy |
| /terms | Terms of service |

## Environment Variables

`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER_MONTHLY=
STRIPE_PRICE_STARTER_YEARLY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=
STRIPE_PRICE_PREMIUM_MONTHLY=
STRIPE_PRICE_PREMIUM_YEARLY=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://referaus.com
`

## Development

`ash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
`

## License

Proprietary. (c) 2026 ReferAus.

