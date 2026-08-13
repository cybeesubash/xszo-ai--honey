# Advanced ESP32 Network Finder and Diagnostic Tool
Write-Host "=== CYBER-EYE ESP32 Network Scanner ===" -ForegroundColor Cyan
Write-Host ""

$backendIP = "192.168.1.100"
$backendPort = 8000

# Step 1: Check if HoneyBot_Setup WiFi is still visible
Write-Host "[1/6] Checking for HoneyBot_Setup WiFi..." -ForegroundColor Yellow
try {
    $networks = netsh wlan show networks mode=bssid
    $honeyBotVisible = $networks | Select-String "HoneyBot_Setup"
    
    if ($honeyBotVisible) {
        Write-Host "  FOUND: HoneyBot_Setup WiFi is VISIBLE!" -ForegroundColor Red
        Write-Host "  This means ESP32 is still in Config Portal mode" -ForegroundColor Red
        Write-Host ""
        Write-Host "  SOLUTION:" -ForegroundColor Yellow
        Write-Host "  1. Connect to HoneyBot_Setup WiFi" -ForegroundColor Gray
        Write-Host "  2. Open browser: http://192.168.4.1" -ForegroundColor Gray
        Write-Host "  3. Enter WiFi credentials and backend URL" -ForegroundColor Gray
        Write-Host "  4. Backend URL: http://${backendIP}:${backendPort}" -ForegroundColor Gray
        Write-Host "  5. API Key: honeypot-secret-soc-key-2026" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    } else {
        Write-Host "  OK: HoneyBot_Setup WiFi not found (ESP32 should be connected to home WiFi)" -ForegroundColor Green
    }
} catch {
    Write-Host "  WARNING: Could not check WiFi networks" -ForegroundColor Yellow
}

# Step 2: Check backend status
Write-Host "[2/6] Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://${backendIP}:${backendPort}/health" -Method Get -TimeoutSec 5
    Write-Host "  OK: Backend is ONLINE" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Backend is OFFLINE!" -ForegroundColor Red
    Write-Host "  Start backend first: npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Step 3: Check registered devices
Write-Host "[3/6] Checking registered devices..." -ForegroundColor Yellow
try {
    $devices = Invoke-RestMethod -Uri "http://${backendIP}:${backendPort}/devices" -Method Get -TimeoutSec 5
    if ($devices.Count -gt 0) {
        Write-Host "  OK: Found $($devices.Count) device(s):" -ForegroundColor Green
        foreach ($dev in $devices) {
            Write-Host "    Device ID: $($dev.device_id)" -ForegroundColor Cyan
            Write-Host "    IP: $($dev.ip)" -ForegroundColor Cyan
            Write-Host "    Hostname: $($dev.hostname)" -ForegroundColor Cyan
            Write-Host "    Online: $($dev.online)" -ForegroundColor $(if ($dev.online) { "Green" } else { "Red" })
            Write-Host "    Last Seen: $($dev.last_seen)" -ForegroundColor Gray
            Write-Host ""
        }
        Write-Host "ESP32 is already registered! Check dashboard." -ForegroundColor Green
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    } else {
        Write-Host "  WARNING: No devices registered yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR: Could not check devices" -ForegroundColor Red
}

# Step 4: Scan network for ESP32 (common ports)
Write-Host "[4/6] Scanning network for ESP32 devices..." -ForegroundColor Yellow
Write-Host "  Scanning 192.168.1.1-254 (this may take 1-2 minutes)..." -ForegroundColor Gray

$foundIPs = @()
$subnet = "192.168.1"

# Quick ping scan
1..254 | ForEach-Object {
    $ip = "$subnet.$_"
    if (Test-Connection -ComputerName $ip -Count 1 -Quiet) {
        $foundIPs += $ip
        Write-Host "  . Found active device: $ip" -ForegroundColor Cyan
    }
}

if ($foundIPs.Count -eq 0) {
    Write-Host "  ERROR: No active devices found on network!" -ForegroundColor Red
} else {
    Write-Host "  OK: Found $($foundIPs.Count) active device(s)" -ForegroundColor Green
}

# Step 5: Check ARP table for ESP32 MAC addresses
Write-Host "[5/6] Checking ARP table for ESP32 devices..." -ForegroundColor Yellow
$arpTable = arp -a | Select-String "$subnet\."
if ($arpTable) {
    Write-Host "  Network devices in ARP table:" -ForegroundColor Cyan
    $arpTable | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
} else {
    Write-Host "  WARNING: No devices in ARP table" -ForegroundColor Yellow
}

# Step 6: Test ESP32 common ports
Write-Host "[6/6] Testing ESP32 honeypot ports on found IPs..." -ForegroundColor Yellow
$esp32Ports = @(21, 22, 23, 80)  # FTP, SSH, Telnet, HTTP

foreach ($ip in $foundIPs) {
    if ($ip -eq $backendIP) { continue }  # Skip backend server
    
    $openPorts = @()
    foreach ($port in $esp32Ports) {
        $connection = Test-NetConnection -ComputerName $ip -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            $openPorts += $port
        }
    }
    
    if ($openPorts.Count -gt 0) {
        Write-Host "  POSSIBLE ESP32 FOUND: $ip" -ForegroundColor Green
        Write-Host "    Open ports: $($openPorts -join ', ')" -ForegroundColor Cyan
        Write-Host "    Try: http://$ip in browser" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Diagnostic Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If ESP32 still not found, possible issues:" -ForegroundColor Yellow
Write-Host "  1. ESP32 WiFi connection failed (wrong password, 5GHz WiFi)" -ForegroundColor Gray
Write-Host "  2. ESP32 still in config portal mode (connect to HoneyBot_Setup)" -ForegroundColor Gray
Write-Host "  3. ESP32 not powered on or crashed" -ForegroundColor Gray
Write-Host "  4. ESP32 on different subnet" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Get a data cable and check Serial Monitor" -ForegroundColor Gray
Write-Host "  2. Press RESET button on ESP32 and run this script again" -ForegroundColor Gray
Write-Host "  3. Re-upload firmware with correct WiFi settings" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
