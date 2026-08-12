"""
telegram_bot.py — CYBER-EYE Interactive Telegram Bot.
Provides SOC commands: /start, /help, /status, /info, /attacks, /stats, /top, /block, /live.
Runs as an async polling loop inside the FastAPI lifespan.
"""

import asyncio
import html
import logging
import os
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set

import requests

logger = logging.getLogger("cyber-eye.telegram-bot")

# Live alert subscriber chat IDs
_live_subscribers: Set[int] = set()

# Bot polling state
_last_update_id: int = 0
_bot_start_time: float = time.time()


def _get_bot_token() -> Optional[str]:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    if not token or "YOUR_TELEGRAM" in token:
        return None
    return token


def _send_message(chat_id: int, text: str, parse_mode: str = "HTML") -> bool:
    """Send a message to a Telegram chat."""
    token = _get_bot_token()
    if not token:
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
    }
    try:
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code != 200:
            logger.warning("Telegram send failed (HTTP %d): %s", resp.status_code, resp.text)
            return False
        return True
    except Exception as exc:
        logger.warning("Telegram send exception: %r", exc)
        return False


def _get_updates(offset: int = 0, timeout: int = 10) -> list:
    """Long-poll for new messages from Telegram."""
    token = _get_bot_token()
    if not token:
        return []
    url = f"https://api.telegram.org/bot{token}/getUpdates"
    params = {"offset": offset, "timeout": timeout, "allowed_updates": '["message"]'}
    try:
        resp = requests.get(url, params=params, timeout=timeout + 5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("ok"):
                return data.get("result", [])
    except Exception as exc:
        logger.debug("Telegram getUpdates error: %r", exc)
    return []


# ---------------------------------------------------------------------------
# Command Handlers — each receives (chat_id, message_text, get_data_fn)
# ---------------------------------------------------------------------------

def _cmd_start(chat_id: int, **kwargs) -> None:
    text = (
        "🛡️ <b>CYBER-EYE SOC BOT</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "🔒 AI-Powered Honeypot Security Operations Center\n\n"
        "<pre>"
        "  ██████╗██╗   ██╗██████╗ ███████╗██████╗ \n"
        " ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗\n"
        " ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝\n"
        " ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗\n"
        " ╚██████╗   ██║   ██████╔╝███████╗██║  ██║\n"
        "  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝\n"
        "         ── E Y E ──\n"
        "</pre>\n\n"
        "📡 <b>ESP32 Honeypot Monitor</b>\n"
        "🤖 <b>GOC AI Threat Analysis</b>\n"
        "📊 <b>Real-time SOC Dashboard</b>\n\n"
        "Type /help to see all commands."
    )
    _send_message(chat_id, text)


def _cmd_help(chat_id: int, **kwargs) -> None:
    text = (
        "📋 <b>CYBER-EYE COMMAND CENTER</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "🟢 <b>Monitoring</b>\n"
        "  /status — System &amp; backend status\n"
        "  /info — ESP32 device live check\n"
        "  /attacks — Last 5 captured attacks\n"
        "  /stats — Full SOC statistics\n"
        "  /top — Top 5 attacker IPs\n\n"
        "🔴 <b>Defense</b>\n"
        "  /block &lt;ip&gt; — Generate firewall rule\n"
        "  /live — Toggle live attack alerts\n\n"
        "📡 <b>System</b>\n"
        "  /start — Welcome screen\n"
        "  /help — This command list\n"
    )
    _send_message(chat_id, text)


def _cmd_status(chat_id: int, get_attacks=None, get_devices=None, **kwargs) -> None:
    attacks = get_attacks() if get_attacks else []
    devices = get_devices() if get_devices else []

    uptime_sec = int(time.time() - _bot_start_time)
    hours, remainder = divmod(uptime_sec, 3600)
    minutes, secs = divmod(remainder, 60)
    uptime_str = f"{hours}h {minutes}m {secs}s"

    online_devices = sum(1 for d in devices if d.get("online"))
    total_critical = sum(1 for a in attacks if (a.get("severity") or "").lower() == "critical")
    total_high = sum(1 for a in attacks if (a.get("severity") or "").lower() == "high")

    text = (
        "⚙️ <b>SYSTEM STATUS</b>\n"
        "━━━━━━━━━━━━━━━━━━━━\n\n"
        f"🟢 <b>Backend:</b> Online\n"
        f"⏱️ <b>Uptime:</b> {uptime_str}\n"
        f"📡 <b>Devices:</b> {online_devices}/{len(devices)} online\n"
        f"📊 <b>Total Events:</b> {len(attacks)}\n"
        f"🔴 <b>Critical:</b> {total_critical}\n"
        f"🟠 <b>High:</b> {total_high}\n"
        f"👥 <b>Live Subscribers:</b> {len(_live_subscribers)}\n"
        f"🕐 <b>Timestamp:</b> <code>{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</code>\n"
    )
    _send_message(chat_id, text)


def _cmd_info(chat_id: int, get_devices=None, **kwargs) -> None:
    devices = get_devices() if get_devices else []

    if not devices:
        _send_message(chat_id, "⚠️ No ESP32 devices registered yet.\n\nMake sure your ESP32 is powered on and connected to WiFi.")
        return

    text = "📡 <b>ESP32 DEVICE STATUS</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n"

    for d in devices:
        online = d.get("online", False)
        status_icon = "🟢" if online else "🔴"
        status_text = "ONLINE" if online else "OFFLINE"

        # WiFi signal strength indicator
        rssi = d.get("wifi_rssi")
        if rssi is not None:
            if rssi > -50:
                signal = "████▌ Excellent"
            elif rssi > -60:
                signal = "███▌░ Good"
            elif rssi > -70:
                signal = "██▌░░ Fair"
            else:
                signal = "█▌░░░ Weak"
        else:
            signal = "░░░░░ Unknown"

        # Uptime
        uptime = d.get("uptime_sec", 0)
        up_h, up_rem = divmod(uptime, 3600)
        up_m, up_s = divmod(up_rem, 60)

        # Heap memory
        heap = d.get("free_heap", 0)
        heap_kb = round(heap / 1024, 1) if heap else 0

        # Last seen
        last_seen = d.get("last_seen", "Unknown")

        text += (
            f"{status_icon} <b>{html.escape(d.get('device_id', 'Unknown'))}</b>\n"
            f"   Status: <b>{status_text}</b>\n"
            f"   📍 IP: <code>{html.escape(d.get('ip', 'N/A'))}</code>\n"
            f"   🏷️ Hostname: {html.escape(d.get('hostname', 'N/A'))}\n"
            f"   📶 WiFi: {signal} ({rssi} dBm)\n"
            f"   ⏱️ Uptime: {up_h}h {up_m}m {up_s}s\n"
            f"   💾 Free Heap: {heap_kb} KB\n"
            f"   🕐 Last Seen: <code>{last_seen}</code>\n\n"
        )

    _send_message(chat_id, text)


def _cmd_attacks(chat_id: int, get_attacks=None, **kwargs) -> None:
    attacks = get_attacks() if get_attacks else []

    if not attacks:
        _send_message(chat_id, "📭 No attacks captured yet.\n\nWait for attackers to probe your honeypot, or use /status to check system health.")
        return

    # Get last 5 attacks (most recent first)
    recent = attacks[:5]

    sev_emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}

    text = "⚔️ <b>LAST 5 ATTACKS</b>\n━━━━━━━━━━━━━━━━━━━━\n\n"

    for i, a in enumerate(recent, 1):
        sev = (a.get("severity") or "low").lower()
        emoji = sev_emoji.get(sev, "⚪")
        ip = html.escape(a.get("ip", "N/A"))
        country = html.escape(a.get("country") or "Unknown")
        attack_type = html.escape(a.get("attack_type") or "Unknown")
        service = html.escape(a.get("service") or "N/A")
        ts = a.get("timestamp", "")
        if isinstance(ts, datetime):
            ts = ts.strftime("%H:%M:%S")
        elif isinstance(ts, str) and len(ts) > 19:
            ts = ts[11:19]

        text += (
            f"{emoji} <b>#{i}</b> — {sev.upper()}\n"
            f"   🌐 IP: <code>{ip}</code> ({country})\n"
            f"   ⚡ Type: {attack_type}\n"
            f"   🔌 Service: {service}\n"
            f"   🕐 Time: {ts}\n\n"
        )

    _send_message(chat_id, text)


