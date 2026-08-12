# AI-Powered ESP32 Honeypot + SOC Dashboard — Implementation Plan

## Overview

A full-stack cybersecurity honeypot system:
- **ESP32 firmware** runs fake services (Telnet port 23, HTTP port 80, SSH banner port 22) to lure and capture attacker interactions
- **FastAPI backend** ingests captures, triggers Claude AI threat analysis, stores results in SQLite, and pushes live events via WebSocket
- **React SOC dashboard** displays live attack feed, severity charts, attacker rankings, timeline, and detailed AI analyst panels

---

## Project Structure

All files will be written to `c:\Users\subas\Desktop\AI HONEY\`

```
AI HONEY/
├── firmware/
│   └── honeypot.ino
├── backend/
│   ├── main.py
│   ├── ai_analyzer.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   └── .env.example
├── dashboard/                  (React app, Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── LiveFeed.jsx
│   │       ├── SeverityChart.jsx
│   │       ├── AttackerTable.jsx
│   │       ├── TimelineChart.jsx
│   │       └── AnalystPanel.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Component 1: ESP32 Firmware (`honeypot.ino`)

### Features
- Connect to WiFi via credentials stored in `secrets.h` (not hardcoded in main file)
- Three `WiFiServer` instances: port 23 (Telnet), port 80 (HTTP), port 22 (SSH banner)
- `WiFiClient` polling in `loop()` using non-blocking pattern to handle multiple clients
- For each connection: capture client IP, port, and raw received bytes (up to 512 bytes to limit RAM)
- Serialize to JSON and POST to `http://<BACKEND_URL>/log` using `HTTPClient`
- Serial debug output at 115200 baud
- Memory guard: use `char[]` buffers instead of `String` concatenations; cap payload at 512 chars

### Fake service behaviors
| Port | Behavior |
|------|----------|
| 23   | Sends `"\r\nLogin: "` banner, captures username/password attempt, responds with `"Access denied\r\n"` |
| 80   | Sends a fake router admin HTML login page, captures full HTTP request headers |
| 22   | Sends SSH-2.0 banner string, captures any handshake bytes |

---

## Component 2: FastAPI Backend

### Files

#### `models.py`
- Pydantic models: `LogEntry` (incoming from ESP32), `AttackLog` (stored record)
- SQLAlchemy ORM model `AttackRecord` with all schema fields

#### `database.py`
- SQLite engine + session factory using SQLAlchemy
- `get_db()` dependency
- `init_db()` to create tables on startup
- **Security**: parameterized queries only (SQLAlchemy ORM — no raw string SQL)

#### `ai_analyzer.py`
- `analyze_attack(service, ip, payload) -> dict`
- Uses `anthropic` SDK, model `claude-sonnet-4-6`
- System prompt: SOC threat analysis engine role
- Returns structured JSON: `attack_type`, `severity`, `cvss_score`, `confidence`, `summary`, `recommended_action`, `indicators[]`
- Graceful fallback on JSON parse failure or API errors
- Input sanitization: truncate payload to 2000 chars before sending to Claude

#### `main.py`
- FastAPI app with lifespan for DB init
- `POST /log` — validates input, calls AI analyzer, stores result, broadcasts via WebSocket
- `GET /logs` — returns all logs newest-first, paginated (limit/offset query params)
- `GET /stats` — aggregates: total, severity counts, top 10 attacker IPs
- `WebSocket /ws/live` — connection manager broadcasts new events to all connected clients
- **Security**:
  - Rate limiting on `/log` endpoint (slowapi, max 60 req/min per IP)
  - Input validation: `ip` validated as valid IP string, `service` validated against allowlist, `payload` truncated to 4096 chars
  - CORS restricted to dashboard origin (configurable via env var)
  - Security headers middleware (X-Content-Type-Options, X-Frame-Options)
  - API key authentication on `/log` (shared secret between ESP32 and backend, set in env)
  - No raw SQL — all queries via SQLAlchemy ORM

### API Key Auth
The ESP32 POSTs with header `X-Honeypot-Key: <secret>`. Backend validates against `HONEYPOT_API_KEY` env var.

### Environment Variables
```
ANTHROPIC_API_KEY=
HONEYPOT_API_KEY=
CORS_ORIGINS=http://localhost:5173,https://your-dashboard.vercel.app
DATABASE_URL=sqlite:///./honeypot.db
```

---

## Component 3: React SOC Dashboard (Vite)

### Design
- Dark cybersecurity aesthetic: deep navy/dark background, cyan/green accent colors
- Font: `JetBrains Mono` for data, `Inter` for UI
- Severity color coding: `low=green (#22c55e)`, `medium=yellow (#eab308)`, `high=orange (#f97316)`, `critical=red (#ef4444)`
- Glassmorphism cards, subtle glow effects, animated live feed rows

### Components

| Component | Description |
|-----------|-------------|
| `LiveFeed.jsx` | WebSocket-connected table, newest events at top, animated row insertion, severity badges |
| `SeverityChart.jsx` | Recharts `PieChart` with custom legend showing severity distribution |
| `AttackerTable.jsx` | Top attacker IPs ranked by attempt count, with bar indicator |
| `TimelineChart.jsx` | Recharts `LineChart` showing attacks per hour over last 24h |
| `AnalystPanel.jsx` | Expandable accordion per log row: full AI summary, indicators, recommended action, CVSS score, confidence bar |
| `App.jsx` | Layout: sidebar nav + main content area, WebSocket context provider |

### Security (Frontend)
- React JSX auto-escaping for all user data (no `dangerouslySetInnerHTML`)
- No auth tokens in localStorage
- API base URL from `VITE_API_URL` env var
- CSP meta tag restricting sources

---

## Security Verification Plan

- [ ] No hardcoded secrets — API keys in `.env` only
- [ ] All DB queries use SQLAlchemy ORM (no string concatenation SQL)
- [ ] Backend validates `ip` field as actual IP format before storing
- [ ] `service` field validated against allowlist (`["telnet","http","ssh"]`)
- [ ] Payload truncated server-side to prevent oversized inputs
- [ ] Rate limiting on `/log` to prevent flooding
- [ ] CORS restricted to known dashboard origins
- [ ] React renders all attacker data as text (XSS safe)
- [ ] API key required for ESP32 → backend communication
- [ ] Security headers set on all responses

---

## Deliverables Checklist

- [ ] `firmware/honeypot.ino`
- [ ] `backend/main.py`
- [ ] `backend/ai_analyzer.py`
- [ ] `backend/database.py`
- [ ] `backend/models.py`
- [ ] `backend/requirements.txt`
- [ ] `backend/.env.example`
- [ ] `dashboard/` (Vite React app with all components)
- [ ] `README.md`

---

## Open Questions

> [!IMPORTANT]
> **Dashboard hosting**: The plan uses Vite React (not Next.js). This gives a simpler SPA suitable for Vercel. Confirm if you prefer Next.js instead.

> [!IMPORTANT]
> **ESP32 API key**: The firmware will include a `secrets.h` file with WiFi credentials and the honeypot API key. This file should be added to `.gitignore`. Is this acceptable?

> [!NOTE]
> **Rate limiting**: Using `slowapi` for FastAPI rate limiting. If you're deploying behind a reverse proxy (Render/Railway), ensure `X-Forwarded-For` is trusted.

> [!NOTE]
> **Claude model**: Using `claude-sonnet-4-6` as specified. The backend will fail loudly at startup if `ANTHROPIC_API_KEY` is missing.
