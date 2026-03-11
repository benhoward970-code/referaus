#!/usr/bin/env node
// Generate API test file template

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node generate-test-template.js <resource-name> [--graphql]');
  console.log('Example: node generate-test-template.js users');
  console.log('Example: node generate-test-template.js posts --graphql');
  process.exit(1);
}

const resourceName = args[0];
const isGraphQL = args.includes('--graphql');
const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

const restTemplate = `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@/server';
import { db } from '@/lib/db';

describe('${capitalizedName} API', () => {
  let authToken: string;
  let test${capitalizedName}Id: string;

  beforeAll(async () => {
    // Setup: authenticate test user
    const response = await request(app)
      .post('/api/auth/login')
      .send({ 
        email: 'test@example.com', 
        password: 'test123' 
      });
    
    authToken = response.body.token;
  });

  afterAll(async () => {
    // Cleanup: remove test data
    if (test${capitalizedName}Id) {
      await db.${resourceName}.delete({ 
        where: { id: test${capitalizedName}Id } 
      });
    }
  });

  describe('GET /api/${resourceName}', () => {
    it('should return paginated ${resourceName}', async () => {
      const response = await request(app)
        .get('/api/${resourceName}')
        .set('Authorization', \`Bearer \${authToken}\`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 10,
          total: expect.any(Number),
        },
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/${resourceName}');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/${resourceName}/:id', () => {
    it('should return single ${resourceName} by id', async () => {
      // TODO: Create test ${resourceName} first
      const response = await request(app)
        .get(\`/api/${resourceName}/\${test${capitalizedName}Id}\`)
        .set('Authorization', \`Bearer \${authToken}\`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: test${capitalizedName}Id,
        // Add expected fields
      });
    });

    it('should return 404 for non-existent ${resourceName}', async () => {
      const response = await request(app)
        .get('/api/${resourceName}/non-existent-id')
        .set('Authorization', \`Bearer \${authToken}\`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/${resourceName}', () => {
    it('should create new ${resourceName}', async () => {
      const new${capitalizedName} = {
        // Add required fields
        name: 'Test ${capitalizedName}',
      };

      const response = await request(app)
        .post('/api/${resourceName}')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(new${capitalizedName});

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        ...new${capitalizedName},
      });

      test${capitalizedName}Id = response.body.id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/${resourceName}')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/${resourceName}/:id', () => {
    it('should update existing ${resourceName}', async () => {
      const updates = {
        name: 'Updated ${capitalizedName}',
      };

      const response = await request(app)
        .put(\`/api/${resourceName}/\${test${capitalizedName}Id}\`)
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updates);
    });

    it('should return 404 for non-existent ${resourceName}', async () => {
      const response = await request(app)
        .put('/api/${resourceName}/non-existent-id')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/${resourceName}/:id', () => {
    it('should delete ${resourceName}', async () => {
      const response = await request(app)
        .delete(\`/api/${resourceName}/\${test${capitalizedName}Id}\`)
        .set('Authorization', \`Bearer \${authToken}\`);

      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app)
        .get(\`/api/${resourceName}/\${test${capitalizedName}Id}\`)
        .set('Authorization', \`Bearer \${authToken}\`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent ${resourceName}', async () => {
      const response = await request(app)
        .delete('/api/${resourceName}/non-existent-id')
        .set('Authorization', \`Bearer \${authToken}\`);

      expect(response.status).toBe(404);
    });
  });
});
`;

const graphQLTemplate = `import { describe, it, expect, beforeAll } from 'vitest';
import { graphql } from 'graphql';
import { schema } from '@/graphql/schema';
import { createContext } from '@/graphql/context';

describe('${capitalizedName} GraphQL', () => {
  let userId: string;

  beforeAll(async () => {
    // Setup: create test user
    userId = 'test-user-id';
  });

  describe('Queries', () => {
    it('should query ${resourceName}', async () => {
      const query = \`
        query Get${capitalizedName}s {
          ${resourceName} {
            id
            name
            createdAt
          }
        }
      \`;

      const result = await graphql({
        schema,
        source: query,
        contextValue: createContext({ userId }),
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.${resourceName}).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        ])
      );
    });

    it('should query single ${resourceName} by id', async () => {
      const query = \`
        query Get${capitalizedName}($id: ID!) {
          ${resourceName}(id: $id) {
            id
            name
          }
        }
      \`;

      const result = await graphql({
        schema,
        source: query,
        variableValues: { id: 'test-id' },
        contextValue: createContext({ userId }),
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.${resourceName}).toMatchObject({
        id: 'test-id',
      });
    });
  });

  describe('Mutations', () => {
    it('should create ${resourceName}', async () => {
      const mutation = \`
        mutation Create${capitalizedName}($input: Create${capitalizedName}Input!) {
          create${capitalizedName}(input: $input) {
            id
            name
          }
        }
      \`;

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          input: { name: 'Test ${capitalizedName}' },
        },
        contextValue: createContext({ userId }),
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.create${capitalizedName}).toMatchObject({
        id: expect.any(String),
        name: 'Test ${capitalizedName}',
      });
    });

    it('should update ${resourceName}', async () => {
      const mutation = \`
        mutation Update${capitalizedName}($id: ID!, $input: Update${capitalizedName}Input!) {
          update${capitalizedName}(id: $id, input: $input) {
            id
            name
          }
        }
      \`;

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: {
          id: 'test-id',
          input: { name: 'Updated ${capitalizedName}' },
        },
        contextValue: createContext({ userId }),
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.update${capitalizedName}).toMatchObject({
        name: 'Updated ${capitalizedName}',
      });
    });

    it('should delete ${resourceName}', async () => {
      const mutation = \`
        mutation Delete${capitalizedName}($id: ID!) {
          delete${capitalizedName}(id: $id)
        }
      \`;

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: { id: 'test-id' },
        contextValue: createContext({ userId }),
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.delete${capitalizedName}).toBe(true);
    });
  });

  describe('Authorization', () => {
    it('should require authentication', async () => {
      const query = \`
        query Get${capitalizedName}s {
          ${resourceName} {
            id
          }
        }
      \`;

      const result = await graphql({
        schema,
        source: query,
        contextValue: createContext({}), // No userId
      });

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain('Unauthorized');
    });
  });
});
`;

const template = isGraphQL ? graphQLTemplate : restTemplate;
const filename = `${resourceName}.test.ts`;
const testDir = path.join(process.cwd(), '__tests__', 'api', isGraphQL ? 'graphql' : 'integration');

// Create directory if it doesn't exist
fs.mkdirSync(testDir, { recursive: true });

const filePath = path.join(testDir, filename);

if (fs.existsSync(filePath)) {
  console.log(`⚠️  File already exists: ${filePath}`);
  console.log('Rename or delete it first, or use a different resource name.');
  process.exit(1);
}

fs.writeFileSync(filePath, template);
console.log(`✅ Created test file: ${filePath}`);
console.log('');
console.log('Next steps:');
console.log('1. Update the test with actual field names for your resource');
console.log('2. Run the test: npm run test:api ' + filename);
console.log('3. Implement the API endpoints to make tests pass');
