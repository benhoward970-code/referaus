# CSS Animations Skill

**Purpose:** Bring interfaces to life with smooth animations  
**Impact:** Better UX, more engaging interfaces

---

## CSS Transitions

### Basic Syntax
```css
.element {
  transition: property duration timing-function delay;
}

/* Examples */
.button {
  transition: background-color 0.3s ease;
}

.box {
  transition: all 0.5s ease-in-out;
}

/* Multiple properties */
.card {
  transition: 
    transform 0.3s ease,
    box-shadow 0.3s ease,
    opacity 0.2s linear;
}
```

### Common Transitions
```css
/* Hover effects */
.button {
  background: blue;
  transition: background 0.3s;
}

.button:hover {
  background: darkblue;
}

/* Transform */
.card {
  transform: scale(1);
  transition: transform 0.3s;
}

.card:hover {
  transform: scale(1.05);
}

/* Opacity */
.modal {
  opacity: 0;
  transition: opacity 0.3s;
}

.modal.show {
  opacity: 1;
}
```

---

## Keyframe Animations

### Basic Animation
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.element {
  animation: fadeIn 0.5s ease;
}
```

### Multi-Step Animation
```css
@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.element {
  animation: slideInUp 0.6s ease-out;
}
```

### Animation Properties
```css
.element {
  animation-name: bounce;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  animation-delay: 0.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-fill-mode: forwards;
  
  /* Shorthand */
  animation: bounce 1s ease-in-out 0.5s infinite alternate forwards;
}
```

---

## Common Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease;
}
```

### Slide In
```css
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slideInUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### Bounce
```css
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

.bounce {
  animation: bounce 1s;
}
```

### Pulse
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.pulse {
  animation: pulse 2s infinite;
}
```

### Shake
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.shake {
  animation: shake 0.5s;
}
```

### Spin
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

---

## Loading Animations

### Spinner
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Dots
```css
.loading-dots span {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #3498db;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
}
```

### Progress Bar
```css
.progress {
  width: 100%;
  height: 4px;
  background: #f3f3f3;
  overflow: hidden;
}

.progress-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## Hover Effects

### Scale Up
```css
.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.05);
}
```

### Lift (Shadow)
```css
.card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
}
```

### Underline
```css
.link {
  position: relative;
  text-decoration: none;
}

.link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}

.link:hover::after {
  width: 100%;
}
```

### Button Press
```css
.button {
  transition: transform 0.1s;
}

.button:active {
  transform: scale(0.95);
}
```

---

## Timing Functions

```css
/* Built-in */
.ease { transition: all 0.3s ease; }
.linear { transition: all 0.3s linear; }
.ease-in { transition: all 0.3s ease-in; }
.ease-out { transition: all 0.3s ease-out; }
.ease-in-out { transition: all 0.3s ease-in-out; }

/* Custom cubic-bezier */
.custom {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Steps (for sprite animations) */
.sprite {
  animation: sprite 1s steps(10) infinite;
}
```

---

## Performance Tips

### ✅ Animate These (GPU-accelerated)
```css
/* Fast animations */
.fast {
  transform: translateX(100px);
  opacity: 0.5;
}
```

### ❌ Avoid Animating These (CPU-bound)
```css
/* Slow animations */
.slow {
  width: 100px;      /* ❌ Triggers layout */
  height: 100px;     /* ❌ Triggers layout */
  margin: 10px;      /* ❌ Triggers layout */
  padding: 10px;     /* ❌ Triggers layout */
}
```

### Will-Change Hint
```css
.animated {
  will-change: transform, opacity;
}

/* Remove after animation */
.animated.done {
  will-change: auto;
}
```

---

## Animation States

### Play/Pause
```css
.animation {
  animation: spin 2s linear infinite;
  animation-play-state: running;
}

.animation.paused {
  animation-play-state: paused;
}
```

### Delay Stagger
```css
.item:nth-child(1) { animation-delay: 0s; }
.item:nth-child(2) { animation-delay: 0.1s; }
.item:nth-child(3) { animation-delay: 0.2s; }
.item:nth-child(4) { animation-delay: 0.3s; }
```

---

## Entrance Animations

### Fade & Slide
```css
.animate-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Sequential Loading
```css
.item {
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.item:nth-child(1) { animation-delay: 0.1s; }
.item:nth-child(2) { animation-delay: 0.2s; }
.item:nth-child(3) { animation-delay: 0.3s; }
```

---

## Modal Animations

### Fade In
```css
.modal-backdrop {
  opacity: 0;
  transition: opacity 0.3s;
}

.modal-backdrop.show {
  opacity: 1;
}

.modal {
  transform: scale(0.7);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

.modal.show {
  transform: scale(1);
  opacity: 1;
}
```

### Slide Down
```css
.modal {
  transform: translateY(-100%);
  transition: transform 0.3s ease-out;
}

.modal.show {
  transform: translateY(0);
}
```

---

## Menu Animations

### Hamburger to X
```css
.hamburger span {
  display: block;
  width: 30px;
  height: 3px;
  background: black;
  margin: 5px 0;
  transition: 0.3s;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}
```

### Slide In Menu
```css
.menu {
  transform: translateX(-100%);
  transition: transform 0.3s ease-out;
}

.menu.open {
  transform: translateX(0);
}
```

---

## Skeleton Loaders

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Accessibility

### Respect User Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## JavaScript Integration

```javascript
// Add animation class
element.classList.add('animate-in');

// Listen for animation end
element.addEventListener('animationend', () => {
  element.classList.remove('animate-in');
});

// Trigger reflow for restart
element.style.animation = 'none';
element.offsetHeight; // Trigger reflow
element.style.animation = null;
```

---

## Best Practices

### ✅ DO
- Keep animations under 300ms
- Use transform & opacity (GPU)
- Test on slower devices
- Respect prefers-reduced-motion
- Use meaningful animations
- Animate only what's needed

### ❌ DON'T
- Animate layout properties
- Use too many simultaneous animations
- Make animations too long (>500ms)
- Animate on scroll (can be janky)
- Force animations on everyone
- Use animations without purpose

---

**Animate with purpose. Delight with motion.** ✨

---

_CSS Animations Skill by CLAWDY - 12 Feb 2026_
