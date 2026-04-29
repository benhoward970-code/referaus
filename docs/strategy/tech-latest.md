# ReferAus Technical Architecture Strategy
*Generated: Tuesday, March 10th, 2026 — 4:00 PM AEST*
*Updated: Wednesday, March 11th, 2026 — 10:00 PM AEST (Claw self-improvement audit)*

---

## Context

ReferAus is a two-sided NDIS marketplace. The growth strategy is clear: seed Hunter Region providers, acquire participants via Support Coordinators, monetise via Verified Badges + Pro listings, and build a moat with PRODA integration. This document maps out HOW to build the technical foundations that enable that strategy.

Current state: Next.js frontend deployed to Vercel (referaus.com — LIVE ✅), Express backend on Vercel (referaus-backend-deploy.vercel.app — healthy ✅, v2.0.0, SQLite, DB connected). Supabase integration in progress (schema exists). 8 autonomous AI agents running via OpenClaw cron.

**~~The single biggest technical blocker: no permanent, reliable backend URL.~~** ✅ RESOLVED — Backend is permanently deployed on Vercel.

**Current biggest technical blocker: Provider onboarding flow not built yet.** The growth strategy needs 50 SIL providers by April 30. Without `/register/provider` and `/providers` directory pages, there's no self-serve path.

---

## Immediate Priorities (This Week)

### 1. Deploy Backend to Railway — Unblock Everything

The Cloudflare quick tunnel is a daily liability. Every restart breaks the frontend-backend connection. This needs to be fixed before any provider onboarding begins.

**How to do it:**

1. Create `railway.json` in backend root:
```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": { "startCommand": "node working-server.js", "healthcheckPath": "/api/health" }
}
```

2. Add `PORT` env support to working-server.js (already likely there — confirm `process.env.PORT || 3002`)

3. Push backend to its own GitHub repo (separate from frontend)

4. Connect to Railway: `railway login` → `railway init` → `railway up`

5. Set env vars in Railway dashboard:
   - `NODE_ENV=production`
   - `JWT_SECRET=<strong random string>`
   - `CORS_ORIGIN=https://refer.org.au,https://ndis-ai-frontend.vercel.app`

6. Update Vercel frontend env: `NEXT_PUBLIC_API_BASE_URL=https://referaus-backend.up.railway.app`

7. Update landing page waitlist endpoint to point to Railway URL

**Cost:** Railway free tier = $5/mo credit, adequate for MVP traffic. Upgrade to $20/mo once providers start onboarding.

**Timeline:** 2-3 hours of work. Do this first.

---

### 2. Custom Domain: refer.org.au

Once Railway is live, point the domain properly:

- `refer.org.au` → Vercel (main app / landing page)
- `api.refer.org.au` → Railway backend (CNAME to Railway domain)
- SSL: Both platforms handle this automatically

This gives the platform a professional URL before first provider outreach begins.

---

## Core Architecture (Current + Target)

```
[referaus.com]                    [referaus-backend-deploy.vercel.app]
  Vercel (Next.js)            ←→   Vercel (Express) ✅ LIVE
  - Landing page (live)            - working-server.js v2.0.0
  - Provider directory (TODO)      - SQLite (connected)
  - Participant search (TODO)      - JWT auth
  - Messaging UI (TODO)            - Supabase (schema ready, migration TODO)
  - Provider dashboard (TODO)      - Autonomous agent APIs
         ↑
  [OpenClaw Cron Agents — 11 jobs, all healthy]
  - Claw (Self-Improvement)    - Scout (Research)
  - Ops (Health Monitoring)    - Growth (Strategy)
  - Builder (Dev Cycles)       - Sentinel (QA)
  - Dev Sprint (Morning/Afternoon)
  - Life Ops (Morning/Evening)
```

---

## Database: Migrate SQLite → PostgreSQL

**Why this matters:** SQLite is fine for local dev but fails under concurrent writes. Once 30+ providers are onboarded, you'll hit locking issues. Railway provides PostgreSQL natively.

**Approach:**
- Add `pg` package to backend
- Create a `db.js` abstraction layer that switches on `DATABASE_URL` env var:
  - If `DATABASE_URL` set → use pg (production)
  - Else → use SQLite (local dev)
- Run schema migrations on Railway startup
- Migrate existing demo data via seed script

**Timeline:** 4-6 hours. Do this in parallel with Railway deployment.

---

## Provider Onboarding Flow (Build for Growth Sprint)

The growth strategy needs 30 providers in 60 days. The tech needs to support self-serve onboarding without Ben touching it.

**Pages to build/complete:**

### `/register/provider` — Provider Sign-Up
- Business name, ABN, service category (multi-select), suburb/region
- Contact email + phone
- Accept terms
- Creates account → sends verification email → lands on free tier dashboard

