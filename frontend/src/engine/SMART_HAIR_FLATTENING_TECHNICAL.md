# Smart Hair Flattening - Technical Documentation

## Architecture Overview

Smart Hair Flattening is a client-side AI-powered feature that enhances AR wig try-on by detecting and adjusting user hair volume in real-time.

### Technology Stack

- **AI/ML:** TensorFlow.js, MediaPipe Selfie Segmentation v2
- **Graphics:** WebGL 2.0, Custom GLSL shaders
- **Frontend:** React, TypeScript, Canvas API
- **State Management:** React hooks, Zustand stores
- **Performance:** Web Workers (planned), OffscreenCanvas

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ AR View  │  │ Controls │  │ Messages │  │ Compare │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│              Hair Processing Pipeline                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Segment  │→ │  Volume  │→ │ Flatten  │→ │  Blend  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                 AR Engine Integration                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Wig    │  │ Position │  │ Lighting │  │ Render  │ │
│  │  Render  │  │  Adjust  │  │  Match   │  │ Output  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   Core Services                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   ML     │  │  WebGL   │  │  Memory  │  │ Privacy │ │
│  │  Models  │  │  Shaders │  │  Manager │  │ Manager │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. HairSegmentationModule

**Purpose:** Detect and isolate hair regions using AI

**Technology:** MediaPipe Selfie Segmentation v2

**Key Methods:**
```typescript
class HairSegmentationModule {
  async initialize(): Promise<void>
  async segmentHair(imageData: ImageData): Promise<SegmentationResult>
  getHairMask(): ImageData | null
  getConfidence(): number
  dispose(): void
}
```

**Performance:**
- Target: < 500ms initial detection
- Typical: 200-400ms on modern devices
- Resolution: 256x256 (adjustable)
- Model size: ~3MB

**Algorithm:**
1. Load MediaPipe model from CDN
2. Verify model integrity (SRI hash)
3. Initialize TensorFlow.js backend
4. Process frame through segmentation model
5. Extract hair mask from output
6. Calculate confidence score
7. Return segmentation result

**Optimization:**
- Lazy loading (only when needed)
- Model caching (30-day TTL)
- Resolution scaling based on device
- WebGL acceleration

---

### 2. HairVolumeDetector

**Purpose:** Calculate hair volume metrics from segmentation mask

**Key Methods:**
```typescript
class HairVolumeDetector {
  calculateVolume(hairMask: ImageData, faceRegion: BoundingBox): VolumeMetrics
  shouldAutoFlatten(volumeScore: number): boolean
  getVolumeCategory(): 'minimal' | 'moderate' | 'high' | 'very-high'
}
```

**Algorithm:**
```
1. Count hair pixels in mask
2. Calculate density (pixels per unit area)
3. Analyze distribution pattern
4. Compute bounding box
5. Generate volume score (0-100)
6. Classify into category
```

**Volume Score Calculation:**
```typescript
const hairPixels = countNonZeroPixels(hairMask);
const totalPixels = hairMask.width * hairMask.height;
const density = hairPixels / totalPixels;

// Adjust for face region size
const faceArea = faceRegion.width * faceRegion.height;
const relativeDensity = (hairPixels / faceArea) * 100;

// Apply distribution weighting
const distributionFactor = analyzeDistribution(hairMask);
const volumeScore = Math.min(100, relativeDensity * distributionFactor);
```

**Categories:**
- Minimal: 0-20
- Moderate: 21-40
- High: 41-70
- Very High: 71-100

---

### 3. HairFlatteningEngine

**Purpose:** Apply volume reduction and edge smoothing

**Key Methods:**
```typescript
class HairFlatteningEngine {
  setMode(mode: AdjustmentMode): void
  async applyFlattening(
    originalImage: ImageData,
    hairMask: ImageData,
    faceRegion: BoundingBox
  ): Promise<FlattenedResult>
}
```

**Modes:**

**Normal Mode:**
- No processing
- Return original image
- Fastest performance

**Flattened Mode:**
- Reduce volume by 60-80%
- Smooth edges (5+ pixel radius)
- Preserve scalp regions
- Match lighting

**Bald Mode:**
- Remove all hair pixels
- Preserve scalp appearance
- Maintain skin tones
- Apply realistic shading

