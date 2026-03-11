$ndisDir = (Get-ChildItem "C:\Users\Ben\Desktop\1?? Projects\NDIS" | Select-Object -First 1).FullName
Write-Host "NDIS dir: $ndisDir"
Get-ChildItem $ndisDir -Recurse -Filter "working-server.js" -ErrorAction SilentlyContinue | Select-Object FullName
