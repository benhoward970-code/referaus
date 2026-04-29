# Accessibility (WCAG) Skill

**Purpose:** Make websites usable for everyone, including people with disabilities  
**Impact:** Reach 15%+ more users, legal compliance, better UX for all

---

## WCAG Principles (POUR)

1. **Perceivable** - Information must be presentable to users
2. **Operable** - Interface must be operable by all users
3. **Understandable** - Information must be understandable
4. **Robust** - Content must work with assistive technologies

---

## Semantic HTML

### Use Proper Elements
```html
<!-- ✅ GOOD: Semantic HTML -->
<nav>
  <ul>
    <li><a href="#home">Home</a></li>
    <li><a href="#about">About</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
</main>

<button>Click Me</button>

<!-- ❌ BAD: Div soup -->
<div class="nav">
  <div class="link">Home</div>
</div>

<div onclick="doSomething()">Click Me</div>
```

---

## ARIA (Accessible Rich Internet Applications)

### ARIA Roles
```html
<!-- Landmark roles -->
<div role="navigation">
<div role="main">
<div role="banner">
<div role="contentinfo">
<div role="search">

<!-- Widget roles -->
<div role="button">
<div role="tab">
<div role="dialog">
<div role="alert">
```

### ARIA Labels
```html
<!-- Label icon buttons -->
<button aria-label="Close dialog">
  <svg>...</svg>
</button>

<!-- Describe purpose -->
<input 
  type="search" 
  aria-label="Search articles"
  placeholder="Search..."
>

<!-- Current state -->
<button aria-pressed="true">Bold</button>
<button aria-expanded="false">Menu</button>
<div aria-hidden="true">Decorative content</div>
```

### ARIA Live Regions
```html
<!-- Announce dynamic content -->
<div aria-live="polite">
  <p>Item added to cart</p>
</div>

<div aria-live="assertive">
  <p>Error: Form submission failed</p>
</div>

<!-- Loading state -->
<div aria-busy="true">Loading...</div>
```

---

## Keyboard Navigation

### Focus Management
```css
/* ✅ GOOD: Visible focus indicator */
a:focus,
button:focus,
input:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* ❌ BAD: Removing outline without replacement */
*:focus {
  outline: none;
}
```

### Tab Order
```html
<!-- Natural tab order (follows DOM) -->
<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
  <a href="#contact">Contact</a>
</nav>

<!-- Custom tab order (avoid if possible) -->
<button tabindex="1">First</button>
<button tabindex="2">Second</button>
<button tabindex="3">Third</button>

<!-- Remove from tab order -->
<div tabindex="-1">Not keyboard accessible</div>

<!-- Make div focusable -->
<div tabindex="0" role="button">Keyboard accessible</div>
```

### Keyboard Event Handling
```javascript
// Handle both click and keyboard
button.addEventListener('click', handleAction);
button.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
});

// Trap focus in modal
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
    
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}
```

---

## Color & Contrast

### WCAG Contrast Ratios
```
Level AA (minimum):
- Normal text: 4.5:1
- Large text (18pt+): 3:1

Level AAA (enhanced):
- Normal text: 7:1
- Large text: 4.5:1
```

### Good Color Combinations
```css
/* ✅ GOOD: High contrast */
.text {
  color: #000000;
  background: #ffffff;
  /* Ratio: 21:1 */
}

.primary-button {
  color: #ffffff;
  background: #0066cc;
  /* Ratio: 4.57:1 */
}

/* ❌ BAD: Low contrast */
.bad-text {
  color: #999999;
  background: #cccccc;
  /* Ratio: 2.8:1 - Fails WCAG AA */
}
```

### Don't Rely on Color Alone
```html
<!-- ✅ GOOD: Color + icon + text -->
<span class="error">
  <svg aria-hidden="true">❌</svg>
  <span>Error: Invalid email</span>
</span>

<!-- ❌ BAD: Color only -->
<span style="color: red;">Invalid email</span>
```

---

## Images

### Alt Text
```html
<!-- ✅ GOOD: Descriptive alt text -->
<img src="dog.jpg" alt="Golden retriever playing fetch in park">

<!-- Decorative images -->
<img src="decorative-line.svg" alt="" role="presentation">

<!-- Complex images -->
<img 
  src="chart.png" 
  alt="Bar chart showing sales increase from $50k to $100k in 2025"
>

<!-- ❌ BAD -->
<img src="image.jpg" alt="image">
<img src="photo.jpg">
```

### SVG Accessibility
```html
<svg role="img" aria-labelledby="icon-title">
  <title id="icon-title">Shopping cart icon</title>
  <path d="..."/>
</svg>

<!-- Decorative SVG -->
<svg aria-hidden="true">
  <path d="..."/>
</svg>
```

---

## Forms

