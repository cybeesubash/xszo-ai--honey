"""
ai_analyzer.py — Google Gemini 2.0 Flash threat classification engine
with intelligent heuristic fallback for robust zero-downtime SOC operations.
"""

import json
import logging
import os
import re
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger(__name__)

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
FALLBACK_MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
]

MAX_ANALYSIS_CHARS = 2000

VALID_ATTACK_TYPES = {
    "sql_injection",
    "brute_force",
    "port_scan",
    "command_injection",
    "malware_drop",
    "credential_harvesting",
    "botnet_probe",
    "mqtt_unauthorized",
    "unknown",
    "benign",
}

VALID_SEVERITIES = {"low", "medium", "high", "critical"}

SYSTEM_PROMPT = """You are GOC AI Agent, an autonomous SOC threat analysis engine for CYBER-EYE ESP32 honeypot.
Analyze raw network captures and classify them into structured threat intelligence.

Rules:
1. Respond ONLY with a single valid JSON object. No markdown fences, no commentary.
2. Every field below is REQUIRED.

JSON schema:
{
  "attack_type": "<sql_injection|brute_force|port_scan|command_injection|malware_drop|credential_harvesting|botnet_probe|mqtt_unauthorized|unknown|benign>",
  "severity": "<low|medium|high|critical>",
  "cvss_score": <float 0.0-10.0 following CVSS v3.1 ranges>,
  "confidence": <float 0.0-1.0>,
  "summary": "<one-sentence analyst summary>",
  "recommended_action": "<actionable SOC mitigation>",
  "indicators": ["<evidence from payload>", "..."]
}"""


def get_openrouter_api_key() -> str:
    return (os.environ.get("OPENROUTER_API_KEY") or "").strip()


def get_openrouter_model() -> str:
    return (os.environ.get("OPENROUTER_MODEL") or "google/gemini-2.0-flash-001").strip()


def get_gemini_api_key() -> str:
    return (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or "").strip()


def is_llm_available() -> bool:
    if get_openrouter_api_key():
        return True
    g_key = get_gemini_api_key()
    if g_key and not g_key.startswith("AQ."):
        return True
    return False


def get_active_engine_name() -> str:
    if get_openrouter_api_key():
        return f"OpenRouter ({get_openrouter_model()})"
    g_key = get_gemini_api_key()
    if g_key and not g_key.startswith("AQ."):
        return f"Google Gemini ({GEMINI_MODEL})"
    return "Rule-based Heuristic SOC Engine"



