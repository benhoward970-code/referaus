$resolved = (Resolve-Path "C:\Users\Ben\Desktop\1?? Projects\NDIS\NDIS-PLATFORM-FRESH\backend\working-server.js").Path
Copy-Item $resolved "E:\referaus-backend-deploy\api\index.js" -Force
Write-Host "Copied: $resolved"

$dbPath = (Resolve-Path "C:\Users\Ben\Desktop\1?? Projects\NDIS\NDIS-PLATFORM-FRESH\backend").Path
$db = Join-Path $dbPath "ndis.db"
if (Test-Path $db) {
    Copy-Item $db "E:\referaus-backend-deploy\api\ndis.db" -Force
    Write-Host "DB copied"
} else {
    Write-Host "No ndis.db found"
}
