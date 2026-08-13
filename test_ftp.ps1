# Test FTP Attack Script
param(
    [string]$esp32_ip = "192.168.1.123"
)

Write-Host "🎯 Testing FTP honeypot on $esp32_ip..." -ForegroundColor Cyan

try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect($esp32_ip, 21)
    $stream = $client.GetStream()
    
    Start-Sleep -Seconds 1
    
    # Send FTP USER command
    $user = [System.Text.Encoding]::ASCII.GetBytes("USER anonymous`r`n")
    $stream.Write($user, 0, $user.Length)
    
    Start-Sleep -Seconds 1
    
    # Send FTP PASS command
    $pass = [System.Text.Encoding]::ASCII.GetBytes("PASS guest@`r`n")
    $stream.Write($pass, 0, $pass.Length)
    
    Write-Host "✅ FTP attack sent! Check dashboard." -ForegroundColor Green
    
    $stream.Close()
    $client.Close()
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
