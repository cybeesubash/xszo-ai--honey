"""
Quick API smoke tests for CYBER-EYE backend.
Run: python test_api.py (backend must be running on :8000)
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE = os.environ.get("TEST_API_URL", "http://localhost:8000")
API_KEY = os.environ.get("HONEYPOT_API_KEY", "honeypot-secret-soc-key-2026")
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}


def test_health():
    r = requests.get(f"{BASE}/health", timeout=5)
    assert r.status_code == 200
    print("[OK] /health")


def test_register():
    r = requests.post(
        f"{BASE}/device/register",
        headers=HEADERS,
        json={
            "device_id": "TEST-DEVICE-001",
            "hostname": "test-honeypot",
            "firmware_version": "2.0.0",
            "ip": "192.168.1.99",
            "mac": "AA:BB:CC:DD:EE:FF",
            "chip_type": "ESP32",
        },
        timeout=5,
    )
    assert r.status_code == 201
    print("[OK] /device/register")


def test_event():
    r = requests.post(
        f"{BASE}/api/event",
        headers=HEADERS,
        json={
            "device": "TEST-DEVICE-001",
            "service": "http",
            "ip": "203.0.113.50",
            "port": 80,
            "protocol": "tcp",
            "payload": "GET /admin HTTP/1.1\r\nHost: router\r\n\r\n",
            "bytes_in": 48,
            "bytes_out": 200,
        },
        timeout=30,
    )
    assert r.status_code == 201
    print("[OK] /api/event")


def test_logs_and_stats():
    r = requests.get(f"{BASE}/logs?limit=5", timeout=5)
    assert r.status_code == 200
    print("[OK] /logs")
    r = requests.get(f"{BASE}/stats", timeout=5)
    assert r.status_code == 200
    print("[OK] /stats")


if __name__ == "__main__":
    test_health()
    test_register()
    test_event()
    test_logs_and_stats()
    print("\nAll tests passed.")
