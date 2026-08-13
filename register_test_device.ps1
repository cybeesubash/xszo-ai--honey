# Manually register a test ESP32 device to backend
$backendURL = "http://192.168.1.100:8000"
$apiKey = "honeypot-secret-soc-key-2026"

Write-Host "=== Registering Test ESP32 Device ===" -ForegroundColor Cyan
Write-Host ""

# Device registration payload
$deviceData = @{
    device_id = "ESP32-TEST-01"
    hostname = "cyber-eye-honeypot-test"
    firmware_version = "1.0.0"
    ip = "192.168.1.150"
    mac = "AA:BB:CC:DD:EE:FF"
    chip_type = "ESP32-WROOM-32"
} | ConvertTo-Json

Write-Host "Registering device..." -ForegroundColor Yellow
Write-Host "Device ID: ESP32-TEST-01" -ForegroundColor Cyan
Write-Host "IP: 192.168.1.150" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$backendURL/device/register" `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{"Authorization" = "Bearer $apiKey"} `
        -Body $deviceData
    
    Write-Host "SUCCESS! Device registered:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json) -ForegroundColor Gray
    Write-Host ""
    Write-Host "Now sending heartbeat..." -ForegroundColor Yellow
    
    # Send heartbeat
    $heartbeatData = @{
        device_id = "ESP32-TEST-01"
        free_heap = 150000
        wifi_rssi = -45
        uptime_sec = 120
        ip = "192.168.1.150"
    } | ConvertTo-Json
    
    $hbResponse = Invoke-RestMethod -Uri "$backendURL/device/heartbeat" `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{"Authorization" = "Bearer $apiKey"} `
        -Body $heartbeatData
    
    Write-Host "SUCCESS! Heartbeat sent" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test device is now visible in dashboard!" -ForegroundColor Green
    Write-Host "Open: http://127.0.0.1:5173" -ForegroundColor Cyan
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
