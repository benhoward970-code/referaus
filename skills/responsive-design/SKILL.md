# Responsive Design Skill

**Purpose:** Make websites look perfect on every device  
**Impact:** Mobile-first, accessible, beautiful everywhere

---

## Mobile-First Approach

### Why Mobile-First?
```css
/* ❌ BAD: Desktop-first (requires many overrides) */
.container {
  width: 1200px;
  padding: 40px;
}

@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 20px;
  }
}

/* ✅ GOOD: Mobile-first (progressive enhancement) */
.container {
  width: 100%;
  padding: 20px;
}

@media (min-width: 768px) {
  .container {
    max-width: 1200px;
    padding: 40px;
  }
}
```

---

## Breakpoints

### Standard Breakpoints
```css
/* Mobile (default) */
/* 0px - 639px */

/* Tablet */
@media (min-width: 640px) {
  /* sm */
}

@media (min-width: 768px) {
  /* md */
}

/* Desktop */
@media (min-width: 1024px) {
  /* lg */
}

@media (min-width: 1280px) {
  /* xl */
}

@media (min-width: 1536px) {
  /* 2xl */
}
```

---

## Responsive Layout Patterns

### 1. Fluid Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

### 2. Flexbox Responsive
```css
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.flex-item {
  flex: 1 1 300px; /* grow, shrink, basis */
}
```

### 3. Container Queries (Modern)
```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
```

---

## Responsive Typography

### Fluid Typography
```css
/* Clamp: min, preferred, max */
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}

h2 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}

p {
  font-size: clamp(1rem, 2vw, 1.25rem);
}
```

### Media Query Typography
```css
body {
  font-size: 16px;
  line-height: 1.5;
}

@media (min-width: 768px) {
  body {
    font-size: 18px;
    line-height: 1.6;
  }
}

@media (min-width: 1024px) {
  body {
    font-size: 20px;
    line-height: 1.7;
  }
}
```

---

## Responsive Images

### Picture Element
```html
<picture>
  <source 
    media="(min-width: 1024px)" 
    srcset="large.jpg"
  >
  <source 
    media="(min-width: 768px)" 
    srcset="medium.jpg"
  >
  <img 
    src="small.jpg" 
    alt="Responsive image"
  >
</picture>
```

### Srcset
```html
<img 
  src="image-400.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  alt="Responsive image"
>
```

### CSS Object Fit
```css
img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  object-position: center;
}
```

---

## Navigation Patterns

### Mobile Menu
```html
<nav>
  <div class="nav-header">
    <div class="logo">Brand</div>
    <button class="menu-toggle">☰</button>
  </div>
  <ul class="nav-links">
    <li><a href="#home">Home</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</nav>
```

```css
/* Mobile */
.menu-toggle {
  display: block;
}

.nav-links {
  display: none;
  flex-direction: column;
}

.nav-links.active {
  display: flex;
}

/* Desktop */
@media (min-width: 768px) {
  .menu-toggle {
    display: none;
  }
  
  .nav-links {
    display: flex;
    flex-direction: row;
  }
}
```

---

## Responsive Tables

### Horizontal Scroll
```css
.table-container {
  overflow-x: auto;
}

table {
  min-width: 600px;
}
```

### Card Layout (Mobile)
```css
/* Desktop */
table {
  width: 100%;
}

/* Mobile */
@media (max-width: 640px) {
  table,
  thead,
  tbody,
  tr,
  th,
  td {
    display: block;
  }
  
  thead {
    display: none;
  }
  
  tr {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
  }
  
  td {
    text-align: right;
    padding: 0.5rem;
    position: relative;
  }
  
  td::before {
    content: attr(data-label);
    position: absolute;
    left: 0;
    font-weight: bold;
  }
}
```

---

## Viewport Meta Tag

```html
<!-- Required for responsive design -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Prevent zoom (not recommended) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

---

## CSS Units

### Responsive Units
```css
/* Viewport units */
.hero {
  height: 100vh;  /* 100% viewport height */
  width: 100vw;   /* 100% viewport width */
}

/* Relative units */
.container {
  width: 90%;     /* Percentage */
  padding: 2rem;  /* Relative to root font-size */
  margin: 1em;    /* Relative to element font-size */
}

/* Avoid fixed pixels for layouts */
/* ❌ width: 300px; */
/* ✅ width: 100%; max-width: 300px; */
```

---

## Common Patterns

### Sidebar Layout
```css
.layout {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .layout {
    flex-direction: row;
  }
  
  .sidebar {
    width: 250px;
  }
  
  .main {
    flex: 1;
  }
}
```

### Card Grid
```css
.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Hero Section
```css
.hero {
  padding: 2rem 1rem;
  text-align: center;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}

@media (min-width: 768px) {
  .hero {
    padding: 4rem 2rem;
    text-align: left;
  }
}
```

---

## Touch Targets

### Minimum Size
```css
/* Touch targets should be at least 44x44px */
button,
a {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
}

/* Increase spacing between touch targets */
.nav-links a {
  padding: 1rem;
  margin: 0.5rem;
}
```

---

## Performance Tips

### 1. Lazy Load Images
```html
<img 
  src="placeholder.jpg" 
  data-src="actual-image.jpg"
  loading="lazy"
  alt="Description"
>
```

### 2. Reduce Images on Mobile
```css
@media (max-width: 640px) {
  .decorative-bg {
    background-image: none;
  }
}
```

### 3. Hide Content on Mobile
```css
@media (max-width: 640px) {
  .desktop-only {
    display: none;
  }
}
```

---

## Testing Responsive Design

### Browser DevTools
```
1. Open DevTools (F12)
2. Click device toolbar icon
3. Test different devices:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)
```

### Media Query Debugging
```css
/* Visual breakpoint indicator */
body::after {
  content: 'Mobile';
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: red;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
}

@media (min-width: 640px) {
  body::after { content: 'Tablet'; background: blue; }
}

@media (min-width: 1024px) {
  body::after { content: 'Desktop'; background: green; }
}
```

---

## Accessibility

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Focus Styles
```css
a:focus,
button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

---

## Print Styles

```css
@media print {
  /* Hide navigation, ads, etc. */
  nav,
  aside,
  .no-print {
    display: none;
  }
  
  /* Reset colors for printing */
  * {
    color: black !important;
    background: white !important;
  }
  
  /* Show link URLs */
  a::after {
    content: " (" attr(href) ")";
  }
  
  /* Page breaks */
  h1, h2, h3 {
    page-break-after: avoid;
  }
}
```

---

## Checklist

### Mobile
- [ ] Text readable without zooming
- [ ] Touch targets min 44x44px
- [ ] No horizontal scrolling
- [ ] Fast load time (<3s)
- [ ] Working without JavaScript

### Tablet
- [ ] Layout adapts to landscape/portrait
- [ ] Navigation accessible
- [ ] Images properly sized

### Desktop
- [ ] Max-width on content (readability)
- [ ] Hover states on interactive elements
- [ ] Keyboard navigation works

### All Devices
- [ ] Images responsive
- [ ] Typography scales
- [ ] Forms easy to fill
- [ ] No content hidden
- [ ] Accessible (WCAG 2.1 AA)

---

**Design for every screen. Delight every user.** 📱💻🖥️

---

_Responsive Design Skill by CLAWDY - 12 Feb 2026_
