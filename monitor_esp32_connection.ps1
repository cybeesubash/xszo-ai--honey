# Monitor ESP32 connection status in real-time
$backendURL = "http://192.168.1.100:8000"

Write-Host "=== ESP32 Connection Monitor ===" -ForegroundColor Cyan
Write-Host "Monitoring ESP32 registration status..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

$lastDeviceCount = -1
$iteration = 0

while ($true) {
    $iteration++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    # Check if HoneyBot_Setup is visible (means ESP32 still in config mode)
    $honeyBotVisible = $false
    try {
        $networks = netsh wlan show networks 2>$null | Select-String "HoneyBot_Setup"
        $honeyBotVisible = $networks -ne $null
    } catch {}
    
    # Check registered devices
    try {
        $devices = Invoke-RestMethod -Uri "$backendURL/devices" -Method Get -TimeoutSec 3
        $deviceCount = $devices.Count
        
        if ($deviceCount -ne $lastDeviceCount) {
            Write-Host "[$timestamp] Device count changed: $deviceCount device(s)" -ForegroundColor Green
            
            if ($deviceCount -gt 0) {
                foreach ($device in $devices) {
                    $onlineStatus = if ($device.online) { "ONLINE" } else { "OFFLINE" }
                    $statusColor = if ($device.online) { "Green" } else { "Yellow" }
                    Write-Host "  → Device: $($device.device_id)" -ForegroundColor Cyan
                    Write-Host "    IP: $($device.ip)" -ForegroundColor Gray
                    Write-Host "    Status: $onlineStatus" -ForegroundColor $statusColor
                    Write-Host "    Last Seen: $($device.last_seen)" -ForegroundColor Gray
                }
                Write-Host ""
                Write-Host "🎉 ESP32 SUCCESSFULLY CONNECTED! 🎉" -ForegroundColor Green
                Write-Host "Dashboard: http://127.0.0.1:5173" -ForegroundColor Cyan
                break
            }
            $lastDeviceCount = $deviceCount
        }
        
        if ($honeyBotVisible) {
            Write-Host "[$timestamp] ESP32 Config Portal ACTIVE (HoneyBot_Setup visible)" -ForegroundColor Yellow
            Write-Host "  → Connect to HoneyBot_Setup WiFi" -ForegroundColor Gray
            Write-Host "  → Open browser: http://192.168.4.1" -ForegroundColor Gray
            Write-Host "  → Configure WiFi settings" -ForegroundColor Gray
        } else {
            if ($deviceCount -eq 0) {
                Write-Host "[$timestamp] ESP32 connecting to WiFi or registering..." -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "[$timestamp] Backend not reachable" -ForegroundColor Red
        Start-Sleep -Seconds 10
        continue
    }
    
    # Show progress dots
    if ($iteration % 4 -eq 0) { Write-Host "." -NoNewline -ForegroundColor Gray }
    
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "Monitoring stopped." -ForegroundColor Gray