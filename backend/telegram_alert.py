"""
telegram_alert.py — Send high/critical severity alerts to Telegram Bot API.
Only fires for high and critical events to avoid alert fatigue.
Also broadcasts to /live subscribers via telegram_bot.
"""

import asyncio
import html
import logging
import os
from typing import Any, Dict

import requests

logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

SEVERITY_EMOJI = {
    "critical": "🔴",
    "high": "🟠",
    "medium": "🟡",
    "low": "🟢",
}


def _format_alert(record, analysis: Dict[str, Any]) -> str:
    sev = analysis.get("severity", "unknown").lower()
    emoji = SEVERITY_EMOJI.get(sev, "⚪")
    country = html.escape(getattr(record, "country", None) or "Unknown")
    ip = html.escape(record.ip)
    service = html.escape(record.service)
    attack_type = html.escape(str(analysis.get("attack_type", "unknown")))
    summary = html.escape(str(analysis.get("summary", "")))
    cvss = analysis.get("cvss_score", "N/A")
    conf = int(float(analysis.get("confidence", 0)) * 100)
    return (
        f"{emoji} <b>CYBER-EYE ALERT</b>\n\n"
        f"<b>Severity:</b> {sev.upper()}\n"
        f"<b>Attacker IP:</b> <code>{ip}</code>\n"
        f"<b>Country:</b> {country}\n"
        f"<b>Service:</b> {service}\n"
        f"<b>Attack Type:</b> {attack_type}\n"
        f"<b>CVSS:</b> {cvss}\n"
        f"<b>Confidence:</b> {conf}%\n\n"
        f"<i>{summary}</i>"
    )


def _send_sync(message: str) -> None:
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not bot_token or not chat_id or "YOUR_TELEGRAM" in chat_id or "YOUR_TELEGRAM" in bot_token:
        return
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML",
    }
    try:
        resp = requests.post(url, json=payload, timeout=5)
        if resp.status_code != 200:
            logger.warning("Telegram alert failed (HTTP %d): %s", resp.status_code, resp.text)
    except Exception as exc:
        logger.warning("Telegram request exception: %r", exc)


async def send_telegram_alert(record, analysis: Dict[str, Any]) -> None:
    """Send Telegram alert only for high/critical severity events.
    Also broadcast to all /live subscribers regardless of severity."""
    severity = str(analysis.get("severity", "low")).lower()

    # Broadcast to /live subscribers (all severities)
    try:
        from telegram_bot import broadcast_live_attack
        record_dict = {
            "ip": record.ip,
            "country": getattr(record, "country", None),
            "attack_type": getattr(record, "attack_type", None),
            "service": record.service,
            "severity": severity,
        }
        await asyncio.to_thread(broadcast_live_attack, record_dict)
    except Exception as exc:
        logger.debug("Live broadcast skipped: %r", exc)

    # Standard alert only for high/critical
    if severity not in ("high", "critical"):
        return
    try:
        message = _format_alert(record, analysis)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _send_sync, message)
        logger.info("Telegram alert sent for %s (%s)", record.ip, severity)
    except Exception as exc:
        logger.error("Failed to send Telegram alert: %s", exc)

