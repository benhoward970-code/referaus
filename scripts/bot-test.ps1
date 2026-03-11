$chatId = "-5063437675"

$bots = @{
    "Builder" = "8364575479:AAFJ95tTj-jgOUJxG6jDr8r9eOJEktEzvm8"
    "Scout" = "8645698018:AAE0DSkai3uiEQwMWF-vnucAWr2GisWKtS0"
    "Growth" = "8549134505:AAGNRwbWtoPnFPQmMjp7bA4XPkCOUdiFDqE"
    "Sentinel" = "8771345429:AAH0JKChPBDzYK5UXf4gZrolpmN7Rk6PXOc"
    "Ops" = "8694192364:AAGZboHne4d2ufXhXSb0gAo4bgK28ydUYxQ"
}

$messages = @{
    "Builder" = "Builder online. Ready to build ReferAus."
    "Scout" = "Scout online. Scanning NDIS landscape."
    "Growth" = "Growth online. Finding providers."
    "Sentinel" = "Sentinel online. QA standing by."
    "Ops" = "Ops online. Monitoring systems."
}

foreach ($name in $bots.Keys) {
    $token = $bots[$name]
    $msg = $messages[$name]
    $uri = "https://api.telegram.org/bot$token/sendMessage"
    $body = @{ chat_id = $chatId; text = $msg } | ConvertTo-Json
    try {
        $r = Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json" -Body $body
        Write-Host "$name : OK"
    } catch {
        Write-Host "$name : FAILED - $($_.Exception.Message)"
    }
}
