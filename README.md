# CYBER-EYE — AI-Powered Honeypot SOC Platform

ESP32 hardware honeypot → FastAPI + Gemini AI → Telegram alerts → React SOC dashboard.

```
ESP32 (decoy services) ──POST /api/event──▶ FastAPI Backend
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                              Gemini 2.5       SQLite DB      WebSocket
                              Classification                      │
                                    │                           ▼
                                    ▼                    React Dashboard
                              Telegram (high/critical)
```

## Components

| Component | Path | Description |
|-----------|------|-------------|
| ESP32 Firmware | `firmware/` | Modular Arduino C++ honeypot (HTTP, Telnet, SSH, FTP) |
| Backend API | `backend/` | FastAPI + Gemini AI threat pipeline |
| SOC Dashboard | `dashboard/` | React + Tailwind CYBER-EYE UI |

---

## Quick Start

### 1. Run both frontend + backend together

From the project root:

```bash
npm install
npm run dev
```

This starts the backend on `http://localhost:8000` and the dashboard on `http://localhost:5173`.

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys (see below)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

### 3. Dashboard

```bash
cd dashboard
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open http://localhost:5173

### 3. ESP32 Firmware

**Requirements:** Arduino IDE 2.x, ESP32 board support, libraries:
- WiFi (built-in)
- WebServer (built-in)
- Preferences (built-in)
- ArduinoJson (v6+)
- ArduinoOTA (built-in)

**Flash:**
1. Open `firmware/honeypot.ino` in Arduino IDE
2. Select board: **ESP32 Dev Module**
3. Upload

**First-time setup:** If WiFi is not configured, the device starts AP mode:
- SSID: `HoneyBot_Setup`
- Connect and browse to `http://192.168.4.1`
- Enter WiFi credentials, backend URL (e.g. `http://192.168.1.50:8000`), and API key

---

## Environment Variables

Copy `.env.example` to `backend/.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GEMINI_MODEL` | No | Gemini model name (default: `gemini-1.5-pro`) |
| `HONEYPOT_API_KEY` | Yes | Shared secret for ESP32 auth |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token for alerts |
| `TELEGRAM_CHAT_ID` | No | Telegram chat/group ID |
| `DATABASE_URL` | No | Default: SQLite `cyber_eye.db` |

---

## Gemini API Key Setup

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key into `backend/.env`:
   ```
   GEMINI_API_KEY=AIza...
   GEMINI_MODEL=gemini-2.5-flash
   ```

The backend uses Gemini 2.5 Flash for:
- **Threat classification** — attack type, severity, CVSS, indicators
- **Defensive advisor** — firewall rules, intent analysis, hardening tips

---

## Telegram Bot Setup

Alerts are sent **only for high and critical** severity events.

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow prompts to create a bot
3. Copy the **bot token** → `TELEGRAM_BOT_TOKEN` in `.env`
4. Get your chat ID:
   - Message your new bot
   - Visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Find `"chat":{"id":123456789}` → `TELEGRAM_CHAT_ID`
5. Restart the backend

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/device/register` | API key | Register ESP32 device |
| POST | `/device/heartbeat` | API key | Device health (30s interval) |
| POST | `/api/event` | API key | Submit attack capture → AI pipeline |
| GET | `/logs` | — | Paginated attack logs |
| GET | `/stats` | — | Aggregated SOC metrics |
| GET | `/chat/{ip}` | — | Defensive advisor for attacker IP |
| POST | `/chat/{ip}` | — | Interactive analyst chat |
| WS | `/ws/live` | — | Real-time event stream |

**ESP32 auth header:**
```
Authorization: Bearer <HONEYPOT_API_KEY>
```

---

## End-to-End Demo Flow

1. Start backend + dashboard
2. Flash ESP32 and configure via setup portal
3. From another machine on the network, probe the honeypot:
   ```bash
   curl http://<ESP32_IP>/
   telnet <ESP32_IP> 23
   nc <ESP32_IP> 22
   ```
4. Backend receives event → Gemini classifies threat
5. High/critical events trigger Telegram alert
6. Dashboard updates live via WebSocket
7. Click attacker IP → AI Analyst panel shows defensive guidance

---

## Security Notes

- Honeypot payloads are **attacker-controlled** — sanitized before storage/display
- Decoy services are **capture-only** — no real authentication
- Rate limiting on `/api/event` (120/min)
- API key required on all device-facing endpoints
- Never commit `.env` files with real keys

---

## Project Structure

```
AI HONEY/
├── firmware/
│   ├── honeypot.ino          # Main entry (setup/loop)
│   ├── config.h / config.cpp # Constants + runtime config
│   ├── wifi.cpp              # WiFi connect/reconnect
│   ├── config_portal.cpp     # AP setup portal
│   ├── api.cpp               # Backend HTTP client + queue
│   ├── storage.cpp           # Preferences + event queue
│   ├── http_server.cpp       # Port 80 decoy
│   ├── telnet_server.cpp     # Port 23 decoy
│   ├── ssh_server.cpp        # Port 22 decoy
│   ├── ftp_server.cpp        # Port 21 decoy
│   └── logger.cpp            # Serial logging
├── backend/
│   ├── main.py               # FastAPI app
│   ├── ai_analyzer.py        # Gemini threat classification
│   ├── defensive_chat.py     # IP-specific defensive advisor
│   ├── telegram_alert.py     # Telegram integration
│   ├── geolocation.py        # IP → country lookup
│   ├── database.py           # SQLAlchemy setup
│   └── models.py             # ORM + Pydantic schemas
├── dashboard/
│   └── src/                  # React CYBER-EYE SOC UI
├── .env.example
└── README.md
```

---

## Upgrading to PostgreSQL

Set in `backend/.env`:
```
DATABASE_URL=postgresql://user:pass@host:5432/cyber_eye
```

Install driver: `pip install psycopg2-binary`

---

## License

MIT — For educational and authorized security research only. Deploy honeypots only on networks you own or have permission to monitor.
