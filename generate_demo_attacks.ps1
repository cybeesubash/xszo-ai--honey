# Generate continuous demo attacks for testing dashboard
$backendURL = "http://192.168.1.100:8000"

Write-Host "=== CYBER-EYE Demo Attack Generator ===" -ForegroundColor Cyan
Write-Host "Generating continuous attack events..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

$count = 0

while ($true) {
    try {
        $response = Invoke-RestMethod -Uri "$backendURL/api/demo/event" -Method Post -TimeoutSec 5
        $count++
        Write-Host "[$count] Attack generated: $($response.service) from $($response.ip)" -ForegroundColor Green
        Start-Sleep -Seconds 3
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
}
