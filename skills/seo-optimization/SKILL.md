# SEO Optimization Skill

**Purpose:** Get your website ranking high on Google  
**Impact:** More organic traffic, better visibility, higher conversions

---

## Essential Meta Tags

### Basic SEO Tags
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Title (50-60 characters) -->
  <title>Your Page Title | Brand Name</title>
  
  <!-- Meta Description (150-160 characters) -->
  <meta name="description" content="Compelling description that makes people want to click. Include primary keyword naturally.">
  
  <!-- Charset & Viewport -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://example.com/page">
  
  <!-- Language -->
  <meta name="language" content="English">
  
  <!-- Robots -->
  <meta name="robots" content="index, follow">
</head>
</html>
```

---

## Open Graph (Social Media)

### Facebook/LinkedIn
```html
<!-- Basic -->
<meta property="og:title" content="Your Page Title">
<meta property="og:description" content="Description for social sharing">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="website">

<!-- Optional -->
<meta property="og:site_name" content="Your Site Name">
<meta property="og:locale" content="en_US">

<!-- Image specifications -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Image description">
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@yourusername">
<meta name="twitter:creator" content="@yourusername">
<meta name="twitter:title" content="Your Page Title">
<meta name="twitter:description" content="Description for Twitter">
<meta name="twitter:image" content="https://example.com/image.jpg">
```

---

## Structured Data (Schema.org)

### Article Schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "description": "Article description",
  "image": "https://example.com/image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2026-02-12",
  "dateModified": "2026-02-12"
}
</script>
```

### LocalBusiness Schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Your Business Name",
  "image": "https://example.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "telephone": "+1-555-123-4567",
  "openingHours": "Mo-Fr 09:00-17:00",
  "priceRange": "$$"
}
</script>
```

### Product Schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "image": "https://example.com/product.jpg",
  "description": "Product description",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/product"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "89"
  }
}
</script>
```

---

## Semantic HTML

### Proper Structure
```html
<!-- ✅ GOOD: Semantic HTML -->
<header>
  <nav>
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Main Heading</h1>
    <section>
      <h2>Section Heading</h2>
      <p>Content...</p>
    </section>
  </article>
  
  <aside>
    <h3>Related Content</h3>
  </aside>
</main>

<footer>
  <p>&copy; 2026 Company</p>
</footer>

<!-- ❌ BAD: Div soup -->
<div class="header">
  <div class="nav">
    <div class="menu-item">Home</div>
  </div>
</div>
```

### Heading Hierarchy
```html
<!-- ✅ GOOD: Proper hierarchy -->
<h1>Page Title (only one per page)</h1>
  <h2>Main Section</h2>
    <h3>Subsection</h3>
    <h3>Another Subsection</h3>
  <h2>Another Main Section</h2>

<!-- ❌ BAD: Skipping levels -->
<h1>Page Title</h1>
  <h3>Subsection</h3> <!-- Skipped h2 -->
```

---

## URL Structure

### SEO-Friendly URLs
```
✅ GOOD:
https://example.com/blog/seo-best-practices
https://example.com/products/running-shoes
https://example.com/about-us

❌ BAD:
https://example.com/page.php?id=123
https://example.com/p/xyz-abc-def
https://example.com/blog_post_final_v2
```

### Best Practices
- Use hyphens, not underscores
- Keep URLs short and descriptive
- Include target keyword
- Use lowercase
- Avoid special characters
- No session IDs or parameters

---

## Image Optimization

### Alt Text
```html
<!-- ✅ GOOD: Descriptive alt text -->
<img src="blue-running-shoes.jpg" alt="Blue Nike running shoes on white background">

<!-- ❌ BAD: Generic or missing -->
<img src="image1.jpg" alt="image">
<img src="photo.jpg">
```

### Lazy Loading
```html
<img 
  src="placeholder.jpg" 
  data-src="actual-image.jpg"
  loading="lazy"
  alt="Description"
>
```

### Next.js Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority  // For above-fold images
  quality={85}
/>
```

---

## Performance

### Core Web Vitals
```javascript
// Measure performance
if ('web-vital' in window) {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log); // Cumulative Layout Shift
    getFID(console.log); // First Input Delay
    getFCP(console.log); // First Contentful Paint
    getLCP(console.log); // Largest Contentful Paint
    getTTFB(console.log); // Time to First Byte
  });
}
```

### Optimization Checklist
- [ ] Minify CSS/JS
- [ ] Compress images (WebP)
- [ ] Enable gzip/brotli
- [ ] Use CDN
- [ ] Lazy load images
- [ ] Defer non-critical JS
- [ ] Reduce server response time (<200ms)
- [ ] Eliminate render-blocking resources

---

## Sitemap

### XML Sitemap
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-02-12</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2026-02-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Generate Sitemap (Next.js)
```typescript
// pages/api/sitemap.xml.ts
export default function handler(req, res) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
}
```

---

## Robots.txt

```txt
# Allow all robots
User-agent: *
Allow: /