**Algorithm (Flattened Mode):**
```
1. Create working copy of image
2. For each hair pixel:
   a. Calculate distance to scalp
   b. Apply volume reduction (0.6-0.8 factor)
   c. Blend with scalp color
   d. Preserve lighting information
3. Apply edge smoothing:
   a. Gaussian blur on boundaries
   b. Alpha blending (5+ pixel radius)
   c. Preserve sharp features
4. Match color temperature
5. Apply shadows
6. Return flattened result
```

**Performance:**
- Target: < 300ms
- Typical: 150-250ms
- Uses WebGL shaders for speed

---

### 4. HairFlatteningShader

**Purpose:** GPU-accelerated hair flattening using WebGL

**Shader Code:**
```glsl
// Fragment shader for hair flattening
precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_hairMask;
uniform float u_volumeReduction;
uniform float u_blendRadius;

varying vec2 v_texCoord;

void main() {
  vec4 originalColor = texture2D(u_image, v_texCoord);
  float hairMask = texture2D(u_hairMask, v_texCoord).r;
  
  if (hairMask > 0.5) {
    // Apply volume reduction
    vec3 flattenedColor = originalColor.rgb * u_volumeReduction;
    
    // Edge smoothing
    float edgeDistance = calculateEdgeDistance(v_texCoord);
    float blendFactor = smoothstep(0.0, u_blendRadius, edgeDistance);
    
    // Blend with original
    vec3 finalColor = mix(flattenedColor, originalColor.rgb, blendFactor);
    
    gl_FragColor = vec4(finalColor, originalColor.a);
  } else {
    gl_FragColor = originalColor;
  }
}
```

**Benefits:**
- 10-20x faster than CPU processing
- Parallel pixel processing
- Real-time performance
- Smooth gradients

---

### 5. WigAlignmentAdjuster

**Purpose:** Recalculate wig position based on flattened head contours

**Key Methods:**
```typescript
class WigAlignmentAdjuster {
  calculateWigPosition(
    headContour: Point[],
    wigDimensions: Dimensions,
    headPose: HeadPose
  ): WigTransform
  
  blendWigEdges(
    wigImage: ImageData,
    flattenedBackground: ImageData,
    wigPosition: WigTransform
  ): ImageData
}
```

**Algorithm:**
```
1. Extract head contour from flattened image
2. Find key landmarks:
   - Forehead top
   - Temple points
   - Ear positions
   - Nape of neck
3. Calculate wig anchor points
4. Compute transform (position, scale, rotation)
5. Apply transform to wig image
6. Blend edges with 10+ pixel width
7. Validate alignment (check for gaps)
```

**Edge Blending:**
```typescript
// Alpha compositing for smooth edges
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const distanceToEdge = calculateDistanceToWigEdge(x, y);
    
    if (distanceToEdge < blendWidth) {
      const alpha = distanceToEdge / blendWidth;
      const wigPixel = getWigPixel(x, y);
      const bgPixel = getBackgroundPixel(x, y);
      
      const blended = {
        r: wigPixel.r * alpha + bgPixel.r * (1 - alpha),
        g: wigPixel.g * alpha + bgPixel.g * (1 - alpha),
        b: wigPixel.b * alpha + bgPixel.b * (1 - alpha)
      };
      
      setPixel(x, y, blended);
    }
  }
}
```

---

### 6. LightingShadowProcessor

**Purpose:** Match lighting and apply realistic shadows

**Key Methods:**
```typescript
class LightingShadowProcessor {
  detectLighting(image: ImageData): LightingConditions
  applyShadows(
    flattenedImage: ImageData,
    wigMask: ImageData,
    wigPosition: WigTransform,
    lighting: LightingConditions
  ): ImageData
}
```

**Lighting Detection:**
```typescript
// Analyze image to extract lighting information
function detectLighting(image: ImageData): LightingConditions {
  // Sample face region pixels
  const facePixels = extractFaceRegion(image);
  
  // Calculate average brightness
  const avgBrightness = calculateAverageBrightness(facePixels);
  
  // Detect light direction from shadows
  const lightDirection = detectLightDirection(facePixels);
  
  // Estimate color temperature
  const colorTemp = estimateColorTemperature(facePixels);
  
  return {
    direction: lightDirection,
    intensity: avgBrightness,
    colorTemperature: colorTemp,
    ambientLevel: calculateAmbientLevel(facePixels)
  };
}
```

