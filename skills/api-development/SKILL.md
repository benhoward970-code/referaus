# API Development & Testing Skill

Complete toolkit for building, testing, and documenting REST APIs with modern best practices.

## When to Use This Skill

- Building new REST APIs or microservices
- Testing existing APIs (integration, load, contract testing)
- Debugging API issues or performance problems
- Generating API documentation
- Setting up API mocks or stubs
- Validating OpenAPI/Swagger specs
- API security testing

## Core Concepts

### REST Best Practices

**Resource Naming**
- Use nouns, not verbs: `/users`, not `/getUsers`
- Plural for collections: `/products`, `/orders`
- Hierarchical relationships: `/users/123/orders`
- Use hyphens for multi-word: `/product-categories`

**HTTP Methods**
- `GET` - Read (idempotent, cacheable)
- `POST` - Create (non-idempotent)
- `PUT` - Replace entire resource (idempotent)
- `PATCH` - Partial update (idempotent)
- `DELETE` - Remove (idempotent)

**Status Codes**
- `200 OK` - Success with body
- `201 Created` - Resource created (return Location header)
- `204 No Content` - Success without body
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid auth
- `403 Forbidden` - Auth but no permission
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate or state conflict
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Temporary downtime

### API Design Patterns

**Pagination**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  },
  "links": {
    "self": "/api/users?page=1",
    "next": "/api/users?page=2",
    "last": "/api/users?page=8"
  }
}
```

**Filtering & Sorting**
```
GET /api/products?category=electronics&price_min=100&sort=-created_at
GET /api/users?status=active&role=admin&limit=50
```

**Error Response Format**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "age",
        "message": "Must be 18 or older"
      }
    ],
    "timestamp": "2026-02-13T07:56:00Z",
    "request_id": "abc123"
  }
}
```

**Versioning**
```
# URL versioning (recommended for simplicity)
/api/v1/users
/api/v2/users

# Header versioning
Accept: application/vnd.myapi.v2+json

# Query parameter (avoid)
/api/users?version=2
```

## Quick Start Templates

### Express.js REST API

```javascript
// server.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/products', require('./routes/products'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

### Resource Controller Pattern

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: errors.array()
      }
    });
  }
  next();
};

// GET /api/v1/users - List users
router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'inactive', 'suspended']),
  validate,
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      
      // Database query here
      const users = await db.users.findMany({
        where: status ? { status } : {},
        skip: (page - 1) * limit,
        take: limit
      });
      
      const total = await db.users.count({
        where: status ? { status } : {}
      });
      
      res.json({
        data: users,
        meta: {
          page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/users/:id - Get single user
router.get('/:id',
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const user = await db.users.findUnique({
        where: { id: req.params.id }
      });
      
      if (!user) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/users - Create user
router.post('/',
  body('email').isEmail(),
  body('name').isString().isLength({ min: 2, max: 100 }),
  body('role').optional().isIn(['user', 'admin', 'moderator']),
  validate,
  async (req, res, next) => {
    try {
      const { email, name, role = 'user' } = req.body;
      
      // Check for duplicates
      const existing = await db.users.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        });
      }
      
      const user = await db.users.create({
        data: { email, name, role }
      });
      
      res.status(201)
        .location(`/api/v1/users/${user.id}`)
        .json({ data: user });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/users/:id - Update user
router.patch('/:id',
  param('id').isUUID(),
  body('email').optional().isEmail(),
  body('name').optional().isString().isLength({ min: 2, max: 100 }),
  body('status').optional().isIn(['active', 'inactive', 'suspended']),
  validate,
  async (req, res, next) => {
    try {
      const user = await db.users.update({
        where: { id: req.params.id },
        data: req.body
      });
      
      res.json({ data: user });
    } catch (error) {
      if (error.code === 'P2025') { // Prisma not found
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      next(error);
    }
  }
);

// DELETE /api/v1/users/:id - Delete user
router.delete('/:id',
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await db.users.delete({
        where: { id: req.params.id }
      });
      
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      next(error);
    }
  }
);

module.exports = router;
```

## Testing

### Jest Integration Tests

```javascript
// tests/users.test.js
const request = require('supertest');
const app = require('../server');

describe('Users API', () => {
  let userId;
  
  beforeAll(async () => {
    // Setup test database
    await db.migrate.latest();
  });
  
  afterAll(async () => {
    await db.destroy();
  });
  
  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          name: 'Test User'
        })
        .expect(201);
      
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.headers.location).toMatch(/\/api\/v1\/users\/.+/);
      
      userId = res.body.data.id;
    });
    
    it('should return 409 for duplicate email', async () => {
      await request(app)
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          name: 'Another User'
        })
        .expect(409);
    });
    
    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'invalid-email',
          name: 'Test User'
        })
        .expect(422);
      
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
  
  describe('GET /api/v1/users', () => {
    it('should list users with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .query({ page: 1, limit: 10 })
        .expect(200);
      
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('total');
    });
    
    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .query({ status: 'active' })
        .expect(200);
      
      expect(res.body.data.every(u => u.status === 'active')).toBe(true);
    });
  });
  
  describe('GET /api/v1/users/:id', () => {
    it('should get a single user', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .expect(200);
      
      expect(res.body.data.id).toBe(userId);
    });
    
    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/v1/users/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
  
  describe('PATCH /api/v1/users/:id', () => {
    it('should update user fields', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .send({ name: 'Updated Name' })
        .expect(200);
      
      expect(res.body.data.name).toBe('Updated Name');
    });
  });
  
  describe('DELETE /api/v1/users/:id', () => {
    it('should delete a user', async () => {
      await request(app)
        .delete(`/api/v1/users/${userId}`)
        .expect(204);
      
      await request(app)
        .get(`/api/v1/users/${userId}`)
        .expect(404);
    });
  });
});
```

