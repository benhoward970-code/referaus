# Create a Vercel-deployable backend
$source = (Resolve-Path "C:\Users\Ben\Desktop\1?? Projects\NDIS\NDIS-PLATFORM-FRESH\backend").Path
$deployDir = "E:\referaus-backend-deploy"

# Create deploy directory
New-Item -ItemType Directory -Force -Path $deployDir | Out-Null
New-Item -ItemType Directory -Force -Path "$deployDir\api" | Out-Null

# Copy the server file
Copy-Item "$source\working-server.js" "$deployDir\api\index.js"

# Create package.json
@'
{
  "name": "referaus-backend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.7",
    "socket.io": "^4.7.4",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  }
}
'@ | Set-Content "$deployDir\package.json"

# Create vercel.json for Express
@'
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
'@ | Set-Content "$deployDir\vercel.json"

# Copy database if exists
if (Test-Path "$source\ndis.db") {
    Copy-Item "$source\ndis.db" "$deployDir\api\ndis.db"
    Write-Host "Database copied"
}

Write-Host "Deploy dir ready at: $deployDir"
Get-ChildItem $deployDir -Recurse | Select-Object FullName
