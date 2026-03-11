# TypeScript Best Practices Skill

**Purpose:** Write type-safe, maintainable TypeScript code  
**Impact:** Catch bugs at compile time, better IDE support, cleaner code

---

## Type Basics

### Primitive Types
```typescript
// Basic types
const name: string = 'John';
const age: number = 30;
const isActive: boolean = true;
const nothing: null = null;
const notDefined: undefined = undefined;

// Arrays
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ['John', 'Jane'];

// Tuples
const user: [string, number] = ['John', 30];

// Any (avoid when possible)
let anything: any = 'hello';
anything = 42; // No error

// Unknown (safer than any)
let value: unknown = 'hello';
if (typeof value === 'string') {
  console.log(value.toUpperCase()); // ✅ Type guard
}
```

---

## Interfaces vs Types

### Interfaces
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional
  readonly createdAt: Date; // Readonly
}

// Extending interfaces
interface Admin extends User {
  role: string;
  permissions: string[];
}

// Implementing interfaces
class UserAccount implements User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }
}
```

### Type Aliases
```typescript
type UserId = string | number;
type Status = 'active' | 'inactive' | 'pending';

type User = {
  id: UserId;
  name: string;
  status: Status;
};

// Union types
type Response = SuccessResponse | ErrorResponse;

// Intersection types
type AdminUser = User & { role: string };

// Function types
type Calculator = (a: number, b: number) => number;
```

### When to Use Which?
```typescript
// ✅ Use interfaces for objects
interface User {
  name: string;
}

// ✅ Use types for unions/intersections
type Status = 'active' | 'inactive';
type Combined = User & Admin;

// ✅ Use types for primitives
type UserId = string;
```

---

## Generics

### Basic Generics
```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity<string>('hello');

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = {
  data: { id: 1, name: 'John' },
  status: 200,
  message: 'Success'
};

// Generic class
class DataStore<T> {
  private data: T[] = [];

  add(item: T): void {
    this.data.push(item);
  }

  get(index: number): T | undefined {
    return this.data[index];
  }
}

const userStore = new DataStore<User>();
```

### Generic Constraints
```typescript
// Constrain to objects with id
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// Constrain to specific keys
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'John', age: 30 };
const name = getProperty(user, 'name'); // ✅ Type: string
// const invalid = getProperty(user, 'invalid'); // ❌ Error
```

---

## Utility Types

### Built-in Utility Types
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial: All properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number; }

// Required: All properties required
type RequiredUser = Required<User>;

// Readonly: All properties readonly
type ReadonlyUser = Readonly<User>;

// Pick: Select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }

// Omit: Exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string; age: number; }

// Record: Create object type
type UserMap = Record<string, User>;
// { [key: string]: User; }

// Exclude: Remove types from union
type Status = 'active' | 'inactive' | 'pending';
type ActiveStatus = Exclude<Status, 'inactive'>;
// 'active' | 'pending'

// Extract: Extract types from union
type InactiveStatus = Extract<Status, 'inactive' | 'pending'>;
// 'inactive' | 'pending'

// NonNullable: Remove null and undefined
type MaybeString = string | null | undefined;
type DefinitelyString = NonNullable<MaybeString>;
// string

// ReturnType: Get function return type
function getUser() {
  return { id: 1, name: 'John' };
}
type User = ReturnType<typeof getUser>;
// { id: number; name: string; }
```

---

## Type Guards

### Type Predicates
```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // ✅ TypeScript knows it's string
  }
}

// User-defined type guard
interface User {
  name: string;
}

interface Admin {
  name: string;
  role: string;
}

function isAdmin(user: User | Admin): user is Admin {
  return 'role' in user;
}
```

### Discriminated Unions
```typescript
interface SuccessResponse {
  type: 'success';
  data: any;
}

interface ErrorResponse {
  type: 'error';
  message: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse) {
  if (response.type === 'success') {
    console.log(response.data); // ✅ TypeScript knows it has data
  } else {
    console.log(response.message); // ✅ TypeScript knows it has message
  }
}
```

---

## Function Types

### Function Signatures
```typescript
// Function declaration
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const subtract = (a: number, b: number): number => a - b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}`;
}

// Default parameters
function multiply(a: number, b: number = 1): number {
  return a * b;
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// Void return
function logMessage(message: string): void {
  console.log(message);
}

// Never return (throws or infinite loop)
function throwError(message: string): never {
  throw new Error(message);
}
```

### Overloads
```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;
function format(value: string | number | boolean): string {
  return String(value);
}

const str = format('hello'); // ✅ Type: string
const num = format(42);      // ✅ Type: string
```

---

## Advanced Types

### Mapped Types
```typescript
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};

// Example
interface User {
  id: number;
  name: string;
}

type ReadonlyUser = Readonly<User>;
// { readonly id: number; readonly name: string; }
```

### Conditional Types
```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// Practical example
type Flatten<T> = T extends Array<infer U> ? U : T;

type Flat = Flatten<string[]>; // string
type NotFlat = Flatten<string>; // string
```

### Template Literal Types
```typescript
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `/api/${HTTPMethod}`;
// '/api/GET' | '/api/POST' | '/api/PUT' | '/api/DELETE'
```

---

## Strict Mode

### Enable in tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    
    // Or enable individually:
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

---

## Best Practices

### ✅ DO
```typescript
// Use explicit types for function parameters
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Use interfaces for object shapes
interface User {
  id: number;
  name: string;
}

// Use const assertions for literal types
const config = {
  api: 'https://api.example.com',
  timeout: 5000
} as const;

// Use type guards
function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

// Use readonly for immutable data
interface Config {
  readonly apiKey: string;
}
```

### ❌ DON'T
```typescript
// Don't use any
function process(data: any) {} // ❌

// Don't ignore errors with @ts-ignore
// @ts-ignore
const result = something(); // ❌

// Don't use non-null assertion unless certain
const value = maybeNull!; // ❌ Use optional chaining instead

// Don't use object type
function save(data: object) {} // ❌ Too generic

// Don't use Function type
const callback: Function = () => {}; // ❌ Use specific signature
```

---

## Common Patterns

### API Response Handling
```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

async function fetchUser(id: number): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### Event Handler Types
```typescript
// React example
type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;

const handleClick: ButtonClickHandler = (event) => {
  console.log(event.currentTarget);
};
```

### Error Handling
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleError(error: unknown): void {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Quick Reference

```typescript
// Type annotation
const name: string = 'John';

// Interface
interface User {
  id: number;
  name: string;
}

// Type alias
type UserId = string | number;

// Generic function
function identity<T>(value: T): T {
  return value;
}

// Type guard
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Utility types
type Partial<T> = { [K in keyof T]?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

---

**Type safely. Code confidently.** 🛡️✨

---

_TypeScript Best Practices Skill by CLAWDY - 12 Feb 2026_
