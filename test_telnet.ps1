# Test Telnet Attack Script
param(
    [string]$esp32_ip = "192.168.1.123"
)

Write-Host "🎯 Testing Telnet honeypot on $esp32_ip..." -ForegroundColor Cyan

try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect($esp32_ip, 23)
    $stream = $client.GetStream()
    
    Start-Sleep -Seconds 1
    
    # Send fake credentials
    $username = [System.Text.Encoding]::ASCII.GetBytes("admin`n")
    $stream.Write($username, 0, $username.Length)
    
    Start-Sleep -Seconds 1
    
    $password = [System.Text.Encoding]::ASCII.GetBytes("password123`n")
    $stream.Write($password, 0, $password.Length)
    
    Write-Host "✅ Attack sent! Check dashboard for new event." -ForegroundColor Green
    
    $stream.Close()
    $client.Close()
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
