"""
virtual_esp32.py -- Simulated ESP32 Honeypot Module
Connects to backend and sends realistic honeypot attack events
"""
import asyncio
import random
import sys
import time
from datetime import datetime
import httpx

# Force UTF-8 output so box-drawing / emoji chars work on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Backend Configuration
BACKEND_URL = "http://127.0.0.1:8000"
API_KEY = "honeypot-secret-soc-key-2026"
DEVICE_ID = "ESP32-VIRTUAL-01"

# Simulated honeypot services
SERVICES = ["telnet", "ssh", "http", "ftp"]
PORTS = {"telnet": 23, "ssh": 22, "http": 80, "ftp": 21}

# Realistic attacker IPs from various countries
ATTACKER_IPS = [
    "185.220.101.5",    # Tor exit node (Russia)
    "45.154.255.82",    # Ukraine
    "198.51.100.42",    # US (Test range)
    "103.152.220.14",   # China
    "91.240.118.172",   # Russia
    "89.248.165.150",   # Russia
    "194.36.191.225",   # Germany
    "217.182.143.207",  # Ukraine
    "93.184.216.34",    # US
    "203.0.113.50",     # Documentation range
    "141.98.10.32",     # Netherlands
    "159.89.49.182",    # Singapore
]

# Realistic attack payloads
PAYLOADS = {
    "telnet": [
        "admin\r\npassword\r\n",
        "root\r\ntoor\r\n",
        "admin\r\nadmin\r\n",
        "enable\r\ncat /etc/passwd\r\n",
        "shell\r\nsh\r\nuname -a\r\n"
    ],
    "ssh": [
        "SSH-2.0-libssh_0.9.0\r\n",
        "SSH-2.0-OpenSSH_7.4\r\n",
        "SSH-2.0-PuTTY_Release_0.70\r\n"
    ],
    "http": [
        "GET /admin/config.php HTTP/1.1\r\nHost: router\r\nUser-Agent: Nikto/2.1.6\r\n\r\n",
        "GET /.env HTTP/1.1\r\nHost: target\r\n\r\n",
        "GET /wp-admin/ HTTP/1.1\r\nHost: site\r\n\r\n",
        "POST /cgi-bin/login.cgi HTTP/1.1\r\nContent-Length: 50\r\n\r\nusername=admin&password=admin",
        "GET /../../../etc/passwd HTTP/1.1\r\n\r\n"
    ],
    "ftp": [
        "USER anonymous\r\nPASS guest@evil.io\r\nLIST\r\n",
        "USER admin\r\nPASS admin\r\nSYST\r\n",
        "USER ftp\r\nPASS ftp\r\nPWD\r\n"
    ]
}


class VirtualESP32:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0)
        self.registered = False
        self.online = True
        self.uptime = 0
        
    async def register_device(self):
        """Register virtual ESP32 with backend"""
        payload = {
            "device_id": DEVICE_ID,
            "hostname": "cyber-eye-virtual-honeypot",
            "firmware_version": "1.0.0-VIRTUAL",
            "ip": "192.168.1.150",
            "mac": "AA:BB:CC:DD:EE:FF",
            "chip_type": "ESP32-WROOM-32-VIRTUAL"
        }
        
        try:
            response = await self.client.post(
                f"{BACKEND_URL}/device/register",
                json=payload,
                headers={"Authorization": f"Bearer {API_KEY}"}
            )
            if response.status_code in [200, 201]:
                self.registered = True
                print(f"✓ Device registered: {DEVICE_ID}")
                return True
            else:
                print(f"✗ Registration failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Registration error: {e}")
            return False
    
    async def send_heartbeat(self):
        """Send device heartbeat"""
        payload = {
            "device_id": DEVICE_ID,
            "free_heap": random.randint(120000, 180000),
            "wifi_rssi": random.randint(-65, -35),
            "uptime_sec": self.uptime,
            "ip": "192.168.1.150"
        }
        
        try:
            response = await self.client.post(
                f"{BACKEND_URL}/device/heartbeat",
                json=payload,
                headers={"Authorization": f"Bearer {API_KEY}"}
            )
            if response.status_code == 200:
                print(f"♥ Heartbeat sent (uptime: {self.uptime}s)")
                return True
        except Exception as e:
            print(f"✗ Heartbeat error: {e}")
            return False
    
    async def send_attack_event(self):
        """Generate and send realistic honeypot attack event"""
        service = random.choice(SERVICES)
        attacker_ip = random.choice(ATTACKER_IPS)
        payload = random.choice(PAYLOADS[service])
        
        event = {
            "device": DEVICE_ID,
            "service": service,
            "ip": attacker_ip,
            "port": PORTS[service],
            "protocol": "tcp",
            "payload": payload,
            "bytes_in": random.randint(40, 500),
            "bytes_out": random.randint(100, 2000)
        }
        
        try:
            response = await self.client.post(
                f"{BACKEND_URL}/api/event",
                json=event,
                headers={"Authorization": f"Bearer {API_KEY}"}
            )
            if response.status_code in [200, 201]:
                print(f"⚡ Attack logged: {service.upper()} from {attacker_ip}")
                return True
            else:
                print(f"✗ Event failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Event error: {e}")
            return False
    
    async def run(self):
        """Main loop - simulate ESP32 honeypot behavior"""
        print("╔═══════════════════════════════════════════════════════╗")
        print("║         CYBER-EYE Virtual ESP32 Honeypot            ║")
        print("╚═══════════════════════════════════════════════════════╝")
        print()
        
        # Register device
        while not self.registered:
            print("→ Registering device...")
            if await self.register_device():
                break
            print("  Retrying in 5 seconds...")
            await asyncio.sleep(5)
        
        print()
        print("✓ Virtual ESP32 online and operational!")
        print("✓ Simulating honeypot attack detection...")
        print()
        print("Press Ctrl+C to stop")
        print("─" * 60)
        print()
        
        heartbeat_counter = 0
        
        try:
            while True:
                # Send heartbeat every 30 seconds
                heartbeat_counter += 1
                if heartbeat_counter >= 6:  # 6 * 5sec = 30sec
                    await self.send_heartbeat()
                    heartbeat_counter = 0
                    self.uptime += 30
                
                # Generate attack event
                await self.send_attack_event()
                
                # Random delay between attacks (5-15 seconds)
                delay = random.uniform(5, 15)
                await asyncio.sleep(delay)
                
        except KeyboardInterrupt:
            print()
            print("─" * 60)
            print("✓ Virtual ESP32 stopped")
            await self.client.aclose()


async def main():
    esp32 = VirtualESP32()
    await esp32.run()


if __name__ == "__main__":
    asyncio.run(main())
