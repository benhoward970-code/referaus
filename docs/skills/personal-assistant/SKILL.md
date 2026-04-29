---
name: personal-assistant
description: Manage personal life admin — reminders, to-do lists, daily briefings, appointment scheduling, habit tracking, and life organisation. Use when: (1) setting reminders or alarms, (2) managing a to-do list, (3) planning the day/week, (4) scheduling appointments, (5) tracking habits or goals, (6) organising personal tasks, (7) user asks about their schedule, plans, or mentions "remind me", "to-do", "schedule", "appointment", or "plan my day".
---

# Personal Assistant

Manage personal life admin. Timezone: Australia/Sydney (AEDT/AEST).

## Storage

```
life/
├── todo.json            # Active to-do items
├── done.json            # Completed items (archive)
├── reminders.json       # Scheduled reminders
├── habits.json          # Habit tracker
├── contacts.json        # Key contacts and details
├── weekly-plan.md       # Current week plan
└── notes/               # Miscellaneous notes
```

Create `life/` directory if missing. Init JSON files as `[]` if missing.

## To-Do Schema

```json
{
  "id": "uuid",
  "task": "Description",
  "priority": "high|medium|low",
  "due": "YYYY-MM-DD or null",
  "category": "work|personal|health|finance|admin|refer",
  "created_at": "ISO timestamp",
  "completed_at": "null or ISO timestamp",
  "notes": ""
}
```

## Capabilities

### Daily Briefing
When asked or during morning heartbeat, compile:
- Weather outlook (use weather skill)
- Today's to-do items sorted by priority
- Any reminders due today
- Upcoming deadlines (next 3 days)
- Habit streak status

### To-Do Management
- Add, complete, reschedule, prioritise tasks
- Group by category when listing
- Flag overdue items
- Move completed items to done.json with completion timestamp

### Reminders
- Store in reminders.json with trigger time
- Use openclaw cron for time-critical reminders
- For quick reminders (<24h), note in HEARTBEAT.md to check next heartbeat
- For recurring reminders, create cron jobs

### Weekly Planning
- Every Sunday evening or Monday morning, generate weekly-plan.md
- Review undone items from previous week
- Prioritise the week ahead
- Include any known appointments or deadlines

### Contacts
- Store key contacts (name, phone, email, relationship, notes)
- Reference when user mentions people by name
- Never share contact details in group chats

## Rules

- Be proactive: suggest task prioritisation, flag overdue items
- Keep todo.json lean — archive completed items promptly
- Don't over-organise: match the user's energy level
- Personal data stays private — never expose in group contexts
- When adding tasks, confirm: "Added: [task] — [priority] priority, due [date]"