**Shadow Application:**
```typescript
// Apply realistic shadows from wig to hair/scalp
function applyShadows(
  flattenedImage: ImageData,
  wigMask: ImageData,
  lighting: LightingConditions
): ImageData {
  const shadowMap = generateShadowMap(wigMask, lighting.direction);
  
  for (let i = 0; i < flattenedImage.data.length; i += 4) {
    const shadowIntensity = shadowMap[i / 4];
    
    if (shadowIntensity > 0) {
      // Calculate shadow opacity (20-60% range)
      const opacity = 0.2 + (shadowIntensity * 0.4 * lighting.intensity);
      
      // Darken pixel
      flattenedImage.data[i] *= (1 - opacity);     // R
      flattenedImage.data[i + 1] *= (1 - opacity); // G
      flattenedImage.data[i + 2] *= (1 - opacity); // B
    }
  }
  
  return flattenedImage;
}
```

---

### 7. PerformanceManager

**Purpose:** Monitor and optimize performance

**Key Methods:**
```typescript
class PerformanceManager {
  monitorPerformance(metrics: PerformanceMetrics): void
  degradeGracefully(): void
  recoverPerformance(metrics: PerformanceMetrics): void
}
```

**Monitoring:**
```typescript
class FPSMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime: number = 0;
  
  recordFrame(): void {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.frameTimes.push(deltaTime);
    
    // Keep last 60 frames
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
    
    this.lastFrameTime = now;
  }
  
  getAverageFPS(): number {
    const avgDelta = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
    return 1000 / avgDelta;
  }
}
```

**Graceful Degradation:**
```typescript
function degradeGracefully(currentFPS: number): void {
  if (currentFPS < 24) {
    // Reduce segmentation resolution
    segmentationResolution = 256;
    
    // Lower segmentation frame rate
    segmentationFPS = 10;
    
    // Disable comparison view
    comparisonViewEnabled = false;
    
    // Show performance warning
    showPerformanceWarning();
  }
}
```

---

### 8. AdaptiveQualityManager

**Purpose:** Automatically adjust quality based on device capabilities

**Quality Levels:**

**High Quality:**
- Segmentation: 512x512
- Frame rate: 30 FPS
- All effects enabled
- Comparison view available

**Medium Quality:**
- Segmentation: 384x384
- Frame rate: 24 FPS
- Some effects disabled
- Comparison view available

**Low Quality:**
- Segmentation: 256x256
- Frame rate: 20 FPS
- Most effects disabled
- Comparison view disabled

**Auto-Detection:**
```typescript
function detectDeviceCapabilities(): QualityLevel {
  const deviceMemory = (navigator as any).deviceMemory || 4;
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  const isLowEnd = deviceMemory < 4 || hardwareConcurrency < 4;
  
  // Run benchmark
  const benchmarkScore = runPerformanceBenchmark();
  
  if (benchmarkScore > 80 && !isLowEnd) {
    return 'high';
  } else if (benchmarkScore > 50) {
    return 'medium';
  } else {
    return 'low';
  }
}
```

---

### 9. BufferManager

**Purpose:** Efficient memory management for ImageData buffers

**Key Methods:**
```typescript
class BufferManager {
  getBuffer(width: number, height: number): ImageData
  releaseBuffer(buffer: ImageData): void
  clearBuffers(): void
}
```

**Buffer Pooling:**
```typescript
class BufferPool {
  private buffers: Map<string, ImageData[]> = new Map();
  private maxBuffers = 5;
  
  getBuffer(width: number, height: number): ImageData {
    const key = `${width}x${height}`;
    const pool = this.buffers.get(key) || [];
    
    if (pool.length > 0) {
      return pool.pop()!;
    }
    
    return new ImageData(width, height);
  }
  
  releaseBuffer(buffer: ImageData): void {
    const key = `${buffer.width}x${buffer.height}`;
    const pool = this.buffers.get(key) || [];
    
    if (pool.length < this.maxBuffers) {
      pool.push(buffer);
      this.buffers.set(key, pool);
    }
  }
}
```

