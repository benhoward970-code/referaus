$config = @'
{
    "meta": {
        "lastTouchedVersion": "2026.2.26",
        "lastTouchedAt": "2026-03-10T06:10:00.000Z"
    },
    "wizard": {
        "lastRunAt": "2026-03-01T03:43:10.343Z",
        "lastRunVersion": "2026.2.26",
        "lastRunCommand": "doctor",
        "lastRunMode": "local"
    },
    "models": {
        "providers": {
            "anthropic": {
                "baseUrl": "https://api.anthropic.com",
                "models": [
                    { "id": "anthropic/claude-opus-4-6", "name": "Claude Opus 4.6", "contextWindow": 200000, "maxTokens": 32000 },
                    { "id": "anthropic/claude-sonnet-4-6", "name": "Claude Sonnet 4.6", "contextWindow": 200000, "maxTokens": 8192 },
                    { "id": "anthropic/claude-sonnet-4-5", "name": "Claude Sonnet 4.5", "contextWindow": 200000, "maxTokens": 8192 },
                    { "id": "anthropic/claude-haiku-4-5", "name": "Claude Haiku 4.5", "contextWindow": 200000, "maxTokens": 8192 }
                ]
            }
        }
    },
    "agents": {
        "defaults": {
            "model": {
                "primary": "anthropic/claude-opus-4-6",
                "fallbacks": ["anthropic/claude-sonnet-4-5", "anthropic/claude-haiku-4-5"]
            },
            "models": {
                "anthropic/claude-opus-4-6": {},
                "anthropic/claude-sonnet-4-6": {},
                "anthropic/claude-sonnet-4-5": {},
                "anthropic/claude-haiku-4-5": {}
            },
            "workspace": "C:\\Users\\Ben\\.openclaw\\workspace",
            "memorySearch": { "enabled": false },
            "contextPruning": { "mode": "cache-ttl", "ttl": "30m", "keepLastAssistants": 3 },
            "maxConcurrent": 4,
            "subagents": { "maxConcurrent": 8 }
        },
        "list": [
            {
                "id": "main",
                "default": true,
                "name": "Claw",
                "workspace": "C:\\Users\\Ben\\.openclaw\\workspace",
                "model": "anthropic/claude-opus-4-6"
            },
            {
                "id": "builder",
                "name": "Builder",
                "workspace": "C:\\Users\\Ben\\.openclaw\\workspace\\agents\\builder",
                "model": "anthropic/claude-sonnet-4-6"
            },
            {
                "id": "scout",
                "name": "Scout",
                "workspace": "C:\\Users\\Ben\\.openclaw\\workspace\\agents\\scout",
                "model": "anthropic/claude-sonnet-4-6"
            },
            {
                "id": "growth",
                "name": "Growth",
                "workspace": "C:\\Users\\Ben\\.openclaw\\workspace\\agents\\growth",
                "model": "anthropic/claude-sonnet-4-6"
            },
            {
                "id": "sentinel",
                "name": "Sentinel",
                "workspace": "C:\\Users\\Ben\\.openclaw\\workspace\\agents\\sentinel",
                "model": "anthropic/claude-sonnet-4-6"
            },
            {
                "id": "ops",
                "name": "Ops",
                "workspace": "C:\\Users\\Ben\\.openclaw\\workspace\\agents\\ops",
                "model": "anthropic/claude-sonnet-4-6"
            }
        ]
    },
    "bindings": [
        { "agentId": "main", "match": { "channel": "telegram", "accountId": "default" } },
        { "agentId": "builder", "match": { "channel": "telegram", "accountId": "builder" } },
        { "agentId": "scout", "match": { "channel": "telegram", "accountId": "scout" } },
        { "agentId": "growth", "match": { "channel": "telegram", "accountId": "growth" } },
        { "agentId": "sentinel", "match": { "channel": "telegram", "accountId": "sentinel" } },
        { "agentId": "ops", "match": { "channel": "telegram", "accountId": "ops" } }
    ],
    "commands": {
        "native": "auto",
        "nativeSkills": "auto",
        "restart": true,
        "ownerDisplay": "raw"
    },
    "channels": {
        "telegram": {
            "name": "Albibot",
            "enabled": true,
            "dmPolicy": "pairing",
            "groupPolicy": "allowlist",
            "streaming": "partial",
            "accounts": {
                "default": {
                    "botToken": "8748958362:AAEQA5YZb8o3MG_Xl_U1HO_GbDlNOlc2S04"
                },
                "builder": {
                    "botToken": "8364575479:AAFJ95tTj-jgOUJxG6jDr8r9eOJEktEzvm8"
                },
                "scout": {
                    "botToken": "8645698018:AAE0DSkai3uiEQwMWF-vnucAWr2GisWKtS0"
                },
                "growth": {
                    "botToken": "8549134505:AAGNRwbWtoPnFPQmMjp7bA4XPkCOUdiFDqE"
                },
                "sentinel": {
                    "botToken": "8771345429:AAH0JKChPBDzYK5UXf4gZrolpmN7Rk6PXOc"
                },
                "ops": {
                    "botToken": "8694192364:AAGZboHne4d2ufXhXSb0gAo4bgK28ydUYxQ"
                }
            },
            "groups": {
                "-5063437675": {
                    "requireMention": false
                }
            }
        },
        "discord": { "enabled": false }
    },
    "gateway": {
        "mode": "local",
        "auth": {
            "mode": "token",
            "token": "1c661ea3db063a56589572b4f1fcf1b9524b59626c179273"
        },
        "remote": {
            "token": "1c661ea3db063a56589572b4f1fcf1b9524b59626c179273"
        }
    },
    "plugins": {
        "entries": {
            "discord": { "enabled": false },
            "telegram": { "enabled": true }
        }
    }
}
'@

$config | Set-Content -Path "C:\Users\Ben\.openclaw\openclaw.json" -Encoding UTF8
Write-Host "Config fixed"
