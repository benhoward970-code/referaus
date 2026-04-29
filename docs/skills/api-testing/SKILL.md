# API Integration Testing Skill

## Overview

Comprehensive guide for testing REST APIs, GraphQL endpoints, and webhooks. Covers integration testing, contract testing, load testing, and test automation strategies.

## When to Use This Skill

- Building or consuming REST/GraphQL APIs
- Setting up API test suites
- Validating API contracts and schemas
- Load testing and performance validation
- Debugging API integrations
- CI/CD pipeline testing
- Mock server setup for development

## Quick Start

### Basic REST API Test Structure

```typescript
// __tests__/api/users.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@/server';
import { db } from '@/lib/db';

describe('User API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Setup: seed test data, get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'test123' });
    
    authToken = response.body.token;
  });

  afterAll(async () => {
    // Cleanup: remove test data
    await db.user.deleteMany({ where: { email: { contains: 'test' } } });
  });

  it('GET /api/users - should return paginated users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      users: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          createdAt: expect.any(String),
        }),
      ]),
      pagination: {
        page: 1,
        limit: 10,
        total: expect.any(Number),
      },
    });
  });

  it('POST /api/users - should create new user', async () => {
    const newUser = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'secure123',
    };

    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: newUser.email,
      name: newUser.name,
    });
    expect(response.body.password).toBeUndefined(); // Never return passwords

    testUserId = response.body.id;
  });

  it('PUT /api/users/:id - should update user', async () => {
    const updates = { name: 'Updated Name' };

    const response = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updates);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updates.name);
  });

  it('DELETE /api/users/:id - should delete user', async () => {
    const response = await request(app)
      .delete(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);

    // Verify deletion
    const getResponse = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getResponse.status).toBe(404);
  });

  describe('Error Handling', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'not-an-email', name: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'email' })
      );
    });

    it('should return 409 for duplicate email', async () => {
      const user = { email: 'duplicate@example.com', name: 'Test', password: 'test123' };
      
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(user);

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(user);

      expect(response.status).toBe(409);
    });
  });
});
```

## Testing Patterns

### 1. Schema Validation with Zod

```typescript
// lib/test-utils/schema-validator.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['USER', 'ADMIN']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      pages: z.number().int().nonnegative(),
    }),
  });

// Usage in tests
it('should return valid user schema', async () => {
  const response = await request(app)
    .get('/api/users/123')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(200);
  const result = UserSchema.safeParse(response.body);
  expect(result.success).toBe(true);
});
```

### 2. GraphQL API Testing

```typescript
// __tests__/api/graphql.test.ts
import { graphql } from 'graphql';
import { schema } from '@/graphql/schema';
import { createContext } from '@/graphql/context';

describe('GraphQL API', () => {
  it('should query users with filters', async () => {
    const query = `
      query GetUsers($role: UserRole) {
        users(role: $role) {
          id
          email
          name
          role
        }
      }
    `;

    const result = await graphql({
      schema,
      source: query,
      variableValues: { role: 'ADMIN' },
      contextValue: createContext({ userId: 'test-user-id' }),
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: 'ADMIN' }),
      ])
    );
  });

  it('should handle mutations with authorization', async () => {
    const mutation = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          id
          title
          published
          author {
            id
            name
          }
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        input: { title: 'Test Post', content: 'Test content' },
      },
      contextValue: createContext({ userId: 'author-id' }),
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.createPost).toMatchObject({
      title: 'Test Post',
      published: false,
      author: { id: 'author-id' },
    });
  });
});
```

### 3. Contract Testing with Pact

```typescript
// __tests__/contract/user-service.pact.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

const { like, eachLike, iso8601DateTime } = MatchersV3;

const provider = new PactV3({
  consumer: 'WebApp',
  provider: 'UserService',
  dir: path.resolve(process.cwd(), 'pacts'),
});

describe('User Service Contract', () => {
  it('should get user by id', async () => {
    await provider
      .given('user with id 123 exists')
      .uponReceiving('a request for user 123')
      .withRequest({
        method: 'GET',
        path: '/api/users/123',
        headers: { Authorization: like('Bearer token') },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: like('123'),
          email: like('user@example.com'),
          name: like('Test User'),
          createdAt: iso8601DateTime(),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const response = await fetch(`${mockServer.url}/api/users/123`, {
        headers: { Authorization: 'Bearer token' },
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe('123');
    });
  });
});
```

### 4. Load Testing with k6

