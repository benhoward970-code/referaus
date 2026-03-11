# Error Handling Skill

**Purpose:** Handle errors gracefully and provide great user experience  
**Impact:** Better debugging, happier users, more reliable apps

---

## Try/Catch Basics

### Synchronous Code
```typescript
function parseJSON(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error.message);
    return null;
  }
}

// Usage
const data = parseJSON(userInput);
if (data) {
  processData(data);
} else {
  showError('Invalid JSON format');
}
```

### Async Code
```typescript
async function fetchUser(id: number) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error; // Re-throw to let caller handle
  }
}
```

---

## Custom Error Classes

### Define Custom Errors
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}
```

### Use Custom Errors
```typescript
async function getUser(id: number) {
  const user = await userRepository.findOne(id);
  
  if (!user) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }
  
  return user;
}

// Catch specific errors
try {
  const user = await getUser(123);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('User not found, creating new one');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Global Error Handling

### Express Error Middleware
```typescript
import { Request, Response, NextFunction } from 'express';

function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error:', error);
  
  // Operational errors (expected)
  if (error instanceof AppError && error.isOperational) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }
  
  // Programming errors (unexpected)
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
}

// Use in app
app.use(errorHandler);
```

### NestJS Exception Filter
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message = typeof errorResponse === 'string' 
        ? errorResponse 
        : (errorResponse as any).message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

// Apply globally
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## React Error Boundaries

### Create Error Boundary
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

---

## API Error Responses

### Standard Error Format
```typescript
interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  errors?: Record<string, string[]>; // Validation errors
  stack?: string; // Only in development
}

function formatError(error: Error, isDevelopment: boolean): ErrorResponse {
  return {
    status: 'error',
    message: error.message,
    code: (error as any).code,
    stack: isDevelopment ? error.stack : undefined
  };
}
```

### Handle Different Error Types
```typescript
async function apiCall(req: Request, res: Response) {
  try {
    const result = await someOperation();
    res.json({ status: 'success', data: result });
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      return res.status(503).json({
        status: 'error',
        message: 'Service temporarily unavailable'
      });
    }
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({
        status: 'error',
        message: 'Resource already exists'
      });
    }
    
    throw error; // Let error handler catch it
  }
}
```

---

## Validation Errors

### Collect Multiple Errors
```typescript
interface ValidationError {
  field: string;
  message: string;
}

function validateUser(user: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!user.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(user.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (!user.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (user.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  return errors;
}

// Usage
const errors = validateUser(userData);
if (errors.length > 0) {
  return res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors
  });
}
```

---

## Retry Logic

### Simple Retry
```typescript
async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw new Error('Max attempts reached');
}

// Usage
const data = await retry(() => fetchData(), 3, 1000);
```

### Retry with Specific Errors
```typescript
async function retryOnNetworkError<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isNetworkError = 
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message.includes('network');
      
      if (!isNetworkError || attempt === maxAttempts) {
        throw error;
      }
      
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }
  
  throw new Error('Unreachable');
}
```

---

## Circuit Breaker Pattern

### Simple Circuit Breaker
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime?: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime! > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage
const breaker = new CircuitBreaker(5, 60000);

try {
  const data = await breaker.execute(() => fetchExternalAPI());
} catch (error) {
  console.log('Circuit breaker prevented call or call failed');
}
```

---

## Logging Errors

### Structured Logging
```typescript
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

function logError(error: Error, context?: Record<string, any>) {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context
  });
}

// Usage
try {
  await dangerousOperation();
} catch (error) {
  logError(error, {
    userId: req.user.id,
    operation: 'dangerousOperation',
    timestamp: new Date().toISOString()
  });
  throw error;
}
```

---

## User-Friendly Error Messages

### Map Technical to User Errors
```typescript
function getUserFriendlyMessage(error: Error): string {
  const errorMap: Record<string, string> = {
    'ENOTFOUND': 'Unable to connect. Please check your internet connection.',
    'ETIMEDOUT': 'Request timed out. Please try again.',
    '23505': 'This email is already registered.',
    'JsonWebTokenError': 'Your session has expired. Please log in again.',
  };
  
  const code = (error as any).code || error.name;
  return errorMap[code] || 'Something went wrong. Please try again later.';
}

// Usage in React
function ErrorMessage({ error }: { error: Error }) {
  return (
    <div className="error">
      {getUserFriendlyMessage(error)}
    </div>
  );
}
```

---

## Best Practices

### ✅ DO
```typescript
// Catch specific errors
try {
  await operation();
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle not found
  } else if (error instanceof ValidationError) {
    // Handle validation
  } else {
    // Handle unexpected
  }
}

// Always clean up resources
try {
  const connection = await openConnection();
  await doWork(connection);
} catch (error) {
  handleError(error);
} finally {
  await connection.close();
}

// Provide context in errors
throw new Error(`Failed to process user ${userId}: ${reason}`);

// Log errors before re-throwing
try {
  await criticalOperation();
} catch (error) {
  logger.error('Critical operation failed', { error, userId });
  throw error;
}
```

### ❌ DON'T
```typescript
// Don't swallow errors
try {
  await operation();
} catch (error) {
  // Silent failure ❌
}

// Don't expose sensitive info
throw new Error(`Database connection failed: ${password}`); // ❌

// Don't use errors for flow control
try {
  const user = getUser(id);
} catch {
  // Using exceptions for logic ❌
}

// Don't catch without handling
try {
  await operation();
} catch (e) {
  console.log(e); // Not enough ❌
}
```

---

**Handle errors gracefully. Fail fast. Recover well.** 🛡️✨

---

_Error Handling Skill by CLAWDY - 13 Feb 2026_
