#!/usr/bin/env pwsh
# Manually Register ESP32 Device — CYBER-EYE HoneyBot
# Use this if ESP32 is not auto-registering with backend

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   MANUAL ESP32 DEVICE REGISTRATION" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "http://192.168.1.100:8000"
$API_KEY = "honeypot-secret-soc-key-2026"

# Get device details from user
Write-Host "Enter ESP32 Details:" -ForegroundColor Green
Write-Host ""

$deviceId = Read-Host "Device ID (e.g., ESP32-CYBER-EYE-01)"
if ([string]::IsNullOrWhiteSpace($deviceId)) {
    $deviceId = "ESP32-CYBER-EYE-" + (Get-Random -Minimum 100 -Maximum 999)
    Write-Host "   Auto-generated: $deviceId" -ForegroundColor Yellow
}

$hostname = Read-Host "Hostname (default: cyber-eye-honeypot)"
if ([string]::IsNullOrWhiteSpace($hostname)) {
    $hostname = "cyber-eye-honeypot"
}

$firmware = Read-Host "Firmware Version (default: 1.0.0)"
if ([string]::IsNullOrWhiteSpace($firmware)) {
    $firmware = "1.0.0"
}

$deviceIp = Read-Host "ESP32 IP Address (check router DHCP)"
if ([string]::IsNullOrWhiteSpace($deviceIp)) {
    $deviceIp = "192.168.1.200"
    Write-Host "   Using default: $deviceIp" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Registering device..." -ForegroundColor Cyan

try {
    $headers = @{
        "Authorization" = "Bearer $API_KEY"
        "Content-Type" = "application/json"
    }
    
    $deviceData = @{
        device_id = $deviceId
        hostname = $hostname
        firmware_version = $firmware
        ip = $deviceIp
        mac = "AA:BB:CC:DD:EE:FF"
        chip_type = "ESP32-WROOM-32"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/device/register" -Method Post -Headers $headers -Body $deviceData -ContentType "application/json"
    
    Write-Host ""
    Write-Host "✅ Device Registered Successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Device ID: $deviceId" -ForegroundColor Cyan
    Write-Host "Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "IP: $deviceIp" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Check dashboard at http://localhost:5173 → Devices panel" -ForegroundColor Gray
    
} catch {
    Write-Host ""
    Write-Host "❌ Registration Failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure backend is running:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  ..\.venv\Scripts\python.exe main.py" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