**Memory Limits:**
- Maximum 5 buffers per size
- Total memory < 100MB
- Automatic cleanup of oldest buffers

---

### 10. PrivacyManager

**Purpose:** Ensure user privacy and data security

**Key Methods:**
```typescript
class PrivacyManager {
  clearCameraData(): void
  handleSessionEnd(): void
  verifyModelIntegrity(modelUrl: string): Promise<boolean>
}
```

**Privacy Guarantees:**

1. **No Server Uploads:**
```typescript
// All processing happens client-side
async function processFrame(frame: ImageData): Promise<ProcessedFrame> {
  // Process locally
  const result = await localProcessing(frame);
  
  // Never send to server
  // No fetch(), no XMLHttpRequest, no WebSocket
  
  return result;
}
```

2. **Immediate Data Disposal:**
```typescript
function processAndDiscard(frame: ImageData): void {
  // Process frame
  const result = processFrame(frame);
  
  // Use result
  renderResult(result);
  
  // Immediately clear from memory
  frame = null;
  result = null;
  
  // Force garbage collection hint
  if (global.gc) global.gc();
}
```

3. **Session Cleanup:**
```typescript
function handleSessionEnd(): void {
  // Clear all buffers
  bufferManager.clearBuffers();
  
  // Dispose ML models
  segmentationModule.dispose();
  
  // Clear canvas
  clearAllCanvases();
  
  // Remove event listeners
  removeAllListeners();
  
  // Clear local storage (if any)
  clearSessionData();
}
```

4. **Model Integrity:**
```typescript
async function verifyModelIntegrity(modelUrl: string): Promise<boolean> {
  const response = await fetch(modelUrl);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  
  // Calculate hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Compare with expected hash
  return hashHex === EXPECTED_MODEL_HASH;
}
```

---

## Data Flow

### Complete Processing Pipeline

```
1. Camera Capture
   ↓
2. Frame Extraction (ImageData)
   ↓
3. Hair Segmentation (AI)
   ↓ (SegmentationResult)
4. Volume Detection
   ↓ (VolumeMetrics)
5. Mode Selection (Auto/Manual)
   ↓ (AdjustmentMode)
6. Hair Flattening (WebGL)
   ↓ (FlattenedResult)
7. Wig Position Calculation
   ↓ (WigTransform)
8. Lighting Adjustment
   ↓ (LightingConditions)
9. Shadow Application
   ↓
10. Edge Blending
    ↓
11. Final Composite
    ↓
12. Render to Canvas
    ↓
13. Display to User
```

### Timing Breakdown

**Total Pipeline:** ~800ms initial, ~100ms updates

- Camera capture: ~16ms (60 FPS)
- Segmentation: 200-400ms (first frame), 50-100ms (updates)
- Volume detection: 10-20ms
- Flattening: 150-250ms
- Wig positioning: 20-50ms
- Lighting/shadows: 30-60ms
- Blending: 20-40ms
- Rendering: 10-20ms

---

## Performance Optimization

### 1. Lazy Loading

```typescript
// Load models only when needed
let segmentationModule: HairSegmentationModule | null = null;

async function initializeIfNeeded(): Promise<void> {
  if (!segmentationModule) {
    segmentationModule = new HairSegmentationModule();
    await segmentationModule.initialize();
  }
}
```

### 2. Caching

```typescript
// Cache segmentation results
const segmentationCache = new Map<string, SegmentationResult>();

function getCachedSegmentation(frameHash: string): SegmentationResult | null {
  return segmentationCache.get(frameHash) || null;
}
```

### 3. Throttling

```typescript
// Limit segmentation frequency
let lastSegmentationTime = 0;
const minSegmentationInterval = 66; // ~15 FPS

function shouldRunSegmentation(): boolean {
  const now = performance.now();
  if (now - lastSegmentationTime < minSegmentationInterval) {
    return false;
  }
  lastSegmentationTime = now;
  return true;
}
```

### 4. WebGL Acceleration

```typescript
// Use WebGL for pixel operations
function processWithWebGL(image: ImageData): ImageData {
  const gl = canvas.getContext('webgl2');
  
  // Upload texture
  const texture = createTexture(gl, image);
  
  // Run shader
  runShader(gl, texture);
  
  // Read result
  return readPixels(gl);
}
```

