# NDIS Platform Fix — 2026-02-19

## What Was Broken

### Backend (working-server.js)
- Missing AI Rostering Assistant endpoints — frontend was calling 5 routes that didn't exist:
  - `GET /api/ai-rostering-assistant/dashboard`
  - `GET /api/ai-rostering-assistant/health`
  - `POST /api/ai-rostering-assistant/chat`
  - `GET /api/ai-rostering-assistant/suggestions`
  - `POST /api/ai-rostering-assistant/optimize`
  - `POST /api/ai-rostering-assistant/emergency` (bonus)
- WebSocket incompatibility: frontend uses native `WebSocket` API but backend only had Socket.IO — connection was always failing
- Backend was not running

### Frontend
- `useWebSocket.ts` was connecting to `ws://localhost:3002` (no path) — not a valid Socket.IO or native WS endpoint

## What Was Fixed

### Backend
1. Added all 6 AI Rostering Assistant endpoints to `working-server.js` (before error handler)
2. Endpoints query the real SQLite DB and return sensible data with intent-routing for chat
3. Added native WebSocket server on path `/ws` using the `ws` package (which was already installed as a transitive dep, then explicitly added)
4. Backend started on port 3002 and confirmed healthy

### Frontend
1. Updated `useWebSocket.ts`: `wsUrl` now appends `/ws` to match the new native WS endpoint
2. `.env.local` already had `NEXT_PUBLIC_WS_URL=ws://localhost:3002` (no `/ws`) — correct as-is
3. Created `BudgetPanel.tsx` — shows Core Supports + Capacity Building budget bars with % utilisation, colour-coded (green/amber/red)
4. Added `BudgetPanel` to right panel in `page.tsx` (after `NotificationCenter`)
5. Created `CommandPalette.tsx` — Cmd+K modal with 8 preset commands, keyboard navigation (↑↓ + Enter), category badges, backdrop blur
6. Added `CommandPalette` to `page.tsx` (outside layout div, fixed overlay)
7. Added ⌘K button to `Header.tsx` right action area — dispatches keyboard event to open palette

## Endpoints Now Available

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/participants` | All participants |
| POST | `/api/participants` | Create participant |
| GET | `/api/staff` | All staff |
| GET | `/api/shifts` | All shifts |
| POST | `/api/shifts` | Create shift |
| GET | `/api/reports` | Reports list |
| **GET** | **`/api/ai-rostering-assistant/dashboard`** | **AI dashboard metrics** |
| **GET** | **`/api/ai-rostering-assistant/health`** | **AI system health** |
| **POST** | **`/api/ai-rostering-assistant/chat`** | **AI chat with DB-aware responses** |
| **GET** | **`/api/ai-rostering-assistant/suggestions`** | **Staff suggestions** |
| **POST** | **`/api/ai-rostering-assistant/optimize`** | **Roster optimisation** |
| **POST** | **`/api/ai-rostering-assistant/emergency`** | **Emergency staff finder** |
| **WS** | **`ws://localhost:3002/ws`** | **Native WebSocket** |

## How to Start the Backend

```powershell
$base = (Get-ChildItem "C:\Users\Ben\Desktop\1?? Projects\NDIS" | Select-Object -First 1).FullName
cd "$base\NDIS-PLATFORM-FRESH\backend"
node working-server.js
```

Or to run in background silently:
```powershell
$base = (Get-ChildItem "C:\Users\Ben\Desktop\1?? Projects\NDIS" | Select-Object -First 1).FullName
Start-Process -FilePath "node" -ArgumentList "working-server.js" -WorkingDirectory "$base\NDIS-PLATFORM-FRESH\backend" -WindowStyle Hidden
```

## Frontend Build

```powershell
cd C:\Users\Ben\Desktop\ndis-ai-frontend
npm run build   # ✓ passes clean
npm run dev     # dev server on port 3004
```

## Known Remaining Issues

1. **AI chat is rule-based, not LLM-powered** — responses use keyword matching + DB queries. No actual AI model integrated (Anthropic SDK is in package.json but unused in working-server.js).
2. **No authentication** — all endpoints are open, no JWT middleware in working-server.js.
3. **Restart required on reboot** — backend is not set up as a Windows service / PM2 process. Must be manually started each time.
4. **WebSocket broadcasts** — the native WS server sends a "connected" message but doesn't broadcast real-time shift updates. Socket.IO still handles that if the frontend used it.
5. **Database path is hardcoded** to `__dirname/ndis.db` — fine for local dev.
