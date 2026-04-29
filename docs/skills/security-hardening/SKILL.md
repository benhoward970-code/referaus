---
name: security-hardening
description: Complete security hardening guide for web applications. Use when implementing authentication, authorization, input validation, API security, data protection, or defending against common attacks (XSS, CSRF, SQL injection, etc.). Covers OWASP Top 10 and production security best practices.
---

# Security Hardening

Comprehensive security implementation for production web applications.

## OWASP Top 10 Protection

### 1. Broken Access Control
**Problem:** Users can access resources they shouldn't.

**Solutions:**
```typescript
// Implement role-based access control (RBAC)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Get('sensitive-data')
getSensitiveData() { }

// Row-level security
async findUserData(userId: string, requesterId: string) {
  if (userId !== requesterId && !isAdmin(requesterId)) {
    throw new ForbiddenException();
  }
  return this.repository.find({ userId });
}

// Check ownership before updates
async update(id: string, userId: string, data: any) {
  const resource = await this.findOne(id);
  if (resource.ownerId !== userId) {
    throw new ForbiddenException('Not your resource');
  }
  return this.repository.update(id, data);
}
```

### 2. Cryptographic Failures
**Problem:** Sensitive data exposure through weak encryption.

**Solutions:**
```typescript
// Hash passwords properly
import * as bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// JWT secrets - use strong, random values
JWT_SECRET=<generate with: openssl rand -base64 64>

// Encrypt sensitive database fields
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

// Never store plaintext:
// ❌ creditCard: '4111111111111111'
// ✅ creditCard: encrypt('4111111111111111')
```

### 3. Injection Attacks
**Problem:** SQL, NoSQL, command injection.

**Solutions:**
```typescript
// Use ORM parameterization (TypeORM)
// ❌ NEVER DO THIS:
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ ALWAYS DO THIS:
const user = await this.userRepository.findOne({ 
  where: { email } 
});

// Use query builders for complex queries
const users = await this.userRepository
  .createQueryBuilder('user')
  .where('user.role = :role', { role })
  .andWhere('user.active = :active', { active: true })
  .getMany();

// Validate and sanitize ALL inputs
import { IsEmail, IsString, Length } from 'class-validator';
class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @Length(8, 100)
  password: string;
}
```

### 4. Insecure Design
**Problem:** Missing security by design.

**Solutions:**
```typescript
// Rate limiting
import rateLimit from 'express-rate-limit';
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Specific endpoints need stricter limits
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per minute
@Post('login')
async login() { }

// Implement account lockout
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 min

if (user.loginAttempts >= MAX_ATTEMPTS) {
  const timeSinceLock = Date.now() - user.lockedAt;
  if (timeSinceLock < LOCKOUT_TIME) {
    throw new ForbiddenException('Account locked');
  }
}
```

### 5. Security Misconfiguration
**Problem:** Default configs, unnecessary features enabled.

**Solutions:**
```typescript
// Helmet.js for security headers
import helmet from 'helmet';
app.use(helmet());

// Explicit CORS configuration
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Remove version headers
app.disable('x-powered-by');

// Environment-specific configs
// ❌ Don't expose errors in production:
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    res.status(500).json({ message: 'Internal server error' });
  });
} else {
  // Detailed errors only in development
  app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message, stack: err.stack });
  });
}
```

### 6. Vulnerable Components
**Problem:** Outdated dependencies with known vulnerabilities.

**Solutions:**
```bash
# Regular audits
npm audit
npm audit fix

# Automated scanning (add to CI/CD)
npm install -g snyk
snyk test
snyk monitor

# Dependabot (GitHub)
# Enable in repo settings → automatically creates PRs for updates

# Update strategy
npm outdated
npm update
```

### 7. Authentication Failures
**Problem:** Weak authentication, session management.

**Solutions:**
```typescript
// Strong password requirements
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

// Multi-factor authentication
async enableMFA(userId: string) {
  const secret = speakeasy.generateSecret();
  await this.saveSecret(userId, secret.base32);
  return QRCode.toDataURL(secret.otpauth_url);
}

async verifyMFA(userId: string, token: string) {
  const secret = await this.getSecret(userId);
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token
  });
}

// JWT best practices
const JWT_EXPIRES_IN = '15m'; // Short-lived access tokens
const REFRESH_EXPIRES_IN = '7d'; // Longer refresh tokens

// Secure session cookies
res.cookie('refreshToken', token, {
  httpOnly: true,  // Can't access via JavaScript
  secure: true,    // HTTPS only
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

### 8. Software/Data Integrity Failures
**Problem:** Unsigned updates, insecure CI/CD.

**Solutions:**
```yaml
# GitHub Actions - secure pipeline
name: CI/CD
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # Lock dependencies
      - run: npm ci  # Not npm install
      
      # Security scan
      - run: npm audit
      
      # Code quality
      - run: npm run lint
      - run: npm test
      
      # Build verification
      - run: npm run build
      
      # Deploy only from main branch
      - if: github.ref == 'refs/heads/main'
        run: npm run deploy
