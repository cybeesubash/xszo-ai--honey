# Clear all fake/demo attack data from CYBER-EYE backend
$backendURL = "http://localhost:8000"
$apiKey = "honeypot-secret-soc-key-2026"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🗑️ CYBER-EYE - CLEAR FAKE ATTACK DATA 🗑️      ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get current stats
Write-Host "📊 Checking current data..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$backendURL/stats" -Method Get -TimeoutSec 5
    Write-Host "   Current attacks: $($stats.total_events)" -ForegroundColor Cyan
    Write-Host "   Unique IPs: $($stats.unique_ips)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($stats.total_events -eq 0) {
        Write-Host "✅ No attacks to clear. Database is already empty." -ForegroundColor Green
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    }
} catch {
    Write-Host "❌ Error: Backend not reachable!" -ForegroundColor Red
    Write-Host "   Make sure backend is running: npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Confirm before clearing
Write-Host "⚠️  This will remove ALL attack data (demo & real)!" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Type 'yes' to confirm"

if ($confirmation -ne 'yes') {
    Write-Host ""
    Write-Host "❌ Cancelled. No data was removed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Clear data
Write-Host ""
Write-Host "🔄 Clearing all attack data..." -ForegroundColor Magenta

try {
    $result = Invoke-RestMethod `
        -Uri "$backendURL/api/clear" `
        -Method Post `
        -Headers @{"Authorization" = "Bearer $apiKey"} `
        -TimeoutSec 5
    
    Write-Host ""
    Write-Host "✅ CLEAR COMPLETED!" -ForegroundColor Green
    Write-Host "   Attacks removed: $($result.attacks_removed)" -ForegroundColor Yellow
    Write-Host "   Devices removed: $($result.devices_removed)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "✅ Dashboard will now show clean state" -ForegroundColor Green
    Write-Host "   Refresh: http://127.0.0.1:5173" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ Error clearing data: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