### `/dashboard/provider` — Provider Dashboard
- View listing (how participants see it)
- Upgrade CTA (Verified Badge / Pro) — Stripe payment link
- Profile completeness meter (drives engagement)
- "You've been viewed X times this month" metric (motivates upgrade)

### `/providers` — Public Directory
- Search by service type + suburb
- Filters: verified only, distance, rating
- Each card: name, services, suburb, verified badge if applicable
- SEO: each category+suburb combo = unique indexable URL

**Tech requirements:**
- Server-side rendering for directory pages (Next.js SSR/ISR for SEO)
- Structured data markup (schema.org/LocalBusiness) on each provider page
- Sitemap generation for all provider + category pages

---

## Support Coordinator Dashboard (SC Partnership Play)

Growth strategy calls for 5 SC partnerships. Each SC needs a reason to use ReferAus. Build a lightweight SC view:

### `/dashboard/coordinator`
- List of clients (participants) they've referred
- Quick search: "Find a provider for [client]" → pre-filtered results
- Share link generator: sends participant a personalised search URL
- Basic referral tracking: how many clients used a referral link

**Tech:** This is a role-based view of existing data. Add `role: coordinator` to user model. 1-2 days of work.

---

## Messaging System (Required for Pro Tier)

Pro tier includes "unlimited messaging." Build a simple inbox:

