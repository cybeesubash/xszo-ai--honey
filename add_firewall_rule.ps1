# Add Windows Firewall rule for CYBER-EYE Backend
# This script requires administrator privileges

$ruleName = "CYBER-EYE Backend Port 8000"
$port = 8000

# Check if rule already exists
$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "Firewall rule already exists: $ruleName" -ForegroundColor Green
    Write-Host "Removing old rule and creating new one..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName $ruleName
}

# Create new firewall rule
try {
    New-NetFirewallRule -DisplayName $ruleName `
        -Direction Inbound `
        -LocalPort $port `
        -Protocol TCP `
        -Action Allow `
        -Profile Any `
        -Enabled True
    
    Write-Host "SUCCESS! Firewall rule created: $ruleName" -ForegroundColor Green
    Write-Host "Port $port is now open for inbound TCP connections" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create firewall rule" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
