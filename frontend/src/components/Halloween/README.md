# Halloween-Themed UI Components

This directory contains all Halloween-themed UI elements for the Spooky Styles AR Store, implementing the requirements from task 22.

## Components Overview

### 🎃 Decorative Elements

#### `HalloweenDecorations.tsx`
Main container component that orchestrates all decorative elements across the application.

**Features:**
- Cobwebs in all four corners
- Multiple floating ghosts with staggered animations
- Floating bats with varied timing
- Non-obstructive (pointer-events: none)
- Positioned with fixed positioning and low z-index

**Usage:**
```tsx
import { HalloweenDecorations } from './components/Halloween';

<HalloweenDecorations />
```

#### `Cobweb.tsx`
SVG-based cobweb decorations for corners.

**Props:**
- `position`: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
- `size`: 'small' | 'medium' | 'large'

**Features:**
- Scalable SVG graphics
- Includes spider detail
- Low opacity (30%) to avoid obstruction

#### `FloatingGhost.tsx`
Animated ghost that floats down the screen.

**Props:**
- `delay`: Animation delay in seconds
- `duration`: Animation duration in seconds
- `left`: CSS left position (e.g., '10%')

**Features:**
- Smooth floating animation
- Fades in and out
- Infinite loop with configurable timing

#### `FloatingBat.tsx`
Animated bat that floats down the screen.

**Props:**
- `delay`: Animation delay in seconds
- `duration`: Animation duration in seconds
- `right`: CSS right position (e.g., '15%')

**Features:**
- Pulsing animation for wing flapping effect
- Smooth descent animation
- Purple Halloween color scheme

### 🎨 Loading States

#### `PumpkinSpinner.tsx`
Animated pumpkin loading spinner with jack-o'-lantern face.

**Props:**
- `size`: 'small' | 'medium' | 'large'

**Features:**
- Slow rotation animation
- Detailed SVG pumpkin with face
- Halloween color scheme (orange)

**Usage:**
```tsx
import { PumpkinSpinner } from './components/Halloween';

<PumpkinSpinner size="large" />
```

#### `HalloweenSpinner.tsx`
Alternative loading spinner with ring and pulsing center.

**Props:**
- `size`: 'small' | 'medium' | 'large'
- `text`: Optional loading text

**Features:**
- Dual animation (spinning ring + pulsing center)
- Customizable loading text
- Purple and orange color scheme

#### `SkeletonCard.tsx`
Skeleton loading screens for different content types.

**Props:**
- `variant`: 'product' | 'order' | 'inspiration'

**Features:**
- Pulsing animation
- Variant-specific layouts
- Halloween color scheme
- Matches actual card dimensions

**Usage:**
```tsx
import { SkeletonCard } from './components/Halloween';

// Product loading
<SkeletonCard variant="product" />

// Order loading
<SkeletonCard variant="order" />

// Inspiration loading
<SkeletonCard variant="inspiration" />
```

### 🎬 Page Transitions

#### `PageTransition.tsx`
Smooth fade transitions between routes.

**Features:**
- 500ms fade duration (meets requirement)
- Automatic route change detection
- Smooth opacity transitions
- No layout shift

**Usage:**
```tsx
import { PageTransition } from './components/Halloween';

<PageTransition>
  <Outlet />
</PageTransition>
```

### 🔊 Audio

#### `AmbientSounds.tsx`
Optional Halloween ambient sound effects with volume controls.

**Features:**
- Play/pause toggle
- Volume slider (0-100%)
- Floating control button (bottom-right)
- Expandable control panel
- Looping audio
- User-controlled (optional)

**Usage:**
```tsx
import { AmbientSounds } from './components/Halloween';

<AmbientSounds />
```

**Note:** In production, set the audio source to actual Halloween ambient sound files:
```typescript
audioRef.current.src = '/sounds/halloween-ambient.mp3';
```

### 🎃 Promotional Content

#### `SeasonalPromotions.tsx`
Halloween-themed promotional section with deals and offers.

**Props:**
- `promotions`: Optional array of promotion objects

**Features:**
- Responsive grid layout (1/2/3 columns)
- Hover effects with scale and glow
- Animated decorative emojis
- Countdown/end date display
- Links to product categories
- Default promotions included

**Usage:**
```tsx
import { SeasonalPromotions } from './components/Halloween';

// With default promotions
<SeasonalPromotions />

// With custom promotions
<SeasonalPromotions promotions={customPromotions} />
```

**Promotion Object Structure:**
```typescript
interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl?: string;
  link: string;
  endDate?: string;
}
```

## Theme Configuration

### Tailwind Colors
The Halloween color palette is defined in `tailwind.config.js`:

```javascript
colors: {
  halloween: {
    orange: '#FF6B35',
    purple: '#6A0572',
    black: '#1A1A1D',
    green: '#4E9F3D',
    darkPurple: '#3D0C4F',
  },
}
```

### Animations
Custom animations defined in `tailwind.config.js` and `index.css`:

- `float`: Gentle up/down floating (3s)
- `pulse-slow`: Slow pulsing effect (3s)
- `spin-slow`: Slow rotation (3s)
- `floatDown`: Vertical descent with fade (configurable)
- `fadeIn`: Fade in with slight upward movement (0.3s)

## Integration

### MainLayout Integration
The Halloween theme is integrated into the main layout:

```tsx
import HalloweenDecorations from '../Halloween/HalloweenDecorations';
import AmbientSounds from '../Halloween/AmbientSounds';
import PageTransition from '../Halloween/PageTransition';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-halloween-black text-white flex flex-col relative overflow-hidden">
      <HalloweenDecorations />
      <AmbientSounds />
      
      <Header />
      <main className="flex-grow relative z-20">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};
```

### App.tsx Loading State
The app uses the PumpkinSpinner for lazy-loaded routes:

```tsx
import PumpkinSpinner from './components/Halloween/PumpkinSpinner';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-halloween-black">
    <div className="text-center">
      <PumpkinSpinner size="large" />
      <p className="text-halloween-purple mt-4 text-lg">Loading spooky content...</p>
    </div>
  </div>
);
```

## Requirements Coverage

This implementation satisfies all requirements from task 22:

✅ **8.1** - Dark theme with Halloween color palette applied throughout
✅ **8.2** - Decorative Halloween animations (ghosts, cobwebs, bats) that don't obstruct functionality
✅ **8.3** - Themed page transitions with 500ms maximum duration
✅ **8.4** - Seasonal promotions section with Halloween styling
✅ **8.5** - Optional ambient Halloween sound effects with volume controls
✅ **Additional** - Custom loading spinners and skeleton screens with Halloween theme

## Performance Considerations

- All decorative elements use `pointer-events: none` to avoid interfering with user interactions
- Animations use CSS transforms for GPU acceleration
- SVG graphics are optimized and inline for fast rendering
- Lazy loading for audio files
- Fixed positioning prevents layout reflows
- Low z-index for decorations ensures content remains accessible

## Accessibility

- Decorative elements are marked as non-interactive
- Sound controls have proper ARIA labels
- Volume controls are keyboard accessible
- Loading states provide text alternatives
- Color contrast meets WCAG standards for text elements

## Browser Compatibility

- Modern browsers with CSS3 animation support
- SVG support (all modern browsers)
- Web Audio API for sound (fallback gracefully)
- Flexbox and Grid layouts
- CSS custom properties (CSS variables)
