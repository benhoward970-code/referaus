#!/bin/bash
# Setup API Testing Environment

set -e

echo "🔧 Setting up API testing environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Start test databases
echo "🐘 Starting PostgreSQL..."
docker run -d \
  --name api-test-postgres \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 \
  --health-cmd pg_isready \
  --health-interval 10s \
  postgres:15 || echo "PostgreSQL container already exists"

echo "🔴 Starting Redis..."
docker run -d \
  --name api-test-redis \
  -p 6379:6379 \
  --health-cmd "redis-cli ping" \
  --health-interval 10s \
  redis:7 || echo "Redis container already exists"

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Test connections
echo "✅ Testing database connections..."
docker exec api-test-postgres pg_isready || echo "PostgreSQL not ready yet"
docker exec api-test-redis redis-cli ping || echo "Redis not ready yet"

# Create .env.test if it doesn't exist
if [ ! -f .env.test ]; then
  echo "📝 Creating .env.test..."
  cat > .env.test << EOF
DATABASE_URL="postgresql://postgres:test@localhost:5432/test_db"
REDIS_URL="redis://localhost:6379/1"
JWT_SECRET="test-secret-key-change-in-production"
NODE_ENV="test"
LOG_LEVEL="error"
API_PORT="3001"
EOF
fi

echo "✅ Test environment ready!"
echo ""
echo "Database URL: postgresql://postgres:test@localhost:5432/test_db"
echo "Redis URL: redis://localhost:6379"
echo ""
echo "Run tests with: npm run test:api"
echo "Stop services with: docker stop api-test-postgres api-test-redis"
echo "Remove services with: docker rm api-test-postgres api-test-redis"