**Architecture:**
- `messages` table: sender_id, recipient_id, body, read_at, created_at
- Participant → Provider and Provider → Participant flows
- Real-time: use existing WebSocket (ws://localhost:3002/ws) — just add message events
- Email notification fallback (SendGrid free tier)
- Free tier: 1 message/day limit (enforced in backend middleware)

**Timeline:** 3-4 days including UI.

---

## Stripe Integration — Monetisation Infrastructure

Without payment infrastructure, no revenue. Stripe is the right choice — simple, trusted, Australian-compliant.

**Implementation:**
```
Provider clicks "Get Verified Badge ($29/mo)"
  → Stripe Checkout (hosted page, no PCI scope)
  → Webhook: stripe-webhook endpoint on Railway
  → Update provider.verified_at, provider.plan in DB
  → Badge appears on listing immediately
```

**Required:**
- `stripe` npm package in backend
- `/api/billing/create-checkout` endpoint
- `/api/stripe/webhook` endpoint (signature verified)
- Vercel env: `NEXT_PUBLIC_STRIPE_KEY`
- Railway env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**Pricing in Stripe:**
- Verified Badge: $29/mo recurring
- Pro: $99/mo recurring  
- Premium: $249/mo recurring

**Timeline:** 1-2 days to basic Stripe flow. Worth doing before first provider outreach so monetisation is live when interest converts.

---

## SEO Infrastructure

Growth strategy targets 500 organic visits/month in 6 months. Tech has to enable this.

**Key pages (Next.js SSR/ISR):**

```
/providers                           → "Find NDIS Providers Australia"
/providers/nsw/hunter-region         → "NDIS Providers Hunter Region"
/providers/nsw/newcastle             → "NDIS Providers Newcastle"
/providers/[state]/[suburb]          → Dynamic, SEO-optimised
/services/support-workers            → "NDIS Support Workers"
/services/[category]                 → Dynamic by service type
/providers/[slug]                    → Individual provider page
```

**Technical requirements:**
- `generateStaticParams` + `revalidate: 3600` for ISR
- `<script type="application/ld+json">` with schema.org on every provider page
- `next-sitemap` package — auto-generates sitemap.xml + robots.txt
- Open Graph tags on all pages for social sharing

---

## PRODA API Integration (Moat Building)

Growth strategy says submit now — applications take 3-6 months. While waiting, build the infrastructure.

**Preparation work (do now):**
1. Review PRODA API vendor requirements (refer-proda-application.md exists)
2. Build `/api/proda/*` route namespace in backend (stubbed)
3. Design the UI: participant plan balance widget on search results
4. Ensure data security compliance: PRODA requires specific data handling

**When approved:**
- OAuth2 flow for participant authentication with PRODA
- Plan balance → show on participant dashboard
- Claim submission from invoice generator agent
- This transforms ReferAus from directory to infrastructure

**Security requirement for PRODA:** Must have proper auth, audit logging (already built in production-engine.js), and HTTPS everywhere (already handled via Railway + Vercel).

---

## AI Agent Infrastructure

8 agents are running via OpenClaw cron. As the platform scales, they need better data access.

**Current problem:** Agents are generating insights based on in-memory context, not live DB queries. They should be querying the Railway backend.

**Fix:**
- Add agent API endpoints to backend (auth via internal API key):
  - `GET /api/agents/compliance-summary`
  - `GET /api/agents/budget-alerts`
  - `GET /api/agents/risk-flags`
  - `GET /api/agents/roster-gaps`
- Each agent's cron prompt includes: fetch from `https://api.refer.org.au/api/agents/[endpoint]`
- Agents can then report on REAL data, not fabricated summaries

**New agents to add (align with growth strategy):**
- **Provider Onboarding Agent** (daily 10am): Checks new provider signups, sends welcome sequence, flags incomplete profiles
- **Conversion Nudge Agent** (weekly): Finds free-tier providers with >50 views but no upgrade — triggers email nudge via SendGrid
- **SEO Monitor Agent** (weekly): Checks Google Search Console API for ranking changes, new keyword opportunities

---

## Security Baseline

Before provider data goes live, these non-negotiables:

| Requirement | Status | Action |
|-------------|--------|--------|
| HTTPS everywhere | ✅ Vercel + Railway handle this | Done |
| JWT auth | ✅ Already built | Done |
| CORS locked to known origins | ⚠️ Currently `origin: true` | Lock to refer.org.au + Vercel URLs in prod |
| Rate limiting | ❌ Not implemented | Add `express-rate-limit` — 100 req/min per IP |
| Input validation | ⚠️ Partial | Add `joi` or `zod` validation on all POST endpoints |
| Audit logging | ✅ Built in production-engine.js | Ensure it's active on Railway |
| Secrets in env vars | ✅ Already using Railway/Vercel env | Done |
| SQLi prevention | ✅ Parameterised queries | Verify when migrating to pg |

**Priority:** Rate limiting + CORS lock before first provider onboarding.

---

## Infrastructure Cost Model

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Vercel | Hobby → Pro when needed | $0 → $20 |
| Railway | Starter | $5–20 |
| PostgreSQL (Railway) | Included | $0 |
| Stripe | Per transaction (2.9% + 30c) | Revenue-based |
| SendGrid | Free (100 emails/day) | $0 |
| Cloudflare | Free (DNS + CDN) | $0 |
| **Total MVP** | | **~$25/mo** |

Once revenue starts: upgrade Railway to performance tier (~$50/mo) for reliability guarantees.

---

## Build Priority Order

Based on what unblocks revenue fastest:

```
Week 1:
  ✅ Railway backend deployment (unblocks everything)
  ✅ Custom domain setup (api.refer.org.au)
  ✅ CORS lock + rate limiting (security baseline)

Week 2:
  ✅ Provider registration + dashboard pages
  ✅ Stripe integration (Verified Badge + Pro)
  ✅ SQLite → PostgreSQL migration

Week 3-4:
  ✅ Public provider directory with SSR + SEO
  ✅ Structured data + sitemap
  ✅ Messaging system (Pro tier unlock)

Month 2:
  ✅ Support Coordinator dashboard
  ✅ Agent data endpoints (real DB queries)
  ✅ New growth agents (onboarding, conversion nudge)
  ✅ Submit PRODA application

Month 3:
  ✅ PRODA UI hooks (ready for when approved)
  ✅ Analytics dashboard for providers
  ✅ Email notification system
```

---

## Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Backend hosting | Railway | Dead simple, PostgreSQL included, no DevOps |
| Database | SQLite → PostgreSQL | Scale for concurrent providers |
| Payments | Stripe | Industry standard, AUS GST support |
| Email | SendGrid | Free tier adequate for MVP |
| CDN/DNS | Cloudflare | Free, fast, DDoS protection |
| Auth | JWT (existing) | Already built, no reason to change |
| Frontend | Next.js (existing) | ISR for SEO, already deployed |

---

## What NOT to Build (Yet)

- Mobile app — web responsive is fine for MVP
- Complex permissions system — 3 roles (participant/provider/coordinator) is enough
- Real-time notifications beyond WebSocket — email fallback is sufficient
- Custom analytics dashboard — use Vercel Analytics + Railway metrics for now
- Microservices — monolithic Express is appropriate at this scale

---

## Summary

The platform is more feature-complete than it needs to be for the growth sprint. The bottleneck is infrastructure (no permanent URL) and missing revenue infrastructure (no Stripe). Fix those two things and the 90-day growth plan becomes executable. Everything else is sequenced to support provider onboarding → conversion → SEO compounding → PRODA moat.

**Immediate actions (in order):**
1. Deploy backend to Railway (~3hrs)
2. Point api.refer.org.au → Railway (~30min)
3. Add Stripe Verified Badge checkout (~1 day)
4. Build provider self-serve registration page (~2 days)
5. Lock CORS + add rate limiting (~2hrs)

After those 5 things, ReferAus can start onboarding providers and taking money.

---

*Next tech review: After Railway deployment and first 5 providers onboarded — assess performance and any scaling needs.*
