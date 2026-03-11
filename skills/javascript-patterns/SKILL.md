# JavaScript Patterns Skill

**Purpose:** Write clean, maintainable, modern JavaScript  
**Impact:** Better code quality, fewer bugs, easier maintenance

---

## Modern Syntax

### Destructuring
```javascript
// Object destructuring
const { name, age, email } = user;
const { firstName, lastName, address: { city } } = person;

// Array destructuring
const [first, second, ...rest] = array;

// Function parameters
function greet({ name, age }) {
  console.log(`${name} is ${age} years old`);
}

// Default values
const { name = 'Anonymous', age = 0 } = user;
```

### Spread & Rest
```javascript
// Spread arrays
const combined = [...array1, ...array2];
const copy = [...original];

// Spread objects
const merged = { ...obj1, ...obj2 };
const updated = { ...user, age: 30 };

// Rest parameters
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
```

### Arrow Functions
```javascript
// Single parameter, single expression
const double = x => x * 2;

// Multiple parameters
const add = (a, b) => a + b;

// Multiple statements
const process = (data) => {
  const cleaned = data.trim();
  return cleaned.toUpperCase();
};

// Object return (wrap in parentheses)
const makeUser = (name, age) => ({ name, age });
```

---

## Async Patterns

### Promises
```javascript
// Creating promises
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: 'Hello' });
    }, 1000);
  });
};

// Chaining
fetchData()
  .then(result => result.data)
  .then(data => console.log(data))
  .catch(error => console.error(error))
  .finally(() => console.log('Done'));

// Promise.all (parallel)
Promise.all([fetch1(), fetch2(), fetch3()])
  .then(([result1, result2, result3]) => {
    // All resolved
  });

// Promise.race (first to complete)
Promise.race([fetch1(), fetch2()])
  .then(result => {
    // First to finish
  });
```

### Async/Await
```javascript
// Basic usage
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user;
}

// Error handling
async function getUser(id) {
  try {
    const user = await fetchUser(id);
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

// Parallel execution
async function fetchAll() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  return { users, posts, comments };
}

// Sequential with results
async function processSequentially(items) {
  const results = [];
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
  }
  return results;
}
```

---

## Array Methods

### Map, Filter, Reduce
```javascript
// Map: transform each element
const doubled = numbers.map(n => n * 2);
const names = users.map(u => u.name);

// Filter: select elements
const adults = users.filter(u => u.age >= 18);
const active = users.filter(u => u.status === 'active');

// Reduce: aggregate
const sum = numbers.reduce((acc, n) => acc + n, 0);
const grouped = users.reduce((acc, user) => {
  acc[user.role] = acc[user.role] || [];
  acc[user.role].push(user);
  return acc;
}, {});

// Chaining
const result = users
  .filter(u => u.age >= 18)
  .map(u => u.name)
  .sort();
```

### Find, Some, Every
```javascript
// Find first match
const admin = users.find(u => u.role === 'admin');
const index = users.findIndex(u => u.id === 123);

// Check if any match
const hasAdmin = users.some(u => u.role === 'admin');

// Check if all match
const allAdults = users.every(u => u.age >= 18);
```

### Modern Methods
```javascript
// Flat
const nested = [[1, 2], [3, 4]];
const flat = nested.flat(); // [1, 2, 3, 4]

// FlatMap
const doubled = [1, 2, 3].flatMap(x => [x, x * 2]);
// [1, 2, 2, 4, 3, 6]

// At (negative indexing)
const last = array.at(-1);
const secondLast = array.at(-2);
```

---

## Object Patterns

### Property Shorthand
```javascript
// ES5
const user = {
  name: name,
  age: age,
  email: email
};

// ES6+
const user = { name, age, email };
```

### Method Shorthand
```javascript
const user = {
  // Old way
  getName: function() {
    return this.name;
  },
  
  // New way
  getName() {
    return this.name;
  }
};
```

### Computed Properties
```javascript
const key = 'name';
const user = {
  [key]: 'John',
  [`get${key}`]() {
    return this[key];
  }
};
```

### Optional Chaining
```javascript
// Old way
const city = user && user.address && user.address.city;

// New way
const city = user?.address?.city;

// With arrays
const first = users?.[0]?.name;

// With functions
const result = obj.method?.();
```

