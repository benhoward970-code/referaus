# OpenClaw Gateway Watchdog - persistent loop, no new processes spawned
# Single process running quietly in background, checks every 5 minutes
# Zero window flashes - nothing new ever starts

$logFile = "C:\Users\Ben\.openclaw\workspace\scripts\gateway-watchdog.log"

function Test-Gateway {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $c = $tcp.BeginConnect("127.0.0.1", 18789, $null, $null)
        $w = $c.AsyncWaitHandle.WaitOne(2000)
        $alive = $w -and $tcp.Connected
        $tcp.Close()
        return $alive
    } catch { return $false }
}

function Write-Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts $msg" | Add-Content $logFile
    # Trim to 100 lines
    if (Test-Path $logFile) {
        $lines = Get-Content $logFile
        if ($lines.Count -gt 100) { $lines[-100..-1] | Set-Content $logFile }
    }
}

# Loop forever - no spawning, no flashing, just a sleep loop
while ($true) {
    Start-Sleep -Seconds 300  # wait 5 minutes

    if (-not (Test-Gateway)) {
        Write-Log "GATEWAY DOWN - restarting..."

        # Set env vars then start node.exe hidden - this is the ONLY external process we ever spawn
        $env:OPENCLAW_GATEWAY_PORT    = "18789"
        $env:OPENCLAW_GATEWAY_TOKEN   = "b80eadb8226320a26eb242c03cab3d542d252708efe92533"
        $env:OPENCLAW_SERVICE_MARKER  = "openclaw"
        $env:OPENCLAW_SERVICE_KIND    = "gateway"
        $env:OPENCLAW_SERVICE_VERSION = "2026.2.17"

        $proc = Start-Process `
            -FilePath "C:\Program Files\nodejs\node.exe" `
            -ArgumentList "`"C:\Users\Ben\AppData\Roaming\npm\node_modules\openclaw\dist\index.js`" gateway --port 18789" `
            -WindowStyle Hidden -PassThru

        Start-Sleep -Seconds 8

        if (Test-Gateway) {
            Write-Log "GATEWAY RESTARTED OK (PID $($proc.Id))"
        } else {
            Write-Log "GATEWAY RESTART FAILED"
        }
    }
    # If gateway is up: complete silence, nothing written, nothing spawned
}
