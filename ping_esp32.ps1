#!/usr/bin/env pwsh
# Ping ESP32 Devices on Network — CYBER-EYE HoneyBot

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ESP32 NETWORK SCANNER" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$baseIP = "192.168.1"
$startRange = 1
$endRange = 254

Write-Host "Scanning $baseIP.$startRange-$endRange for ESP32 devices..." -ForegroundColor Cyan
Write-Host "This may take 2-3 minutes..." -ForegroundColor Gray
Write-Host ""

$found = @()

# Quick ping sweep
1..$endRange | ForEach-Object -ThrottleLimit 50 -Parallel {
    $ip = "$using:baseIP.$_"
    $ping = Test-Connection -ComputerName $ip -Count 1 -Quiet -TimeoutSeconds 1
    
    if ($ping) {
        # Try to connect to ESP32 HTTP service (port 80)
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.ConnectAsync($ip, 80).Wait(1000) | Out-Null
            
            if ($tcp.Connected) {
                $tcp.Close()
                return [PSCustomObject]@{
                    IP = $ip
                    Port80 = $true
                }
            }
        } catch {
            # Not ESP32
        }
    }
} | ForEach-Object {
    if ($_) {
        $found += $_
        Write-Host "   ✅ Found device: $($_.IP) (Port 80 open)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   SCAN RESULTS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($found.Count -eq 0) {
    Write-Host "❌ No ESP32 devices found on network" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. ESP32 not powered ON" -ForegroundColor White
    Write-Host "2. ESP32 not connected to WiFi" -ForegroundColor White
    Write-Host "3. ESP32 on different subnet" -ForegroundColor White
    Write-Host "4. Firewall blocking ping" -ForegroundColor White
    Write-Host ""
    Write-Host "Try:" -ForegroundColor Cyan
    Write-Host "- Check router DHCP leases" -ForegroundColor White
    Write-Host "- Connect to HoneyBot_Setup WiFi for reconfiguration" -ForegroundColor White
    Write-Host "- Run .\esp32_debug_fixed.ps1 for full diagnostics" -ForegroundColor White
} else {
    Write-Host "✅ Found $($found.Count) potential ESP32 device(s):" -ForegroundColor Green
    Write-Host ""
    
    foreach ($device in $found) {
        Write-Host "   IP: $($device.IP)" -ForegroundColor Cyan
        Write-Host "   Testing honeypot services..." -ForegroundColor Gray
        
        # Test HTTP service
        try {
            $response = Invoke-WebRequest -Uri "http://$($device.IP)/" -TimeoutSec 2 -ErrorAction Stop
            Write-Host "   ✅ HTTP (port 80): ACTIVE" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  HTTP (port 80): REACHABLE but no response" -ForegroundColor Yellow
        }
        
        # Test if it's registered with backend
        try {
            $BACKEND_URL = "http://192.168.1.100:8000"
            $devices = Invoke-RestMethod -Uri "$BACKEND_URL/devices" -Method Get -TimeoutSec 2
            $registered = $devices | Where-Object { $_.ip -eq $device.IP }
            
            if ($registered) {
                Write-Host "   ✅ REGISTERED with backend as: $($registered.device_id)" -ForegroundColor Green
                Write-Host "   Status: $(if ($registered.online) {'[ONLINE]'} else {'[OFFLINE]'})" -ForegroundColor $(if ($registered.online) {'Green'} else {'Yellow'})
            } else {
                Write-Host "   ⚠️  NOT REGISTERED with backend" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ⚠️  Cannot verify backend registration" -ForegroundColor Yellow
        }
        
        Write-Host ""
    }
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Access ESP32 at: http://$($found[0].IP)" -ForegroundColor White
    Write-Host "2. Check dashboard: http://localhost:5173" -ForegroundColor White
    Write-Host "3. If not registered, run: .\register_esp32_manual.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