### Labels
```html
<!-- ✅ GOOD: Explicit labels -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" required>

<!-- Group related inputs -->
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street</label>
  <input type="text" id="street">
  
  <label for="city">City</label>
  <input type="text" id="city">
</fieldset>

<!-- ❌ BAD: No label -->
<input type="email" placeholder="Email">
```

### Error Messages
```html
<!-- Associate errors with inputs -->
<label for="password">Password</label>
<input 
  type="password" 
  id="password"
  aria-describedby="password-error"
  aria-invalid="true"
>
<span id="password-error" role="alert">
  Password must be at least 8 characters
</span>
```

### Required Fields
```html
<label for="name">
  Name <span aria-label="required">*</span>
</label>
<input type="text" id="name" required aria-required="true">
```

---

## Skip Links

### Allow Keyboard Users to Skip Navigation
```html
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  
  <nav>
    <!-- Navigation -->
  </nav>
  
  <main id="main-content">
    <!-- Main content -->
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

---

## Headings

### Proper Hierarchy
```html
<!-- ✅ GOOD: Logical hierarchy -->
<h1>Page Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>

<!-- ❌ BAD: Skipping levels -->
<h1>Page Title</h1>
  <h3>Section</h3> <!-- Skipped h2 -->
  
<!-- ❌ BAD: Using for styling -->
<h4>Small text</h4> <!-- Should be <p> with CSS -->
```

---

## Tables

### Accessible Tables
```html
<table>
  <caption>Monthly Sales Report</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Sales</th>
      <th scope="col">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">January</th>
      <td>$50,000</td>
      <td>+10%</td>
    </tr>
  </tbody>
</table>
```

---

## Modals & Dialogs

### Accessible Modal
```html
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-description">
    Are you sure you want to delete this item?
  </p>
  
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

```javascript
function openModal(modal) {
  // Save current focus
  const previousFocus = document.activeElement;
  
  // Show modal
  modal.style.display = 'block';
  
  // Focus first element
  const firstFocusable = modal.querySelector('button, [href], input');
  firstFocusable?.focus();
  
  // Trap focus
  trapFocus(modal);
  
  // Restore focus on close
  modal.addEventListener('close', () => {
    previousFocus.focus();
  });
}
```

---

## Screen Reader Only Content

### Visually Hidden but Screen Reader Accessible
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

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## Testing

### Automated Testing
```bash
# Install axe-core
npm install --save-dev @axe-core/cli

# Run accessibility audit
axe https://example.com

# Or use browser extension
# - axe DevTools
# - WAVE
# - Lighthouse (Chrome DevTools)
```

### Manual Testing
1. **Keyboard only** - Navigate entire site with Tab, Enter, Space, Arrows
2. **Screen reader** - Test with NVDA (Windows), JAWS, or VoiceOver (Mac)
3. **Color contrast** - Use browser DevTools or WebAIM contrast checker
4. **Zoom to 200%** - Ensure content is readable
5. **Responsive** - Test on mobile devices

---

## Common Issues & Fixes

### Issue: Button without accessible name
```html
<!-- ❌ BAD -->
<button><svg>...</svg></button>

<!-- ✅ FIX -->
<button aria-label="Close">
  <svg aria-hidden="true">...</svg>
</button>
```

### Issue: Link with no text
```html
<!-- ❌ BAD -->
<a href="/page"><img src="icon.png"></a>

<!-- ✅ FIX -->
<a href="/page">
  <img src="icon.png" alt="Go to page">
</a>
```

### Issue: Form without labels
```html
<!-- ❌ BAD -->
<input type="text" placeholder="Name">

<!-- ✅ FIX -->
<label for="name">Name</label>
<input type="text" id="name">
```

### Issue: Low contrast text
```css
/* ❌ BAD */
.text {
  color: #999;
  background: #ddd;
}

/* ✅ FIX */
.text {
  color: #333;
  background: #fff;
}
```

---

## Quick Checklist

### ✅ Page Level
- [ ] Page has `<title>`
- [ ] Page language set (`<html lang="en">`)
- [ ] Skip link to main content
- [ ] Logical heading hierarchy (H1 → H2 → H3)
- [ ] All images have alt text
- [ ] Sufficient color contrast (4.5:1 minimum)

### ✅ Interactive Elements
- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators
- [ ] Buttons have accessible names
- [ ] Links have descriptive text
- [ ] Form inputs have labels
- [ ] Error messages associated with inputs

### ✅ Dynamic Content
- [ ] Loading states announced (aria-live)
- [ ] Modal focus trapped
- [ ] Tab order makes sense
- [ ] ARIA states update (aria-expanded, aria-pressed)

---

**Build for everyone. Accessibility is not optional.** ♿✨

---

_Accessibility (WCAG) Skill by CLAWDY - 12 Feb 2026_
