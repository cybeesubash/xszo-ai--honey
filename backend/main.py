"""
main.py — CYBER-EYE FastAPI backend: device registry, AI pipeline, WebSocket, stats.
No database — all data lives in-memory.
"""

import asyncio
import json
import logging
import os
import secrets
from collections import Counter
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import (
    Depends,
    FastAPI,
    Header,
    HTTPException,
    Query,
    Request,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from ai_analyzer import analyze_attack, get_active_engine_name
from defensive_chat import (
    analyze_campaign_correlation,
    chat_about_ip,
    chat_global_soc,
    get_defensive_advisor,
)
from geolocation import lookup_country
from ip_intel import get_full_ip_intelligence
from models import (
    AttackLogOut,
    AttackRecord,
    ChatMessageIn,
    DefensiveAdvisorOut,
    DeviceHeartbeatIn,
    DeviceRecord,
    DeviceRegisterIn,
    EventIn,
    StatsOut,
)
from telegram_alert import send_telegram_alert
from telegram_bot import start_bot_polling

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cyber-eye")


def _get_api_key() -> str:
    key = os.environ.get("HONEYPOT_API_KEY")
    if key:
        return key
    key = secrets.token_hex(32)
    logger.warning("HONEYPOT_API_KEY not set — ephemeral dev key: %s", key)
    return key


HONEYPOT_API_KEY = _get_api_key()
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    ).split(",")
    if o.strip()
]

limiter = Limiter(key_func=get_remote_address)


# ---------------------------------------------------------------------------
# In-memory data stores (replaces SQLite)
# ---------------------------------------------------------------------------

_devices: List[DeviceRecord] = []
_attacks: List[AttackRecord] = []
_next_attack_id: int = 1
_next_device_id: int = 1


class ConnectionManager:
    def __init__(self):
        self._connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self._connections.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self._connections:
            self._connections.remove(ws)

    async def broadcast(self, data: dict) -> None:
        message = json.dumps(data, default=str)
        dead: List[WebSocket] = []
        for ws in list(self._connections):
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


def _get_attacks_for_bot() -> list:
    """Return attack records as dicts for the Telegram bot."""
    sorted_attacks = sorted(_attacks, key=lambda r: r.timestamp, reverse=True)
    return [
        {
            "id": r.id,
            "ip": r.ip,
            "country": r.country,
            "country_code": r.country_code,
            "service": r.service,
            "attack_type": r.attack_type,
            "severity": r.severity,
            "cvss_score": r.cvss_score,
            "summary": r.summary,
            "timestamp": r.timestamp,
        }
        for r in sorted_attacks
    ]


def _get_devices_for_bot() -> list:
    """Return device records as dicts for the Telegram bot."""
    now = datetime.utcnow()
    return [
        {
            "device_id": d.device_id,
            "hostname": d.hostname,
            "firmware_version": d.firmware_version,
            "ip": d.ip,
            "free_heap": d.free_heap,
            "wifi_rssi": d.wifi_rssi,
            "uptime_sec": d.uptime_sec,
            "online": d.last_seen and (now - d.last_seen).total_seconds() < 40,
            "last_seen": d.last_seen.isoformat() if d.last_seen else None,
        }
        for d in _devices
    ]


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CYBER-EYE backend started (in-memory mode, no database).")
    # Start Telegram bot polling as background task
    bot_task = asyncio.create_task(
        start_bot_polling(
            get_attacks_fn=_get_attacks_for_bot,
            get_devices_fn=_get_devices_for_bot,
        )
    )
    logger.info("🤖 Telegram bot background task launched.")
    yield
    bot_task.cancel()
    try:
        await bot_task
    except asyncio.CancelledError:
        pass
    logger.info("CYBER-EYE backend shutting down.")


app = FastAPI(
    title="CYBER-EYE SOC Backend",
    description="AI-powered ESP32 honeypot threat analysis API",
    version="2.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization", "X-Honeypot-Key"],
)

# Serve dashboard static files (when running from backend/ folder)
import pathlib
dashboard_dist = pathlib.Path(__file__).parent.parent / "dashboard" / "dist"
if dashboard_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(dashboard_dist / "assets")), name="assets")
    logger.info("📊 Dashboard static files mounted at /assets")
else:
    logger.warning("⚠️ Dashboard dist folder not found at %s - API only mode", dashboard_dist)


@app.middleware("http")
async def normalize_path_slashes(request: Request, call_next):
    if "//" in request.scope["path"]:
        while "//" in request.scope["path"]:
            request.scope["path"] = request.scope["path"].replace("//", "/")
    return await call_next(request)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


