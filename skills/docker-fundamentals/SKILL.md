# Docker Fundamentals Skill

**Purpose:** Containerize applications for consistent deployments  
**Impact:** "Works on my machine" → "Works everywhere"

---

## Quick Start

### Install Docker
```bash
# Check installation
docker --version
docker-compose --version

# Run hello world
docker run hello-world
```

---

## Essential Commands

### Images
```bash
# List images
docker images

# Pull image
docker pull node:18-alpine

# Build image
docker build -t myapp:latest .

# Remove image
docker rmi myapp:latest

# Remove unused images
docker image prune
```

### Containers
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Run container
docker run -d -p 3000:3000 --name myapp myapp:latest

# Stop container
docker stop myapp

# Start container
docker start myapp

# Restart container
docker restart myapp

# Remove container
docker rm myapp

# Remove all stopped containers
docker container prune

# View logs
docker logs myapp
docker logs -f myapp  # Follow logs

# Execute command in container
docker exec -it myapp sh
docker exec myapp npm test
```

---

## Dockerfile

### Basic Dockerfile
```dockerfile
# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
```

### Multi-Stage Build (Optimized)
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only production files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package*.json ./

# Switch to non-root user
USER nodejs

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

---

## Docker Compose

### Basic compose.yml
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
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Docker Compose Commands
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Build and start
docker-compose up -d --build

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Scale service
docker-compose up -d --scale backend=3
```

---

## Networking

### Create Network
```bash
# Create network
docker network create myapp-network

# List networks
docker network ls

# Connect container to network
docker network connect myapp-network myapp

# Inspect network
docker network inspect myapp-network
```

### Network in Docker Compose
```yaml
services:
  backend:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend

networks:
  frontend:
  backend:
```

---

## Volumes

### Named Volumes
```bash
# Create volume
docker volume create myapp-data

# List volumes
docker volume ls

# Inspect volume
docker volume inspect myapp-data

# Remove volume
docker volume rm myapp-data

# Remove unused volumes
docker volume prune
```

### Volume Types
```yaml
services:
  app:
    volumes:
      # Named volume
      - postgres_data:/var/lib/postgresql/data
      
      # Bind mount (local directory)
      - ./uploads:/app/uploads
      
      # Anonymous volume
      - /app/node_modules

volumes:
  postgres_data:
```

---

## Environment Variables

### In Dockerfile
```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

### In Docker Run
```bash
docker run -e NODE_ENV=production -e PORT=3000 myapp
```

### In Docker Compose
```yaml
services:
  backend:
    environment:
      - NODE_ENV=production
      - PORT=3000
    
    # Or from .env file
    env_file:
      - .env
```

---

## Best Practices

### 1. Use Specific Tags
```dockerfile
# ❌ BAD
FROM node:latest

# ✅ GOOD
FROM node:18-alpine
```

### 2. Optimize Layer Caching
```dockerfile
# ✅ GOOD - Copy package files first
COPY package*.json ./
RUN npm ci

# Then copy source code
COPY . .
```

### 3. Minimize Image Size
```dockerfile
# Use alpine images
FROM node:18-alpine

# Multi-stage builds
FROM node:18-alpine AS builder
# ... build
FROM node:18-alpine
COPY --from=builder /app/dist ./dist

# Remove unnecessary files
RUN npm prune --production
```

### 4. Don't Run as Root
```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs
```

### 5. Use .dockerignore
```
node_modules
npm-debug.log
.git
.env
.DS_Store
coverage
dist
build
*.md
```

---

## Health Checks

### In Dockerfile
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node healthcheck.js || exit 1
```

### In Docker Compose
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
```

---

## Debugging

### View Container Logs
```bash
# All logs
docker logs myapp

# Last 100 lines
docker logs --tail 100 myapp

# Follow logs
docker logs -f myapp

# With timestamps
docker logs -t myapp
```

### Inspect Container
```bash
# Full details
docker inspect myapp

# Specific field
docker inspect -f '{{.State.Status}}' myapp
```

### Enter Container
```bash
# Interactive shell
docker exec -it myapp sh

# Run command
docker exec myapp ls -la
docker exec myapp npm test
```

### Check Resource Usage
```bash
# All containers
docker stats

# Specific container
docker stats myapp
```

---

## Production Tips

### 1. Use Docker Secrets
```yaml
services:
  backend:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 2. Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 3. Restart Policies
```yaml
services:
  backend:
    restart: unless-stopped
    # or: no, always, on-failure
```

---

## Common Patterns

### Full Stack App
```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3000
    depends_on:
      - backend

  # Backend
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  # Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Cache
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## Quick Reference

```bash
# Build and run
docker build -t myapp .
docker run -d -p 3000:3000 myapp

# Compose
docker-compose up -d
docker-compose down

# Cleanup
docker system prune -a  # Remove everything
docker volume prune     # Remove volumes
docker image prune      # Remove images

# Debug
docker logs -f myapp
docker exec -it myapp sh
docker stats

# Push to registry
docker tag myapp:latest username/myapp:latest
docker push username/myapp:latest
```

---

**Containerize everything. Deploy anywhere.** 🐳

---

_Docker Fundamentals Skill by CLAWDY - 12 Feb 2026_
