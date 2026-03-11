# Performance Optimization Skill

**Purpose:** Make everything faster - code, builds, deploys, responses  
**Impact:** 10x speed improvements in common workflows

---

## Quick Wins

### Frontend Performance

**1. Code Splitting**
```javascript
// Lazy load components
const Dashboard = lazy(() => import('./Dashboard'));
const Reports = lazy(() => import('./Reports'));

// With Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

**2. Image Optimization**
```javascript
// Next.js Image component
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  priority  // For above-fold images
  quality={85}
  placeholder="blur"
/>
```

**3. Bundle Analysis**
```bash
# Next.js
npm run build -- --profile
ANALYZE=true npm run build

# React
npm install --save-dev webpack-bundle-analyzer
```

---

### Backend Performance

**1. Database Indexing**
```typescript
// Add indexes for frequently queried fields
@Index(['ndisNumber'])
@Index(['planStatus'])
@Index(['currentPlanEndDate'])
@Entity()
export class Participant {
  @Column({ unique: true })
  ndisNumber: string;
  
  @Column()
  @Index()
  planStatus: string;
}
```

**2. Query Optimization**
```typescript
// Bad: N+1 queries
const participants = await repository.find();
for (const p of participants) {
  const plans = await planRepo.findBy({ participantId: p.id });
}

// Good: Single query with relations
const participants = await repository.find({
  relations: ['plans', 'goals'],
  where: { status: 'Active' }
});
```

**3. Caching Layer**
```typescript
import { Cache } from '@nestjs/common';

@Injectable()
export class ParticipantsService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}
  
  async findAll() {
    const cached = await this.cache.get('participants');
    if (cached) return cached;
    
    const data = await this.repository.find();
    await this.cache.set('participants', data, { ttl: 300 }); // 5 min
    return data;
  }
}
```

---

### Build Performance

**1. Parallel Builds**
```bash
# Use all CPU cores
npm install --save-dev concurrently

# package.json
{
  "scripts": {
    "build:all": "concurrently \"npm:build:backend\" \"npm:build:frontend\"",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build"
  }
}
```

**2. Incremental Builds**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

---

## Performance Metrics

### Target Metrics
- **Time to Interactive (TTI):** <3 seconds
- **First Contentful Paint (FCP):** <1.5 seconds
- **API Response Time:** <200ms (p95)
- **Build Time:** <2 minutes

### Measuring Tools
```bash
# Frontend
npx lighthouse https://your-site.com
npm install --save-dev @next/bundle-analyzer

# Backend
npm install --save-dev clinic
clinic doctor -- node dist/main.js
```

---

## Optimization Checklist

### Frontend ✅
- [ ] Code splitting (route-based)
- [ ] Image optimization (WebP, lazy loading)
- [ ] Tree shaking enabled
- [ ] Minification (CSS, JS)
- [ ] Gzip/Brotli compression
- [ ] CDN for static assets
- [ ] Service worker caching
- [ ] Remove unused dependencies

### Backend ✅
- [ ] Database indexes on foreign keys
- [ ] Connection pooling
- [ ] Query result caching
- [ ] API response caching
- [ ] Pagination on large datasets
- [ ] Compression middleware
- [ ] Rate limiting
- [ ] Async/await everywhere

### Build ✅
- [ ] Parallel builds
- [ ] Incremental compilation
- [ ] Docker layer caching
- [ ] Prune dev dependencies in prod
- [ ] Multi-stage builds

---

## Common Bottlenecks

### 1. Large node_modules
```bash
# Analyze bundle size
npx depcheck  # Find unused deps
npm prune --production  # Remove dev deps

# Use lighter alternatives
# lodash → lodash-es (tree-shakeable)
# moment → date-fns (smaller)
```

### 2. Unoptimized Images
```bash
# Convert to WebP
npm install --save-dev sharp
sharp input.jpg -o output.webp

# Responsive images
<picture>
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero">
</picture>
```

### 3. Slow Database Queries
```sql
-- Add EXPLAIN to analyze
EXPLAIN SELECT * FROM participants WHERE ndisNumber = '123456789';

-- Add composite indexes
CREATE INDEX idx_participant_plan 
ON participants(participantId, planStatus, currentPlanEndDate);
```

---

## Quick Commands

### Analyze Bundle
```bash
cd ndis-ops-ui
ANALYZE=true npm run build
```

### Profile Backend
```bash
cd backend
clinic doctor -- npm start
clinic flame -- npm start
```

### Lighthouse Audit
```bash
npx lighthouse http://localhost:3001 --view
```

---

**Make it fast. Keep it fast.** ⚡

---

_Performance Optimization Skill by CLAWDY - 12 Feb 2026_
