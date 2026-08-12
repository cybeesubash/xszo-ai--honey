"""
models.py — Pydantic schemas and in-memory record classes for CYBER-EYE honeypot SOC.
No database dependency — all data lives in memory.
"""

import html
import ipaddress
import json
import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# In-memory record classes (replace SQLAlchemy ORM models)
# ---------------------------------------------------------------------------


class DeviceRecord:
    """Simple namespace for device data (no DB)."""

    def __init__(self, **kwargs):
        self.id = kwargs.get("id")
        self.device_id = kwargs.get("device_id", "")
        self.hostname = kwargs.get("hostname")
        self.firmware_version = kwargs.get("firmware_version")
        self.ip = kwargs.get("ip")
        self.mac = kwargs.get("mac")
        self.chip_type = kwargs.get("chip_type")
        self.free_heap = kwargs.get("free_heap")
        self.wifi_rssi = kwargs.get("wifi_rssi")
        self.uptime_sec = kwargs.get("uptime_sec")
        self.last_seen = kwargs.get("last_seen", datetime.utcnow())
        self.registered_at = kwargs.get("registered_at", datetime.utcnow())


class AttackRecord:
    """Simple namespace for attack log data (no DB)."""

    def __init__(self, **kwargs):
        self.id = kwargs.get("id")
        self.device_id = kwargs.get("device_id")
        self.ip = kwargs.get("ip", "")
        self.country = kwargs.get("country")
        self.country_code = kwargs.get("country_code")
        self.service = kwargs.get("service", "")
        self.port = kwargs.get("port")
        self.protocol = kwargs.get("protocol")
        self.payload = kwargs.get("payload")
        self.bytes_in = kwargs.get("bytes_in")
        self.bytes_out = kwargs.get("bytes_out")
        self.attack_type = kwargs.get("attack_type", "unknown")
        self.severity = kwargs.get("severity", "low")
        self.cvss_score = kwargs.get("cvss_score")
        self.confidence = kwargs.get("confidence")
        self.summary = kwargs.get("summary")
        self.recommended_action = kwargs.get("recommended_action")
        self.indicators = kwargs.get("indicators")
        self.timestamp = kwargs.get("timestamp", datetime.utcnow())


# ---------------------------------------------------------------------------
# Input sanitization — attacker-controlled data must never be executed raw
# ---------------------------------------------------------------------------

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def sanitize_text(value: Optional[str], max_len: int = 4096) -> Optional[str]:
    if value is None:
        return None
    cleaned = _CONTROL_CHARS.sub("", str(value))
    cleaned = html.escape(cleaned, quote=False)
    return cleaned[:max_len]


ALLOWED_SERVICES = {"telnet", "http", "ssh", "ftp"}
MAX_PAYLOAD_CHARS = 4096


