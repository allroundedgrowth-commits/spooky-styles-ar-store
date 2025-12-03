# Mobile-First Architecture 📱

## Overview

Spooky Wigs follows a mobile-first architecture where every feature is designed for mobile devices first, then progressively enhanced for larger screens.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     USER DEVICES                             │
├─────────────────────────────────────────────────────────────┤
│  📱 Phone (Primary)  │  📱 Tablet  │  💻 Desktop (Enhanced) │
│  - Touch gestures    │  - Hybrid   │  - Mouse/keyboard      │
│  - Camera (superior) │  - Touch    │  - Larger viewport     │
│  - Portrait mode     │  - Larger   │  - Multi-column        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   RESPONSIVE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Breakpoints:                                                │
│  xs: 375px  (iPhone SE)                                      │
│  sm: 640px  (Large phones)                                   │
│  md: 768px  (Tablets)                                        │
│  lg: 1024px (Desktops)                                       │
│  xl: 1280px (Large desktops)                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  React Components (Mobile-First)                             │
│  ├── Layout                                                  │
│  │   ├── Header (Hamburger menu)                            │
│  │   ├── Footer (Compact)                                   │
│  │   └── MainLayout (Responsive)                            │
│  ├── Pages                                                   │
│  │   ├── Home (Single column → Multi-column)                │
│  │   ├── Products (1 col → 2 → 3 → 4 cols)                  │
│  │   ├── Simple2DARTryOn (Portrait optimized)               │
│  │   ├── Cart (Stacked → Side-by-side)                      │
│  │   └── Checkout (Single page flow)                        │
│  └── Components                                              │
│      ├── ProductCard (Touch-friendly)                       │
│      ├── Navigation (Mobile drawer)                         │
│      └── Forms (Large inputs)                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   INTERACTION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Touch Events (Primary)        Mouse Events (Fallback)      │
│  ├── onTouchStart              ├── onMouseDown              │
│  ├── onTouchMove               ├── onMouseMove              │
│  ├── onTouchEnd                └── onMouseUp                │
│  └── Gestures                                               │
│      ├── Drag (Reposition)                                  │
│      ├── Tap (Select)                                       │
│      ├── Pinch (Zoom - future)                              │
│      └── Swipe (Navigate - future)                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   AR ENGINE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Simple2DAREngine                                            │
│  ├── Camera Input (Mobile optimized)                        │
│  │   ├── Front camera (Default)                             │
│  │   ├── Photo upload (Alternative)                         │
│  │   └── Permissions handling                               │
│  ├── Face Tracking                                           │
│  │   ├── MediaPipe (When available)                         │
│  │   └── Basic tracking (Fallback)                          │
│  ├── Rendering                                               │
│  │   ├── Canvas (9:16 portrait)                             │
│  │   ├── Wig overlay                                        │
│  │   └── Real-time updates                                  │
│  └── Controls                                                │
│      ├── Touch drag positioning                             │
│      ├── Slider adjustments                                 │
│      └── Auto-fit algorithm                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                           │
├─────────────────────────────────────────────────────────────┤
│  Zustand Stores                                              │
│  ├── userStore (Auth state)                                 │
│  ├── cartStore (Shopping cart)                              │
│  ├── arSessionStore (AR state)                              │
│  └── productFilterStore (Filters)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER                                  │
├─────────────────────────────────────────────────────────────┤
│  Services (Axios)                                            │
│  ├── auth.service                                            │
│  ├── product.service                                         │
│  ├── cart.service                                            │
│  ├── order.service                                           │
│  ├── payment.service                                         │
│  └── upload.service                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API                                │
├─────────────────────────────────────────────────────────────┤
│  Express.js REST API                                         │
│  ├── Routes                                                  │
│  ├── Middleware (Auth, Rate limiting)                       │
│  ├── Services (Business logic)                              │
│  └── Database (PostgreSQL)                                  │
└─────────────────────────────────────────────────────────────┘
```

## Mobile-First Data Flow

### AR Try-On Flow (Mobile)

```
User Opens Product
       ↓
Clicks "Try On with AR"
       ↓
┌──────────────────────┐
│ Permission Request   │
│ - Camera access      │
│ - Photo upload alt   │
└──────────────────────┘
       ↓
┌──────────────────────┐
│ Camera Initialization│
│ - Front camera       │
│ - Portrait mode      │
│ - 9:16 aspect ratio  │
└──────────────────────┘
       ↓
┌──────────────────────┐
│ Face Detection       │
│ - MediaPipe (if OK)  │
│ - Basic (fallback)   │
└──────────────────────┘
       ↓
┌──────────────────────┐
│ Wig Rendering        │
│ - Load wig image     │
│ - Position on head   │
│ - Apply color        │
└──────────────────────┘
       ↓
┌──────────────────────┐
│ User Adjustments     │
│ - Touch drag         │
│ - Slider controls    │
│ - Auto-fit button    │
└──────────────────────┘
       ↓
┌──────────────────────┐
│ Screenshot/Purchase  │
│ - Save image         │
│ - Add to cart        │
└──────────────────────┘
```

## Responsive Breakpoint Strategy

### Mobile First (Base Styles)
```css
/* Default: Mobile (320px+) */
.product-grid {
  grid-template-columns: 1fr; /* Single column */
  gap: 1rem;
  padding: 1rem;
}