### Load Testing with k6

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // List users
  let res = http.get(`${BASE_URL}/users?page=1&limit=20`);
  check(res, {
    'list users status 200': (r) => r.status === 200,
    'list has data': (r) => JSON.parse(r.body).data !== undefined,
  });
  
  sleep(1);
  
  // Create user
  const payload = JSON.stringify({
    email: `user-${Date.now()}@example.com`,
    name: 'Load Test User',
  });
  
  res = http.post(`${BASE_URL}/users`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'create user status 201': (r) => r.status === 201,
  });
  
  if (res.status === 201) {
    const userId = JSON.parse(res.body).data.id;
    
    sleep(0.5);
    
    // Get user
    res = http.get(`${BASE_URL}/users/${userId}`);
    check(res, {
      'get user status 200': (r) => r.status === 200,
    });
    
    sleep(0.5);
    
    // Delete user
    res = http.del(`${BASE_URL}/users/${userId}`);
    check(res, {
      'delete user status 204': (r) => r.status === 204,
    });
  }
  
  sleep(2);
}
```

Run with: `k6 run load-test.js`

## API Documentation

### OpenAPI/Swagger Setup

```javascript
// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to API route files
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };

// In server.js:
// const { specs, swaggerUi } = require('./swagger');
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

### Documenting Endpoints

```javascript
/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
```

## Helper Scripts

### API Test Runner

```bash
#!/bin/bash
# test-api.sh - Quick API testing script

BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
TOKEN="${API_TOKEN:-}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

auth_header() {
  if [ -n "$TOKEN" ]; then
    echo "-H \"Authorization: Bearer $TOKEN\""
  fi
}

test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  echo "Testing: $method $endpoint"
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      $(auth_header) \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      "$BASE_URL$endpoint" \
      $(auth_header))
  fi
  
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)
  
  if [ "$status" -ge 200 ] && [ "$status" -lt 300 ]; then
    echo -e "${GREEN}✓ Status: $status${NC}"
  else
    echo -e "${RED}✗ Status: $status${NC}"
  fi
  
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
}

# Health check
test_endpoint GET "/health"

# List users
test_endpoint GET "/users?page=1&limit=5"

# Create user
test_endpoint POST "/users" '{"email":"test@example.com","name":"Test User"}'

# Get specific user (update ID)
# test_endpoint GET "/users/{id}"

# Update user
# test_endpoint PATCH "/users/{id}" '{"name":"Updated Name"}'

# Delete user
# test_endpoint DELETE "/users/{id}"
```

### Performance Monitor

```javascript
// monitor.js - API performance monitoring
const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

async function measureEndpoint(method, endpoint, data = null) {
  const start = performance.now();
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      ...(data && { data }),
    };
    
    const response = await axios(config);
    const duration = performance.now() - start;
    
    return {
      endpoint,
      method,
      status: response.status,
      duration: Math.round(duration),
      success: true,
    };
  } catch (error) {
    const duration = performance.now() - start;
    
    return {
      endpoint,
      method,
      status: error.response?.status || 0,
      duration: Math.round(duration),
      success: false,
      error: error.message,
    };
  }
}

async function runMonitoring() {
  console.log(`\n🔍 API Performance Monitor - ${new Date().toISOString()}\n`);
  
  const tests = [
    { method: 'GET', endpoint: '/health' },
    { method: 'GET', endpoint: '/users?page=1&limit=20' },
    { method: 'GET', endpoint: '/users?page=1&limit=100' },
    { method: 'GET', endpoint: '/users?status=active' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await measureEndpoint(test.method, test.endpoint, test.data);
    results.push(result);
    
    const icon = result.success ? '✓' : '✗';
    const color = result.success ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(
      `${color}${icon}${reset} ${result.method} ${result.endpoint} - ` +
      `${result.status} (${result.duration}ms)`
    );
    
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  }
  
  console.log('\n📊 Summary:');
  const avgDuration = Math.round(
    results.reduce((sum, r) => sum + r.duration, 0) / results.length
  );
  const successRate = (
    (results.filter(r => r.success).length / results.length) * 100
  ).toFixed(1);
  
  console.log(`  Average response time: ${avgDuration}ms`);
  console.log(`  Success rate: ${successRate}%`);
  console.log('');
}

// Run every 60 seconds
setInterval(runMonitoring, 60000);
runMonitoring(); // Run immediately on start
```