# Block specific pages
Disallow: /admin/
Disallow: /private/
Disallow: /api/

# Sitemap location
Sitemap: https://example.com/sitemap.xml
```

---

## Internal Linking

### Best Practices
```html
<!-- ✅ GOOD: Descriptive anchor text -->
<a href="/seo-guide">Learn about SEO best practices</a>

<!-- ❌ BAD: Generic anchor text -->
<a href="/seo-guide">Click here</a>
<a href="/seo-guide">Read more</a>

<!-- Link to related content -->
<article>
  <h2>SEO Basics</h2>
  <p>Want to dive deeper? Check out our 
    <a href="/advanced-seo">advanced SEO techniques</a>.
  </p>
</article>
```

---

## Mobile Optimization

### Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Mobile-Friendly Test
```
Google Search Console > Mobile Usability
https://search.google.com/test/mobile-friendly
```

---

## Page Speed

### Lighthouse Score
```bash
# Install
npm install -g lighthouse

# Run audit
lighthouse https://example.com --view

# Target scores:
# Performance: >90
# Accessibility: >90
# Best Practices: >90
# SEO: >90
```

### Quick Wins
```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/font.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- DNS prefetch -->
<link rel="dns-prefetch" href="https://analytics.google.com">
```

---

## Content Optimization

### Keyword Research
1. Use Google Keyword Planner
2. Analyze competitors
3. Long-tail keywords (3-4 words)
4. Search intent (informational, transactional)

### Content Guidelines
- **Title:** Include primary keyword
- **First paragraph:** Include keyword naturally
- **Headings:** Use keywords in H2/H3
- **Content length:** 1000+ words for pillar content
- **Internal links:** 2-3 per page
- **External links:** 1-2 authoritative sources
- **Images:** Alt text with keywords

---

## Technical SEO Checklist

### ✅ On-Page SEO
- [ ] Unique title tags (<60 chars)
- [ ] Meta descriptions (<160 chars)
- [ ] H1 tag (one per page)
- [ ] Semantic HTML
- [ ] Alt text on images
- [ ] Internal linking
- [ ] Mobile-friendly
- [ ] Fast loading (<3s)
- [ ] HTTPS enabled
- [ ] No broken links

### ✅ Technical
- [ ] XML sitemap submitted
- [ ] Robots.txt configured
- [ ] Canonical tags
- [ ] Structured data
- [ ] 301 redirects for moved pages
- [ ] 404 page exists
- [ ] No duplicate content
- [ ] Proper URL structure

### ✅ Off-Page SEO
- [ ] Quality backlinks
- [ ] Social media presence
- [ ] Local listings (Google My Business)
- [ ] Online reviews

---

## Common Mistakes

### ❌ Avoid These
```html
<!-- Keyword stuffing -->
<h1>SEO SEO SEO Best Practices for SEO</h1>

<!-- Hidden text -->
<div style="display:none">keywords keywords keywords</div>

<!-- Duplicate content -->
<!-- Same content on multiple pages -->

<!-- Broken links -->
<a href="/page-that-doesnt-exist">Link</a>

<!-- Missing alt text -->
<img src="important-image.jpg">

<!-- Slow loading -->
<!-- Unoptimized 5MB images -->
```

---

## Monitoring & Analytics

### Google Search Console
- Monitor search performance
- Submit sitemap
- Check mobile usability
- Fix crawl errors
- View backlinks

### Google Analytics
- Track organic traffic
- Monitor bounce rate
- Analyze user behavior
- Set up goals
- Track conversions

---

## Quick SEO Wins

1. **Add meta descriptions** to all pages
2. **Optimize images** (compress, add alt text)
3. **Fix broken links**
4. **Improve page speed** (compress files)
5. **Add structured data**
6. **Submit sitemap** to Google
7. **Get HTTPS** (free with Let's Encrypt)
8. **Mobile optimize**
9. **Internal linking** between related pages
10. **Update old content** regularly

---

**Rank higher. Get found. Convert more.** 🚀📈

---

_SEO Optimization Skill by CLAWDY - 12 Feb 2026_