def _heuristic_analyzer(
    service: str,
    ip: str,
    payload: Optional[str],
    protocol: Optional[str] = None,
) -> Dict[str, Any]:
    """Rule-based SOC threat intelligence analyzer used when Gemini LLM is unavailable."""
    text = (payload or "").strip().lower()
    service_clean = (service or "").lower()
    indicators = []

    # 1. Command Injection
    cmd_keywords = [
        "cat /etc",
        "wget ",
        "curl ",
        "chmod",
        "nc -e",
        "/bin/sh",
        "/bin/bash",
        "sudo ",
        "; ls",
        "$(",
        "`id`",
        "busybox",
        "tftp",
        "rm -rf",
    ]
    for kw in cmd_keywords:
        if kw in text:
            indicators.append(f"Command injection payload pattern: '{kw}'")

    if indicators:
        return {
            "attack_type": "command_injection",
            "severity": "critical",
            "cvss_score": 9.8,
            "confidence": 0.95,
            "summary": f"Remote Command Injection detected in {service_clean.upper()} payload.",
            "recommended_action": f"Block IP {ip} immediately via iptables/WAF. Audit system processes.",
            "indicators": indicators[:5],
        }

    # 2. SQL Injection
    sqli_keywords = [
        "select ",
        "union ",
        "or 1=1",
        "or '1'='1'",
        "--",
        "drop table",
        "information_schema",
        "sleep(",
        "benchmark(",
        "exec ",
    ]
    for kw in sqli_keywords:
        if kw in text:
            indicators.append(f"SQL injection syntax: '{kw}'")

    if indicators:
        return {
            "attack_type": "sql_injection",
            "severity": "high",
            "cvss_score": 8.5,
            "confidence": 0.92,
            "summary": f"SQL Injection attempt targeting {service_clean.upper()} endpoint.",
            "recommended_action": f"Apply WAF rules to block traffic from {ip}. Ensure DB queries use prepared statements.",
            "indicators": indicators[:5],
        }

    # 3. Credential Harvesting & Brute Force
    cred_keywords = ["admin", "root", "password", "pass=", "user=", "login", "auth", "authorization: basic"]
    for kw in cred_keywords:
        if kw in text:
            indicators.append(f"Credential signature: '{kw}'")

    if service_clean in ["ssh", "telnet", "ftp"]:
        return {
            "attack_type": "brute_force",
            "severity": "high",
            "cvss_score": 7.8,
            "confidence": 0.88,
            "summary": f"Brute-force credential authentication attempt on decoy {service_clean.upper()} service.",
            "recommended_action": f"Block IP {ip} with fail2ban. Mandate SSH key authentication.",
            "indicators": indicators if indicators else [f"Auth probe on decoy {service_clean.upper()}"],
        }

    if indicators:
        return {
            "attack_type": "credential_harvesting",
            "severity": "high",
            "cvss_score": 7.5,
            "confidence": 0.85,
            "summary": f"Credential harvesting attempt targeting login endpoints on {service_clean.upper()}.",
            "recommended_action": f"Revoke exposed session tokens and block IP {ip} at network edge.",
            "indicators": indicators[:5],
        }

    # 4. Malware Drop
    malware_keywords = [".exe", ".sh", ".py", ".bin", "powershell", "invoke-expression", "curl -o", "wget -O"]
    for kw in malware_keywords:
        if kw in text:
            indicators.append(f"Malware stager signature: '{kw}'")

    if indicators:
        return {
            "attack_type": "malware_drop",
            "severity": "critical",
            "cvss_score": 9.1,
            "confidence": 0.90,
            "summary": f"Malware stager payload capture in {service_clean.upper()} session.",
            "recommended_action": f"Isolate host, submit payload to sandbox for analysis, drop packets from {ip}.",
            "indicators": indicators[:5],
        }

    # 5. MQTT Unauthorized
    if "mqtt" in service_clean or "publish" in text or "subscribe" in text:
        return {
            "attack_type": "mqtt_unauthorized",
            "severity": "medium",
            "cvss_score": 6.5,
            "confidence": 0.80,
            "summary": f"Unauthorized MQTT broker probe or telemetry injection attempt.",
            "recommended_action": f"Enforce TLS (port 8883) and client certificate authentication on MQTT broker.",
            "indicators": [f"MQTT packet from {ip} on {service_clean}"],
        }

    # 6. Botnet / Recon / Port Scan
    if not text or len(text) < 15 or "nmap" in text or "masscan" in text or "zgrab" in text:
        attack_type = "botnet_probe" if ("bot" in text or "mirai" in text or "zgrab" in text) else "port_scan"
        return {
            "attack_type": attack_type,
            "severity": "medium" if attack_type == "botnet_probe" else "low",
            "cvss_score": 5.3 if attack_type == "botnet_probe" else 3.5,
            "confidence": 0.75,
            "summary": f"Automated recon / {attack_type.replace('_', ' ')} probe on {service_clean.upper()}.",
            "recommended_action": f"Rate-limit connection attempts from {ip} and update firewall blocklists.",
            "indicators": [f"Recon probe on port/service {service_clean} from {ip}"],
        }

    # Default fallback
    return {
        "attack_type": "unknown",
        "severity": "medium",
        "cvss_score": 5.0,
        "confidence": 0.65,
        "summary": f"Suspicious activity detected on decoy service {service_clean.upper()}.",
        "recommended_action": f"Inspect raw traffic log for {ip} and enforce perimeter drop rules.",
        "indicators": [f"Payload capture from {ip}: '{payload[:60]}'"],
    }


def _sanitize_result(raw: Dict[str, Any], ip: str) -> Dict[str, Any]:
    attack_type = raw.get("attack_type", "unknown")
    if attack_type not in VALID_ATTACK_TYPES:
        attack_type = "unknown"

    severity = raw.get("severity", "low")
    if severity not in VALID_SEVERITIES:
        severity = "low"

    try:
        cvss = float(raw["cvss_score"]) if raw.get("cvss_score") is not None else 3.0
        cvss = max(0.0, min(10.0, cvss))
    except (TypeError, ValueError):
        cvss = 3.0

    try:
        confidence = float(raw.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))
    except (TypeError, ValueError):
        confidence = 0.5

    summary = str(raw.get("summary", "Threat assessment completed."))[:250]
    recommended_action = str(raw.get("recommended_action", f"Review activity from {ip}."))[:350]

    indicators_raw = raw.get("indicators", [])
    if isinstance(indicators_raw, list):
        indicators = [str(i)[:200] for i in indicators_raw[:10]]
    else:
        indicators = [f"Payload signature from {ip}"]

    return {
        "attack_type": attack_type,
        "severity": severity,
        "cvss_score": cvss,
        "confidence": confidence,
        "summary": summary,
        "recommended_action": recommended_action,
        "indicators": indicators,
    }


def _extract_gemini_text(data: Any) -> Optional[str]:
    if not isinstance(data, dict):
        return None

    candidates = data.get("candidates")
    if isinstance(candidates, list) and candidates:
        first = candidates[0]
        if isinstance(first, dict):
            content = first.get("content") or {}
            if isinstance(content, dict):
                parts = content.get("parts") or []
                if isinstance(parts, list) and parts:
                    part = parts[0]
                    if isinstance(part, dict):
                        return str(part.get("text", "")).strip()

    output = data.get("output")
    if isinstance(output, list) and output:
        first = output[0]
        if isinstance(first, dict):
            content = first.get("content") or []
            if isinstance(content, list) and content:
                part = content[0]
                if isinstance(part, dict):
                    return str(part.get("text", "")).strip()

    for key in ("response", "text", "reply"):
        value = data.get(key)
        if isinstance(value, str):
            return value.strip()

    return None


