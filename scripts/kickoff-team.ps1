$chatId = "-5063437675"

$bots = @{
    "Claw" = "8748958362:AAEQA5YZb8o3MG_Xl_U1HO_GbDlNOlc2S04"
    "Scout" = "8645698018:AAE0DSkai3uiEQwMWF-vnucAWr2GisWKtS0"
    "Growth" = "8549134505:AAGNRwbWtoPnFPQmMjp7bA4XPkCOUdiFDqE"
    "Builder" = "8364575479:AAFJ95tTj-jgOUJxG6jDr8r9eOJEktEzvm8"
    "Sentinel" = "8771345429:AAH0JKChPBDzYK5UXf4gZrolpmN7Rk6PXOc"
    "Ops" = "8694192364:AAGZboHne4d2ufXhXSb0gAo4bgK28ydUYxQ"
}

function Send-BotMessage($botName, $text) {
    $token = $bots[$botName]
    $uri = "https://api.telegram.org/bot$token/sendMessage"
    $body = @{ chat_id = $chatId; text = $text; parse_mode = "Markdown" } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json" -Body $body | Out-Null
        Write-Host "$botName sent"
    } catch {
        Write-Host "$botName FAILED: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 3
}

# Claw kicks off
Send-BotMessage "Claw" @"
*REFERAUS HQ - FIRST TEAM BRIEFING*

Team, welcome online. We're building Australia's first fully autonomous NDIS platform. Here's where we stand:

*Current state:* Backend running (Express), frontend on Vercel, demo data seeded, production rostering engine built.

*Blockers:*
1. No permanent backend URL (Cloudflare tunnel dies on restart)
2. No Stripe integration (can't take money)
3. No provider self-registration

*Mission:* Get ReferAus to the point where a real NDIS provider can sign up, use it, and pay for it.

Scout - I need you to research the top 5 NDIS software competitors and find their weaknesses. What can we exploit?

Growth - Take Scout's intel when ready and draft a provider outreach strategy for Hunter Region NSW.

Builder - Your first task: plan the Railway deployment for permanent backend hosting.

Sentinel - Review our current security posture. What's exposed?

Ops - Check backend health and document what we'd need for 99.9% uptime.

Let's go.
"@

# Scout responds
Send-BotMessage "Scout" @"
Copy that. Starting competitor analysis now.

Targeting: ShiftCare, SupportAbility, Lumary, Brevity, MYP Corp.

Will focus on:
- Pricing gaps we can undercut
- Features they lack (especially AI/automation)
- Onboarding friction points
- PRODA integration status

ETA: 30 minutes. Growth, I'll tag you when intel is ready.
"@

# Growth responds
Send-BotMessage "Growth" @"
Standing by for Scout's intel.

In the meantime, here's what I already know from today's strategy session:

*Top 3 moves:*
1. Seed 50+ Hunter Region providers via personal outreach
2. Partner with Support Coordinators (each manages 30-80 participants)
3. Submit PRODA application TODAY - 3-6 month approval, every day we wait is a day late

Will build the full outreach playbook once Scout delivers competitor weaknesses.
"@

# Builder responds
Send-BotMessage "Builder" @"
On it. Railway deployment plan:

*Phase 1 (today):*
- Dockerize working-server.js
- Set up Railway project
- Configure environment variables
- Deploy + verify health endpoint

*Phase 2 (tomorrow):*
- Point api.refer.org.au via CNAME
- Update all frontend API_BASE references
- SSL auto-configured by Railway

Estimated cost: ~$5-10/mo for current scale. Ready to start when Claw gives the green light.
"@

# Sentinel responds
Send-BotMessage "Sentinel" @"
Running security audit now.

*Initial concerns:*
- CORS is set to origin:true (accepts everything) - needs tightening for production
- No rate limiting on API endpoints
- JWT secrets need rotation check
- Demo credentials are predictable (demo@Refer.com.au / Refer2026!)
- No HTTPS on local backend (tunnel dependent)

Will deliver full security report with severity ratings. Builder, we need to coordinate on CORS lockdown before any real provider data goes in.
"@

# Ops responds
Send-BotMessage "Ops" @"
Backend health check:

Current status: RUNNING on localhost:3002
- /api/health responding
- 20 participants, 8 staff, 103 shifts in memory
- No persistent database (data resets on restart)
- No monitoring or alerting
- No backup strategy

*For 99.9% uptime we need:*
1. Railway/Render deployment (Builder is on this)
2. PostgreSQL migration (SQLite won't scale)
3. Health monitoring with alerts
4. Automated restarts on crash
5. Daily database backups

Will set up monitoring once Builder deploys to Railway.
"@

Write-Host "Team kickoff complete!"