## Security Checklist

### Essential Security Measures

- [ ] **Input Validation**: Validate all inputs (express-validator, joi, zod)
- [ ] **Rate Limiting**: Prevent abuse (express-rate-limit)
- [ ] **Authentication**: JWT, OAuth2, or API keys
- [ ] **Authorization**: Role-based access control (RBAC)
- [ ] **HTTPS Only**: Redirect HTTP to HTTPS in production
- [ ] **CORS**: Configure allowed origins properly
- [ ] **SQL Injection**: Use parameterized queries/ORMs
- [ ] **XSS Prevention**: Sanitize outputs, set CSP headers
- [ ] **CSRF Protection**: Use tokens for state-changing operations
- [ ] **Request Size Limits**: Prevent DoS (express.json({ limit: '10mb' }))
- [ ] **Helmet.js**: Security headers (X-Frame-Options, etc.)
- [ ] **Error Handling**: Don't leak stack traces in production
- [ ] **Logging**: Log security events, failed auth attempts
- [ ] **Dependencies**: Keep packages updated, run `npm audit`
- [ ] **Secrets**: Use environment variables, never commit secrets

### JWT Authentication Example

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'MISSING_AUTH',
        message: 'Authorization header required'
      }
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }
    
    next();
  };
}

module.exports = { authenticate, authorize };

// Usage:
// router.get('/admin/users', authenticate, authorize('admin'), handler);
```

## Performance Optimization

### Caching Strategy

```javascript
// middleware/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

function cacheMiddleware(duration = 300) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = `cache:${req.originalUrl}`;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cache.set(key, body, duration);
      return originalJson(body);
    };
    
    next();
  };
}

// Usage:
// router.get('/users', cacheMiddleware(60), handler);
```

### Database Query Optimization

```javascript
// Use indexes on frequently queried fields
// Use SELECT only needed columns
// Implement connection pooling
// Use read replicas for heavy read workloads

// Example with Prisma:
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    // Don't select password, metadata, etc. unless needed
  },
  where: { status: 'active' },
  take: limit,
  skip: (page - 1) * limit,
  orderBy: { createdAt: 'desc' },
});
```

## Deployment Checklist

- [ ] Environment variables configured (.env in production)
- [ ] Database migrations applied
- [ ] SSL/TLS certificates installed
- [ ] API gateway/reverse proxy configured (nginx, Caddy)
- [ ] Rate limiting enabled
- [ ] Monitoring and alerting setup (Sentry, DataDog, etc.)
- [ ] Health check endpoints working
- [ ] Logging configured (Winston, Pino)
- [ ] Backup strategy in place
- [ ] CI/CD pipeline setup
- [ ] Load balancer configured (if using multiple instances)
- [ ] Auto-scaling configured (if needed)
- [ ] API documentation published
- [ ] CORS configured for production domains

## Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run lint             # Lint code

# Testing
curl -X GET http://localhost:3000/api/v1/users
curl -X POST http://localhost:3000/api/v1/users -H "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test"}'
k6 run load-test.js      # Load testing

# Production
npm run build            # Build for production
npm run start            # Start production server
pm2 start server.js      # Start with PM2
pm2 logs                 # View logs
pm2 restart all          # Restart all instances

# Database
npx prisma migrate dev   # Run migrations (dev)
npx prisma migrate deploy # Run migrations (prod)
npx prisma studio        # Open database GUI

# Docker
docker build -t my-api .
docker run -p 3000:3000 my-api
docker-compose up -d
```

## Troubleshooting

### High Response Times
- Check database query performance (use EXPLAIN)
- Enable caching for frequently accessed data
- Use connection pooling
- Optimize N+1 queries (use eager loading)
- Consider read replicas

### Memory Leaks
- Monitor memory usage: `node --max-old-space-size=4096 server.js`
- Use heap snapshots: `node --inspect server.js`
- Check for unclosed database connections
- Review event listener cleanup

### Rate Limit Issues
- Adjust rate limit configuration
- Use distributed rate limiting (Redis) for multiple instances
- Implement per-user limits vs IP limits
- Add rate limit headers to responses

### CORS Errors
- Verify allowed origins match exactly (including protocol, port)
- Check preflight OPTIONS requests
- Ensure credentials are configured if needed
- Review Access-Control-Allow-* headers

## Resources

- **Express.js**: https://expressjs.com/
- **Swagger/OpenAPI**: https://swagger.io/specification/
- **k6 Load Testing**: https://k6.io/docs/
- **Jest Testing**: https://jestjs.io/
- **REST API Best Practices**: https://restfulapi.net/
- **OWASP API Security**: https://owasp.org/www-project-api-security/

---

**Skill Version**: 1.0.0  
**Last Updated**: 2026-02-13  
**Maintained By**: CLAWDY
