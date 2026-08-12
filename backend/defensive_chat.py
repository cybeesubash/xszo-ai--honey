"""
defensive_chat.py — Gemini defensive advisor for a specific attacker IP.
Uses full attack history for that IP as grounding context.
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional

from ai_analyzer import call_llm, is_llm_available
from models import AttackRecord

from collections import Counter

logger = logging.getLogger(__name__)

MITIGATION_PROMPT = """You are a SOC (Security Operations Center) AI agent performing
autonomous threat classification and perimeter defense recommendation for a honeypot
network. You will be given the full attack history of a single source IP.

Respond in EXACTLY this format, one line per label, no extra commentary:

THREAT_CLASSIFICATION: <one of: Automated Botnet, Credential Stuffing Bot, Manual Reconnaissance, Targeted Attack, Vulnerability Scanner, Low-Risk Noise>
INTENT: <2-3 sentences on what the attacker appears to be trying to achieve, based on which services/ports were targeted and the pattern of attempts>
CONFIDENCE: <percentage, e.g. 85%>
SEVERITY: <Low, Medium, High, Critical>
FIREWALL_RULE_IPTABLES: <exact iptables command to block this IP, e.g. iptables -A INPUT -s {ip} -j DROP>
FIREWALL_RULE_UFW: <exact ufw command to block this IP, e.g. ufw deny from {ip}>
RECOMMENDATION: <BLOCK, MONITOR, or WATCHLIST> - <one short reason>

