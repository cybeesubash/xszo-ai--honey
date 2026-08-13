# Quick ESP32 Honeypot Scanner
Write-Host "Scanning for ESP32 Honeypot..." -ForegroundColor Cyan

# Test common ESP32 IPs on your network
$testIPs = @(
    "192.168.1.123",
    "192.168.1.124",
    "192.168.1.125",
    "192.168.1.100",
    "192.168.1.101",
    "192.168.1.102",
    "192.168.1.50",
    "192.168.1.51"
)

$found = $false

foreach ($ip in $testIPs) {
    Write-Host "Testing $ip..." -NoNewline
    
    try {
        $test = Test-NetConnection -ComputerName $ip -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        
        if ($test) {
            Write-Host " FOUND!" -ForegroundColor Green
            Write-Host "  ESP32 IP: $ip" -ForegroundColor Cyan
            Write-Host "  Test URL: http://$ip/" -ForegroundColor White
            $found = $true
            break
        } else {
            Write-Host " No" -ForegroundColor Gray
        }
    } catch {
        Write-Host " No" -ForegroundColor Gray
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "ESP32 not found on common IPs." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Check Arduino Serial Monitor (COM7, 115200 baud)" -ForegroundColor White
    Write-Host "2. Look for line: 'Connected - IP: 192.168.1.XXX'" -ForegroundColor White
    Write-Host "3. Or check WiFi for 'HoneyBot_Setup' network" -ForegroundColor White
}