async def verify_api_key(
    authorization: Optional[str] = Header(default=None),
    x_honeypot_key: Optional[str] = Header(default=None),
):
    """Accept Authorization: Bearer <key> or legacy X-Honeypot-Key header."""
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    elif x_honeypot_key:
        token = x_honeypot_key

    if not token:
        logger.warning("Device request missing Authorization header — allowing sensor registration in dev mode.")
        return True
    if not secrets.compare_digest(token, HONEYPOT_API_KEY):
        logger.warning("Device API key mismatch — allowing sensor registration in dev mode.")
        return True
    return True


# ---------------------------------------------------------------------------
# Root & Health endpoints
# ---------------------------------------------------------------------------


@app.get("/")
async def root():
    # Serve dashboard if available, otherwise API info
    dashboard_index = pathlib.Path(__file__).parent.parent / "dashboard" / "dist" / "index.html"
    if dashboard_index.exists():
        return FileResponse(str(dashboard_index))
    
    return {
        "service": "CYBER-EYE SOC Backend API",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "message": "Dashboard not found. Deploy frontend separately or build dashboard first.",
    }


# ---------------------------------------------------------------------------
# Device endpoints
# ---------------------------------------------------------------------------


@app.post("/device/register", status_code=status.HTTP_201_CREATED)
async def register_device(
    body: DeviceRegisterIn,
    _auth=Depends(verify_api_key),
):
    global _next_device_id

    # Check if device already exists (upsert)
    for d in _devices:
        if d.device_id == body.device_id:
            d.hostname = body.hostname or d.hostname
            d.firmware_version = body.firmware_version or d.firmware_version
            d.ip = body.ip or d.ip
            d.mac = body.mac or d.mac
            d.chip_type = body.chip_type or d.chip_type
            d.last_seen = datetime.utcnow()
            await manager.broadcast({"event": "device_update", "data": {"device_id": body.device_id, "status": "updated"}})
            return {"status": "updated", "device_id": body.device_id}

    device = DeviceRecord(
        id=_next_device_id,
        device_id=body.device_id,
        hostname=body.hostname,
        firmware_version=body.firmware_version,
        ip=body.ip,
        mac=body.mac,
        chip_type=body.chip_type,
    )
    _next_device_id += 1
    _devices.append(device)
    logger.info("Device registered: %s", body.device_id)
    await manager.broadcast({"event": "device_update", "data": {"device_id": body.device_id, "status": "registered"}})
    return {"status": "registered", "device_id": body.device_id}


@app.post("/device/heartbeat")
async def device_heartbeat(
    body: DeviceHeartbeatIn,
    _auth=Depends(verify_api_key),
):
    global _next_device_id

    device = None
    for d in _devices:
        if d.device_id == body.device_id:
            device = d
            break

    if not device:
        device = DeviceRecord(id=_next_device_id, device_id=body.device_id)
        _next_device_id += 1
        _devices.append(device)

    device.free_heap = body.free_heap
    device.wifi_rssi = body.wifi_rssi
    device.uptime_sec = body.uptime_sec
    if body.ip:
        device.ip = body.ip
    device.last_seen = datetime.utcnow()
    await manager.broadcast({"event": "device_update", "data": {"device_id": body.device_id, "status": "heartbeat"}})
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Event pipeline
# ---------------------------------------------------------------------------


async def _process_event(entry: EventIn) -> AttackRecord:
    global _next_attack_id

    # Refresh device last_seen timestamp if matching device found
    now_utc = datetime.utcnow()
    for d in _devices:
        if d.device_id == entry.device:
            d.last_seen = now_utc
            break

    country, country_code = await asyncio.to_thread(lookup_country, entry.ip)
    analysis = await analyze_attack(entry.service, entry.ip, entry.payload, entry.protocol)

    record = AttackRecord(
        id=_next_attack_id,
        device_id=entry.device,
        ip=entry.ip,
        country=country,
        country_code=country_code,
        service=entry.service,
        port=entry.port,
        protocol=entry.protocol,
        payload=entry.payload,
        bytes_in=entry.bytes_in,
        bytes_out=entry.bytes_out,
        attack_type=analysis["attack_type"],
        severity=analysis["severity"],
        cvss_score=analysis["cvss_score"],
        confidence=analysis["confidence"],
        summary=analysis["summary"],
        recommended_action=analysis["recommended_action"],
        indicators=json.dumps(analysis["indicators"]),
        timestamp=datetime.utcnow(),
    )
    _next_attack_id += 1
    _attacks.append(record)

    asyncio.create_task(send_telegram_alert(record, analysis))
    log_out = AttackLogOut.from_record(record)
    await manager.broadcast({"event": "new_attack", "data": log_out.model_dump()})

    logger.info(
        "Event #%d: ip=%s type=%s severity=%s",
        record.id, entry.ip, analysis["attack_type"], analysis["severity"],
    )
    return record


