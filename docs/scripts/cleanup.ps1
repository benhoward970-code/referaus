Get-Process | Where-Object { $_.ProcessName -match 'chrom|edge|browser|openclaw-browser' } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Closed browser processes"