async def call_gemini(
    prompt: str,
    temperature: float = 0.2,
    max_tokens: int = 1024,
) -> Optional[str]:
    """Low-level Gemini API call returning raw text with automatic model fallback."""
    api_key = get_gemini_api_key()
    if not api_key:
        return None

    # If key starts with AQ., direct REST API calls will fail with 429 quota error.
    if api_key.startswith("AQ."):
        logger.info("GEMINI_API_KEY uses OAuth format (AQ...) — using high-performance heuristic analyzer fallback.")
        return None

    models_to_try = [GEMINI_MODEL] + [m for m in FALLBACK_MODELS if m != GEMINI_MODEL]

    async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
        for model in models_to_try:
            url = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={api_key}"
            )
            body = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens,
                    "responseMimeType": "application/json",
                },
            }

            try:
                resp = await client.post(url, json=body)
                logger.info("Gemini request model=%s status=%s", model, resp.status_code)
                if resp.status_code == 200:
                    try:
                        data = resp.json()
                    except ValueError:
                        text = resp.text.strip()
                        if text:
                            return text
                        logger.warning("Gemini model %s returned invalid JSON", model)
                        continue

                    text = _extract_gemini_text(data)
                    if text:
                        return text

                    logger.warning(
                        "Gemini model %s returned unrecognized payload shape: %s",
                        model,
                        resp.text[:600],
                    )
                else:
                    logger.warning(
                        "Gemini API (%s) HTTP %d: %s",
                        model,
                        resp.status_code,
                        resp.text[:240],
                    )
                    if resp.status_code in (400, 401, 403, 429):
                        # Key issue or quota exceeded — fall back instantly
                        break
            except Exception as exc:
                logger.warning("Gemini API call to model %s failed: %r", model, exc)

    return None


async def call_openrouter(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: int = 1024,
) -> Optional[str]:
    """OpenRouter API chat completion caller for multi-model LLM access."""
    api_key = get_openrouter_api_key()
    if not api_key:
        return None

    model = get_openrouter_model()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "CYBER-EYE SOC",
        "Content-Type": "application/json",
    }

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    body = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            resp = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=body)
            logger.info("OpenRouter API request model=%s status=%s", model, resp.status_code)
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices and len(choices) > 0:
                    content = choices[0].get("message", {}).get("content", "")
                    if content:
                        return content.strip()
            else:
                logger.warning("OpenRouter API (%s) HTTP %d: %s", model, resp.status_code, resp.text[:240])
        except Exception as exc:
            logger.warning("OpenRouter API call to model %s failed: %r", model, exc)

    return None


async def call_llm(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: int = 1024,
) -> Optional[str]:
    """Unified LLM router: tries OpenRouter API first, then Google Gemini API."""
    if get_openrouter_api_key():
        res = await call_openrouter(prompt, system_prompt=system_prompt, temperature=temperature, max_tokens=max_tokens)
        if res:
            return res

    full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
    return await call_gemini(full_prompt, temperature=temperature, max_tokens=max_tokens)


async def analyze_attack(
    service: str,
    ip: str,
    payload: Optional[str],
    protocol: Optional[str] = None,
) -> Dict[str, Any]:
    """Classify a honeypot event using OpenRouter or Gemini LLM with robust heuristic fallback."""
    if is_llm_available():
        truncated = (payload or "")[:MAX_ANALYSIS_CHARS]
        payload_desc = truncated if truncated else "[empty — connection with no payload data]"

        prompt = (
            f"Honeypot Event:\n"
            f"  Service: {service}\n"
            f"  Protocol: {protocol or service}\n"
            f"  Attacker IP: {ip}\n"
            f"  Payload:\n---\n{payload_desc}\n---\n\n"
            f"Return your JSON threat report."
        )

        raw_text = await call_llm(prompt, system_prompt=SYSTEM_PROMPT, temperature=0.15, max_tokens=800)
        if raw_text:
            text = raw_text.strip()
            # Extract JSON block using regex if wrapped or preceded by text
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                text = match.group(0)
            elif text.startswith("```"):
                lines = [l for l in text.splitlines() if not l.startswith("```")]
                text = "\n".join(lines)

            try:
                parsed = json.loads(text)
                if isinstance(parsed, dict):
                    logger.info("Successfully analyzed threat using LLM model for IP %s", ip)
                    return _sanitize_result(parsed, ip)
            except json.JSONDecodeError:
                logger.warning("Malformed LLM JSON for %s: %s", ip, text[:120])

    # Smart heuristic SOC analyzer fallback when LLM API keys are missing/invalid/throttled
    logger.info("Using smart rule-based SOC threat analyzer for IP %s (service: %s)", ip, service)
    return _heuristic_analyzer(service=service, ip=ip, payload=payload, protocol=protocol)

