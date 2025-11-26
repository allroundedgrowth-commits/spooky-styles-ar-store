# AR Engine Implementation

## Overview

The AR Try-On Engine is built with Three.js and provides the foundation for rendering 3D wigs and accessories in augmented reality. This implementation satisfies task 13 requirements.

## Components

### ARTryOnEngine (`ARTryOnEngine.ts`)

Core engine class that manages:
- **Three.js Scene**: Container for all 3D objects
- **Camera**: PerspectiveCamera with 75° FOV optimized for AR
- **Renderer**: WebGL renderer with mobile-optimized settings
- **Lighting**: Ambient + Directional lights for realistic rendering
- **FPS Monitoring**: Real-time performance tracking

#### Key Features

1. **Mobile Optimization**
   - Pixel ratio capped at 2x for performance
   - Medium precision for balance between quality and speed
   - High-performance power preference
   - Shadow mapping with PCF soft shadows

2. **Responsive Canvas**
   - Automatic resize handling
   - Maintains aspect ratio
   - Updates camera projection matrix

3. **FPS Monitoring**
   - Real-time FPS calculation
   - Callback system for FPS updates
   - Target: 24+ FPS (requirement 1.3)

4. **Lighting System**
   - Ambient light: Base illumination (0.6 intensity)
   - Directional light: Main light source (0.8 intensity)
   - Dynamic brightness adjustment based on ambient conditions
   - Shadow casting enabled

5. **Cleanup**
   - Proper disposal of geometries and materials
   - Animation frame cancellation
   - Scene clearing

### React Integration

#### `useAREngine` Hook (`hooks/useAREngine.ts`)
Custom hook that manages AR engine lifecycle:
- Initializes engine on mount
- Handles window resize events
- Provides FPS updates
- Cleans up on unmount
- Error handling

#### `ARCanvas` Component (`components/AR/ARCanvas.tsx`)
React component wrapper for the AR canvas:
- Responsive canvas element
- Loading state display
- Error state display
- Engine ready callback
- FPS update callback

#### `FPSMonitor` Component (`components/AR/FPSMonitor.tsx`)
Visual FPS display with performance indicators:
- Color-coded performance (green/yellow/red)
- Target FPS comparison (default: 24 fps)
- Performance labels (Good/Fair/Poor)

## Usage Example

```typescript
import ARCanvas from './components/AR/ARCanvas';
import { ARTryOnEngine } from './engine/ARTryOnEngine';

function MyARComponent() {
  const [engine, setEngine] = useState<ARTryOnEngine | null>(null);
  const [fps, setFps] = useState(0);

  const handleEngineReady = (arEngine: ARTryOnEngine) => {
    setEngine(arEngine);
    // Engine is ready - can now load models, etc.
  };

  return (
    <ARCanvas 
      onEngineReady={handleEngineReady}
      onFPSUpdate={setFps}
    />
  );
}
```

## Performance Targets

- **Minimum FPS**: 24 fps (requirement 1.3)
- **Target FPS**: 30+ fps
- **Optimal FPS**: 60 fps

## Requirements Satisfied

✅ **Requirement 1.2**: Three.js scene with camera, renderer, and lighting
✅ **Requirement 1.3**: 24+ FPS performance with monitoring
✅ **Requirement 10.1**: Adaptive lighting based on ambient conditions

## Next Steps

The following tasks will build upon this foundation:
- Task 14: Face tracking with TensorFlow.js
- Task 15: 3D wig loading and rendering
- Task 16: Color customization
- Task 17: Accessory layering
- Task 18: Adaptive lighting and head rotation

## Technical Details

### Renderer Configuration
```typescript
{
  alpha: true,              // Transparent background for AR overlay
  antialias: true,          // Smooth edges
  powerPreference: 'high-performance',
  precision: 'mediump',     // Balance quality/performance
  shadowMap: PCFSoftShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: ACESFilmicToneMapping
}
```

### Camera Configuration
```typescript
{
  fov: 75,                  // Field of view
  aspect: width / height,   // Responsive aspect ratio
  near: 0.1,               // Near clipping plane
  far: 1000                // Far clipping plane
}
```

### Lighting Configuration
```typescript
Ambient Light: {
  color: 0xffffff,
  intensity: 0.6 (adjustable: 0.4-0.8)
}

Directional Light: {
  color: 0xffffff,
  intensity: 0.8 (adjustable: 0.6-1.0),
  position: [5, 10, 7.5],
  castShadow: true,
  shadowMapSize: 1024x1024
}
```
