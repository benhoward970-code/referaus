# HEARTBEAT.md

## Self-Improvement Loop (EVERY heartbeat)

On every heartbeat, do ALL of the following. Don't skip steps. Don't just reply HEARTBEAT_OK unless you've actually checked everything.

### 1. Check Systems
- Run `openclaw cron list` — fix any errors immediately
- Check Supabase task_updates (use hb-check.ps1)
- Check agent health: are all 6 Telegram bots responding?

### 2. Review Agent Output
- Read `shared-context/SIGNALS.md` — is Scout producing useful intel?
- Read `strategy/growth-latest.md` — is Growth actionable?
- Read recent git log from ndis-ai-frontend — is Builder shipping?
- Check if Sentinel is catching real issues or rubber-stamping

### 3. Fix What's Broken
- If a cron is erroring, fix it NOW (don't just report it to Ben)
- If an agent's output is low quality, update their SOUL.md with better instructions
- If agents aren't posting to the group, debug and fix the curl commands
- If shared context files are stale, trigger the relevant agent

### 4. Improve the System
- Identify bottlenecks in the agent pipeline
- Update agent prompts based on what's working/not working
- Add missing context to shared-context/ files
- Clean up workspace clutter
- Update MEMORY.md with lessons learned

### 5. Take Initiative
- If there's an obvious next step for ReferAus, DO IT or delegate it to an agent
- Don't wait for Ben to ask — anticipate what's needed
- If something needs Ben's input, message him with a specific question (not a status update)

## Rules
- NEVER just reply HEARTBEAT_OK without checking everything above
- Fix problems yourself. Don't report them to Ben unless you need his credentials/access.
- If you identify an improvement, implement it immediately
- Update this file if you find better ways to self-improve
