# Testing Frameworks Skill

**Purpose:** Ship code with confidence through comprehensive testing  
**Impact:** Catch bugs before users do

---

## Testing Pyramid

```
       /\
      /E2E\      <- Few (slow, expensive)
     /------\
    /  API   \   <- Some (medium speed)
   /----------\
  /    UNIT    \ <- Many (fast, cheap)
 /--------------\
```

**Strategy:** Many unit tests, some integration tests, few E2E tests

---

## Unit Testing (Jest)

### Basic Setup
```bash
npm install --save-dev jest @types/jest ts-jest
```

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Service Test Example
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantsService } from './participants.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Participant } from './entities/participant.entity';

describe('ParticipantsService', () => {
  let service: ParticipantsService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantsService,
        {
          provide: getRepositoryToken(Participant),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ParticipantsService>(ParticipantsService);
  });

  describe('findAll', () => {
    it('should return array of participants', async () => {
      const expected = [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' },
      ];
      
      mockRepo.find.mockResolvedValue(expected);

      const result = await service.findAll();
      
      expect(result).toEqual(expected);
      expect(mockRepo.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no participants', async () => {
      mockRepo.find.mockResolvedValue([]);

      const result = await service.findAll();
      
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return participant by id', async () => {
      const expected = { id: 1, firstName: 'John' };
      mockRepo.findOne.mockResolvedValue(expected);

      const result = await service.findOne(1);
      
      expect(result).toEqual(expected);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Participant not found');
    });
  });

  describe('create', () => {
    it('should create and return new participant', async () => {
      const dto = { firstName: 'John', lastName: 'Doe' };
      const expected = { id: 1, ...dto };
      
      mockRepo.save.mockResolvedValue(expected);

      const result = await service.create(dto);
      
      expect(result).toEqual(expected);
      expect(mockRepo.save).toHaveBeenCalledWith(dto);
    });
  });
});
```

---

## Integration Testing

### API Integration Tests
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('ParticipantsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    
    authToken = response.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /participants', () => {
    it('should return list of participants', () => {
      return request(app.getHttpServer())
        .get('/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/participants')
        .expect(401);
    });
  });

  describe('POST /participants', () => {
    it('should create new participant', () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        ndisNumber: '123456789',
        email: 'john@test.com'
      };

      return request(app.getHttpServer())
        .post('/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.firstName).toBe('John');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'J' }) // Too short
        .expect(400);
    });
  });
});
```

---

## Frontend Testing (React Testing Library)

### Setup
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Component Test
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ParticipantForm } from './ParticipantForm';

describe('ParticipantForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render form fields', () => {
    render(<ParticipantForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('NDIS Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<ParticipantForm onSubmit={mockOnSubmit} />);
    
    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    render(<ParticipantForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByLabelText('NDIS Number'), {
      target: { value: '123456789' }
    });

    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        ndisNumber: '123456789'
      });
    });
  });
});
```

---

## E2E Testing (Playwright)

### Setup
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test';

test.describe('Participant Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3001/login');
    await page.fill('[name="email"]', 'test@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should create new participant', async ({ page }) => {
    // Navigate to participants
    await page.click('text=Participants');
    await page.waitForURL('**/participants');

    // Click create button
    await page.click('text=Add Participant');

    // Fill form
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="ndisNumber"]', '123456789');
    await page.fill('[name="email"]', 'john@test.com');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Participant created successfully')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should search participants', async ({ page }) => {
    await page.goto('http://localhost:3001/participants');

    // Search
    await page.fill('[placeholder="Search participants"]', 'John');
    await page.press('[placeholder="Search participants"]', 'Enter');

    // Verify results
    await expect(page.locator('text=John')).toBeVisible();
  });

  test('should edit participant', async ({ page }) => {
    await page.goto('http://localhost:3001/participants');

    // Click edit on first participant
    await page.click('button[aria-label="Edit"]:first-of-type');

    // Change name
    await page.fill('[name="firstName"]', 'Jane');
    await page.click('button[type="submit"]');

    // Verify update
    await expect(page.locator('text=Jane')).toBeVisible();
  });
});
```

---

## Test Coverage

### Generate Coverage Report
```bash
# Backend
npm run test:cov

# Frontend
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Coverage Thresholds
```json
// package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

## Testing Best Practices

### ✅ DO
- Write tests before fixing bugs
- Test edge cases (null, zero, empty)
- Use descriptive test names
- Keep tests independent
- Mock external dependencies
- Test one thing per test
- Aim for 70%+ coverage

### ❌ DON'T
- Test implementation details
- Have tests depend on each other
- Use real databases in unit tests
- Ignore flaky tests
- Test third-party libraries
- Skip error cases

---

## Continuous Testing

### Pre-commit Hook
```bash
# .husky/pre-commit
#!/bin/sh
npm test
```

### CI Pipeline
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

---

## Quick Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test participants.service.spec.ts

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run specific E2E test
npx playwright test participants.spec.ts
```

---

**Test early. Test often. Ship with confidence.** ✅

---

_Testing Frameworks Skill by CLAWDY - 12 Feb 2026_
