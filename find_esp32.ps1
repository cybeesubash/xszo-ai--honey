# Find ESP32 Honeypot on Network
Write-Host "🔍 Scanning network for ESP32 honeypot..." -ForegroundColor Cyan
Write-Host ""

# Get your network range
$ipConfig = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}
$myIP = $ipConfig.IPAddress
$subnet = $myIP.Substring(0, $myIP.LastIndexOf('.'))

Write-Host "Your IP: $myIP" -ForegroundColor Yellow
$range = "$subnet.1-254"
Write-Host "Scanning: $range" -ForegroundColor Yellow
Write-Host ""

$found = @()

# Scan common ESP32 ports (22, 23, 80)
1..254 | ForEach-Object {
    $ip = "$subnet.$_"
    $jobs = @()
    
    # Test port 80 (HTTP)
    $jobs += Test-NetConnection -ComputerName $ip -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue
    
    if ($jobs -contains $true) {
        Write-Host "✅ Found device at: $ip (port 80 open)" -ForegroundColor Green
        
        # Try to get honeypot response
        try {
            $response = Invoke-WebRequest -Uri "http://$ip/" -TimeoutSec 2 -ErrorAction Stop
            Write-Host "   Response: $($response.StatusCode)" -ForegroundColor Gray
            $found += $ip
        } catch {}
    }
}

Write-Host ""
if ($found.Count -gt 0) {
    Write-Host "╔════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ESP32 Honeypot Found!             ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    $found | ForEach-Object {
        Write-Host "  IP: $_" -ForegroundColor Cyan
        Write-Host "  Test: http://$_/" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "❌ No ESP32 found. Check:" -ForegroundColor Red
    Write-Host "  1. ESP32 powered on?" -ForegroundColor Yellow
    Write-Host "  2. Connected to same WiFi?" -ForegroundColor Yellow
    Write-Host "  3. Serial Monitor shows 'Services active'?" -ForegroundColor Yellow
}
