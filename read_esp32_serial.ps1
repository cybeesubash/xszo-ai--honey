#!/usr/bin/env pwsh
# ESP32 Serial Monitor — CYBER-EYE HoneyBot
# Reads serial output from ESP32 to debug connection issues

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ESP32 SERIAL MONITOR" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Find ESP32 COM port
Write-Host "Detecting ESP32 COM port..." -ForegroundColor Cyan

$comPorts = Get-WmiObject Win32_SerialPort | Where-Object { $_.Description -match "(CP210|CH340|Silicon Labs|USB)" }

if ($comPorts.Count -eq 0) {
    Write-Host "❌ No ESP32 COM port found!" -ForegroundColor Red
    Write-Host "Make sure ESP32 is connected via USB" -ForegroundColor Yellow
    exit 1
}

$comPort = $comPorts[0].DeviceID
Write-Host "✅ Found ESP32 on $comPort" -ForegroundColor Green
Write-Host ""

Write-Host "Opening serial connection at 115200 baud..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray

try {
    # Create serial port object
    $port = New-Object System.IO.Ports.SerialPort $comPort, 115200, None, 8, One
    $port.ReadTimeout = 500
    $port.Open()
    
    Write-Host "[SERIAL MONITOR ACTIVE]" -ForegroundColor Green
    Write-Host ""
    
    # Read loop
    while ($true) {
        try {
            $line = $port.ReadLine()
            
            # Color code log messages
            if ($line -match "ERROR|FAILED") {
                Write-Host $line -ForegroundColor Red
            }
            elseif ($line -match "WARN") {
                Write-Host $line -ForegroundColor Yellow
            }
            elseif ($line -match "WiFi|CONNECTED|IP:") {
                Write-Host $line -ForegroundColor Green
            }
            elseif ($line -match "Device registered|Heartbeat|Event sent") {
                Write-Host $line -ForegroundColor Cyan
            }
            else {
                Write-Host $line -ForegroundColor White
            }
        }
        catch [System.TimeoutException] {
            # Timeout is normal when no data
            Start-Sleep -Milliseconds 100
        }
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Serial monitor error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Close Arduino IDE if open" -ForegroundColor White
    Write-Host "2. Unplug and replug ESP32" -ForegroundColor White
    Write-Host "3. Try different USB cable" -ForegroundColor White
}
finally {
    if ($port -and $port.IsOpen) {
        $port.Close()
        $port.Dispose()
    }
}
