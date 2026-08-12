# ESP32 Firmware Installation Fix

## Problem
ESP32 board version 3.3.11 la WiFi classes work aagala.

## ✅ Solution: Downgrade to ESP32 Board 2.0.17

### Step 1: Arduino IDE-la Board Manager Open Pannunga

1. **Tools → Board → Boards Manager** click pannunga
2. Search box-la "esp32" type pannunga
3. "esp32 by Espressif Systems" **currently installed** kaanum (3.3.11)

### Step 2: Downgrade pannunga

1. Dropdown arrow click pannunga version number kooda
2. **Version 2.0.17** select pannunga (or any 2.0.x version)
3. **Install** click pannunga
4. Wait for download and install complete

### Step 3: Board Settings

**Tools menu-la ippadi set pannunga:**

```
Board: "ESP32 Dev Module"
Upload Speed: "921600"
CPU Frequency: "240MHz"
Flash Frequency: "80MHz"
Flash Mode: "QIO"
Flash Size: "4MB (32Mb)"
Partition Scheme: "Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)"
Core Debug Level: "None"
PSRAM: "Disabled"
```

### Step 4: Compile & Upload

1. Arduino IDE **close** panni **reopen** pannunga
2. **File → Open** → `honeypot.ino`
3. **Verify** ✅ (compile check)
4. **Upload** ➡️ (ESP32-ku flash)

---

## Alternative: Fix for ESP32 v3.x (if downgrade panna mudiyala)

If neenga ESP32 3.x-layum work panna venumna:

### Changes needed:

1. **WiFiServer** → **WiFiServer** (same, but include order different)
2. **WIFI_STA** → **WIFI_MODE_STA**
3. **WIFI_AP** → **WIFI_MODE_AP**

But easier solution: **Version 2.0.17 use pannunga** - stable and tested!

---

## Quick Check: Current Version

Arduino IDE-la:
1. Tools → Board → Boards Manager
2. Search "esp32"
3. Installed version parunga

**Should be: 2.0.17** (or any 2.0.x)
**Not: 3.x.x** (API changes iruku)

---

## After Successful Upload:

1. Serial Monitor open pannunga (115200 baud)
2. ESP32 WiFi AP mode start aarum
3. WiFi-la "HoneyBot_Setup" search pannunga
4. Connect aagi browser-la `http://192.168.4.1` ponga
5. Configuration pannunga!

Good luck! 🚀
