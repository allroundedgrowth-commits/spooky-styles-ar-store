# Wig Loader System

## Overview

The Wig Loader system handles loading, caching, and positioning of 3D wig models in the AR try-on experience. It provides efficient model management with Draco compression support, automatic caching, retry logic, and real-time positioning based on face tracking data.

## Features

### 1. GLTF/GLB Model Loading
- Supports both GLTF and GLB model formats
- Progress tracking during model loading
- Automatic retry logic (up to 3 attempts) on load failures
- Error handling with detailed error messages

### 2. Draco Compression Support
- Automatic Draco decompression for compressed models
- Reduces model file sizes by ~70%
- Uses CDN-hosted Draco decoder for optimal performance

### 3. Model Caching
- Automatic caching of loaded models
- Prevents redundant network requests
- Efficient memory management
- Cache clearing functionality

### 4. Real-time Positioning
- Updates wig position based on face landmarks (468 points)
- Applies head pose (rotation and translation)
- Maintains 24+ FPS performance with throttling
- Smooth positioning during head movements up to 45 degrees

### 5. Model Switching
- Fast model switching (< 500ms target)
- Automatic cleanup of previous models
- Seamless transitions between wigs

## Architecture

```
WigLoader
├── GLTFLoader (Three.js)
├── DRACOLoader (Three.js)
├── Model Cache (Map)
└── Position Calculator
```

## Usage

### Basic Usage

```typescript
import { ARTryOnEngine } from './engine/ARTryOnEngine';

// Initialize AR engine
const canvas = document.getElementById('ar-canvas') as HTMLCanvasElement;
const engine = new ARTryOnEngine(canvas);
engine.initializeScene();
engine.startRendering();

// Load a wig model
const model = await engine.loadWigModel(
  'https://example.com/models/wig1.glb',
  (progress) => {
    console.log(`Loading: ${progress.toFixed(0)}%`);
  },
  (error) => {
    console.error('Load failed:', error);
  }
);

// Set as current wig
await engine.setCurrentWig(model);

// Update position with face tracking data
engine.updateWigPosition(landmarks, headPose);
```

### Advanced Usage

```typescript
// Load multiple wigs (they will be cached)
const wig1 = await engine.loadWigModel('wig1.glb');
const wig2 = await engine.loadWigModel('wig2.glb');
const wig3 = await engine.loadWigModel('wig3.glb');

// Switch between wigs (fast due to caching)
await engine.setCurrentWig(wig1);
// ... later
await engine.setCurrentWig(wig2); // < 500ms

// Check cache status
console.log(`Cached models: ${engine.getCachedModelCount()}`);

// Clear cache if needed
engine.clearModelCache();

// Remove current wig
engine.removeCurrentWig();
```

## Integration with Face Tracking

The wig loader uses face landmark data to position wigs accurately:

```typescript
import { FaceTrackingModule } from './engine/FaceTrackingModule';

const faceTracker = new FaceTrackingModule();
await faceTracker.initialize();
faceTracker.startTracking();

// In your render loop
const landmarks = faceTracker.getFaceLandmarks();
const headPose = faceTracker.getHeadPose();

if (landmarks && headPose) {
  engine.updateWigPosition(landmarks, headPose);
}
```

## Face Landmark Mapping

The system uses specific MediaPipe Face Mesh landmarks for positioning:

### Head Top Landmarks (Forehead)
- Indices: 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288
- Used to position the wig at the top of the head

### Head Center Landmarks (Nose Bridge)
- Indices: 1, 4, 5, 6, 168, 197, 195
- Used to center the wig horizontally

## Performance Optimization

### FPS Throttling
- Updates are throttled to maintain 24+ FPS
- Minimum frame time: ~42ms (1000ms / 24fps)
- Prevents excessive position calculations

### Model Optimization
- Automatic shadow casting/receiving setup
- Material optimization for mobile devices
- Texture anisotropy reduced to 4 (from 16)

### Memory Management
- Proper disposal of geometries and materials
- Cache clearing functionality
- Automatic cleanup on engine disposal

## Error Handling

### Load Failures
```typescript
try {
  const model = await engine.loadWigModel('wig.glb');
} catch (error) {
  // Handle error after 3 retry attempts
  console.error('Failed to load model:', error.message);
}
```

### Retry Logic
- Automatic retry on load failure
- Exponential backoff: 1s, 2s, 3s
- Maximum 3 attempts before throwing error

## Model Requirements

### File Format
- GLTF (.gltf) or GLB (.glb)
- Draco compression recommended for smaller file sizes

### Model Specifications
- Optimized polygon count (< 50k triangles recommended)
- PBR materials (MeshStandardMaterial)
- Proper UV mapping for textures
- Centered at origin (0, 0, 0)
- Appropriate scale (1 unit = 1 meter)

### Texture Recommendations
- Power-of-2 dimensions (512x512, 1024x1024, 2048x2048)
- Compressed formats (JPEG for color, PNG for alpha)
- Maximum 2048x2048 for mobile compatibility

## Configuration

### Position Configuration
```typescript
// Access the wig loader directly if needed
const wigLoader = engine.getWigLoader(); // (if exposed)

// Configure positioning parameters
wigLoader.setPositionConfig({
  offsetY: 0.15,        // Vertical offset from head top
  scale: 1.2,           // Scale factor
  rotationOffset: new THREE.Euler(0.1, 0, 0), // Additional rotation
});
```

## Testing

### Unit Tests
```bash
npm test -- WigLoader.test.ts
```

### Integration Tests
```bash
npm test -- ARTryOnEngine.test.ts
```

## Troubleshooting

### Model Not Loading
1. Check model URL is accessible
2. Verify CORS headers are set correctly
3. Check browser console for detailed errors
4. Ensure model format is GLTF/GLB

### Poor Performance
1. Reduce model polygon count
2. Use Draco compression
3. Optimize texture sizes
4. Check FPS with `engine.getCurrentFPS()`

### Positioning Issues
1. Verify face tracking is working
2. Check landmark confidence > 0.7
3. Ensure proper lighting conditions
4. Adjust position configuration if needed

## Requirements Satisfied

This implementation satisfies the following requirements:

- **1.2**: Renders selected wig as 3D model positioned on user's head
- **1.3**: Updates wig position at minimum 24 FPS
- **1.4**: Replaces current wig within 500ms when switching
- **10.3**: Maintains accurate positioning during head rotation up to 45 degrees

## Future Enhancements

- [ ] Progressive model loading for large files
- [ ] LOD (Level of Detail) support
- [ ] Texture streaming
- [ ] WebWorker-based model processing
- [ ] IndexedDB caching for offline support
