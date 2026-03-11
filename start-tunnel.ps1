# start-tunnel.ps1 - Auto-start tunnels + update Vercel on every PC start
# Runs at login via Windows Startup folder

$cloudflared   = "C:\Users\Ben\.openclaw\workspace\cloudflared.exe"
$workspace     = "C:\Users\Ben\.openclaw\workspace"
$ndisDir       = "C:\Users\Ben\Desktop\ndis-ai-frontend"
$mcDir         = "C:\Users\Ben\Desktop\mission-control"

function Get-TelegramToken {
    $cfg = Get-Content "$workspace\openclaw.json" -Raw | ConvertFrom-Json
    return $cfg.channels.telegram.botToken
}

function Send-Telegram($text) {
    try {
        $token = Get-TelegramToken
        Invoke-WebRequest -Uri "https://api.telegram.org/bot$token/sendMessage" `
            -Method POST `
            -Body @{ chat_id = "1547488150"; text = $text } `
            -UseBasicParsing | Out-Null
    } catch {}
}

function Start-Tunnel($port, $logFile) {
    # Kill old tunnel log
    if (Test-Path $logFile) { Remove-Item $logFile -Force }

    $proc = Start-Process -FilePath $cloudflared `
        -ArgumentList "tunnel --url http://localhost:$port --no-autoupdate" `
        -RedirectStandardError $logFile `
        -PassThru -WindowStyle Hidden

    # Wait for URL (up to 30s)
    $url = $null
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep 2
        if (Test-Path $logFile) {
            $log = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
            if ($log -match "https://[a-z0-9\-]+\.trycloudflare\.com") {
                $url = $matches[0]
                break
            }
        }
    }
    return $url
}

# ─── Start Mission Control tunnel (port 3000) ──────────────────────────────
Write-Host "Starting Mission Control tunnel (port 3000)..."
$mcUrl = Start-Tunnel 3000 "$workspace\tunnel-mc.log"
if ($mcUrl) {
    $mcUrl | Out-File "$workspace\tunnel-mc-url.txt" -NoNewline
    Write-Host "MC tunnel: $mcUrl"
} else {
    Write-Host "MC tunnel: failed to get URL"
}

# ─── Start NDIS Backend tunnel (port 3002) ─────────────────────────────────
Write-Host "Starting NDIS backend tunnel (port 3002)..."
$ndisUrl = Start-Tunnel 3002 "$workspace\tunnel-ndis.log"
if ($ndisUrl) {
    $ndisUrl | Out-File "$workspace\tunnel-ndis-url.txt" -NoNewline
    Write-Host "NDIS tunnel: $ndisUrl"

    # Update Vercel env vars with new backend URL
    Write-Host "Updating Vercel env vars..."
    try {
        Set-Location $ndisDir
        $httpUrl = $ndisUrl
        $wsUrl   = $ndisUrl -replace "^https://", "wss://"

        # Update env vars
        echo $httpUrl | vercel env add NEXT_PUBLIC_API_BASE_URL production --force 2>&1 | Out-Null
        echo $wsUrl   | vercel env add NEXT_PUBLIC_WS_URL        production --force 2>&1 | Out-Null

        # Redeploy
        Write-Host "Redeploying NDIS frontend..."
        $deployOut = vercel deploy --yes --prod 2>&1
        $liveUrl = ($deployOut | Select-String "https://ndis-ai-frontend\.vercel\.app").Line
        Write-Host "NDIS deployed: $liveUrl"
    } catch {
        Write-Host "Vercel update failed: $($_.Exception.Message)"
    }
} else {
    Write-Host "NDIS tunnel: failed to get URL"
}

# ─── Start push data script ────────────────────────────────────────────────
Write-Host "Starting Mission Control data push script..."
Start-Process powershell -ArgumentList `
    "-WindowStyle Hidden -ExecutionPolicy Bypass -File $workspace\push-agent-data.ps1" `
    -WindowStyle Hidden

# ─── Telegram notification ─────────────────────────────────────────────────
$msg = "PC is online. Systems starting up:`n"
if ($mcUrl)   { $msg += "`nMission Control: https://mission-control-ruddy-chi.vercel.app" }
if ($ndisUrl) { $msg += "`nNDIS Platform: https://ndis-ai-frontend.vercel.app" }
$msg += "`n`nAll URLs are permanent - open from anywhere."

Send-Telegram $msg
Write-Host "Startup complete."
