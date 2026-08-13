# Test ESP32 Connection to Backend
Write-Host "=== CYBER-EYE ESP32 Connection Test ===" -ForegroundColor Cyan
Write-Host ""

$backendIP = "192.168.1.100"
$backendPort = 8000
$backendURL = "http://${backendIP}:${backendPort}"

# Test 1: Check backend health
Write-Host "[1/5] Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendURL/health" -Method Get -TimeoutSec 5
    Write-Host "  OK Backend is ONLINE: $($response.service)" -ForegroundColor Green
} catch {
    Write-Host "  ERROR Backend OFFLINE or unreachable!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check if port 8000 is listening
Write-Host "[2/5] Checking if port 8000 is open..." -ForegroundColor Yellow
$listening = netstat -an | Select-String "0.0.0.0:8000.*LISTENING"
if ($listening) {
    Write-Host "  OK Port 8000 is LISTENING on all interfaces" -ForegroundColor Green
} else {
    Write-Host "  ERROR Port 8000 is NOT listening!" -ForegroundColor Red
}

# Test 3: Check current devices
Write-Host "[3/5] Checking registered devices..." -ForegroundColor Yellow
try {
    $devices = Invoke-RestMethod -Uri "$backendURL/devices" -Method Get -TimeoutSec 5
    if ($devices.Count -gt 0) {
        Write-Host "  OK Found $($devices.Count) device(s) registered:" -ForegroundColor Green
        foreach ($dev in $devices) {
            Write-Host "    - Device ID: $($dev.device_id)" -ForegroundColor Cyan
            Write-Host "      IP: $($dev.ip)" -ForegroundColor Cyan
            Write-Host "      Online: $($dev.online)" -ForegroundColor $(if ($dev.online) { "Green" } else { "Red" })
        }
    } else {
        Write-Host "  WARNING No devices registered yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR Failed to get devices!" -ForegroundColor Red
}

# Test 4: Scan network for ESP32
Write-Host "[4/5] Scanning network for ESP32..." -ForegroundColor Yellow
Write-Host "  Scanning 192.168.1.101-120..." -ForegroundColor Gray
$foundDevices = @()
101..120 | ForEach-Object {
    $ip = "192.168.1.$_"
    if (Test-Connection -ComputerName $ip -Count 1 -Quiet -TimeoutSeconds 1) {
        $foundDevices += $ip
    }
}

if ($foundDevices.Count -gt 0) {
    Write-Host "  OK Found $($foundDevices.Count) active device(s) on network:" -ForegroundColor Green
    $foundDevices | ForEach-Object { Write-Host "    - $_" -ForegroundColor Cyan }
} else {
    Write-Host "  WARNING No devices found in range 192.168.1.101-120" -ForegroundColor Yellow
}

# Test 5: Check Windows Firewall status
Write-Host "[5/5] Checking Windows Firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "*CYBER-EYE*" -ErrorAction SilentlyContinue
if ($firewallRule) {
    Write-Host "  OK Firewall rule exists: $($firewallRule.DisplayName)" -ForegroundColor Green
    Write-Host "    Enabled: $($firewallRule.Enabled)" -ForegroundColor $(if ($firewallRule.Enabled -eq 'True') { "Green" } else { "Red" })
} else {
    Write-Host "  WARNING No CYBER-EYE firewall rule found" -ForegroundColor Yellow
    Write-Host "    Run add_firewall_rule.ps1 as Administrator to create it" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If no devices found, check ESP32 Serial Monitor (Arduino IDE, COM7, 115200 baud)" -ForegroundColor Gray
Write-Host "2. Look for WiFi connection errors or backend registration failures" -ForegroundColor Gray
Write-Host "3. Verify ESP32 config: WiFi SSID (2.4GHz), Password, Backend URL" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
