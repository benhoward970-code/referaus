$dirs = Get-ChildItem 'C:\Users\Ben' -Directory -ErrorAction SilentlyContinue
foreach ($d in $dirs) {
    $size = (Get-ChildItem $d.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
    $gb = [math]::Round($size / 1GB, 2)
    if ($gb -gt 0.5) {
        Write-Host "$gb GB  $($d.Name)"
    }
}

# Also check other big C: locations
$otherPaths = @("C:\Windows\Temp", "C:\temp", "C:\ProgramData", "C:\Program Files")
foreach ($p in $otherPaths) {
    if (Test-Path $p) {
        $size = (Get-ChildItem $p -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
        $gb = [math]::Round($size / 1GB, 2)
        Write-Host "$gb GB  $p"
    }
}
