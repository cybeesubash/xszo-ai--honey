# ESP32 CONNECTION TROUBLESHOOTING — CYBER-EYE HONEYPOT

## 🔴 CURRENT STATUS (from diagnostics)

### ✅ WORKING:
- Backend server ONLINE at `http://192.168.1.100:8000`
- API key configured correctly: `honeypot-secret-soc-key-2026`
- Computer IP: `192.168.1.100` (correct network)
- Firewall rules: OK
- Config portal NOT visible (ESP32 tried to connect)

### ❌ NOT WORKING:
- **WiFi "subash07" NOT VISIBLE from Windows PC**
- **NO ESP32 devices registered in backend**
- ESP32 not showing in backend `/devices` endpoint
- No serial USB connection available for debugging

---

## 🎯 ROOT CAUSE

Your ESP32 is **configured correctly** but **cannot connect to WiFi "subash07"** for one of these reasons:

### 1. WiFi Router Issue (MOST LIKELY)
- ✅ Router may be turned OFF or restarting
- ✅ WiFi "subash07" may be temporarily disabled
- ✅ Router may have changed channel/frequency
- ✅ 5GHz network enabled but ESP32 needs 2.4GHz

### 2. WiFi Configuration Error
- Wrong WiFi password entered in config portal
- SSID typo ("subash07" vs "Subash07" - case sensitive!)
- Hidden SSID enabled (ESP32 struggles with hidden networks)

### 3. ESP32 Hardware Issue
- ESP32 needs physical RESET after configuration
- Power supply insufficient (use quality USB cable)
- ESP32 antenna damaged or loose

### 4. Network Distance/Interference
- ESP32 too far from WiFi router
- 2.4GHz interference from microwave/Bluetooth
- Metal enclosure blocking signal

---

## 🔧 SOLUTIONS (Try in this order)

### SOLUTION 1: Check Your WiFi Router ⭐ START HERE
```
1. Make sure your WiFi router is powered ON
2. Check if "subash07" WiFi is enabled and broadcasting
3. Verify it's on 2.4GHz channel (1-13), NOT 5GHz
4. Check router admin panel DHCP leases for ESP32
5. Restart router if needed
```

### SOLUTION 2: Reconfigure ESP32
```
1. Power ON ESP32 (should show "HoneyBot_Setup" WiFi)
2. Connect PC to "HoneyBot_Setup" (no password)
3. Open browser: http://192.168.4.1
4. Enter configuration:
   - WiFi SSID: subash07
   - WiFi Password: [your exact password]
   - Backend URL: http://192.168.1.100:8000
   - API Key: honeypot-secret-soc-key-2026
5. Click SAVE
6. **PHYSICALLY PRESS THE RESET BUTTON ON ESP32**
7. Wait 30 seconds
8. Run diagnostics again: .\esp32_debug_fixed.ps1
```

### SOLUTION 3: Use Mobile Hotspot (Quick Test)
```
If you have an Android phone with 2.4GHz hotspot:
1. Enable mobile hotspot named "subash07" with same password
2. ESP32 should connect immediately
3. Check backend: http://192.168.1.100:8000/devices
4. If this works, problem is your main WiFi router
```

### SOLUTION 4: Create Alternative WiFi Network
```
1. Create NEW 2.4GHz WiFi hotspot on your PC:
   - Name: HoneyBot-Test
   - Password: honeypot123
   - Frequency: 2.4GHz ONLY
2. Reconfigure ESP32 with this network
3. Update backend URL if needed
```

### SOLUTION 5: Check ESP32 Serial Logs (Requires USB cable)
```
1. Connect ESP32 to PC via USB
2. Run: .\read_esp32_serial.ps1
3. Look for these messages:
   ✅ "WiFi connected"
   ✅ "IP: 192.168.1.xxx"
   ✅ "Device registered"
   ❌ "WiFi connection failed"
   ❌ "Connection timeout"
```

---

## 📊 VERIFY FIX

After trying solutions, run diagnostics:
```powershell
.\esp32_debug_fixed.ps1
```

### Expected output when working:
```
✅ Backend ONLINE
✅ WiFi 'subash07' is visible
✅ 1 device(s) registered: [ONLINE] ESP32-CYBER-EYE-xxx
```

### Check dashboard:
```
1. Open: http://localhost:5173
2. Go to "Devices" panel (bottom left)
3. You should see: ESP32-CYBER-EYE-xxx [ONLINE]
```

---

## 🛠️ AVAILABLE SCRIPTS

| Script | Purpose |
|--------|---------|
| `esp32_debug_fixed.ps1` | Full diagnostics (run this first) |
| `read_esp32_serial.ps1` | Read ESP32 serial output (needs USB) |
| `register_esp32_manual.ps1` | Manually register device (testing only) |
| `find_esp32_advanced.ps1` | Find ESP32 on network |

---

## 💡 QUICK CHECKS

### Is backend running?
```powershell
Invoke-RestMethod -Uri "http://192.168.1.100:8000/health"
```
Should return: `{"status": "ok", "engine": "OpenRouter..."}`

### Is ESP32 on network?
```powershell
Test-NetConnection -ComputerName 192.168.1.200 -Port 80
```
(Replace 192.168.1.200 with ESP32's IP from router)

### Check registered devices:
```powershell
Invoke-RestMethod -Uri "http://192.168.1.100:8000/devices"
```
Should return device list (empty if not connected)

---

## 🎓 UNDERSTANDING THE FLOW

```
ESP32 Boot Sequence:
1. Power ON
2. Load WiFi config from NVS memory
3. Try connecting to "subash07"
4. If SUCCESS:
   - Get IP from DHCP (e.g., 192.168.1.200)
   - POST to http://192.168.1.100:8000/device/register
   - Start heartbeat (every 30 seconds)
   - Start honeypot services (HTTP, FTP, SSH, Telnet)
5. If FAIL:
   - Start config portal "HoneyBot_Setup"
   - Wait for user to reconfigure
```

**Your ESP32 is stuck at step 3** because WiFi "subash07" is not reachable.

---

## 📞 STILL NOT WORKING?

If none of the solutions work:

1. **Check router logs** for connection attempts from ESP32 MAC address
2. **Try different ESP32 board** (hardware failure possible)
3. **Use Ethernet adapter** instead of WiFi (if available)
4. **Contact router manufacturer** (some routers block IoT devices)

---

## ✅ SUCCESS INDICATORS

When working properly, you'll see:
- ✅ Backend `/devices` endpoint shows ESP32
- ✅ Dashboard "Devices" panel shows [ONLINE] status
- ✅ Real attacks trigger alerts
- ✅ Heartbeat updates every 30 seconds
- ✅ No "HoneyBot_Setup" WiFi visible

---

**Generated by CYBER-EYE Diagnostics**  
**Next: Run `.\esp32_debug_fixed.ps1` after each change**