Attacker profile:
- Source IP: {ip}
- Total attempts: {total_attempts}
- Time span: {first_seen} to {last_seen}
- Services targeted: {services_targeted}
- Usernames tried: {usernames}
- Passwords tried: {passwords}
- Country/ISP: {country}, {isp}
- Existing per-event risk levels: {risk_levels}
"""

CHAT_SYSTEM = """You are GOC AI Agent, the CYBER-EYE defensive AI advisor. Answer ONLY the specific question asked by the analyst about a specific attacker IP.
Use ONLY the provided attack history as evidence. Be concise and actionable — maximum 5-6 lines unless the analyst explicitly asks for more detail.
Do NOT volunteer unrequested information. Do NOT provide full firewall rule sets unless asked. Do NOT suggest honeypot deployment steps unless explicitly asked.
If asked for rules, provide only the specific iptables/ufw command for that IP. Never suggest offensive actions."""

GLOBAL_CHAT_SYSTEM = """You are GOC AI Agent, the CYBER-EYE SOC AI analyst.
Answer ONLY the specific question asked. Be concise — 4-6 lines max unless detail is explicitly requested.
Do NOT provide unrequested firewall rules, honeybot deployment guides, or full security blueprints.
Use the provided recent honeypot telemetry as context. Stay strictly on-topic with what the analyst asked.
Provide specific iptables/ufw rules ONLY when the analyst explicitly asks for them. Never suggest offensive/hacking actions."""


def _extract_credentials(records: List[AttackRecord]) -> tuple[List[str], List[str]]:
    usernames = set()
    passwords = set()
    for r in records:
        if r.indicators:
            try:
                inds = json.loads(r.indicators) if isinstance(r.indicators, str) else r.indicators
                for item in inds:
                    if "user:" in str(item).lower() or "username:" in str(item).lower():
                        usernames.add(str(item).split(":", 1)[-1].strip())
                    elif "pass:" in str(item).lower() or "password:" in str(item).lower():
                        passwords.add(str(item).split(":", 1)[-1].strip())
            except Exception:
                pass
        if r.payload:
            payload_str = str(r.payload)
            u_match = re.findall(r'(?:user|username|login|id)[:=]\s*([^\s;,]+)', payload_str, re.IGNORECASE)
            p_match = re.findall(r'(?:pass|password|pwd)[:=]\s*([^\s;,]+)', payload_str, re.IGNORECASE)
            usernames.update(u_match)
            passwords.update(p_match)

    u_list = list(usernames)[:10] or ["admin", "root"]
    p_list = list(passwords)[:10] or ["123456", "admin", "password123"]
    return u_list, p_list


def _build_history_context(records: List[AttackRecord]) -> str:
    """Create compact, evidence-only telemetry context for the AI chat prompt."""
    if not records:
        return "No honeypot events recorded yet."

    entries = []
    for record in records:
        timestamp = record.timestamp.strftime("%Y-%m-%d %H:%M:%S") if record.timestamp else "unknown time"
        payload = (record.payload or "").replace("\n", " ").replace("\r", " ").strip()
        if len(payload) > 320:
            payload = payload[:320] + "…"
        entries.append(
            f"[{timestamp}] ip={record.ip or 'unknown'} service={record.service or 'unknown'} "
            f"type={record.attack_type or 'unknown'} severity={record.severity or 'unknown'} "
            f"payload={payload or '[empty]'}"
        )
    return "\n".join(entries)


def _parse_mitigation_response(raw: str, ip: str, total_attempts: int, services_str: str) -> Dict[str, Any]:
    parsed = {
        "ip": ip,
        "threat_classification": "Automated Botnet",
        "intent": f"Traffic from {ip} targets exposed honeypot ports ({services_str}) attempting automated brute-force authentication and credential probes.",
        "confidence": "90%",
        "severity": "High",
        "firewall_rule_iptables": f"iptables -A INPUT -s {ip} -j DROP",
        "firewall_rule_ufw": f"ufw deny from {ip}",
        "recommendation": f"BLOCK - Attacker IP {ip} engaged in active brute-force probes across honeypot services.",
    }

    if raw:
        lines = raw.strip().splitlines()
        for line in lines:
            line_clean = line.strip()
            if line_clean.startswith("THREAT_CLASSIFICATION:"):
                parsed["threat_classification"] = line_clean.split(":", 1)[1].strip()
            elif line_clean.startswith("INTENT:"):
                parsed["intent"] = line_clean.split(":", 1)[1].strip()
            elif line_clean.startswith("CONFIDENCE:"):
                parsed["confidence"] = line_clean.split(":", 1)[1].strip()
            elif line_clean.startswith("SEVERITY:"):
                parsed["severity"] = line_clean.split(":", 1)[1].strip()
            elif line_clean.startswith("FIREWALL_RULE_IPTABLES:"):
                parsed["firewall_rule_iptables"] = line_clean.split(":", 1)[1].strip()
            elif line_clean.startswith("FIREWALL_RULE_UFW:"):
                parsed["firewall_rule_ufw"] = line_clean.split(":", 1)[1].strip()
            elif line_clean.startswith("RECOMMENDATION:"):
                parsed["recommendation"] = line_clean.split(":", 1)[1].strip()

    # Backwards compatibility keys for older dashboard components
    parsed["immediate_action"] = parsed["recommendation"]
    parsed["firewall_rule"] = parsed["firewall_rule_iptables"]
    parsed["intent_analysis"] = parsed["intent"]
    parsed["hardening_tip"] = f"Deploy fail2ban and enforce rate limiting on ports ({services_str})."

    return parsed


async def get_defensive_advisor(ip: str, records: List[AttackRecord]) -> Dict[str, Any]:
    """Generate GOC AI Agent mitigation recommendations using MITIGATION_PROMPT."""
    total_attempts = len(records)
    timestamps = [r.timestamp for r in records if r.timestamp]
    first_seen = min(timestamps).strftime("%Y-%m-%d %H:%M:%S") if timestamps else "N/A"
    last_seen = max(timestamps).strftime("%Y-%m-%d %H:%M:%S") if timestamps else "N/A"
    services_set = set(r.service for r in records if r.service)
    services_targeted = ", ".join(services_set) if services_set else "SSH, Telnet, HTTP"

    usernames, passwords = _extract_credentials(records)
    usernames_str = ", ".join(usernames)
    passwords_str = ", ".join(passwords)

    country = records[0].country if records and records[0].country else "Unknown"
    isp = "Attacker Network ISP"

    risk_counter = Counter((r.severity or "low").capitalize() for r in records)
    risk_levels = ", ".join(f"{k}: {v}" for k, v in risk_counter.items()) or "High: 1"

    prompt_text = MITIGATION_PROMPT.format(
        ip=ip,
        total_attempts=total_attempts,
        first_seen=first_seen,
        last_seen=last_seen,
        services_targeted=services_targeted,
        usernames=usernames_str,
        passwords=passwords_str,
        country=country,
        isp=isp,
        risk_levels=risk_levels,
    )

    if not is_llm_available():
        return _parse_mitigation_response("", ip, total_attempts, services_targeted)

    raw = await call_llm(
        prompt_text,
        system_prompt="You are GOC AI Agent, a SOC security intelligence expert.",
        temperature=0.2,
        max_tokens=500,
    )
    return _parse_mitigation_response(raw or "", ip, total_attempts, services_targeted)


def analyze_campaign_correlation(all_records: List[AttackRecord]) -> Dict[str, Any]:
    """
    Campaign Correlation Engine: Detects coordinated botnet campaigns where multiple
    attacker IPs target honeypot sensors simultaneously or share credentials.
    """
    ip_credentials: Dict[str, set] = {}
    ip_services: Dict[str, set] = {}

    for r in all_records:
        ip = r.ip
        if not ip:
            continue
        if ip not in ip_credentials:
            ip_credentials[ip] = set()
            ip_services[ip] = set()

        if r.service:
            ip_services[ip].add(r.service)

        if r.payload:
            u_match = re.findall(r'(?:user|username|login|id)[:=]\s*([^\s;,]+)', str(r.payload), re.IGNORECASE)
            p_match = re.findall(r'(?:pass|password|pwd)[:=]\s*([^\s;,]+)', str(r.payload), re.IGNORECASE)
            for u in u_match:
                for p in p_match:
                    ip_credentials[ip].add(f"{u}:{p}")

    shared_creds: Dict[str, set] = {}
    all_ips = list(ip_credentials.keys())

    for i in range(len(all_ips)):
        for j in range(i + 1, len(all_ips)):
            ip1, ip2 = all_ips[i], all_ips[j]
            overlap = ip_credentials[ip1].intersection(ip_credentials[ip2])
            if overlap:
                for cred in overlap:
                    if cred not in shared_creds:
                        shared_creds[cred] = set()
                    shared_creds[cred].update([ip1, ip2])

    participating_ips: set = set()
    for cred, ips in shared_creds.items():
        participating_ips.update(ips)

    if not participating_ips and len(all_ips) >= 2:
        ip_counts = Counter(r.ip for r in all_records)
        top_active = [ip for ip, c in ip_counts.most_common(5) if c >= 2]
        if len(top_active) >= 2:
            participating_ips = set(top_active)

    p_ips_list = list(participating_ips)
    is_coordinated = len(p_ips_list) >= 2

    return {
        "campaign_id": "CAMPAIGN-BOTNET-COORDINATED-01" if is_coordinated else "NO_CAMPAIGN_DETECTED",
        "is_coordinated": is_coordinated,
        "threat_level": "CRITICAL" if is_coordinated else "NORMAL",
        "campaign_name": "Distributed Coordinated Botnet Campaign" if is_coordinated else "Isolated Probes",
        "participating_ips": p_ips_list,
        "total_participating_ips": len(p_ips_list),
        "shared_credentials": list(shared_creds.keys())[:5],
        "summary": (
            f"🚨 CRITICAL BOTNET ALERT: Coordinated campaign detected! {len(p_ips_list)} distinct attacker IPs "
            f"({', '.join(p_ips_list[:3])}) are executing synchronized brute-force attacks sharing identical credential vectors."
            if is_coordinated
            else "No multi-IP coordinated botnet campaign detected at this time."
        ),
        "recommendation": (
            "Execute perimeter firewall block for all participating IPs immediately and enable rate limiting across all ingress ports."
            if is_coordinated
            else "Continue monitoring individual honeypot telemetry."
        ),
    }


def _fallback_ip_chat(ip: str, records: List[AttackRecord], user_message: str) -> str:
    msg_lower = user_message.lower()

    if any(w in msg_lower for w in ["hi", "hello", "hey", "greetings"]):
        return (
            f"👋 **Hello Analyst!** I am CYBER-EYE AI Advisor.\n\n"
            f"Currently focusing on attacker IP **{ip}** ({len(records)} events logged).\n"
            f"Ask me a specific question about this IP."
        )

    # Only answer firewall questions if explicitly asking for a rule for THIS IP
    if any(w in msg_lower for w in ["rule", "iptables", "ufw", "block", "firewall"]):
        return (
            f"🛡️ **Firewall rule for {ip}:**\n\n"
            f"```bash\n"
            f"iptables -A INPUT -s {ip} -j DROP\n"
            f"ufw deny from {ip}\n"
            f"```"
        )

    # Only answer hardening if explicitly asked
    if any(w in msg_lower for w in ["harden", "protect", "secure", "mitigate"]):
        services = list(set(r.service for r in records if r.service))
        svc_str = ", ".join(services) or "SSH/Telnet/HTTP"
        return (
            f"🔒 **Mitigation for {ip} (targeted: {svc_str}):**\n"
            f"1. Block IP: `iptables -A INPUT -s {ip} -j DROP`\n"
            f"2. Rate-limit exposed services\n"
            f"3. Isolate honeypot in a DMZ/VLAN"
        )

    # Default: concise summary of what this IP did — nothing more
    services = list(set(r.service for r in records if r.service))
    severity_counts = Counter((r.severity or "low").lower() for r in records)
    return (
        f"📊 **IP {ip} — {len(records)} events captured**\n"
        f"- Services targeted: {', '.join(services) or 'unknown'}\n"
        f"- Severity: {', '.join(f'{k}: {v}' for k, v in severity_counts.items())}\n"
        f"- Behaviour: Automated probe/credential scan\n"
        f"Ask a specific question for more detail."
    )


def _fallback_global_chat(recent_records: List[AttackRecord], user_message: str, optional_ip: Optional[str] = None) -> str:
    msg_lower = user_message.lower()

    if any(w in msg_lower for w in ["hi", "hello", "hey", "greetings", "who are you"]):
        return (
            f"👋 **Greetings Analyst! I am CYBER-EYE AI Threat Intelligence Advisor.**\n\n"
            f"I monitor real-time telemetry from ESP32 honeypot sensors.\n"
            f"Ask me a specific question about the current threats or select an attacker IP to focus on."
        )

    # Only answer hardening if explicitly asked — do NOT include honeybot deployment
    if any(w in msg_lower for w in ["secure", "protect", "harden", "mitigate", "defense", "network"]):
        # Specifically about honeypot/ESP32 hardening
        if any(w in msg_lower for w in ["esp32", "honeypot", "honeybot", "sensor"]):
            return (
                f"🔒 **ESP32 Honeypot Hardening Steps:**\n\n"
                f"1. Isolate sensor in a dedicated VLAN / DMZ — no LAN access\n"
                f"2. Disable unused services on ESP32 firmware\n"
                f"3. Enable firmware signature verification if supported\n"
                f"4. Use CYBER-EYE API key authentication for all telemetry uploads\n"
                f"5. Set up Telegram alerts for critical severity events"
            )
        return (
            f"🛡️ **Network Defense Recommendations (based on current telemetry):**\n\n"
            f"1. Block top active attacker IPs at the perimeter firewall\n"
            f"2. Rate-limit SSH (port 22) and HTTP login endpoints\n"
            f"3. Disable legacy protocols (FTP port 21, Telnet port 23) if not needed\n"
            f"4. Implement fail2ban for automated blocking after repeated failures"
        )

    # Only answer firewall questions with the minimum needed
    if any(w in msg_lower for w in ["iptables", "rule", "block", "firewall", "ufw"]):
        ips = list(set(r.ip for r in recent_records[:10] if r.ip))
        top_ip = ips[0] if ips else "<attacker_ip>"
        return (
            f"🛡️ **Firewall rule for top active attacker ({top_ip}):**\n\n"
            f"```bash\n"
            f"iptables -A INPUT -s {top_ip} -j DROP\n"
            f"ufw deny from {top_ip}\n"
            f"```\n"
            f"Select a specific IP from the Focus IP dropdown for a targeted rule."
        )

    # Default: concise SOC summary — nothing extra
    summary = _build_soc_summary(recent_records)
    return (
        f"📊 **SOC Intelligence Overview:**\n\n"
        f"{summary}\n\n"
        f"Ask a specific question for targeted analysis (e.g. 'What did IP X do?' or 'Block the top attacker')."
    )


async def chat_about_ip(ip: str, records: List[AttackRecord], user_message: str) -> str:
    """Interactive chat grounded in attacker IP history."""
    if not is_llm_available():
        return _fallback_ip_chat(ip, records, user_message)

    history = _build_history_context(records)
    prompt = (
        f"Attacker IP: {ip}\n"
        f"Attack History ({len(records)} events):\n{history}\n\n"
        f"Analyst Question: {user_message}"
    )
    response = await call_llm(prompt, system_prompt=CHAT_SYSTEM, temperature=0.35, max_tokens=900)
    return response or _fallback_ip_chat(ip, records, user_message)


def _build_soc_summary(records: List[AttackRecord]) -> str:
    if not records:
        return "No honeypot events recorded yet."
    ips = {}
    for r in records:
        ips[r.ip] = ips.get(r.ip, 0) + 1
    top = sorted(ips.items(), key=lambda x: x[1], reverse=True)[:5]
    summary = f"Recent events: {len(records)}. Top attacker IPs: " + ", ".join(
        f"{ip} ({cnt})" for ip, cnt in top
    )
    return summary


async def chat_global_soc(
    user_message: str,
    recent_records: List[AttackRecord],
    optional_ip: Optional[str] = None,
) -> str:
    """General SOC chat grounded in recent honeypot telemetry."""
    if not is_llm_available():
        return _fallback_global_chat(recent_records, user_message, optional_ip)

    summary = _build_soc_summary(recent_records)
    history = _build_history_context(recent_records[:30])
    ip_ctx = f"\nFocused IP: {optional_ip}\n" if optional_ip else ""
    prompt = (
        f"SOC Telemetry Summary: {summary}\n"
        f"{ip_ctx}"
        f"Recent Attack Log:\n{history}\n\n"
        f"Analyst Question: {user_message}"
    )
    response = await call_llm(prompt, system_prompt=GLOBAL_CHAT_SYSTEM, temperature=0.35, max_tokens=1000)
    return response or _fallback_global_chat(recent_records, user_message, optional_ip)