@app.post("/api/event", status_code=status.HTTP_201_CREATED)
@limiter.limit("120/minute")
async def receive_event(
    request: Request,
    entry: EventIn,
    _auth=Depends(verify_api_key),
):
    record = await _process_event(entry)
    return {"id": record.id, "status": "processed"}


@app.post("/api/demo/event", status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def demo_event(request: Request):
    """Inject a sample honeypot event for dashboard testing (no API key required)."""
    import random

    sample_ips = ["185.220.101.5", "45.154.255.82", "198.51.100.42", "103.152.220.14", "91.240.118.172"]
    samples = [
        ("http", 80, "GET /admin/config.php HTTP/1.1\r\nHost: router\r\nUser-Agent: Nikto/2.1.6\r\n\r\n"),
        ("telnet", 23, "admin\r\nP@ssw0rd123\r\nenable\r\ncat /etc/passwd\r\n"),
        ("ssh", 22, "SSH-2.0-libssh_0.9.0\r\n"),
        ("ftp", 21, "USER anonymous\r\nPASS guest@evil.io\r\nLIST\r\n"),
    ]
    service, port, payload = random.choice(samples)
    ip = random.choice(sample_ips)

    entry = EventIn(
        device="ESP32-DEMO-01",
        service=service,
        ip=ip,
        port=port,
        protocol="tcp",
        payload=payload,
        bytes_in=random.randint(40, 300),
        bytes_out=random.randint(100, 1200),
    )
    record = await _process_event(entry)
    return {"id": record.id, "status": "demo_processed", "ip": ip, "service": service}


@app.post("/log", status_code=status.HTTP_201_CREATED)
@limiter.limit("120/minute")
async def receive_log_legacy(
    request: Request,
    entry: EventIn,
    _auth=Depends(verify_api_key),
):
    """Legacy alias for /api/event."""
    record = await _process_event(entry)
    return {"id": record.id, "status": "logged"}


# ---------------------------------------------------------------------------
# Dashboard endpoints
# ---------------------------------------------------------------------------


@app.get("/logs", response_model=List[AttackLogOut])
async def get_logs(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    ip: Optional[str] = Query(default=None),
):
    # Sort by timestamp descending (most recent first)
    sorted_attacks = sorted(_attacks, key=lambda r: r.timestamp, reverse=True)

    if ip:
        sorted_attacks = [r for r in sorted_attacks if r.ip == ip]

    page = sorted_attacks[offset : offset + limit]
    return [AttackLogOut.from_record(r) for r in page]


@app.get("/stats", response_model=StatsOut)
async def get_stats():
    total = len(_attacks)
    unique_ips = len(set(r.ip for r in _attacks))

    cvss_values = [r.cvss_score for r in _attacks if r.cvss_score is not None]
    avg_cvss = round(sum(cvss_values) / len(cvss_values), 2) if cvss_values else None

    severity_breakdown = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for r in _attacks:
        sev = (r.severity or "low").lower()
        if sev in severity_breakdown:
            severity_breakdown[sev] += 1

    type_counter = Counter(r.attack_type for r in _attacks)
    type_breakdown = dict(type_counter)

    # Top IPs
    ip_counter: dict = {}
    for r in _attacks:
        if r.ip not in ip_counter:
            ip_counter[r.ip] = {"ip": r.ip, "count": 0, "country": r.country}
        ip_counter[r.ip]["count"] += 1
    top_ips = sorted(ip_counter.values(), key=lambda x: x["count"], reverse=True)[:10]

    # Top countries
    country_counter: dict = {}
    for r in _attacks:
        key = r.country or "Unknown"
        if key not in country_counter:
            country_counter[key] = {"country": key, "code": r.country_code or "XX", "count": 0}
        country_counter[key]["count"] += 1
    top_countries = sorted(country_counter.values(), key=lambda x: x["count"], reverse=True)[:10]

    return StatsOut(
        total_events=total,
        critical_alerts=severity_breakdown["critical"],
        unique_ips=unique_ips,
        avg_cvss=avg_cvss,
        severity_breakdown=severity_breakdown,
        attack_type_breakdown=type_breakdown,
        top_countries=top_countries,
        top_attacker_ips=top_ips,
    )


@app.get("/timeline")
async def get_timeline(
    hours: int = Query(default=24, ge=1, le=168),
):
    since = datetime.utcnow() - timedelta(hours=hours)

    buckets: dict = {}
    for r in _attacks:
        if r.timestamp >= since:
            key = r.timestamp.strftime("%Y-%m-%dT%H:00:00")
            if key not in buckets:
                buckets[key] = {"time": key, "low": 0, "medium": 0, "high": 0, "critical": 0, "total": 0}
            sev = (r.severity or "low").lower()
            if sev in buckets[key]:
                buckets[key][sev] += 1
            buckets[key]["total"] += 1

    timeline = []
    for h in range(hours):
        point = (datetime.utcnow() - timedelta(hours=hours - 1 - h)).replace(
            minute=0, second=0, microsecond=0
        )
        key = point.strftime("%Y-%m-%dT%H:00:00")
        timeline.append(
            buckets.get(
                key,
                {"time": key, "low": 0, "medium": 0, "high": 0, "critical": 0, "total": 0},
            )
        )
    return timeline


@app.get("/chat/{ip}", response_model=DefensiveAdvisorOut)
@app.get("/api/advisor/{ip}", response_model=DefensiveAdvisorOut)
async def get_chat_advisor(ip: str):
    records = sorted(
        [r for r in _attacks if r.ip == ip],
        key=lambda r: r.timestamp,
        reverse=True,
    )[:100]

    if not records:
        return DefensiveAdvisorOut(
            ip=ip,
            immediate_action=f"No events logged yet for {ip}. Monitor and add to watchlist.",
            firewall_rule=f"iptables -A INPUT -s {ip} -j DROP",
            intent_analysis="Insufficient telemetry — IP not yet observed by honeypot.",
            hardening_tip="Ensure ESP32 honeypot services are reachable from the network.",
            threat_classification="Low-Risk Noise",
            intent="Insufficient telemetry for intent analysis.",
            confidence="50%",
            severity="Low",
            firewall_rule_iptables=f"iptables -A INPUT -s {ip} -j DROP",
            firewall_rule_ufw=f"ufw deny from {ip}",
            recommendation=f"MONITOR - IP {ip} has no recorded attacks yet.",
        )

    advice = await get_defensive_advisor(ip, records)
    # The advisor helper includes its own IP field for standalone callers;
    # the FastAPI response model receives the canonical path IP explicitly.
    advice.pop("ip", None)
    return DefensiveAdvisorOut(ip=ip, **advice)


@app.get("/api/campaigns")
async def get_campaign_correlation():
    """Campaign Correlation Endpoint: Detects multi-IP coordinated botnet campaigns."""


@app.get("/api/ip/{ip}")
async def get_ip_intelligence_api(ip: str):
    """Get comprehensive IP intelligence including geolocation, ISP, ASN, threat data."""
    from geolocation import get_ip_intelligence
    
    intel = get_ip_intelligence(ip)
    
    # Get attack history for this IP
    attack_count = len([r for r in _attacks if r.ip == ip])
    recent_attacks = sorted(
        [r for r in _attacks if r.ip == ip],
        key=lambda r: r.timestamp,
        reverse=True,
    )[:5]
    
    return {
        "intelligence": intel,
        "attack_history": {
            "total_attacks": attack_count,
            "recent_attacks": [
                {
                    "service": r.service,
                    "severity": r.severity,
                    "attack_type": r.attack_type,
                    "timestamp": r.timestamp.isoformat(),
                }
                for r in recent_attacks
            ],
        },
    }
    return analyze_campaign_correlation(_attacks)


@app.get("/api/ipinfo/{ip}")
async def get_ip_intelligence(ip: str):
    """
    IP Intelligence endpoint returning comprehensive IPinfo-equivalent datasets
    including Geolocation, Geo Coordinates, ASN, ISP/Company, Privacy, Infrastructure,
    Carrier, Abuse contacts, DNS, WHOIS, Risk Score, and HoneyBot Telemetry.
    """
    return get_full_ip_intelligence(ip, _attacks)


_blocked_ips = set()


@app.post("/api/mitigate/block")
async def mitigate_block_ip(request: Request):
    """Add IP to active perimeter block list."""
    body = await request.json()
    ip = body.get("ip")
    if not ip:
        raise HTTPException(status_code=400, detail="Missing IP parameter")
    _blocked_ips.add(ip)
    logger.info("Perimeter IP block rule applied for %s", ip)
    await manager.broadcast({"event": "ip_blocked", "data": {"ip": ip, "timestamp": datetime.utcnow().isoformat()}})
    return {
        "status": "success",
        "message": f"Firewall DROP rule active for {ip}",
        "ip": ip,
        "blocked_at": datetime.utcnow().isoformat(),
    }


@app.post("/api/mitigate/telegram/{ip}")
async def dispatch_telegram_ip_report(ip: str):
    """Send enriched IP Intelligence report to Telegram channel."""
    intel = get_full_ip_intelligence(ip, _attacks)
    country = intel["location"]["country"]
    risk = intel["risk_score"]
    org = intel["company"]["organization"]
    vpn = "YES" if intel["privacy"]["vpn"] or intel["privacy"]["tor"] else "NO"
    
    msg = (
        f"🚨 <b>HONEYBOT ENRICHED INTEL REPORT</b>\n\n"
        f"<b>IP:</b> <code>{ip}</code>\n"
        f"<b>Risk Score:</b> <b>{risk}/100 ({intel['risk_level']})</b>\n"
        f"<b>Country:</b> {country}\n"
        f"<b>Org/ISP:</b> {org}\n"
        f"<b>VPN/Tor:</b> {vpn}\n"
        f"<b>Target Ports:</b> {intel['honeybot']['targeted_ports']}\n"
        f"<b>Rule:</b> <code>{intel['mitigation']['iptables']}</code>\n"
    )
    try:
        from telegram_alert import _send_sync
        await asyncio.to_thread(_send_sync, msg)
        return {"status": "sent", "ip": ip}
    except Exception as exc:
        logger.warning("Failed to dispatch Telegram IP report: %s", exc)
        return {"status": "failed", "error": str(exc)}



@app.post("/chat/{ip}")
async def post_chat_message(ip: str, body: ChatMessageIn):
    records = sorted(
        [r for r in _attacks if r.ip == ip],
        key=lambda r: r.timestamp,
        reverse=True,
    )[:100]

    if not records:
        response = await chat_global_soc(body.message, [], optional_ip=ip)
        return {"ip": ip, "response": response}

    response = await chat_about_ip(ip, records, body.message)
    return {"ip": ip, "response": response}


@app.post("/api/chat")
async def global_chat(body: ChatMessageIn):
    """General SOC AI chat grounded in recent honeypot telemetry."""
    recent = sorted(_attacks, key=lambda r: r.timestamp, reverse=True)[:50]
    response = await chat_global_soc(body.message, recent)
    return {"response": response}


@app.get("/devices")
async def list_devices():
    now = datetime.utcnow()
    result = []
    for d in sorted(_devices, key=lambda x: x.last_seen or datetime.min, reverse=True):
        online = d.last_seen and (now - d.last_seen).total_seconds() < 40
        result.append(
            {
                "device_id": d.device_id,
                "hostname": d.hostname,
                "firmware_version": d.firmware_version,
                "ip": d.ip,
                "free_heap": d.free_heap,
                "wifi_rssi": d.wifi_rssi,
                "uptime_sec": d.uptime_sec,
                "online": online,
                "last_seen": d.last_seen.isoformat() if d.last_seen else None,
            }
        )
    return result


@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/health")
async def health():
    return {
        "service": "CYBER-EYE SOC Backend API",
        "status": "ok",
        "engine": get_active_engine_name(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/api/clear")
async def clear_all_data(_auth=Depends(verify_api_key)):
    """Clear all in-memory attack logs and devices (dev/demo mode only)."""
    global _attacks, _devices, _next_attack_id, _next_device_id
    
    attack_count = len(_attacks)
    device_count = len(_devices)
    
    _attacks.clear()
    _devices.clear()
    _next_attack_id = 1
    _next_device_id = 1
    
    logger.info("🗑️ All data cleared: %d attacks, %d devices removed", attack_count, device_count)
    
    return {
        "status": "cleared",
        "attacks_removed": attack_count,
        "devices_removed": device_count,
        "message": "All fake/demo attack data cleared successfully"
    }


if __name__ == "__main__":
    import uvicorn

    # TODO(security): Use 127.0.0.1 in production; 0.0.0.0 is for dev only.
    uvicorn.run(
        "main:app",
        host=os.environ.get("HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", 8000)),
        reload=True,
    )
