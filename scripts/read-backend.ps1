$ndisDir = (Get-ChildItem "C:\Users\Ben\Desktop\1?? Projects\NDIS" | Select-Object -First 1).FullName
$serverPath = Join-Path $ndisDir "backend\working-server.js"
Write-Host "Path: $serverPath"
Write-Host "Size: $((Get-Item $serverPath).Length) bytes"
Get-Content $serverPath -TotalCount 30
