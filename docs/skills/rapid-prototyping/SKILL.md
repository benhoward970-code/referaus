# Rapid Prototyping Skill

**Purpose:** Build production-ready prototypes in minutes, not hours  
**Cost:** Minimal (uses templates + lightweight generation)  
**Speed:** 10x faster than building from scratch

---

## Quick Start

To build a prototype:
1. Choose template from `workspace/templates/`
2. Customize with AI assistance
3. Deploy immediately

---

## Available Templates

### Landing Pages
- **modern-landing**: `templates/landing-page-modern.html`
  - Hero section with CTA
  - Features grid
  - Stats section
  - Full responsive
  - Use for: Marketing sites, product launches

### Dashboards
- **admin-dashboard**: `templates/dashboard-admin.html`
  - Sidebar navigation
  - Stats cards
  - Data tables
  - Use for: Admin panels, SaaS dashboards

### Coming Soon
- E-commerce product page
- Blog layout
- Portfolio site
- Pricing page
- Contact/About pages

---

## Customization Commands

### Quick Rebrand
```
"Rebrand template [name] to [brand] with colors [primary] and [secondary]"
```

### Add Section
```
"Add [section-type] section to [template] after [existing-section]"
```

### Change Layout
```
"Change [template] layout from [current] to [new-layout]"
```

---

## Component Library

### Pre-built Components

**Navigation:**
- Sticky navbar with dropdown
- Mobile hamburger menu
- Sidebar navigation
- Breadcrumbs

**Content:**
- Hero sections (centered, split, with video)
- Feature grids (2-col, 3-col, 4-col)
- Stats/metrics displays
- Testimonial carousels
- Pricing tables
- FAQ accordions
- Contact forms

**UI Elements:**
- Buttons (primary, secondary, ghost, icon)
- Cards (basic, image, stats, pricing)
- Modals & overlays
- Notifications/toasts
- Loading spinners
- Progress bars

---

## Color Schemes

### Modern Tech
```css
--primary: #6366f1; /* Indigo */
--secondary: #ec4899; /* Pink */
--accent: #14b8a6; /* Teal */
```

### Professional Business
```css
--primary: #2563eb; /* Blue */
--secondary: #7c3aed; /* Purple */
--accent: #059669; /* Green */
```

### Warm & Friendly
```css
--primary: #f59e0b; /* Amber */
--secondary: #ef4444; /* Red */
--accent: #ec4899; /* Pink */
```

### Dark Mode
```css
--bg-primary: #0f172a; /* Slate 900 */
--bg-secondary: #1e293b; /* Slate 800 */
--text: #f8fafc; /* Slate 50 */
```

---

## Typography Scales

### Modern Scale
```css
h1: 3.5rem (56px)
h2: 2.5rem (40px)
h3: 2rem (32px)
h4: 1.5rem (24px)
body: 1rem (16px)
small: 0.875rem (14px)
```

### Compact Scale  
```css
h1: 2.5rem (40px)
h2: 2rem (32px)
h3: 1.5rem (24px)
h4: 1.25rem (20px)
body: 0.875rem (14px)
small: 0.75rem (12px)
```

---

## Grid Systems

### 12-Column Grid
```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.row {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 20px;
}

.col-6 { grid-column: span 6; }
.col-4 { grid-column: span 4; }
.col-3 { grid-column: span 3; }
```

### Auto-Fit Responsive
```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}
```

---

## Animation Patterns

### Fade In Up
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate {
    animation: fadeInUp 0.6s ease;
}
```

### Slide In
```css
@keyframes slideIn {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(0);
    }
}
```

### Scale Up
```css
@keyframes scaleUp {
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}
```

---

## Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## Rapid Build Workflow

### 1. Choose Template (1 min)
- Select closest matching template
- Copy to project folder

### 2. Customize Content (5 min)
- Update text, images, colors
- Adjust sections as needed

### 3. Add Components (10 min)
- Drop in pre-built components
- Adjust spacing/sizing

### 4. Deploy (2 min)
- Push to Vercel/Netlify
- Or save as static HTML

**Total Time: ~18 minutes for production-ready prototype**

---

## Integration Patterns

### Form Handling
```html
<form action="https://formspree.io/f/YOUR_ID" method="POST">
    <input type="email" name="email" required>
    <button type="submit">Submit</button>
</form>
```

### Analytics
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_ID');
</script>
```

### Live Chat
```html
<!-- Tawk.to -->
<script type="text/javascript">
    var Tawk_API=Tawk_API||{};
    var Tawk_LoadStart=new Date();
    // Add your Tawk.to script here
</script>
```

---

## Best Practices

### Performance
- ✅ Inline critical CSS
- ✅ Lazy load images
- ✅ Minify CSS/JS
- ✅ Use CDN for assets
- ✅ Enable gzip compression

### SEO
- ✅ Semantic HTML5
- ✅ Meta tags (title, description)
- ✅ Open Graph tags
- ✅ Schema.org markup
- ✅ Alt text on images

### Accessibility
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Color contrast (4.5:1 minimum)
- ✅ Focus indicators
- ✅ Screen reader support

---

## Quick Commands

### Create from Template
```bash
# Copy template
cp templates/landing-page-modern.html my-project/index.html

# Or use AI
"Create landing page for [product] using modern template"
```

### Customize Colors
```
"Change template colors to use [brand-color] as primary"
```

### Add Feature
```
"Add pricing section with 3 tiers to landing page"
```

### Deploy
```
"Deploy this prototype to Vercel"
```

---

## Examples

### SaaS Landing Page
1. Use: `landing-page-modern.html`
2. Customize: Hero, features, pricing
3. Add: Live chat widget
4. Deploy: Vercel
5. Time: 15 minutes

### Admin Dashboard
1. Use: `dashboard-admin.html`
2. Customize: Stats, tables, branding
3. Add: Charts library (Chart.js)
4. Connect: API endpoints
5. Time: 30 minutes

### Portfolio Site
1. Use: Custom layout
2. Add: Project grid, about section
3. Integrate: Contact form
4. Deploy: Netlify
5. Time: 20 minutes

---

## Pro Tips

1. **Start with closest template** - Don't build from scratch
2. **Use component library** - Drop in pre-built sections
3. **Mobile-first always** - Design for mobile, scale up
4. **Test early** - Deploy prototype ASAP for feedback
5. **Iterate fast** - Don't aim for perfection first time

---

**Build prototypes in minutes, not hours!** 🚀

---

_Rapid Prototyping Skill by CLAWDY - 12 Feb 2026_