### Nullish Coalescing
```javascript
// Old way (treats 0, '', false as null)
const value = input || 'default';

// New way (only null/undefined)
const value = input ?? 'default';

// Use case
const count = data.count ?? 0; // 0 is valid, only replace null/undefined
```

---

## Function Patterns

### Default Parameters
```javascript
function greet(name = 'Guest', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

// With destructuring
function create({ 
  name = 'Untitled',
  author = 'Anonymous',
  year = new Date().getFullYear()
} = {}) {
  return { name, author, year };
}
```

### IIFE (Immediately Invoked)
```javascript
(function() {
  // Private scope
  const privateVar = 'secret';
  console.log('Executed immediately');
})();

// Arrow function version
(() => {
  // Private scope
})();
```

### Currying
```javascript
// Regular function
function add(a, b) {
  return a + b;
}

// Curried function
const add = a => b => a + b;
const add5 = add(5);
console.log(add5(3)); // 8

// Practical example
const multiply = a => b => a * b;
const double = multiply(2);
const triple = multiply(3);
```

---

## Error Handling

### Try/Catch
```javascript
try {
  const data = JSON.parse(jsonString);
  processData(data);
} catch (error) {
  console.error('Failed to parse JSON:', error.message);
} finally {
  cleanup();
}
```

### Custom Errors
```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateUser(user) {
  if (!user.email) {
    throw new ValidationError('Email is required');
  }
}

try {
  validateUser(user);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  }
}
```

---

## Module Patterns

### ES6 Modules
```javascript
// Export
export const name = 'John';
export function greet() {}
export default class User {}

// Import
import User from './user.js';
import { name, greet } from './utils.js';
import * as utils from './utils.js';

// Re-export
export { name } from './user.js';
export * from './utils.js';
```

### Dynamic Import
```javascript
// Lazy load module
async function loadModule() {
  const module = await import('./heavy-module.js');
  module.doSomething();
}

// Conditional import
if (condition) {
  const { feature } = await import('./feature.js');
  feature();
}
```

---

## Class Patterns

### ES6 Classes
```javascript
class User {
  // Private field
  #password;
  
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.#password = '';
  }
  
  // Method
  greet() {
    return `Hello, ${this.name}`;
  }
  
  // Getter
  get displayName() {
    return this.name.toUpperCase();
  }
  
  // Setter
  set password(value) {
    if (value.length < 8) {
      throw new Error('Password too short');
    }
    this.#password = value;
  }
  
  // Static method
  static create(data) {
    return new User(data.name, data.email);
  }
}

// Inheritance
class Admin extends User {
  constructor(name, email, role) {
    super(name, email);
    this.role = role;
  }
  
  greet() {
    return `${super.greet()} (Admin)`;
  }
}
```

---

## Common Patterns

### Debounce
```javascript
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Usage
const searchInput = debounce((query) => {
  fetchResults(query);
}, 300);
```

### Throttle
```javascript
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage
const handleScroll = throttle(() => {
  console.log('Scrolled');
}, 1000);
```

### Memoization
```javascript
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
```

### Singleton
```javascript
class Database {
  static #instance;
  
  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    Database.#instance = this;
  }
  
  query(sql) {
    // Execute query
  }
}

// Usage
const db1 = new Database();
const db2 = new Database();
console.log(db1 === db2); // true
```

---

## Working with APIs

### Fetch Pattern
```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// Usage
const data = await fetchWithRetry('/api/users');
```

---

## Best Practices

### ✅ DO
```javascript
// Use const/let, not var
const name = 'John';
let age = 30;

// Use template literals
const greeting = `Hello, ${name}!`;

// Use === instead of ==
if (value === 10) {}

// Use async/await over callbacks
async function getData() {
  const data = await fetch(url);
}

// Use array methods over loops
const names = users.map(u => u.name);
```

### ❌ DON'T
```javascript
// Don't use var
var name = 'John'; // ❌

// Don't mutate parameters
function update(obj) {
  obj.name = 'Changed'; // ❌
}

// Don't use == 
if (value == '10') {} // ❌

// Don't use callbacks when async/await available
getData((data) => { // ❌
  processData(data);
});
```

---

**Write modern. Write clean. Write maintainable.** 📝✨

---

_JavaScript Patterns Skill by CLAWDY - 12 Feb 2026_
