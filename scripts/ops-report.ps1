$chatId = "-1003464285103"
$token = "8694192364:AAGZboHne4d2ufXhXSb0gAo4bgK28ydUYxQ"
$msg = "OPS HEALTH REPORT - Tue 10 Mar 7:00 PM

Backend (port 3002): OFFLINE - working-server.js not running
Frontend (refer.org.au): OFFLINE - DNS not resolving  
Memory: YELLOW - 80% used (6.5 GB free / 32.7 GB)
Disk C: CRITICAL - 97% full, only 7.6 GB free!

Cron jobs: 3 errors (timeouts - already fixed)

ACTIONS NEEDED:
1. Restart working-server.js
2. Fix refer.org.au DNS
3. URGENT: Free disk space - 97% is dangerous
4. Monitor cron fixes overnight"

$body = @{ chat_id = $chatId; text = $msg } | ConvertTo-Json
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/sendMessage" -Method Post -ContentType "application/json" -Body $bytes | Out-Null
Write-Host "Ops report sent"
