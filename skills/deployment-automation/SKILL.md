# Deployment Automation Skill

**Purpose:** Deploy apps in minutes with zero downtime  
**Impact:** From manual deploys to one-click automation

---

## Quick Deploy Script

### One-Click Deploy (deploy.sh)
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Run tests
npm test

# 5. Backup database
./scripts/backup.sh

# 6. Run migrations
npm run migration:run

# 7. Restart services
pm2 restart all

echo "✅ Deployment complete!"
```

---

## Docker Deployment

### Multi-Stage Dockerfile
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/ndis
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3000
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=ndis
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## PM2 Process Management

### PM2 Ecosystem File
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ndis-backend',
    script: 'dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }, {
    name: 'ndis-frontend',
    script: 'npm',
    args: 'start',
    cwd: './frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

### PM2 Commands
```bash
# Start
pm2 start ecosystem.config.js

# Restart
pm2 restart all

# Stop
pm2 stop all

# Logs
pm2 logs

# Monitor
pm2 monit

# Auto-start on reboot
pm2 startup
pm2 save
```

---

## Database Migrations

### TypeORM Migration
```bash
# Generate migration
npm run migration:generate -- -n AddUserRoles

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Migration File
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoles1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN role
    `);
  }
}
```

---

## Zero-Downtime Deployment

### Blue-Green Deployment
```bash
#!/bin/bash

# 1. Build new version (Green)
docker-compose -f docker-compose.green.yml up -d --build

# 2. Health check
sleep 10
if curl -f http://localhost:3002/health; then
  echo "✅ Green environment healthy"
  
  # 3. Switch traffic (update nginx)
  cp nginx.green.conf /etc/nginx/sites-enabled/default
  nginx -s reload
  
  # 4. Stop old version (Blue)
  docker-compose -f docker-compose.blue.yml down
  
  echo "✅ Deployment complete!"
else
  echo "❌ Green environment unhealthy, rolling back"
  docker-compose -f docker-compose.green.yml down
  exit 1
fi
```

---

## Backup Automation

### Backup Script
```bash
#!/bin/bash

# backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_NAME="ndis"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump $DB_NAME > "$BACKUP_DIR/db_$DATE.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" ./uploads

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup complete: $DATE"
```

### Automated Backup (Cron)
```bash
# Run backup daily at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

---

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.7
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/ndis-platform
            git pull
            npm install
            npm run build
            pm2 restart all
```

---

## Health Checks

### API Health Endpoint
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private db: DatabaseService,
    private cache: CacheService
  ) {}

  @Get()
  async check() {
    const checks = {
      database: false,
      cache: false,
      timestamp: new Date().toISOString()
    };

    try {
      await this.db.query('SELECT 1');
      checks.database = true;
    } catch (e) {
      // Database down
    }

    try {
      await this.cache.get('health-check');
      checks.cache = true;
    } catch (e) {
      // Cache down
    }

    const healthy = checks.database && checks.cache;
    const status = healthy ? 200 : 503;

    return {
      status: healthy ? 'healthy' : 'unhealthy',
      checks
    };
  }
}
```

---

## Monitoring & Alerts

### Simple Uptime Monitor
```bash
#!/bin/bash

# monitor.sh
URL="https://yourapp.com/health"

if ! curl -f $URL > /dev/null 2>&1; then
  # Send alert (email, Discord, Slack, etc.)
  curl -X POST https://discord.com/api/webhooks/YOUR_WEBHOOK \
    -H "Content-Type: application/json" \
    -d '{"content": "🚨 App is DOWN!"}'
fi
```

### Run every 5 minutes
```bash
*/5 * * * * /path/to/monitor.sh
```

---

## Environment Management

### .env Files
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/ndis
JWT_SECRET=super-secret-production-key
PORT=3000
```

### Load Environment
```typescript
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true
    })
  ]
})
export class AppModule {}
```

---

## Rollback Strategy

### Quick Rollback
```bash
#!/bin/bash

# rollback.sh
echo "🔄 Rolling back to previous version..."

# Get previous commit
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

# Checkout previous version
git checkout $PREVIOUS_COMMIT

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart all

echo "✅ Rollback complete!"
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Database migrations tested
- [ ] Environment variables set
- [ ] Backup created
- [ ] Monitoring enabled

### During Deployment
- [ ] Run in off-peak hours
- [ ] Monitor logs in real-time
- [ ] Check health endpoints
- [ ] Verify key features working

### Post-Deployment
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify database migrations
- [ ] Test rollback procedure

---

**Deploy fast. Deploy safe. Deploy often.** 🚀

---

_Deployment Automation Skill by CLAWDY - 12 Feb 2026_
