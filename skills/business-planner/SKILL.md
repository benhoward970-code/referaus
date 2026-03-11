---
name: business-planner
description: Business planning for Australian startups — org charts, hiring plans, SOPs, business models, revenue projections, and launch readiness. Use when: (1) planning business structure or employees, (2) writing SOPs or processes, (3) revenue modelling or projections, (4) preparing for launch, (5) writing a business plan, (6) user mentions employees, hiring, org chart, business model, revenue, launch plan, SOPs, or business structure.
---

# Business Planner

Plan and structure an Australian startup/small business. Focus on Refer (referaus.com) — NDIS marketplace platform.

## Storage

```
business/
├── business-plan.md        # Living business plan
├── org-chart.md            # Current and planned roles
├── hiring-plan.md          # When to hire, who, budget
├── sops/                   # Standard Operating Procedures
│   ├── onboarding.md       # New employee/contractor onboarding
│   ├── customer-support.md # How to handle support requests
│   ├── incident-response.md# Platform incidents
│   └── sales-process.md    # Provider acquisition process
├── revenue-model.md        # Revenue projections and assumptions
├── launch-checklist.md     # Pre-launch checklist
└── competitors.md          # Competitor analysis
```

## Refer Business Context

- **Product**: NDIS provider marketplace (referaus.com)
- **Revenue**: SaaS subscriptions from providers (Free/Pro/Premium tiers)
- **Market**: Australia, starting Hunter Region NSW
- **Regulatory**: NDIS Commission mandatory registration by July 1, 2026
- **Moat**: AI-powered compliance, autonomous agent workforce, first-mover in NDIS digital platforms

## Org Chart Template

### Phase 1: Solo + AI (NOW)
- **Ben** — Founder, CEO
- **Claw (AI)** — CTO, operations, finance, marketing, development
- **AI Agents** — Builder, Strategist, Reviewer, Compliance, etc.

### Phase 2: First Revenue ($5K MRR)
- **Ben** — CEO, Sales
- **Part-time Bookkeeper** — BAS, reconciliation, payroll
- **Contract Developer** — As needed for surge work

### Phase 3: Growth ($20K MRR)
- **Ben** — CEO
- **Operations Manager** — Customer success, provider onboarding
- **Full-stack Developer** — Platform development
- **Sales/BD** — Provider acquisition
- **Bookkeeper** — Part-time continuing

### Phase 4: Scale ($50K+ MRR)
- Add: Compliance Officer, Support Team, Marketing

## Revenue Model Framework

```
Monthly Revenue = Active Providers x Avg Revenue Per Provider

Tiers:
- Free: $0 (basic listing, limited features)
- Pro: $99/mo (messaging, analytics, priority listing)
- Premium: $249/mo (API access, compliance tools, dedicated support)

Targets:
- Month 3: 50 free, 5 pro = $495/mo
- Month 6: 150 free, 20 pro, 3 premium = $2,727/mo
- Month 12: 500 free, 80 pro, 15 premium = $11,655/mo
```

## Launch Checklist

Generate/update `business/launch-checklist.md` covering:
- [ ] ABN registered
- [ ] Business name registered (ASIC)
- [ ] Domain secured (referaus.com)
- [ ] NDIS Commission platform provider registration
- [ ] Privacy policy and terms of service
- [ ] Stripe payment processing live
- [ ] Professional liability insurance
- [ ] Business bank account
- [ ] GST registered (required if revenue >$75K or want to claim GST credits)
- [ ] Platform deployed and tested
- [ ] Initial provider onboarding (10+ providers)
- [ ] Support email/process set up
- [ ] Analytics tracking (GA4, Mixpanel, or similar)

## SOP Template

When writing SOPs, use this structure:
1. **Purpose** — Why this process exists
2. **Trigger** — What kicks off this process
3. **Steps** — Numbered, specific, actionable
4. **Owner** — Who is responsible
5. **Escalation** — What to do if it goes wrong
6. **Review** — When to review/update this SOP

## Rules

- Keep projections conservative — better to exceed than disappoint
- All financial assumptions must be stated explicitly
- Update org chart as business stage changes
- SOPs should be written for someone with zero context
- Web search for current NDIS market data when making projections
