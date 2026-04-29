# ReferAus — Master Plan

## Status: 🟢 LIVE (frontend only)
**URL:** https://referaus.vercel.app (→ referaus.com once DNS updated)

---

## 🔒 Security & Organisation

| Item | Status | Notes |
|------|--------|-------|
| Gateway | ✅ Secure | Loopback only (127.0.0.1), auth token set |
| Channels | ✅ Telegram only | No unnecessary exposure |
| Model security | ⚠️ Warning | Haiku model referenced in config — low risk, just cosmetic |
| API keys exposed | ✅ None | No Stripe/Supabase keys in code |
| CORS | ✅ N/A | No backend deployed yet |
| Reverse proxy | ⚠️ Warning | Cosmetic — not using reverse proxy |

## 💰 Credit Usage — Current Cron Jobs

| Job | Frequency | Model | Est. Cost/Day |
|-----|-----------|-------|---------------|
| Life Ops Morning | 7am daily | Sonnet | ~$0.15 |
| Life Ops Evening | 9pm daily | Sonnet | ~$0.30 |
| Weekly Cleanup | Sunday 3am | Sonnet | ~$0.02/day |
| Morning Briefing | ❌ One-shot (March 6 only) | Sonnet | $0 going forward |

**Total: ~$0.50/day ($15/month)** — very lean ✅

### Killed/Disabled (previously burning ~$35/day):
- ❌ Builder Loop (was Haiku, every 2h)
- ❌ Reviewer Loop (was Sonnet, every 2h)
- ❌ Strategist Loop
- ❌ 8x Refer NDIS agents (compliance, budget, roster, etc.)
- ❌ Dev Sprint, Queue Manager, BizDev, System Maintenance
- ❌ 4:30pm Build Council
- ❌ Content Creation Agent

## 📧 Email Needed

**YES — you need hello@referaus.com**

Options:
1. **Google Workspace** — $7.20/mo (AUD) — hello@referaus.com, Drive, Calendar
2. **Zoho Mail** — FREE for 1 user — hello@referaus.com
3. **GoDaddy Email** — ~$5/mo (you already have the domain there)
4. **Cloudflare Email Routing** — FREE — forwards hello@referaus.com → your personal email

**Recommendation:** Cloudflare Email Routing (free) for now, upgrade to Google Workspace when you have paying customers.

## 📄 Pages — Status

| Page | Status | Notes |
|------|--------|-------|
| Home | ✅ Live | Hero, stats, features, providers, testimonials, pricing, CTA |
| Browse Providers | ✅ Live | 10 demo providers, search, filters |
| Pricing | ⚠️ Needs update | Mismatch (homepage: $99/$249, page: $49/$149). Need 4 tiers + monthly/yearly toggle |
| About | ⚠️ Sparse | Mission statement only, big empty space. Needs team, values, story |
| Contact | ✅ Live | Form with participant/provider toggle, hello@referaus.com |
| Login | ✅ Live | Email + password |
| Register | ✅ Live | Participant/Provider toggle |
| Provider Detail | ⏳ Not reviewed | Individual provider profile page |
| Blog | ⏳ Not reviewed | |
| Compare | ⏳ Not reviewed | |
| Dashboard | ⏳ Not reviewed | Provider dashboard after login |

## 🔧 What Ben Needs To Do

### Tonight (when home):
1. **Update GoDaddy DNS** → A record: 76.76.21.21, CNAME www: cname.vercel-dns.com
2. **Share Stripe secret key** → so I can pull existing products and set up payments
3. **Review all pages** → tell me what to change page by page
4. **Set up email** → Cloudflare routing or Google Workspace

### This Week:
5. **Decide final pricing** → 4 tiers, monthly + yearly prices
6. **Supabase backend** → I build it once pricing is locked
7. **Provider outreach** → call 10 Hunter Region providers (free listing pitch)

### Before Launch:
8. **Privacy Policy + Terms** → legally required
9. **ABN on invoices** → already in footer ✅
10. **Google Search Console** → submit sitemap for indexing

## 🏗️ Tech Stack

| Layer | Tool | Status |
|-------|------|--------|
| Frontend | Next.js 16 + Tailwind | ✅ Deployed on Vercel |
| Backend | Supabase (planned) | ⏳ Not started |
| Payments | Stripe | ⏳ Need key |
| Email | TBD | ⏳ Need to set up |
| Domain | referaus.com (GoDaddy) | ⚠️ DNS not pointed yet |
| SSL | Vercel auto | ✅ Ready once DNS points |
| CI/CD | Vercel auto-deploy | ✅ Working |

## 📝 Decisions Made
- Logo: Hexagon R + bold REFERAUS (Oswald font)
- Branding: Orange (#f97316) + dark text, light theme
- Free for participants, providers pay
- Hunter Region focus first
- Page-by-page approach (nail frontend → wire backend)