class DeviceRegisterIn(BaseModel):
    device_id: str = Field(..., min_length=1, max_length=64)
    hostname: Optional[str] = Field(None, max_length=128)
    firmware_version: Optional[str] = Field(None, max_length=32)
    ip: Optional[str] = Field(None, max_length=45)
    mac: Optional[str] = Field(None, max_length=17)
    chip_type: Optional[str] = Field(None, max_length=64)

    @field_validator("device_id", "hostname", "firmware_version", "mac", "chip_type")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_text(v, 256) if v else v

    @field_validator("ip")
    @classmethod
    def validate_ip(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        try:
            ipaddress.ip_address(v)
        except ValueError as exc:
            raise ValueError(f"Invalid IP address: {v!r}") from exc
        return v


class DeviceHeartbeatIn(BaseModel):
    device_id: str = Field(..., min_length=1, max_length=64)
    free_heap: Optional[int] = Field(None, ge=0)
    wifi_rssi: Optional[int] = None
    uptime_sec: Optional[int] = Field(None, ge=0)
    ip: Optional[str] = Field(None, max_length=45)

    @field_validator("device_id")
    @classmethod
    def sanitize_device(cls, v: str) -> str:
        return sanitize_text(v, 64) or v

    @field_validator("ip")
    @classmethod
    def validate_ip(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        try:
            ipaddress.ip_address(v)
        except ValueError as exc:
            raise ValueError(f"Invalid IP address: {v!r}") from exc
        return v


class EventIn(BaseModel):
    device: str = Field(..., min_length=1, max_length=64)
    service: str
    ip: str = Field(..., min_length=7, max_length=45)
    port: Optional[int] = Field(None, ge=1, le=65535)
    protocol: Optional[str] = Field(None, max_length=16)
    payload: Optional[str] = Field(None, max_length=MAX_PAYLOAD_CHARS)
    severity: Optional[str] = Field("unknown", max_length=16)
    timestamp: Optional[str] = Field(None, max_length=32)
    bytes_in: Optional[int] = Field(None, ge=0)
    bytes_out: Optional[int] = Field(None, ge=0)

    @field_validator("device")
    @classmethod
    def sanitize_device(cls, v: str) -> str:
        return sanitize_text(v, 64) or v

    @field_validator("ip")
    @classmethod
    def validate_ip(cls, v: str) -> str:
        try:
            ipaddress.ip_address(v)
        except ValueError as exc:
            raise ValueError(f"Invalid IP address: {v!r}") from exc
        return v

    @field_validator("service")
    @classmethod
    def validate_service(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in ALLOWED_SERVICES:
            raise ValueError(f"Unknown service {v!r}. Allowed: {', '.join(ALLOWED_SERVICES)}")
        return v

    @field_validator("payload", "protocol")
    @classmethod
    def sanitize_optional(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_text(v, MAX_PAYLOAD_CHARS) if v else v


class AttackLogOut(BaseModel):
    id: int
    device_id: Optional[str]
    ip: str
    country: Optional[str]
    country_code: Optional[str]
    service: str
    port: Optional[int]
    protocol: Optional[str]
    payload: Optional[str]
    attack_type: str
    severity: str
    cvss_score: Optional[float]
    confidence: Optional[float]
    summary: Optional[str]
    recommended_action: Optional[str]
    indicators: Optional[List[str]]
    timestamp: datetime

    @classmethod
    def from_record(cls, rec: AttackRecord) -> "AttackLogOut":
        """Build from an in-memory AttackRecord namespace object."""
        indicators: Optional[List[str]] = None
        if rec.indicators:
            try:
                indicators = json.loads(rec.indicators) if isinstance(rec.indicators, str) else rec.indicators
            except (json.JSONDecodeError, TypeError):
                indicators = []
        return cls(
            id=rec.id,
            device_id=rec.device_id,
            ip=rec.ip,
            country=rec.country,
            country_code=rec.country_code,
            service=rec.service,
            port=rec.port,
            protocol=rec.protocol,
            payload=rec.payload,
            attack_type=rec.attack_type,
            severity=rec.severity,
            cvss_score=rec.cvss_score,
            confidence=rec.confidence,
            summary=rec.summary,
            recommended_action=rec.recommended_action,
            indicators=indicators,
            timestamp=rec.timestamp,
        )

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    total_events: int
    critical_alerts: int
    unique_ips: int
    avg_cvss: Optional[float]
    severity_breakdown: dict
    attack_type_breakdown: dict
    top_countries: List[dict]
    top_attacker_ips: List[dict]


class DefensiveAdvisorOut(BaseModel):
    ip: str
    immediate_action: str
    firewall_rule: str
    intent_analysis: str
    hardening_tip: str
    threat_classification: Optional[str] = "Automated Botnet"
    intent: Optional[str] = None
    confidence: Optional[str] = "90%"
    severity: Optional[str] = "High"
    firewall_rule_iptables: Optional[str] = None
    firewall_rule_ufw: Optional[str] = None
    recommendation: Optional[str] = None


class ChatMessageIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, v: str) -> str:
        return sanitize_text(v, 2000) or v
