# Form Validation Skill

**Purpose:** Validate user input effectively on frontend and backend  
**Impact:** Better UX, data integrity, security

---

## Client-Side Validation

### HTML5 Validation
```html
<form>
  <!-- Required field -->
  <input type="text" name="name" required>
  
  <!-- Email validation -->
  <input type="email" name="email" required>
  
  <!-- Pattern matching -->
  <input 
    type="text" 
    name="phone" 
    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
    placeholder="123-456-7890"
  >
  
  <!-- Min/max length -->
  <input 
    type="text" 
    name="username" 
    minlength="3" 
    maxlength="20" 
    required
  >
  
  <!-- Number range -->
  <input 
    type="number" 
    name="age" 
    min="18" 
    max="100" 
    required
  >
  
  <button type="submit">Submit</button>
</form>
```

### JavaScript Validation
```javascript
const form = document.getElementById('myForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Clear previous errors
  clearErrors();
  
  // Validate
  const errors = validateForm();
  
  if (errors.length > 0) {
    displayErrors(errors);
    return;
  }
  
  // Submit form
  submitForm();
});

function validateForm() {
  const errors = [];
  const formData = new FormData(form);
  
  // Name validation
  const name = formData.get('name');
  if (!name || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }
  
  // Email validation
  const email = formData.get('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }
  
  // Password validation
  const password = formData.get('password');
  if (!password || password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  return errors;
}

function displayErrors(errors) {
  errors.forEach(error => {
    const field = document.querySelector(`[name="${error.field}"]`);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = error.message;
    field.parentNode.appendChild(errorElement);
    field.classList.add('error');
  });
}
```

---

## React Validation

### Controlled Form with State
```typescript
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    // Name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
    setErrors(validate());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true });
    
    const newErrors = validate();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Submit form
      console.log('Form submitted:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.name && errors.name && (
          <span className="error">{errors.name}</span>
        )}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.email && errors.email && (
          <span className="error">{errors.email}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.password && errors.password && (
          <span className="error">{errors.password}</span>
        )}
      </div>

      <button type="submit">Register</button>
    </form>
  );
}
```

---

## Backend Validation (NestJS)

### DTOs with class-validator
```typescript
import { 
  IsString, 
  IsEmail, 
  MinLength, 
  MaxLength,
  IsOptional,
  Matches,
  IsInt,
  Min,
  Max
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, and number' }
  )
  password: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  age?: number;

  @IsOptional()
  @Matches(/^\d{3}-\d{3}-\d{4}$/, { message: 'Phone must be in format 123-456-7890' })
  phone?: string;
}
```

### Custom Validators
```typescript
import { 
  registerDecorator, 
  ValidationOptions, 
  ValidatorConstraint, 
  ValidatorConstraintInterface 
} from 'class-validator';

// Check if username is unique
@ValidatorConstraint({ async: true })
export class IsUsernameUniqueConstraint implements ValidatorConstraintInterface {
  async validate(username: string) {
    const user = await userRepository.findOne({ where: { username } });
    return !user;
  }

  defaultMessage() {
    return 'Username already exists';
  }
}

export function IsUsernameUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameUniqueConstraint,
    });
  };
}

// Usage in DTO
export class CreateUserDto {
  @IsString()
  @IsUsernameUnique()
  username: string;
}
```

---

## Validation Libraries

### Zod (TypeScript-first)
```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().int().min(18).max(100).optional(),
});

// Validate
const result = userSchema.safeParse(data);

if (!result.success) {
  console.error(result.error.issues);
} else {
  console.log(result.data);
}

// Type inference
type User = z.infer<typeof userSchema>;
```

### Yup
```javascript
import * as yup from 'yup';

const userSchema = yup.object({
  name: yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain uppercase letter')
    .required('Password is required'),
  
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

// Validate
try {
  await userSchema.validate(data, { abortEarly: false });
} catch (err) {
  console.error(err.errors);
}
```

---

## Common Validation Patterns

### Email Validation
```javascript
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

### Password Strength
```javascript
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Must contain number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Must contain special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Phone Number
```javascript
function isValidPhone(phone) {
  // US format: (123) 456-7890 or 123-456-7890
  const regex = /^(\(\d{3}\)\s?|\d{3}-)\d{3}-\d{4}$/;
  return regex.test(phone);
}
```

### Credit Card
```javascript
function isValidCreditCard(number) {
  // Luhn algorithm
  const digits = number.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}
```

### URL
```javascript
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

---

## Real-Time Validation

### Debounced Validation
```javascript
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const validateEmailDebounced = debounce(async (email) => {
  if (!isValidEmail(email)) {
    showError('email', 'Invalid email format');
    return;
  }
  
  // Check if email exists
  const exists = await checkEmailExists(email);
  if (exists) {
    showError('email', 'Email already registered');
  }
}, 500);

emailInput.addEventListener('input', (e) => {
  validateEmailDebounced(e.target.value);
});
```

---

## Error Display

### Inline Errors
```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-group.error input {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.success-message {
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

### Toast Notifications
```javascript
function showToast(message, type = 'error') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

---

## Security Considerations

### Sanitize Input
```javascript
function sanitizeInput(input) {
  return input
    .trim()
    .replace(/[<>]/g, ''); // Remove < and >
}
```

### Prevent XSS
```javascript
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

### Rate Limiting (Backend)
```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 attempts per minute
@Post('register')
async register(@Body() dto: CreateUserDto) {
  // Register user
}
```

---

## Best Practices

### ✅ DO
- Validate on both client and server
- Provide clear, helpful error messages
- Validate as user types (debounced)
- Show errors inline near fields
- Use appropriate input types (email, tel, etc.)
- Sanitize and escape user input
- Rate limit form submissions

### ❌ DON'T
- Rely only on client-side validation
- Show generic "Invalid input" messages
- Validate on every keystroke (no debounce)
- Clear entire form on error
- Trust client-side data without server validation
- Allow unlimited form submissions

---

**Validate early. Validate often. Validate everywhere.** ✅🛡️

---

_Form Validation Skill by CLAWDY - 12 Feb 2026_
