# Web Performance Skill

**Purpose:** Make websites blazing fast  
**Impact:** Better UX, higher conversions, better SEO rankings

---

## Core Web Vitals

### The 3 Key Metrics
```
1. LCP (Largest Contentful Paint) - Loading
   Target: < 2.5 seconds
   
2. FID (First Input Delay) - Interactivity
   Target: < 100 milliseconds
   
3. CLS (Cumulative Layout Shift) - Visual Stability
   Target: < 0.1
```

### Measure Web Vitals
```javascript
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```

---

## Image Optimization

### Modern Image Formats
```html
<!-- Use WebP with fallback -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>

<!-- Next.js automatic optimization -->
<Image
  src="/photo.jpg"
  width={800}
  height={600}
  alt="Description"
  quality={85}
  priority  // For above-fold
/>
```

### Lazy Loading
```html
<!-- Native lazy loading -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Intersection Observer -->
<script>
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));
</script>
```

### Responsive Images
```html
<img
  srcset="
    small.jpg 480w,
    medium.jpg 800w,
    large.jpg 1200w
  "
  sizes="
    (max-width: 600px) 480px,
    (max-width: 1000px) 800px,
    1200px
  "
  src="medium.jpg"
  alt="Responsive image"
>
```

---

## Code Splitting

### Dynamic Imports
```javascript
// Before: Bundle everything
import HeavyComponent from './HeavyComponent';

// After: Load on demand
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### Route-Based Splitting
```javascript
// Next.js automatically code-splits by route
// pages/about.js → about-[hash].js
// pages/contact.js → contact-[hash].js

// React Router with lazy loading
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

<Routes>
  <Route path="/about" element={
    <Suspense fallback={<Loading />}>
      <About />
    </Suspense>
  } />
</Routes>
```

---

## Bundle Optimization

### Analyze Bundle Size
```bash
# Next.js
ANALYZE=true npm run build

# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer
```

### Tree Shaking
```javascript
// ❌ BAD: Imports entire library
import _ from 'lodash';

// ✅ GOOD: Import only what you need
import debounce from 'lodash/debounce';

// ✅ BETTER: Use tree-shakeable alternative
import { debounce } from 'lodash-es';
```

### Remove Unused Code
```javascript
// Check for unused exports
npx depcheck

// Remove dead code
npm prune --production
```

---

## Critical CSS

### Inline Critical CSS
```html
<head>
  <style>
    /* Critical above-fold CSS */
    body { margin: 0; font-family: sans-serif; }
    .header { background: #000; color: #fff; }
  </style>
  
  <!-- Load full CSS async -->
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles.css"></noscript>
</head>
```

### Extract Critical CSS
```bash
# Using critical package
npm install --save-dev critical

# Extract and inline critical CSS
critical source.html --base dist/ --inline > optimized.html
```

---

## JavaScript Optimization

### Defer Non-Critical JS
```html
<!-- Defer script execution -->
<script src="app.js" defer></script>

<!-- Load async (for independent scripts) -->
<script src="analytics.js" async></script>

<!-- Module scripts (defer by default) -->
<script type="module" src="app.js"></script>
```

### Minification
```bash
# Production build automatically minifies
npm run build

# Manual minification
npx terser app.js -o app.min.js --compress --mangle
```

---

## Caching Strategies

### HTTP Caching Headers
```nginx
# Static assets - cache for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# HTML - no cache
location ~* \.html$ {
  add_header Cache-Control "no-cache";
}
```

### Service Worker Caching
```javascript
// sw.js
const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/app.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

---

## Resource Hints

### Preload Critical Resources
```html
<!-- Preload fonts -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preload critical images -->
<link rel="preload" href="/hero.jpg" as="image">

<!-- Preload critical CSS -->
<link rel="preload" href="/critical.css" as="style">
```

### Preconnect to External Domains
```html
<!-- Establish early connection -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://cdn.example.com">

<!-- DNS prefetch (fallback) -->
<link rel="dns-prefetch" href="https://analytics.google.com">
```

### Prefetch Next Page
```html
<!-- Prefetch likely next navigation -->
<link rel="prefetch" href="/about.html">

<!-- Prerender for instant load -->
<link rel="prerender" href="/next-page.html">
```

---

## Compression

### Enable Gzip/Brotli
```nginx
# Nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;

# Brotli (better compression)
brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

### Pre-compress Assets
```bash
# Compress during build
gzip -k -9 dist/*.js dist/*.css

# Brotli compression
brotli -k dist/*.js dist/*.css
```

---

## Database Performance

### Connection Pooling
```typescript
// TypeORM config
{
  type: 'postgres',
  extra: {
    max: 20,              // Max pool size
    min: 5,               // Min connections
    idleTimeoutMillis: 30000,
  }
}
```

### Query Optimization
```typescript
// ❌ BAD: N+1 queries
const users = await userRepo.find();
for (const user of users) {
  user.posts = await postRepo.find({ userId: user.id });
}

// ✅ GOOD: Single query with joins
const users = await userRepo.find({
  relations: ['posts']
});
```

### Indexing
```sql
-- Add index on frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Composite index
CREATE INDEX idx_posts_user_status ON posts(user_id, status);
```

---

## CDN Usage

### Static Assets
```html
<!-- Use CDN for libraries -->
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>

<!-- Use CDN for images -->
<img src="https://cdn.example.com/images/photo.jpg" alt="Photo">
```

### Next.js Image CDN
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.example.com'],
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/demo/image/upload/',
  },
};
```

---

## Performance Budget

### Set Targets
```javascript
// performance-budget.json
{
  "sizes": {
    "bundle": 250000,    // 250KB max bundle
    "image": 100000,     // 100KB max image
    "total": 500000      // 500KB total page
  },
  "budgets": [
    {
      "resourceSizes": [{
        "resourceType": "script",
        "budget": 250
      }]
    }
  ]
}
```

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://example.com
      https://example.com/about
    uploadArtifacts: true
```

---

## Monitoring

### Real User Monitoring (RUM)
```javascript
// Send metrics to analytics
import { getCLS, getFID, getLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  fetch('/analytics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

### Performance Observer
```javascript
// Monitor long tasks
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Long task detected:', entry.duration);
  }
});

observer.observe({ entryTypes: ['longtask'] });
```

---

## Quick Wins Checklist

### ✅ Images
- [ ] Convert to WebP
- [ ] Add lazy loading
- [ ] Use responsive srcset
- [ ] Compress images
- [ ] Use CDN

### ✅ Code
- [ ] Minify CSS/JS
- [ ] Tree shake unused code
- [ ] Code split by route
- [ ] Remove console.logs
- [ ] Use production build

### ✅ Loading
- [ ] Defer non-critical JS
- [ ] Inline critical CSS
- [ ] Preload critical resources
- [ ] Enable compression (gzip/brotli)
- [ ] Use CDN

### ✅ Caching
- [ ] Set cache headers
- [ ] Implement service worker
- [ ] Use ETags
- [ ] Cache API responses

### ✅ Fonts
- [ ] Preload fonts
- [ ] Use font-display: swap
- [ ] Subset fonts
- [ ] Use system fonts

---

## Performance Tools

```bash
# Lighthouse audit
npx lighthouse https://example.com --view

# WebPageTest
https://webpagetest.org

# Bundle size
npm install -g cost-of-modules
cost-of-modules

# Check unused CSS
npx purgecss --css style.css --content index.html

# Image optimization
npm install -g sharp-cli
sharp input.jpg -o output.webp
```

---

**Fast sites win. Optimize everything.** ⚡🚀

---

_Web Performance Skill by CLAWDY - 12 Feb 2026_
