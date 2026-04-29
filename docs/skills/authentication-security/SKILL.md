# Authentication & Security Skill

**Purpose:** Implement secure user authentication  
**Impact:** Protect user data, prevent unauthorized access

---

## Password Security

### Hashing with bcrypt
```typescript
import * as bcrypt from 'bcrypt';

// Hash password on registration
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Higher = more secure, slower
  return bcrypt.hash(password, saltRounds);
}

// Verify password on login
async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Usage
const hashedPassword = await hashPassword('user-password');
const isValid = await verifyPassword('user-password', hashedPassword);
```

### Password Requirements
```typescript
function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
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

---

## JWT (JSON Web Tokens)

### Generate & Verify Tokens
```typescript
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles
    };
    
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '15m'
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET
      })
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### JWT Strategy
```typescript
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles
    };
  }
}
```

### Protected Routes
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
```

---

## Refresh Tokens

### Token Rotation
```typescript
@Post('refresh')
async refreshToken(@Body('refresh_token') refreshToken: string) {
  try {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET
    });
    
    // Issue new tokens
    const newAccessToken = this.jwtService.sign({
      sub: payload.sub,
      email: payload.email
    }, { expiresIn: '15m' });
    
    const newRefreshToken = this.jwtService.sign({
      sub: payload.sub,
      email: payload.email
    }, {
      expiresIn: '7d',
      secret: process.env.REFRESH_TOKEN_SECRET
    });
    
    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    };
  } catch (error) {
    throw new UnauthorizedException('Invalid refresh token');
  }
}
```

---

## Session Management

### Express Session
```typescript
import * as session from 'express-session';
import * as RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true,  // Prevent XSS
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict' // CSRF protection
  }
}));
```

---

## Role-Based Access Control (RBAC)

### Define Roles
```typescript
export enum Role {
  User = 'user',
  Admin = 'admin',
  Moderator = 'moderator'
}

// Decorator
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### Use Roles
```typescript
@Post()
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
createUser(@Body() dto: CreateUserDto) {
  // Only admins can create users
}
```

---

## OAuth 2.0

### Google OAuth Strategy
```typescript
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any
  ) {
    const { id, emails, displayName } = profile;
    
    const user = {
      googleId: id,
      email: emails[0].value,
      name: displayName,
      accessToken
    };
    
    return user;
  }
}
```

### OAuth Routes
```typescript
@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth() {
  // Redirects to Google
}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req) {
  // Handle callback
  return this.authService.login(req.user);
}
```

---

## Two-Factor Authentication (2FA)

### Setup TOTP
```typescript
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Post('2fa/generate')
async generate2FA(@Request() req) {
  const secret = speakeasy.generateSecret({
    name: `MyApp (${req.user.email})`
  });
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  // Save secret to user (encrypted!)
  await this.userService.update(req.user.id, {
    twoFactorSecret: secret.base32
  });
  
  return { qrCode, secret: secret.base32 };
}

@Post('2fa/verify')
async verify2FA(
  @Request() req,
  @Body('token') token: string
) {
  const user = await this.userService.findOne(req.user.id);
  
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps
  });
  
  if (verified) {
    await this.userService.update(user.id, {
      twoFactorEnabled: true
    });
  }
  
  return { verified };
}
```

---

## Rate Limiting

### Prevent Brute Force
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 5 // 5 login attempts per minute
    })
  ]
})

// Apply to login route
@Post('login')
@UseGuards(ThrottlerGuard)
@Throttle(5, 60)
async login(@Body() credentials: LoginDto) {
  // Login logic
}
```

---

## CSRF Protection

### CSRF Tokens
```typescript
import * as csurf from 'csurf';

// Enable CSRF protection
app.use(csurf());

// Send token to client
@Get('csrf-token')
getCsrfToken(@Req() req, @Res() res) {
  res.json({ csrfToken: req.csrfToken() });
}

// Validate on state-changing requests
@Post('update')
update(@Body() data, @Headers('csrf-token') csrfToken) {
  // Request will be rejected if token invalid
}
```

---

## Security Headers

### Helmet.js
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));
```

---

## XSS Prevention

### Sanitize Input
```typescript
import * as DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
}

// Use in controller
@Post('comment')
createComment(@Body('content') content: string) {
  const sanitized = sanitizeInput(content);
  return this.commentService.create(sanitized);
}
```

---

## SQL Injection Prevention

### Always Use Parameterized Queries
```typescript
// ❌ NEVER DO THIS
const email = req.body.email;
const query = `SELECT * FROM users WHERE email = '${email}'`;
await db.query(query);

// ✅ ALWAYS DO THIS
const email = req.body.email;
const user = await userRepository.findOne({ where: { email } });

// ✅ OR WITH RAW QUERIES
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

---

## API Security Checklist

### ✅ Authentication
- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] JWT with short expiration (15min)
- [ ] Refresh token rotation
- [ ] Secure session cookies (httpOnly, secure, sameSite)

### ✅ Authorization
- [ ] Role-based access control
- [ ] Verify user owns resource
- [ ] Principle of least privilege

### ✅ Input Validation
- [ ] Validate all inputs (class-validator)
- [ ] Sanitize user content
- [ ] Prevent SQL injection (parameterized queries)
- [ ] Limit file upload size & types

### ✅ Protection
- [ ] Rate limiting on login/API
- [ ] CSRF protection
- [ ] XSS prevention (sanitize, CSP)
- [ ] Security headers (helmet)
- [ ] HTTPS only
- [ ] CORS properly configured

### ✅ Monitoring
- [ ] Log authentication events
- [ ] Monitor failed login attempts
- [ ] Alert on suspicious activity
- [ ] Regular security audits

---

## Environment Variables

### Never Commit Secrets
```bash
# .env (NEVER commit)
JWT_SECRET=super-secret-key-min-32-characters
REFRESH_TOKEN_SECRET=another-secret-key
DATABASE_URL=postgresql://user:pass@localhost/db
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# .env.example (commit this)
JWT_SECRET=your-jwt-secret-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here
DATABASE_URL=postgresql://user:password@localhost/database
```

---

**Secure by default. Trust nothing. Verify everything.** 🔒🛡️

---

_Authentication & Security Skill by CLAWDY - 12 Feb 2026_