### 5. Worker Threads (Planned)

```typescript
// Offload processing to worker
const worker = new Worker('hair-processing-worker.js');

worker.postMessage({ type: 'segment', imageData });

worker.onmessage = (e) => {
  const result = e.data;
  handleSegmentationResult(result);
};
```

---

## Error Handling

### Error Types

```typescript
enum ProcessingErrorType {
  MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
  SEGMENTATION_FAILED = 'SEGMENTATION_FAILED',
  TIMEOUT = 'TIMEOUT',
  LOW_CONFIDENCE = 'LOW_CONFIDENCE',
  WEBGL_ERROR = 'WEBGL_ERROR',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY'
}
```

### Error Recovery

```typescript
async function processWithRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Graceful Fallback

```typescript
async function processWithFallback(frame: ImageData): Promise<ProcessedFrame> {
  try {
    // Try hair flattening
    return await processWithHairFlattening(frame);
  } catch (error) {
    console.warn('Hair flattening failed, falling back to standard AR', error);
    
    // Fall back to standard AR
    return await processStandardAR(frame);
  }
}
```

---

## Testing

### Unit Tests

```typescript
describe('HairVolumeDetector', () => {
  it('should calculate volume score between 0 and 100', () => {
    const detector = new HairVolumeDetector();
    const mask = createTestMask();
    const result = detector.calculateVolume(mask, faceRegion);
    
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
```

### Integration Tests

```typescript
describe('Hair Flattening Pipeline', () => {
  it('should complete full pipeline within time limits', async () => {
    const startTime = performance.now();
    
    const frame = await captureFrame();
    const segResult = await segmentHair(frame);
    const volume = calculateVolume(segResult.hairMask);
    const flattened = await applyFlattening(frame, segResult.hairMask);
    
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(1000); // 1 second max
  });
});
```

### Performance Tests

```typescript
describe('Performance Benchmarks', () => {
  it('should maintain 24+ FPS during head movement', async () => {
    const fpsMonitor = new FPSMonitor();
    
    for (let i = 0; i < 150; i++) {
      await processFrame();
      fpsMonitor.recordFrame();
    }
    
    expect(fpsMonitor.getAverageFPS()).toBeGreaterThanOrEqual(24);
  });
});
```

---

## API Reference

See individual module documentation:
- [HairSegmentationModule](./HAIR_SEGMENTATION_README.md)
- [HairVolumeDetector](./HAIR_VOLUME_DETECTOR_README.md)
- [HairFlatteningEngine](./HAIR_FLATTENING_ENGINE_README.md)
- [HairFlatteningShader](./HAIR_FLATTENING_SHADER_README.md)
- [WigAlignmentAdjuster](./WIG_ALIGNMENT_ADJUSTER_README.md)
- [PerformanceManager](./PERFORMANCE_MANAGER_README.md)
- [AdaptiveQualityManager](./ADAPTIVE_QUALITY_MANAGER_README.md)
- [BufferManager](./BUFFER_MANAGER_README.md)
- [PrivacyManager](./PRIVACY_MANAGER_README.md)

---

## Integration Guide

See [Integration Guide](./SIMPLE2DAR_HAIR_FLATTENING_INTEGRATION.md) for details on integrating hair flattening into your AR application.

---

## Future Enhancements

### Planned Features

1. **WebGPU Support** - Faster GPU processing
2. **Worker Threads** - Offload processing from main thread
3. **Improved Models** - Smaller, faster, more accurate
4. **Advanced Lighting** - Better shadow and highlight matching
5. **Hair Style Detection** - Detect and preserve specific styles
6. **Multi-Person Support** - Handle multiple faces simultaneously

### Research Areas

- Real-time hair physics simulation
- Style-aware flattening (preserve braids, etc.)
- Improved edge detection and blending
- Adaptive model selection based on hair type
- Predictive frame processing

---

## Contributing

For developers interested in contributing:

1. Review this technical documentation
2. Check existing issues and PRs
3. Follow code style guidelines
4. Write tests for new features
5. Update documentation
6. Submit PR with detailed description

---

## Support

For technical support:
- GitHub Issues: [link]
- Developer Forum: [link]
- Email: dev-support@example.com

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Maintainers:** AR Team