```javascript
// scripts/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.1'],              // Error rate under 10%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  // Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'load-test@example.com',
    password: 'test123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('token') !== undefined,
  }) || errorRate.add(1);

  const token = loginRes.json('token');

  // Get users
  const usersRes = http.get(`${BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(usersRes, {
    'users fetched': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Create user
  const createRes = http.post(`${BASE_URL}/api/users`, JSON.stringify({
    email: `user-${Date.now()}@example.com`,
    name: 'Load Test User',
    password: 'test123',
  }), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  check(createRes, {
    'user created': (r) => r.status === 201,
  }) || errorRate.add(1);

  sleep(1);
}
```

### 5. Mock Server Setup

```typescript
// lib/test-utils/mock-server.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const mockServer = setupServer(
  // Mock external API
  http.get('https://api.external.com/data', () => {
    return HttpResponse.json({
      id: '123',
      data: 'mocked response',
    });
  }),

  // Mock with delay
  http.post('https://api.external.com/slow', async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json({ success: true });
  }),

  // Mock error responses
  http.get('https://api.external.com/error', () => {
    return HttpResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }),

  // Dynamic mock based on request
  http.get('https://api.external.com/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: `User ${id}`,
    });
  }),
);

// Setup/teardown
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
```

### 6. Test Helpers & Utilities

```typescript
// lib/test-utils/api-helpers.ts
import request from 'supertest';
import { app } from '@/server';
import { sign } from 'jsonwebtoken';

export class ApiTestHelper {
  private authToken?: string;

  async login(email: string, password: string) {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    this.authToken = response.body.token;
    return this;
  }

  async createTestUser(overrides = {}) {
    const user = {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      password: 'test123',
      ...overrides,
    };

    const response = await this.post('/api/users', user);
    return response.body;
  }

  get(url: string, query = {}) {
    const req = request(app).get(url).query(query);
    if (this.authToken) req.set('Authorization', `Bearer ${this.authToken}`);
    return req;
  }

  post(url: string, body: any) {
    const req = request(app).post(url).send(body);
    if (this.authToken) req.set('Authorization', `Bearer ${this.authToken}`);
    return req;
  }

  put(url: string, body: any) {
    const req = request(app).put(url).send(body);
    if (this.authToken) req.set('Authorization', `Bearer ${this.authToken}`);
    return req;
  }

  delete(url: string) {
    const req = request(app).delete(url);
    if (this.authToken) req.set('Authorization', `Bearer ${this.authToken}`);
    return req;
  }

  generateToken(payload: any, expiresIn = '1h') {
    return sign(payload, process.env.JWT_SECRET!, { expiresIn });
  }

  expectValidationError(response: any, field: string) {
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ field })
    );
  }
}

// Usage
const api = new ApiTestHelper();
await api.login('admin@example.com', 'admin123');
const user = await api.createTestUser({ role: 'ADMIN' });
const response = await api.get('/api/users');
```

### 7. Snapshot Testing for API Responses

```typescript
// __tests__/api/snapshots.test.ts
it('should match API response snapshot', async () => {
  const response = await request(app)
    .get('/api/config')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(200);
  
  // Remove dynamic fields before snapshot
  const normalized = {
    ...response.body,
    timestamp: expect.any(String),
    version: expect.any(String),
  };

  expect(normalized).toMatchSnapshot();
});
```

## WebSocket Testing

```typescript
// __tests__/api/websocket.test.ts
import { io, Socket } from 'socket.io-client';
import { createServer } from '@/server';

