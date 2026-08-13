# Test SSH Attack Script
param(
    [string]$esp32_ip = "192.168.1.123"
)

Write-Host "🎯 Testing SSH honeypot on $esp32_ip..." -ForegroundColor Cyan

try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect($esp32_ip, 22)
    $stream = $client.GetStream()
    
    Start-Sleep -Seconds 1
    
    # Send fake SSH authentication
    $creds = [System.Text.Encoding]::ASCII.GetBytes("root`npassword`n")
    $stream.Write($creds, 0, $creds.Length)
    
    Write-Host "✅ SSH attack sent! Check dashboard." -ForegroundColor Green
    
    $stream.Close()
    $client.Close()
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