```

### 9. Logging & Monitoring Failures
**Problem:** Insufficient logging, no alerting.

**Solutions:**
```typescript
// Structured logging
import { Logger } from '@nestjs/common';
const logger = new Logger('SecurityEvents');

// Log security events
logger.warn(`Failed login attempt: ${email} from ${ip}`);
logger.error(`Unauthorized access attempt: ${userId} to ${resource}`);

// Centralized logging
import * as winston from 'winston';
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Never log sensitive data
// ❌ logger.info(`User logged in: ${email} with password ${password}`);
// ✅ logger.info(`User logged in: ${userId}`);
```

### 10. Server-Side Request Forgery (SSRF)
**Problem:** Attacker makes server perform requests.

**Solutions:**
```typescript
// Validate URLs
import { isURL } from 'validator';

async fetchExternal(url: string) {
  if (!isURL(url, { protocols: ['http', 'https'] })) {
    throw new BadRequestException('Invalid URL');
  }
  
  // Whitelist approach
  const ALLOWED_DOMAINS = ['api.example.com', 'trusted-partner.com'];
  const hostname = new URL(url).hostname;
  if (!ALLOWED_DOMAINS.includes(hostname)) {
    throw new ForbiddenException('Domain not allowed');
  }
  
  return fetch(url);
}
```

## Input Validation

```typescript
// Class-validator patterns
import { 
  IsString, IsEmail, IsInt, Min, Max, 
  Length, Matches, IsOptional, ValidateNested 
} from 'class-validator';

class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @Length(12, 128)
  @Matches(PASSWORD_REGEX)
  password: string;
  
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;
  
  @IsInt()
  @Min(18)
  @Max(120)
  age: number;
}

// Sanitize HTML inputs
import * as sanitizeHtml from 'sanitize-html';

@Transform(({ value }) => sanitizeHtml(value, {
  allowedTags: ['b', 'i', 'em', 'strong'],
  allowedAttributes: {}
}))
bio: string;
```

## API Security

```typescript
// API Key authentication
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    return this.validateApiKey(apiKey);
  }
}

// Request size limiting
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// CORS preflight caching
app.use(cors({
  maxAge: 86400 // 24 hours
}));
```

## File Upload Security

```typescript
// Validate file types
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async upload(@UploadedFile() file: Express.Multer.File) {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    throw new BadRequestException('Invalid file type');
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB
    throw new BadRequestException('File too large');
  }
  
  // Scan for malware (if applicable)
  await this.scanFile(file);
  
  // Generate safe filename
  const ext = path.extname(file.originalname);
  const filename = `${uuid()}${ext}`;
  
  return this.saveFile(filename, file.buffer);
}
```

## Database Security

```typescript
// Connection string security
// ❌ Never commit:
DATABASE_URL=postgresql://user:password@localhost/db

// ✅ Use environment variables:
DATABASE_URL=${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}

// SSL connections in production
{
  type: 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: true 
  } : false
}

// Backup encryption
pg_dump dbname | gpg --encrypt --recipient admin@example.com > backup.sql.gpg
```

## Deployment Security

```bash
# Use secrets management
# AWS Secrets Manager, HashiCorp Vault, etc.

# Minimal Docker images
FROM node:20-alpine  # Not node:20 (500MB smaller)

# Don't run as root
USER node

# Read-only filesystem where possible
docker run --read-only ...

# Scan images
docker scan myapp:latest
```

## Monitoring & Alerting

```typescript
// Failed login monitoring
if (failedLoginCount > 10 in last hour) {
  alert('Potential brute force attack');
}

// Unusual activity detection
if (requests from IP > 1000/min) {
  alert('Possible DDoS');
}

// Data access monitoring
if (user downloads > 1000 records) {
  alert('Possible data exfiltration');
}
```

## Security Checklist

**Before Production:**
- [ ] All secrets in environment variables
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (ORM)
- [ ] XSS protection (sanitization)
- [ ] CSRF tokens implemented
- [ ] Strong password requirements
- [ ] Account lockout after failed attempts
- [ ] Security headers (Helmet.js)
- [ ] CORS properly configured
- [ ] Error messages don't leak info
- [ ] Logging excludes sensitive data
- [ ] Dependencies updated & scanned
- [ ] Backups encrypted
- [ ] Monitoring & alerting active

**Regular Tasks:**
- [ ] Weekly: npm audit
- [ ] Monthly: Dependency updates
- [ ] Quarterly: Penetration testing
- [ ] Annually: Security audit

Remember: Security is not a feature, it's a requirement.