describe('WebSocket API', () => {
  let socket: Socket;
  let serverUrl: string;

  beforeAll(async () => {
    const server = await createServer();
    serverUrl = `http://localhost:${server.address().port}`;
  });

  beforeEach((done) => {
    socket = io(serverUrl, {
      auth: { token: 'test-token' },
    });
    socket.on('connect', done);
  });

  afterEach(() => {
    socket.close();
  });

  it('should receive messages on subscribe', (done) => {
    socket.emit('subscribe', { channel: 'notifications' });

    socket.on('notification', (data) => {
      expect(data).toMatchObject({
        type: expect.any(String),
        message: expect.any(String),
      });
      done();
    });

    // Trigger notification
    socket.emit('trigger-notification');
  });

  it('should handle reconnection', (done) => {
    let reconnectCount = 0;

    socket.on('reconnect', () => {
      reconnectCount++;
      if (reconnectCount === 1) {
        expect(socket.connected).toBe(true);
        done();
      }
    });

    // Force disconnect
    socket.disconnect();
    socket.connect();
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db

      - name: Run API tests
        run: npm run test:api
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret

      - name: Run contract tests
        run: npm run test:contract

      - name: Publish Pact contracts
        if: github.ref == 'refs/heads/main'
        run: npm run pact:publish
        env:
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Performance Testing

### Artillery Configuration

```yaml
# artillery.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  
  variables:
    email:
      - "user1@example.com"
      - "user2@example.com"
      - "user3@example.com"

scenarios:
  - name: "User workflow"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ email }}"
            password: "test123"
          capture:
            - json: "$.token"
              as: "authToken"
      
      - get:
          url: "/api/users"
          headers:
            Authorization: "Bearer {{ authToken }}"
          expect:
            - statusCode: 200
      
      - post:
          url: "/api/posts"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            title: "Test Post"
            content: "Content here"
          expect:
            - statusCode: 201
            - contentType: json
      
      - think: 2
```

Run with: `artillery run artillery.yml`

## Best Practices

### 1. Test Organization

```
__tests__/
├── api/
│   ├── integration/
│   │   ├── users.test.ts
│   │   ├── posts.test.ts
│   │   └── auth.test.ts
│   ├── contract/
│   │   └── user-service.pact.ts
│   └── e2e/
│       └── user-journey.test.ts
├── fixtures/
│   ├── users.json
│   └── posts.json
└── setup/
    ├── globalSetup.ts
    ├── globalTeardown.ts
    └── testDb.ts
```

### 2. Database Test Isolation

```typescript
// __tests__/setup/testDb.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

export async function setupTestDb() {
  // Create test database
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
  });

  // Seed test data
  await prisma.user.createMany({
    data: [
      { email: 'admin@test.com', name: 'Admin', role: 'ADMIN' },
      { email: 'user@test.com', name: 'User', role: 'USER' },
    ],
  });
}

export async function cleanupTestDb() {
  const tables = ['User', 'Post', 'Comment'];
  
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}

export async function teardownTestDb() {
  await prisma.$disconnect();
}
```

### 3. Environment Configuration

```bash
# .env.test
DATABASE_URL="postgresql://test:test@localhost:5432/test_db"
REDIS_URL="redis://localhost:6379/1"
JWT_SECRET="test-secret-key"
NODE_ENV="test"
LOG_LEVEL="error"
```

### 4. Parallel Test Execution

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['__tests__/setup/globalSetup.ts'],
    globalSetup: ['__tests__/setup/testDb.ts'],
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.test.ts', '__tests__/**'],
    },
  },
});
```

## Common Patterns

### Rate Limiting Tests

```typescript
it('should enforce rate limits', async () => {
  const requests = Array(101).fill(null).map(() =>
    request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
  );

  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r.status === 429);

  expect(rateLimited.length).toBeGreaterThan(0);
  expect(rateLimited[0].headers['retry-after']).toBeDefined();
});
```

### File Upload Tests

```typescript
it('should upload and process file', async () => {
  const response = await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${authToken}`)
    .attach('file', Buffer.from('test content'), 'test.txt')
    .field('description', 'Test file');

  expect(response.status).toBe(201);
  expect(response.body).toMatchObject({
    filename: expect.any(String),
    size: expect.any(Number),
    url: expect.stringMatching(/^https?:\/\//),
  });
});
```

### Webhook Testing

```typescript
it('should handle webhook callback', async () => {
  const webhookPayload = {
    event: 'payment.completed',
    data: { orderId: '123', amount: 100 },
    signature: 'hmac-signature',
  };

  const response = await request(app)
    .post('/api/webhooks/stripe')
    .set('Stripe-Signature', webhookPayload.signature)
    .send(webhookPayload);

  expect(response.status).toBe(200);
  
  // Verify side effects
  const order = await db.order.findUnique({ where: { id: '123' } });
  expect(order?.status).toBe('PAID');
});
```

## Troubleshooting

### Test Flakiness

```typescript
// Retry flaky tests
it.retry(3)('flaky network test', async () => {
  const response = await request(app).get('/api/external-data');
  expect(response.status).toBe(200);
});

// Add timeouts for slow operations
it('slow operation', async () => {
  const response = await request(app)
    .post('/api/process')
    .timeout(5000);
  
  expect(response.status).toBe(202);
}, 10000); // 10s test timeout
```

### Debug Mode

```typescript
// Enable request/response logging
import debug from 'debug';

const log = debug('test:api');

it('debug test', async () => {
  const response = await request(app)
    .get('/api/users')
    .on('request', (req) => log('Request:', req))
    .on('response', (res) => log('Response:', res.body));

  expect(response.status).toBe(200);
});
```

Run with: `DEBUG=test:api npm test`

## Resources

- [Supertest](https://github.com/ladjs/supertest) - HTTP assertion library
- [MSW](https://mswjs.io/) - API mocking library
- [Pact](https://docs.pact.io/) - Contract testing
- [k6](https://k6.io/) - Load testing tool
- [Artillery](https://www.artillery.io/) - Load testing framework
- [Vitest](https://vitest.dev/) - Fast unit test framework

## Quick Commands

```bash
# Run all API tests
npm run test:api

# Run with coverage
npm run test:api -- --coverage

# Run specific test file
npm run test:api users.test.ts

# Run in watch mode
npm run test:api -- --watch

# Run load tests
k6 run scripts/load-test.js

# Run with environment
API_URL=https://staging.example.com k6 run scripts/load-test.js

# Generate contract tests
npm run pact:test
npm run pact:publish
```

---

**Next Steps:**
1. Set up test database with migrations
2. Configure CI/CD pipeline for automated testing
3. Add contract tests for external services
4. Set up load testing for critical endpoints
5. Integrate with monitoring/alerting systems