def _cmd_stats(chat_id: int, get_attacks=None, **kwargs) -> None:
    attacks = get_attacks() if get_attacks else []

    if not attacks:
        _send_message(chat_id, "📊 No statistics available yet. Waiting for attack data...")
        return

    total = len(attacks)
    unique_ips = len(set(a.get("ip", "") for a in attacks))

    sev_count = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    country_count: Dict[str, int] = {}
    type_count: Dict[str, int] = {}

    for a in attacks:
        sev = (a.get("severity") or "low").lower()
        if sev in sev_count:
            sev_count[sev] += 1

        c = a.get("country") or "Unknown"
        country_count[c] = country_count.get(c, 0) + 1

        t = a.get("attack_type") or "Unknown"
        type_count[t] = type_count.get(t, 0) + 1

    # Top 5 countries
    top_countries = sorted(country_count.items(), key=lambda x: x[1], reverse=True)[:5]
    countries_str = "\n".join(f"   🏳️ {html.escape(c)}: {n}" for c, n in top_countries)

    # Top 3 attack types
    top_types = sorted(type_count.items(), key=lambda x: x[1], reverse=True)[:3]
    types_str = "\n".join(f"   ⚡ {html.escape(t)}: {n}" for t, n in top_types)

    # Severity bar chart
    max_sev = max(sev_count.values()) if any(sev_count.values()) else 1
    bars = ""
    for label, count in [("CRIT", sev_count["critical"]), ("HIGH", sev_count["high"]),
                          ("MED", sev_count["medium"]), ("LOW", sev_count["low"])]:
        bar_len = int((count / max_sev) * 10) if max_sev else 0
        bar = "█" * bar_len + "░" * (10 - bar_len)
        bars += f"   {label}: {bar} {count}\n"

    text = (
        "📊 <b>SOC STATISTICS</b>\n"
        "━━━━━━━━━━━━━━━━━━━━\n\n"
        f"📈 <b>Total Events:</b> {total}\n"
        f"👤 <b>Unique IPs:</b> {unique_ips}\n\n"
        f"<b>Severity Breakdown:</b>\n{bars}\n"
        f"<b>Top Countries:</b>\n{countries_str}\n\n"
        f"<b>Top Attack Types:</b>\n{types_str}\n"
    )
    _send_message(chat_id, text)


