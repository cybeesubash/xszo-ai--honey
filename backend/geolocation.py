"""
geolocation.py — Enhanced IP intelligence: geolocation, ISP, ASN, threat data.
Uses ip-api.com (free tier) with extended fields for comprehensive attacker profiling.
"""

import logging
from functools import lru_cache
from typing import Optional, Tuple, Dict, Any

import requests

logger = logging.getLogger(__name__)

# Private/reserved ranges — skip geolocation lookup
_PRIVATE_PREFIXES = ("10.", "192.168.", "127.", "0.", "169.254.", "fe80:", "::1")


def _is_private_ip(ip: str) -> bool:
    return any(ip.startswith(p) for p in _PRIVATE_PREFIXES)


@lru_cache(maxsize=512)
def lookup_country(ip: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Returns (country_name, country_code) for a given IP.
    Falls back to (None, None) on failure or private IPs.
    """
    if not ip or _is_private_ip(ip):
        return "Local Network", "LO"

    try:
        resp = requests.get(
            f"http://ip-api.com/json/{ip}",
            params={"fields": "status,country,countryCode"},
            timeout=3,
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success":
                return data.get("country"), data.get("countryCode")
    except Exception as exc:
        logger.debug("Geolocation lookup failed for %s: %s", ip, exc)

    return "Unknown", "XX"


@lru_cache(maxsize=512)
def get_ip_intelligence(ip: str) -> Dict[str, Any]:
    """
    Returns comprehensive IP intelligence including:
    - Geolocation (country, region, city, coordinates)
    - ISP/Organization
    - ASN (Autonomous System Number)
    - Timezone
    - Network details
    
    Uses ip-api.com free tier (45 requests/minute limit).
    """
    default_response = {
        "ip": ip,
        "country": "Unknown",
        "country_code": "XX",
        "region": None,
        "city": None,
        "latitude": None,
        "longitude": None,
        "isp": "Unknown ISP",
        "org": "Unknown Organization",
        "asn": None,
        "as_name": None,
        "timezone": None,
        "is_proxy": False,
        "is_hosting": False,
        "threat_level": "unknown",
    }
    
    if not ip or _is_private_ip(ip):
        default_response.update({
            "country": "Local Network",
            "country_code": "LO",
            "isp": "Private Network",
            "org": "RFC1918 Private Address Space",
            "threat_level": "none",
        })
        return default_response

    try:
        # Extended fields for comprehensive intelligence
        fields = "status,message,country,countryCode,region,regionName,city,lat,lon," \
                 "timezone,isp,org,as,asname,proxy,hosting"
        
        resp = requests.get(
            f"http://ip-api.com/json/{ip}",
            params={"fields": fields},
            timeout=5,
        )
        
        if resp.status_code == 200:
            data = resp.json()
            
            if data.get("status") == "success":
                # Parse ASN from "as" field (format: "AS15169 Google LLC")
                asn_raw = data.get("as", "")
                asn = None
                as_name = None
                if asn_raw:
                    parts = asn_raw.split(" ", 1)
                    asn = parts[0].replace("AS", "") if parts else None
                    as_name = parts[1] if len(parts) > 1 else None
                
                # Determine threat level based on proxy/hosting flags
                is_proxy = data.get("proxy", False)
                is_hosting = data.get("hosting", False)
                threat_level = "high" if is_proxy else ("medium" if is_hosting else "low")
                
                return {
                    "ip": ip,
                    "country": data.get("country", "Unknown"),
                    "country_code": data.get("countryCode", "XX"),
                    "region": data.get("regionName"),
                    "city": data.get("city"),
                    "latitude": data.get("lat"),
                    "longitude": data.get("lon"),
                    "isp": data.get("isp", "Unknown ISP"),
                    "org": data.get("org", "Unknown Organization"),
                    "asn": asn,
                    "as_name": as_name or data.get("asname"),
                    "timezone": data.get("timezone"),
                    "is_proxy": is_proxy,
                    "is_hosting": is_hosting,
                    "threat_level": threat_level,
                }
            else:
                logger.warning("IP intelligence lookup failed for %s: %s", ip, data.get("message"))
                
    except Exception as exc:
        logger.error("IP intelligence lookup exception for %s: %s", ip, exc)

    return default_response