.button {
  min-height: 44px; /* Touch-friendly */
  padding: 12px 24px;
}
```

### Progressive Enhancement
```css
/* sm: 640px+ (Large phones) */
@media (min-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columns */
  }
}

/* md: 768px+ (Tablets) */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 columns */
  }
}

/* lg: 1024px+ (Desktops) */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 columns */
  }
}
```

## Touch Event Handling

### Dual Event Support
```typescript
// Support both touch and mouse
<canvas
  // Touch events (primary)
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  
  // Mouse events (fallback)
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
/>
```

### Touch Gesture Recognition
```typescript
// Drag gesture
const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  const deltaX = touch.clientX - startX;
  const deltaY = touch.clientY - startY;
  
  // Update position
  setPosition({ x: deltaX, y: deltaY });
};

// Pinch gesture (future)
const handlePinch = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const distance = getDistance(
      e.touches[0],
      e.touches[1]
    );
    setScale(distance / initialDistance);
  }
};
```

## Performance Optimization

### Mobile-Specific Optimizations

```
┌─────────────────────────────────────┐
│     Performance Strategies          │
├─────────────────────────────────────┤
│ 1. Code Splitting                   │
│    - Route-based chunks             │
│    - Lazy load heavy components     │
│                                     │
│ 2. Image Optimization               │
│    - Responsive images              │
│    - Lazy loading                   │
│    - WebP format                    │
│                                     │
│ 3. Network Optimization             │
│    - Service worker caching         │
│    - API response caching           │
│    - Compression (gzip/brotli)      │
│                                     │
│ 4. Rendering Optimization           │
│    - Virtual scrolling              │
│    - Debounced events               │
│    - RequestAnimationFrame          │
│                                     │
│ 5. Bundle Optimization              │
│    - Tree shaking                   │
│    - Minification                   │
│    - Dead code elimination          │
└─────────────────────────────────────┘
```

## Camera Architecture

### Mobile Camera Priority

```
┌─────────────────────────────────────┐
│     Camera Input Strategy           │
├─────────────────────────────────────┤
│ 1. Request Camera Permission        │
│    ├── Granted → Use camera         │
│    └── Denied → Photo upload        │
│                                     │
│ 2. Camera Configuration             │
│    ├── facingMode: "user" (front)  │
│    ├── width: { ideal: 1280 }      │
│    └── height: { ideal: 720 }      │
│                                     │
│ 3. Fallback Strategy                │
│    ├── Primary: Live camera         │
│    ├── Secondary: Photo upload      │
│    └── Tertiary: Demo mode          │
│                                     │
│ 4. Quality Optimization             │
│    ├── Mobile camera (superior)     │
│    ├── Good lighting detection      │
│    └── Auto-focus support           │
└─────────────────────────────────────┘
```

## Security Considerations

### Mobile-Specific Security

```
┌─────────────────────────────────────┐
│     Security Measures               │
├─────────────────────────────────────┤
│ 1. HTTPS Required                   │
│    - Camera access                  │
│    - Geolocation                    │
│    - Service worker                 │
│                                     │
│ 2. Permission Handling              │
│    - Graceful degradation           │
│    - Clear user messaging           │
│    - Alternative options            │
│                                     │
│ 3. Data Privacy                     │
│    - No camera data stored          │
│    - Local processing only          │
│    - User consent required          │
│                                     │
│ 4. Input Validation                 │
│    - File type checking             │
│    - File size limits               │
│    - Sanitization                   │
└─────────────────────────────────────┘
```

## Testing Strategy

### Mobile Testing Pyramid

```
        ┌─────────────┐
        │   Manual    │  ← Real devices
        │   Testing   │
        └─────────────┘
       ┌───────────────┐
       │   Browser     │  ← DevTools emulation
       │   DevTools    │
       └───────────────┘
      ┌─────────────────┐
      │   Automated     │  ← Unit/Integration
      │   Tests         │
      └─────────────────┘
     ┌───────────────────┐
     │   Responsive      │  ← CSS/Layout tests
     │   Design Tests    │
     └───────────────────┘
```

## Deployment Architecture

### Mobile-Optimized Deployment

```
┌─────────────────────────────────────┐
│     CDN (CloudFront)                │
│     - Static assets                 │
│     - Image optimization            │
│     - Gzip/Brotli compression       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Load Balancer                   │
│     - SSL termination               │
│     - Health checks                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Application Servers             │
│     - Node.js/Express               │
│     - Horizontal scaling            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Database (PostgreSQL)           │
│     - Connection pooling            │
│     - Read replicas                 │
└─────────────────────────────────────┘
```

## Key Principles

1. **Mobile First**: Design for mobile, enhance for desktop
2. **Touch Priority**: Touch events before mouse events
3. **Performance**: Optimize for mobile networks
4. **Progressive Enhancement**: Core features work everywhere
5. **Accessibility**: Support all input methods
6. **Camera Quality**: Leverage superior mobile cameras

## Conclusion

This mobile-first architecture ensures that Spooky Wigs provides an excellent experience on phones (where most users shop), while still working great on tablets and desktops. The AR try-on feature specifically leverages the superior camera quality found in modern smartphones.
