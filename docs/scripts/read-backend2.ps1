$file = "C:\Users\Ben\Desktop\1?? Projects\NDIS\NDIS-PLATFORM-FRESH\backend\working-server.js"
$resolved = (Resolve-Path $file).Path
Write-Host "Resolved: $resolved"
Write-Host "Size: $((Get-Item $resolved).Length) bytes"
Get-Content $resolved -TotalCount 40