def _cmd_top(chat_id: int, get_attacks=None, **kwargs) -> None:
    attacks = get_attacks() if get_attacks else []

    if not attacks:
        _send_message(chat_id, "👤 No attacker data available yet.")
        return

    ip_data: Dict[str, Dict[str, Any]] = {}
    for a in attacks:
        ip = a.get("ip", "N/A")
        if ip not in ip_data:
            ip_data[ip] = {"count": 0, "country": a.get("country") or "Unknown", "last_sev": "low"}
        ip_data[ip]["count"] += 1
        ip_data[ip]["last_sev"] = a.get("severity") or "low"

    top_ips = sorted(ip_data.items(), key=lambda x: x[1]["count"], reverse=True)[:5]

    sev_emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}

    text = "🏆 <b>TOP 5 ATTACKERS</b>\n━━━━━━━━━━━━━━━━━━━━\n\n"

    for i, (ip, data) in enumerate(top_ips, 1):
        emoji = sev_emoji.get(data["last_sev"].lower(), "⚪")
        text += (
            f"{emoji} <b>#{i}</b> <code>{html.escape(ip)}</code>\n"
            f"   🌍 {html.escape(data['country'])} — {data['count']} hits\n\n"
        )

    _send_message(chat_id, text)


def _cmd_block(chat_id: int, args: str = "", **kwargs) -> None:
    ip = args.strip()
    if not ip:
        _send_message(chat_id, "⚠️ Usage: <code>/block &lt;ip_address&gt;</code>\n\nExample: <code>/block 185.220.101.5</code>")
        return

    safe_ip = html.escape(ip)
    text = (
        f"🚫 <b>FIREWALL BLOCK RULES</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"Target: <code>{safe_ip}</code>\n\n"
        f"<b>Linux (iptables):</b>\n"
        f"<code>iptables -A INPUT -s {safe_ip} -j DROP</code>\n\n"
        f"<b>Linux (nftables):</b>\n"
        f"<code>nft add rule inet filter input ip saddr {safe_ip} drop</code>\n\n"
        f"<b>Windows Firewall:</b>\n"
        f"<code>netsh advfirewall firewall add rule name=\"Block {safe_ip}\" dir=in action=block remoteip={safe_ip}</code>\n\n"
        f"<b>UFW:</b>\n"
        f"<code>ufw deny from {safe_ip}</code>\n\n"
        f"⚠️ Apply these rules on your perimeter firewall to block this attacker."
    )
    _send_message(chat_id, text)


def _cmd_live(chat_id: int, **kwargs) -> None:
    if chat_id in _live_subscribers:
        _live_subscribers.discard(chat_id)
        _send_message(chat_id, "🔕 <b>Live alerts DISABLED</b>\n\nYou will no longer receive instant attack notifications.\n\nType /live again to re-enable.")
    else:
        _live_subscribers.add(chat_id)
        _send_message(chat_id, "🔔 <b>Live alerts ENABLED</b>\n\nYou will now receive instant notifications for every new attack captured by the honeypot.\n\n⚡ Real-time mode active!\n\nType /live again to disable.")


# ---------------------------------------------------------------------------
# Live broadcast (called from telegram_alert.py on new attack)
# ---------------------------------------------------------------------------

