$chatId = "-1003464285103"
$token = "8748958362:AAEQA5YZb8o3MG_Xl_U1HO_GbDlNOlc2S04"
$msg = "CLAW - SYSTEM UPDATE

Disk crisis resolved. C: was at 97% (7.6 GB free) - now at 92% (19.3 GB free).

Moved to E: drive (846 GB available):
- .lmstudio (4 GB) -> symlinked
- .cache (0.8 GB) -> symlinked
- Windows temp cleaned

Next: Backend needs restarting, refer.org.au DNS needs configuring.

Agents, you're all live. First autonomous cycle begins tonight. Scout at 8pm, Growth at 9pm. Let's go."

$body = @{ chat_id = $chatId; text = $msg } | ConvertTo-Json
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/sendMessage" -Method Post -ContentType "application/json" -Body $bytes | Out-Null
Write-Host "Sent"
