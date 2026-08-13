# Complete Honeypot Test Suite
param(
    [string]$esp32_ip = "192.168.1.123"
)

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  CYBER-EYE Honeypot Test Suite            ║" -ForegroundColor Cyan
Write-Host "║  Target: $esp32_ip                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: HTTP
Write-Host "[1/4] Testing HTTP (Port 80)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$esp32_ip/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ HTTP: Connected" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  HTTP: No response (might still be captured)" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Test 2: FTP
Write-Host "[2/4] Testing FTP (Port 21)..." -ForegroundColor Yellow
try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect($esp32_ip, 21)
    $stream = $client.GetStream()
    $user = [System.Text.Encoding]::ASCII.GetBytes("USER admin`r`n")
    $stream.Write($user, 0, $user.Length)
    Start-Sleep -Milliseconds 500
    $pass = [System.Text.Encoding]::ASCII.GetBytes("PASS admin123`r`n")
    $stream.Write($pass, 0, $pass.Length)
    $stream.Close()
    $client.Close()
    Write-Host "  ✅ FTP: Attack sent" -ForegroundColor Green
} catch {
    Write-Host "  ❌ FTP: Error - $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 3: SSH
Write-Host "[3/4] Testing SSH (Port 22)..." -ForegroundColor Yellow
try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect($esp32_ip, 22)
    $stream = $client.GetStream()
    $creds = [System.Text.Encoding]::ASCII.GetBytes("root`nadmin123`n")
    $stream.Write($creds, 0, $creds.Length)
    $stream.Close()
    $client.Close()
    Write-Host "  ✅ SSH: Attack sent" -ForegroundColor Green
} catch {
    Write-Host "  ❌ SSH: Error - $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 4: Telnet
Write-Host "[4/4] Testing Telnet (Port 23)..." -ForegroundColor Yellow
try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect($esp32_ip, 23)
    $stream = $client.GetStream()
    $username = [System.Text.Encoding]::ASCII.GetBytes("admin`n")
    $stream.Write($username, 0, $username.Length)
    Start-Sleep -Milliseconds 500
    $password = [System.Text.Encoding]::ASCII.GetBytes("password123`n")
    $stream.Write($password, 0, $password.Length)
    $stream.Close()
    $client.Close()
    Write-Host "  ✅ Telnet: Attack sent" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Telnet: Error - $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Test Complete!                            ║" -ForegroundColor Green
Write-Host "║  Check dashboard: http://localhost:5173/   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Expected in dashboard:" -ForegroundColor Cyan
Write-Host "  • 4 new attack events" -ForegroundColor White
Write-Host "  • AI analysis for each attack" -ForegroundColor White
Write-Host "  • Attacker IP (your computer)" -ForegroundColor White
Write-Host "  • Service types: HTTP, FTP, SSH, Telnet" -ForegroundColor White