def broadcast_live_attack(record_dict: dict) -> None:
    """Send live attack notification to all /live subscribers."""
    if not _live_subscribers:
        return

    sev_emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}
    sev = (record_dict.get("severity") or "low").lower()
    emoji = sev_emoji.get(sev, "⚪")

    text = (
        f"{emoji} <b>⚡ LIVE ATTACK</b>\n"
        f"━━━━━━━━━━━━━━━━━━\n\n"
        f"🌐 IP: <code>{html.escape(record_dict.get('ip', 'N/A'))}</code>\n"
        f"🏳️ Country: {html.escape(record_dict.get('country') or 'Unknown')}\n"
        f"⚡ Type: {html.escape(record_dict.get('attack_type') or 'Unknown')}\n"
        f"🔌 Service: {html.escape(record_dict.get('service') or 'N/A')}\n"
        f"🎯 Severity: <b>{sev.upper()}</b>\n"
        f"🕐 Time: {datetime.utcnow().strftime('%H:%M:%S')} UTC\n"
    )

    for sub_id in list(_live_subscribers):
        try:
            _send_message(sub_id, text)
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Command Router
# ---------------------------------------------------------------------------

COMMANDS = {
    "/start": _cmd_start,
    "/help": _cmd_help,
    "/status": _cmd_status,
    "/info": _cmd_info,
    "/attacks": _cmd_attacks,
    "/stats": _cmd_stats,
    "/top": _cmd_top,
    "/block": _cmd_block,
    "/live": _cmd_live,
}


def _handle_message(chat_id: int, text: str, get_attacks=None, get_devices=None) -> None:
    """Route an incoming message to the right command handler."""
    text = text.strip()

    # Extract command and args
    parts = text.split(maxsplit=1)
    cmd = parts[0].lower().split("@")[0]  # Handle /command@botname
    args = parts[1] if len(parts) > 1 else ""

    handler = COMMANDS.get(cmd)
    if handler:
        handler(chat_id=chat_id, args=args, get_attacks=get_attacks, get_devices=get_devices)
    elif text.startswith("/"):
        _send_message(
            chat_id,
            f"❓ Unknown command: <code>{html.escape(cmd)}</code>\n\nType /help for available commands."
        )


# ---------------------------------------------------------------------------
# Async polling loop (runs inside FastAPI lifespan)
# ---------------------------------------------------------------------------

async def start_bot_polling(get_attacks_fn, get_devices_fn) -> None:
    """
    Long-poll Telegram for updates and dispatch commands.
    get_attacks_fn: callable returning list of attack dicts (most recent first)
    get_devices_fn: callable returning list of device dicts
    """
    global _last_update_id

    token = _get_bot_token()
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN not configured — Telegram bot disabled.")
        return

    logger.info("🤖 Telegram bot polling started.")

    # Set bot commands menu in Telegram UI
    try:
        commands = [
            {"command": "start", "description": "🛡️ Welcome & bot info"},
            {"command": "help", "description": "📋 List all commands"},
            {"command": "status", "description": "⚙️ System status"},
            {"command": "info", "description": "📡 ESP32 device live check"},
            {"command": "attacks", "description": "⚔️ Last 5 attacks"},
            {"command": "stats", "description": "📊 SOC statistics"},
            {"command": "top", "description": "🏆 Top attacker IPs"},
            {"command": "block", "description": "🚫 Generate firewall rule"},
            {"command": "live", "description": "🔔 Toggle live alerts"},
        ]
        requests.post(
            f"https://api.telegram.org/bot{token}/setMyCommands",
            json={"commands": commands},
            timeout=10,
        )
        logger.info("Telegram bot commands menu registered.")
    except Exception as exc:
        logger.warning("Failed to set bot commands: %r", exc)

    while True:
        try:
            updates = await asyncio.to_thread(
                _get_updates, offset=_last_update_id + 1, timeout=15
            )

            for update in updates:
                update_id = update.get("update_id", 0)
                if update_id > _last_update_id:
                    _last_update_id = update_id

                message = update.get("message", {})
                chat_id = message.get("chat", {}).get("id")
                text = message.get("text", "")

                if chat_id and text:
                    try:
                        _handle_message(
                            chat_id=chat_id,
                            text=text,
                            get_attacks=get_attacks_fn,
                            get_devices=get_devices_fn,
                        )
                    except Exception as exc:
                        logger.error("Error handling Telegram command: %r", exc)

        except asyncio.CancelledError:
            logger.info("Telegram bot polling stopped.")
            break
        except Exception as exc:
            logger.warning("Telegram polling error: %r — retrying in 5s", exc)
            await asyncio.sleep(5)
