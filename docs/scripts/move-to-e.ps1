# Move heavy user folders to E: and create symlinks
# This frees up C: without breaking anything

$moves = @(
    @{ From = "C:\Users\Ben\.lmstudio"; To = "E:\moved-from-c\.lmstudio" },
    @{ From = "C:\Users\Ben\Downloads"; To = "E:\moved-from-c\Downloads" },
    @{ From = "C:\Users\Ben\.cache"; To = "E:\moved-from-c\.cache" }
)

# Create target root
New-Item -ItemType Directory -Force -Path "E:\moved-from-c" | Out-Null

foreach ($m in $moves) {
    $from = $m.From
    $to = $m.To
    
    if (-not (Test-Path $from)) {
        Write-Host "SKIP: $from doesn't exist"
        continue
    }
    
    # Check if already a symlink
    $item = Get-Item $from -Force -ErrorAction SilentlyContinue
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
        Write-Host "SKIP: $from is already a symlink"
        continue
    }
    
    Write-Host "Moving $from -> $to ..."
    
    # Copy to E:
    if (-not (Test-Path $to)) {
        Copy-Item -Path $from -Destination $to -Recurse -Force
    }
    
    # Remove original
    Remove-Item -Path $from -Recurse -Force
    
    # Create symlink
    New-Item -ItemType SymbolicLink -Path $from -Target $to | Out-Null
    
    Write-Host "DONE: $from -> $to (symlinked)"
}

# Also clean Windows temp
Write-Host "Cleaning Windows temp..."
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue

# Clean npm cache
Write-Host "Cleaning npm cache..."
npm cache clean --force 2>$null

Write-Host ""
$free = [math]::Round((Get-PSDrive C).Free / 1GB, 2)
Write-Host "C: drive free space now: $free GB"
