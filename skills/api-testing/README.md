# API Testing Skill

Complete testing suite for REST APIs, GraphQL, WebSockets, and load testing.

## Quick Start

1. **Setup test environment:**
   ```bash
   bash scripts/setup-test-env.sh
   ```

2. **Generate test file:**
   ```bash
   node scripts/generate-test-template.js users        # REST API
   node scripts/generate-test-template.js posts --graphql  # GraphQL
   ```

3. **Run tests:**
   ```bash
   npm run test:api              # All API tests
   npm run test:api:watch        # Watch mode
   npm run test:coverage         # With coverage report
   ```

## What's Included

### 📚 Comprehensive Guide (`SKILL.md`)
- REST API testing patterns
- GraphQL testing
- Contract testing with Pact
- Load testing with k6 and Artillery
- WebSocket testing
- Mock server setup with MSW
- CI/CD integration examples
- Best practices and troubleshooting

### 🛠️ Helper Scripts
- `setup-test-env.sh` - Docker-based test database setup
- `generate-test-template.js` - Generate test files for new resources

### 📋 Templates
- `vitest.config.ts` - Vitest configuration
- `package.json` - Dependencies for API testing
- `k6-template.js` - k6 load testing template

## Testing Layers

```
┌─────────────────────────────────────┐
│         E2E Tests (Playwright)       │  Full user journeys
├─────────────────────────────────────┤
│       Integration Tests (Vitest)     │  API endpoints + DB
├─────────────────────────────────────┤
│       Contract Tests (Pact)          │  API contracts
├─────────────────────────────────────┤
│       Load Tests (k6/Artillery)      │  Performance
└─────────────────────────────────────┘
```

## Test Structure

```
__tests__/
├── api/
│   ├── integration/        # REST/GraphQL integration tests
│   ├── contract/          # Pact contract tests
│   └── e2e/              # End-to-end scenarios
├── fixtures/             # Test data
│   ├── users.json
│   └── posts.json
└── setup/               # Test configuration
    ├── globalSetup.ts
    ├── globalTeardown.ts
    └── testDb.ts
```

## Common Commands

```bash
# Development
npm run test:api:watch           # Watch mode for rapid development

# CI/CD
npm run test:api                 # Run all integration tests
npm run test:coverage            # Generate coverage report
npm run test:contract            # Run contract tests
npm run pact:publish             # Publish contracts to broker

# Performance
npm run test:load                # k6 load tests
npm run test:perf                # Artillery performance tests
k6 run --vus 100 --duration 30s scripts/load-test.js  # Custom load
```

## Environment Variables

```bash
# .env.test
DATABASE_URL="postgresql://postgres:test@localhost:5432/test_db"
REDIS_URL="redis://localhost:6379/1"
JWT_SECRET="test-secret-key"
NODE_ENV="test"
LOG_LEVEL="error"
```

## Tips

1. **Isolate tests** - Each test should be independent
2. **Clean up** - Remove test data in `afterAll` hooks
3. **Mock external APIs** - Use MSW to avoid hitting real services
4. **Test error cases** - Don't just test happy paths
5. **Use factories** - Create test data with factory functions
6. **Snapshot strategically** - Good for complex response structures
7. **Load test early** - Catch performance issues before production

## Integration with Other Skills

- **security-hardening** - Test auth, input validation, rate limiting
- **ui-component-library** - E2E tests for UI components with API calls

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Supertest](https://github.com/ladjs/supertest)
- [MSW](https://mswjs.io/)
- [k6 Docs](https://k6.io/docs/)
- [Pact Docs](https://docs.pact.io/)

---

Built for CLAWDY workspace | Last updated: 2026-02-13
