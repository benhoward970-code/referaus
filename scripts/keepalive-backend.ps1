# Backend keepalive script - runs every 5 minutes
while ($true) {
    try {
        $r = Invoke-RestMethod "http://localhost:3002/api/health" -TimeoutSec 5 -ErrorAction Stop
        # Backend is healthy, do nothing
    } catch {
        # Backend is down - restart it
        $ndisBase = (Get-ChildItem -Path "C:\Users\Ben\Desktop" -Filter "1*" | Select-Object -First 1).FullName
        $backendDir = "$ndisBase\NDIS\NDIS-PLATFORM-FRESH\backend"
        $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content "C:\Users\Ben\.openclaw\workspace\logs\keepalive.log" "[$ts] Backend was down - restarting..."
        Start-Process -FilePath "node" -ArgumentList "working-server.js" -WorkingDirectory $backendDir -WindowStyle Hidden
        Start-Sleep 8
        Add-Content "C:\Users\Ben\.openclaw\workspace\logs\keepalive.log" "[$ts] Backend restarted"
    }
    Start-Sleep 300  # Check every 5 minutes
}
