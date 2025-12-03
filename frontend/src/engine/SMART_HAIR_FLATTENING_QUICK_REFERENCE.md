# Smart Hair Flattening - Quick Reference

## For Users

### What It Does
Automatically detects your hair and adjusts it to show how wigs look with a wig cap.

### Three Modes
1. **Normal** - Original hair (no adjustment)
2. **Flattened** - Soft flattening (recommended, 60-80% reduction)
3. **Bald** - Complete removal (preview only)

### Quick Tips
- ✅ Use bright, even lighting
- ✅ Face camera directly
- ✅ Remove hats/coverings
- ✅ Keep head within ±45° rotation
- ❌ Avoid backlighting
- ❌ Don't move too quickly

### Volume Score
- **0-20:** Minimal hair
- **21-40:** Moderate hair
- **41-70:** High hair (auto-flatten)
- **71-100:** Very high hair (auto-flatten)

### Common Issues
| Issue | Solution |
|-------|----------|
| Not detecting hair | Improve lighting, remove hat |
| Looks unnatural | Better lighting, try different mode |
| Slow performance | Close other apps, use Normal mode |
| Won't load | Update browser, check WebGL |

### Browser Support
- ✅ Chrome 90+ (recommended)
- ✅ Firefox 88+
- ✅ Edge 90+
- ⚠️ Safari 14+ (limited)

---

## For Developers

### Installation
```bash
npm install @mediapipe/selfie_segmentation @tensorflow/tfjs
```

### Basic Usage
```typescript
import { HairSegmentationModule } from './engine/HairSegmentationModule';
import { HairFlatteningEngine } from './engine/HairFlatteningEngine';

// Initialize
const segmentation = new HairSegmentationModule();
await segmentation.initialize();

const flattening = new HairFlatteningEngine();

// Process frame
const result = await segmentation.segmentHair(imageData);
const flattened = await flattening.applyFlattening(
  imageData,
  result.hairMask,
  faceRegion
);
```

### Key Components
```typescript
// Segmentation
HairSegmentationModule.segmentHair(imageData) → SegmentationResult

// Volume Detection
HairVolumeDetector.calculateVolume(mask, region) → VolumeMetrics

// Flattening
HairFlatteningEngine.applyFlattening(image, mask, region) → FlattenedResult

// Alignment
WigAlignmentAdjuster.calculateWigPosition(contour, dims, pose) → WigTransform
```

### Performance Targets
- Segmentation: < 500ms
- Flattening: < 300ms
- Overall FPS: 24+
- Segmentation FPS: 15+
- Memory: < 100MB

### React Hook
```typescript
import { useHairFlattening } from './hooks/useHairFlattening';

function MyComponent() {
  const {
    isInitialized,
    volumeScore,
    currentMode,
    setMode,
    processFrame
  } = useHairFlattening();
  
  // Use in your component
}
```

### Error Handling
```typescript
try {
  const result = await segmentation.segmentHair(frame);
} catch (error) {
  if (error.type === 'MODEL_LOAD_FAILED') {
    // Fall back to standard AR
  } else if (error.type === 'LOW_CONFIDENCE') {
    // Show warning to user
  }
}
```

### Testing
```typescript
// Unit test
it('should calculate volume score in range', () => {
  const score = detector.calculateVolume(mask, region).score;
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(100);
});

// Integration test
it('should complete pipeline within time limit', async () => {
  const start = performance.now();
  await fullPipeline(frame);
  expect(performance.now() - start).toBeLessThan(1000);
});
```

---

## Documentation Index

### User Documentation
- **[User Guide](./SMART_HAIR_FLATTENING_USER_GUIDE.md)** - Complete feature guide
- **[FAQ](./SMART_HAIR_FLATTENING_FAQ.md)** - Common questions
- **[Troubleshooting](./SMART_HAIR_FLATTENING_TROUBLESHOOTING.md)** - Problem solving
- **[Compatibility](./SMART_HAIR_FLATTENING_COMPATIBILITY.md)** - Browser requirements

### Developer Documentation
- **[Technical Docs](./SMART_HAIR_FLATTENING_TECHNICAL.md)** - Architecture & API
- **[Integration Guide](./SIMPLE2DAR_HAIR_FLATTENING_INTEGRATION.md)** - How to integrate
- **Module READMEs:**
  - [Hair Segmentation](./HAIR_SEGMENTATION_README.md)
  - [Volume Detector](./HAIR_VOLUME_DETECTOR_README.md)
  - [Flattening Engine](./HAIR_FLATTENING_ENGINE_README.md)
  - [Flattening Shader](./HAIR_FLATTENING_SHADER_README.md)
  - [Wig Alignment](./WIG_ALIGNMENT_ADJUSTER_README.md)
  - [Performance Manager](./PERFORMANCE_MANAGER_README.md)
  - [Adaptive Quality](./ADAPTIVE_QUALITY_MANAGER_README.md)
  - [Buffer Manager](./BUFFER_MANAGER_README.md)
  - [Privacy Manager](./PRIVACY_MANAGER_README.md)

