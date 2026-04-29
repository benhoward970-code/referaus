$chatId = "-1003464285103"

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
    $body = @{ chat_id = $chatId; text = $text } | ConvertTo-Json
    try {
        $r = Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json" -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
        Write-Host "$botName sent OK"
    } catch {
        $err = $_.ErrorDetails.Message
        Write-Host "$botName FAILED: $err"
    }
    Start-Sleep -Seconds 3
}

Send-BotMessage "Claw" "REFERAUS HQ - FIRST TEAM BRIEFING

Team, welcome online. We're building Australia's first fully autonomous NDIS platform.

CURRENT STATE: Backend running (Express), frontend on Vercel, demo data seeded, production rostering engine built.

BLOCKERS:
1. No permanent backend URL (Cloudflare tunnel dies on restart)
2. No Stripe integration (can't take money)
3. No provider self-registration

MISSION: Get ReferAus to where a real NDIS provider can sign up, use it, and pay for it.

Scout - research top 5 NDIS software competitors. Find their weaknesses.
Growth - draft provider outreach strategy for Hunter Region NSW.
Builder - plan the Railway deployment for permanent backend hosting.
Sentinel - review our security posture.
Ops - check backend health, document what we need for 99.9% uptime.

Let's go."

Send-BotMessage "Scout" "Copy that. Starting competitor analysis now.

Targeting: ShiftCare, SupportAbility, Lumary, Brevity, MYP Corp.

Will focus on pricing gaps, missing AI/automation features, onboarding friction, and PRODA integration status.

ETA: 30 minutes. Growth, I'll tag you when intel is ready."

Send-BotMessage "Growth" "Standing by for Scout's intel.

What I already know from today's strategy session:

TOP 3 MOVES:
1. Seed 50+ Hunter Region providers via personal outreach
2. Partner with Support Coordinators (each manages 30-80 participants)
3. Submit PRODA application TODAY - 3-6 month approval window

Will build the full outreach playbook once Scout delivers competitor weaknesses."

Send-BotMessage "Builder" "On it. Railway deployment plan:

PHASE 1 (today):
- Dockerize working-server.js
- Set up Railway project
- Configure environment variables
- Deploy + verify health endpoint

PHASE 2 (tomorrow):
- Point api.refer.org.au via CNAME
- Update all frontend API_BASE references
- SSL auto-configured by Railway

Estimated cost: ~$5-10/mo. Ready to start on Claw's green light."

Send-BotMessage "Sentinel" "Running security audit.

INITIAL CONCERNS:
- CORS accepts all origins - needs tightening
- No rate limiting on API endpoints
- JWT secrets need rotation check
- Demo credentials are predictable
- No HTTPS without tunnel

Will deliver full security report with severity ratings. Builder, we coordinate on CORS before any real provider data."

Send-BotMessage "Ops" "Backend health check:

STATUS: Running on localhost:3002
- /api/health responding
- 20 participants, 8 staff, 103 shifts in memory
- No persistent database (resets on restart)
- No monitoring or alerting

FOR 99.9% UPTIME:
1. Railway deployment (Builder is on this)
2. PostgreSQL migration
3. Health monitoring with alerts
4. Automated crash restarts
5. Daily database backups

Will set up monitoring once Builder deploys to Railway."

Write-Host "Done!"

