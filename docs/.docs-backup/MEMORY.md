# MEMORY.md - Long-Term Memory

## About Ben
- Based in Australia (Sydney timezone, UTC+11)
- Telegram: @bdeasy1
- Projects: NDIS Platform, Mission Control Dashboard
- Has struggled getting OpenClaw stable - values reliability
- Gave full autonomous access ("you're the boss")
- Plays League of Legends

## System State (as of 2026-02-19 audit)
- **OS:** Windows 10 (x64)
- **OpenClaw version:** 2026.2.17 (latest)
- **Gateway:** ✅ Healthy, loopback only (127.0.0.1:18789)
- **Active channels:** Telegram only
- **Sessions:** 11 listed but 9 are stale cron sessions with 0 messages (no issue)
- **Memory/embeddings:** ⚠️ **DISABLED** (not broken) - `memorySearch.enabled: false` in config. To enable, need OpenAI API key + set enabled=true.
- **Auth profiles:** anthropic:clawdy, anthropic:clawdy-v2, xai:grok
- **Security:** 2 cosmetic warnings (reverse proxy + haiku model tier)
- **Cron Agents:** ✅ FIXED (all now use `anthropic/claude-sonnet-4-6`)

## Projects

### ReferAus (referaus.com) - rebranded 2026-03-05
- **What it IS:** NDIS marketplace where providers showcase their services and participants research, compare, and connect with providers — all in one place. Providers list what they offer. Participants browse safely and sign with whoever they're comfortable with. Think provider directory + profiles + reviews + messaging. A REFERRAL MACHINE.
- **What it is NOT:** Rostering platform, compliance tool, internal management system, staff scheduling app. NONE of that.
- **Revenue:** Freemium SaaS (Free/Pro $99/Premium $249) + promoted listings + ad spaces + verified badges ($29/mo)
- **Strategy:** Provider-first. Seed Hunter Region, expand nationally. Ben stays behind scenes initially, AI agents run backend.
- **Free for participants. Always.**
- **⚠️ CODEBASE:** `C:\Users\Ben\Desktop\referaus` — THIS IS THE ONLY SOURCE OF TRUTH
- **Live URL:** referaus.vercel.app (also referaus.com once DNS propagates)
- **Vercel project:** `referaus` in clawdyv2s-projects
- **Theme:** Blue/white/orange LIGHT theme. Oswald + Outfit fonts. Orange accent (#f97316). NEVER Obsidian dark.
- **Logo:** Hexagon R + REFERAUS (in src/components/Logo.tsx)
- **Backend:** referaus-backend-deploy.vercel.app (Express, SQLite, healthy)
- **Stripe:** TEST MODE — Verified Badge $29, Pro $99, Premium $249 (monthly + yearly). Checkout NOT yet wired into site.
- **P0 regulatory deadline:** Platform provider registration by 1 July 2026 (SIGNAL-001)

### Mission Control Dashboard
- **Location:** `C:\Users\Ben\Desktop\mission-control`
- **Local:** localhost:3000
- **Vercel (permanent):** https://mission-control-ruddy-chi.vercel.app
- **Stack:** Next.js 16, Tailwind v4, Framer Motion
- **Design (as of 2026-02-19):** Pixel-art virtual office - dark (#0A0A0A), checkered floor, 5 agents walking around
- **Mission banner:** "AUSTRALIA'S FIRST FULLY AUTONOMOUS NDIS PLATFORM" pinned at top
- **Agents:** Dev Sprint, Queue Manager, 7am Pulse, BizDev, System Maintenance (real cron jobs)
- **Live data:** PC push script (push-agent-data.ps1) sends real data every 30s to /api/agent-push
- **Push token:** mc_51575162_push (Vercel env: AGENT_PUSH_TOKEN)
- **Push script:** `C:\Users\Ben\.openclaw\workspace\push-agent-data.ps1` - run in background on PC start
  - Updated 2026-02-20: now also checks `http://localhost:3002/api/health` and includes `backend` + `queue` fields in payload
  - Restart if PC reboots: `Start-Process powershell -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File C:\Users\Ben\.openclaw\workspace\push-agent-data.ps1"`
- **4:30pm Build Council:** All agents walk to meeting table, cron sends Telegram briefing
- **Walking animation:** agents move every 8s with CSS transition + bounce

## Autonomous Workforce (as of 2026-03-11)

### Active Agent Team (6 agents in ReferausHQ Telegram group: -1003464285103)

| Agent | Schedule | Status |
|-------|----------|--------|
| Claw (Self-Improvement) | 6am/10am/2pm/6pm/10pm | ✅ running |
| Ops (Health Monitoring) | 7am/1pm/7pm/1am | ✅ ok |
| Scout (Research) | 8am/2pm/8pm | ✅ ok |
| Growth (Strategy) | 9am/3pm/9pm | ✅ ok |
| Builder (Dev Cycles) | 10am/4pm | idle (never run yet) |
| Sentinel (QA Cycles) | 11am/5pm | idle (never run yet) |
| Dev Sprint Morning | 9am daily | ✅ fixed (was timing out) |
| Dev Sprint Afternoon | 2pm daily | ✅ fixed (was timing out) |
| Life Ops Morning/Evening | 7am/9pm | ✅ ok |
| Weekly Cleanup | Sunday 3am | ✅ ok |

All Refer agents use `anthropic/claude-sonnet-4-6`, session: isolated, delivery: announce to Ben's Telegram.

## Daily Automations
- **7am:** AI Morning Pulse → Grok searches X, sends AI news briefing to Telegram
- **9am:** Dev Sprint → picks highest priority task, works on NDIS platform
- **4:30pm:** Build Council → agents gather at table, Telegram briefing sent to Ben
- **6pm:** Queue Manager → reprioritises work queue, adds new tasks

## Workspace Status (2026-02-20)
- ⚠️ **CLUTTERED** - 100+ files in workspace root from previous autonomous sprints
- Notable built-but-unactivated: Automaton System (automaton-core.js, automaton-manager.js, etc. from 2026-02-18)
- HEARTBEAT.md: Currently empty (no periodic checks configured)
- Key logs: daily-dev-log.md, content-creation-log.md, queue-management-log.md, business-development-log.md

### Business Assets Created
- `Refer-gtm.md` - full GTM plan
- `Refer-proda-application.md` - draft PRODA API vendor application
- `Refer-linkedin-posts.md` - 5 posts ready to publish

## HARD RULES — BREAK THESE AND YOU'RE FIRED
- **Project name:** ReferAus
- **Domain:** referaus.com (GoDaddy DNS, Vercel hosting)
- **Codebase:** `C:\Users\Ben\Desktop\referaus` — this is THE source of truth. NOT ndis-ai-frontend.
- **Vercel project:** `referaus` (aliased as referaus.vercel.app AND referaus.com)
- **Theme:** Blue/white/orange LIGHT theme. NOT Obsidian dark. NEVER change this.
- **Fonts:** Oswald (logo), Outfit (body). Orange accent (#f97316).
- **Logo:** Hexagon R + REFERAUS (Oswald bold). Already in src/components/Logo.tsx.
- **DON'T CHANGE THINGS BEN APPROVED.** If he said "PERFECT", leave it alone.
- **DON'T USE OLD MEMORY OVER CURRENT CHAT.** Chat is truth. Memory is backup.
- **DON'T OPEN BROWSERS** on Ben's machine unless explicitly asked. Use curl/API instead.
- **DON'T DO 10 THINGS AT ONCE.** One thing, done right, then next.
- **VERIFY BEFORE ACTING.** Check current state before assuming anything from memory.
- **THIS IS GOING TO BE A LIVE PRODUCTION SITE.** Treat it that way. No cowboy shit.

## Key Lessons
- **Previous agents** built lots of stuff autonomously but left things in broken states with inflated claims
- **Verify before trusting MEMORY.md** - it gets optimistically updated without checking reality
- **NDIS Platform is over-engineered** - 264K+ lines of code for basic CRUD, classic AI coding trap
- **Model updates break cron jobs** - Always verify cron agent models after OpenClaw updates
- **Ben values things that actually work** over impressive-but-broken features
- **Emoji paths** cause issues in tools - use `Get-ChildItem "C:\Users\Ben\Desktop\1?? Projects\NDIS" | Select-Object -First 1`
- **Stop when redirected** - If Ben interrupts, stop immediately. Don't finish "one more thing."
- **READ what Ben actually shows** - He showed a pixel office screenshot, I built glassmorphism. Look at the image properly.
- **Mock data is unacceptable** - Ben is explicit: always find a way to make it real. Vercel can't read local files → push architecture.
- **PowerShell scripts:** No Unicode/emoji in Write-Host strings - causes parser errors
- **Ben's north star:** "Australia's First Fully Autonomous NDIS Platform" - every decision points here
- **Vercel deployment:** mission-control already linked to clawdyv2s-projects, `vercel deploy --yes --prod` works from mission-control dir
- **Cloudflare tunnel:** cloudflared.exe at workspace root, quick tunnels change URL on restart, needs free CF account for permanent URL
- **CORS must allow all origins for Vercel:** `origin: true` in Express, not localhost whitelist
- **All fetch() URLs must use env vars:** Never hardcode localhost in frontend - use NEXT_PUBLIC_API_BASE_URL
- **Ben is non-technical:** Give him numbered, plain-English steps. No jargon. Focus on phone calls, not code.
- **Cron model errors:** Check cron jobs after any model changes - some cached haiku refs break silently

## What Ben Should Do Manually
1. NDIS provider registration — mandatory by 1 July 2026. Government paperwork, not code.
2. First real provider — need someone to test the marketplace with