### Component Documentation
- **UI Components:**
  - [Adjustment Mode Toggle](../components/AR/AdjustmentModeToggle.tsx)
  - [Hair Adjustment Message](../components/AR/HairAdjustmentMessage.tsx)
  - [Comparison View](../components/AR/ComparisonView.tsx)
  - [Volume Score Indicator](../components/AR/VolumeScoreIndicator.tsx)

### Examples
- [Hair Segmentation Example](../examples/HairSegmentationExample.tsx)
- [Volume Detector Example](../examples/HairVolumeDetectorExample.tsx)
- [Flattening Example](../examples/HairFlatteningExample.tsx)
- [Wig Alignment Example](../examples/WigAlignmentExample.tsx)
- [Comparison View Example](../examples/ComparisonViewExample.tsx)
- [Hook Usage Example](../examples/HairFlatteningHookExample.tsx)

---

## Quick Commands

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run specific test
npm test HairSegmentation

# Build for production
npm run build
```

### Testing
```bash
# Unit tests
npm test -- --grep "HairSegmentation"

# Integration tests
npm test -- --grep "Integration"

# Performance tests
npm test -- --grep "Performance"

# Coverage
npm test -- --coverage
```

### Debugging
```bash
# Enable verbose logging
localStorage.setItem('DEBUG_HAIR_FLATTENING', 'true');

# Check WebGL support
chrome://gpu

# Check TensorFlow.js backend
console.log(tf.getBackend());

# Monitor performance
performance.mark('start');
// ... code ...
performance.mark('end');
performance.measure('duration', 'start', 'end');
```

---

## Keyboard Shortcuts (in AR)

- **N** - Switch to Normal mode
- **F** - Switch to Flattened mode
- **B** - Switch to Bald mode
- **C** - Toggle comparison view
- **S** - Take screenshot
- **Esc** - Exit AR session

---

## API Quick Reference

### Segmentation
```typescript
interface SegmentationResult {
  hairMask: ImageData;
  confidence: number;
  processingTime: number;
}
```

### Volume Metrics
```typescript
interface VolumeMetrics {
  score: number; // 0-100
  density: number;
  distribution: 'even' | 'concentrated' | 'sparse';
  boundingBox: BoundingBox;
}
```

### Adjustment Modes
```typescript
enum AdjustmentMode {
  NORMAL = 'normal',
  FLATTENED = 'flattened',
  BALD = 'bald'
}
```

### Flattened Result
```typescript
interface FlattenedResult {
  flattenedImage: ImageData;
  adjustedMask: ImageData;
  processingTime: number;
  headContour: Point[];
}
```

---

## Configuration

### Default Settings
```typescript
const DEFAULT_CONFIG = {
  // Segmentation
  segmentationResolution: 256,
  minConfidence: 0.7,
  
  // Volume
  autoFlattenThreshold: 40,
  
  // Flattening
  volumeReduction: 0.7, // 70%
  blendRadius: 5,
  
  // Performance
  targetFPS: 24,
  minSegmentationFPS: 15,
  
  // Memory
  maxBuffers: 5,
  maxMemoryMB: 100
};
```

### Customization
```typescript
// Override defaults
const customConfig = {
  ...DEFAULT_CONFIG,
  autoFlattenThreshold: 50,
  volumeReduction: 0.8
};

const engine = new HairFlatteningEngine(customConfig);
```

---

## Performance Checklist

- [ ] WebGL enabled
- [ ] Hardware acceleration on
- [ ] Good lighting conditions
- [ ] Camera at 720p or higher
- [ ] Browser updated to latest
- [ ] Other tabs/apps closed
- [ ] Device meets minimum specs
- [ ] Models cached (after first use)

---

## Privacy Checklist

- [x] All processing client-side
- [x] No server uploads
- [x] Immediate data disposal
- [x] Session cleanup on exit
- [x] Model integrity verification
- [x] No tracking or analytics on camera data
- [x] No storage of personal information

---

## Support Resources

### Getting Help
1. Check [FAQ](./SMART_HAIR_FLATTENING_FAQ.md)
2. Review [Troubleshooting Guide](./SMART_HAIR_FLATTENING_TROUBLESHOOTING.md)
3. Check [Compatibility Guide](./SMART_HAIR_FLATTENING_COMPATIBILITY.md)
4. Contact support with details

### Reporting Issues
Include:
- Browser name and version
- Device type and model
- Operating system
- Steps to reproduce
- Screenshots/recordings
- Error messages
- Console logs (F12)

### Feature Requests
- Describe the feature
- Explain the use case
- Provide examples
- Suggest implementation (optional)

---

## Version History

### v1.0.0 (Current)
- Initial release
- Three adjustment modes
- Real-time segmentation
- Automatic quality adjustment
- Privacy-first design

### Planned Features
- WebGPU support
- Worker thread processing
- Improved models
- Style-aware flattening
- Multi-person support

---

## License & Credits

### Technology Credits
- **MediaPipe** - Google (Apache 2.0)
- **TensorFlow.js** - Google (Apache 2.0)
- **WebGL** - Khronos Group

### Team
- AR Team - Development
- ML Team - Model training
- UX Team - Interface design
- QA Team - Testing

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** Production Ready
