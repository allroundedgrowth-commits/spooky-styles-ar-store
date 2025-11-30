# EdgeCaseHandler

The `EdgeCaseHandler` class manages edge cases in the hair segmentation and flattening pipeline, ensuring graceful handling of challenging scenarios.

## Features

### 1. Bald User Detection (Requirement 10.1)
- Detects users with minimal or no visible hair (volume score < 5)
- Automatically skips flattening effect for bald users
- Provides appropriate user feedback

### 2. Hat/Head Covering Detection (Requirement 10.2)
- Analyzes segmentation patterns to detect hats or head coverings
- Looks for unusual density patterns and aspect ratios
- Suggests removal for best results

### 3. Low Quality Image Detection (Requirement 10.3)
- Analyzes image brightness, sharpness, and contrast
- Provides specific feedback on quality issues:
  - Too dim or too bright lighting
  - Out of focus images
  - Low contrast images
- Continues processing but warns user

### 4. Multiple Face Handling (Requirement 10.4)
- Detects multiple faces in the frame
- Selects primary face using combined scoring:
  - 60% weight on face size (larger is better)
  - 40% weight on centrality (closer to center is better)
- Applies hair adjustment only to primary face

## Usage

### Basic Usage

```typescript
import { EdgeCaseHandler } from './EdgeCaseHandler';
import type { HairSegmentationData } from './HairSegmentationModule';

const edgeCaseHandler = new EdgeCaseHandler();

// Check for bald user
const baldResult = edgeCaseHandler.handleBaldUser(segmentationData);
if (baldResult.shouldSkipFlattening) {
  console.log(baldResult.message); // "No hair adjustment needed"
  // Skip flattening
}

// Check for hat detection
const hatResult = edgeCaseHandler.handleHatDetection(segmentationData);
if (hatResult.shouldSkipFlattening) {
  console.log(hatResult.message); // "For best results, please remove head coverings or hats"
  // Skip flattening or show warning
}

// Check image quality
const qualityResult = edgeCaseHandler.handleLowQuality(imageData);
if (qualityResult.message) {
  console.log(qualityResult.message); // "Image quality is low: lighting is too dim. Please improve lighting..."
  // Show warning but continue
}

// Handle multiple faces
const faces = [face1BoundingBox, face2BoundingBox, face3BoundingBox];
const primaryFace = edgeCaseHandler.handleMultipleFaces(faces, imageWidth, imageHeight);
// Use primaryFace for hair adjustment
```

### Comprehensive Check

```typescript
// Run all edge case checks at once
const result = edgeCaseHandler.checkAllEdgeCases(
  segmentationData,
  imageData,
  detectedFaces
);

if (result.shouldSkipFlattening) {
  console.log(`Skipping flattening: ${result.reason}`);
  console.log(result.message);
  // Skip flattening
} else if (result.message) {
  console.log(`Warning: ${result.message}`);
  // Show warning but continue
}
```

## API Reference

### EdgeCaseHandler

#### Methods

##### `handleBaldUser(segmentationData: HairSegmentationData): EdgeCaseResult`
Checks if user has minimal hair (volume score < 5).

**Parameters:**
- `segmentationData`: Hair segmentation data with volume score

**Returns:** `EdgeCaseResult` with:
- `shouldSkipFlattening: true` if bald user detected
- `message`: User-friendly message
- `reason: 'bald_user'`

##### `handleHatDetection(segmentationData: HairSegmentationData): EdgeCaseResult`
Detects unusual segmentation patterns indicating hats or head coverings.

**Parameters:**
- `segmentationData`: Hair segmentation data with mask and bounding box

**Returns:** `EdgeCaseResult` with:
- `shouldSkipFlattening: true` if hat detected
- `message`: Suggestion to remove head covering
- `reason: 'hat_detected'`

##### `handleLowQuality(image: ImageData): EdgeCaseResult`
Analyzes image quality and provides improvement suggestions.

**Parameters:**
- `image`: ImageData to analyze

**Returns:** `EdgeCaseResult` with:
- `shouldSkipFlattening: false` (continues processing)
- `message`: Specific quality issues and suggestions
- `reason: 'low_quality'`

##### `handleMultipleFaces(faces: BoundingBox[], imageWidth: number, imageHeight: number): BoundingBox`
Selects primary face from multiple detected faces.

**Parameters:**
- `faces`: Array of face bounding boxes
- `imageWidth`: Image width in pixels
- `imageHeight`: Image height in pixels

**Returns:** `BoundingBox` of the primary face (largest or most centered)

**Throws:** Error if no faces provided

##### `checkAllEdgeCases(segmentationData: HairSegmentationData, image: ImageData, faces?: BoundingBox[]): EdgeCaseResult`
Runs all edge case checks in sequence.

**Parameters:**
- `segmentationData`: Hair segmentation data
- `image`: ImageData to analyze
- `faces`: Optional array of detected faces

**Returns:** Combined `EdgeCaseResult` from all checks

## Types

### EdgeCaseResult
```typescript
interface EdgeCaseResult {
  shouldSkipFlattening: boolean;
  message?: string;
  reason?: 'bald_user' | 'hat_detected' | 'low_quality' | 'multiple_faces' | 'none';
}
```

### BoundingBox
```typescript
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### QualityMetrics
```typescript
interface QualityMetrics {
  brightness: number; // 0-255
  sharpness: number; // 0-1
  contrast: number; // 0-1
}
```

## Quality Thresholds

The handler uses the following thresholds:

- **Bald Detection:** Volume score < 5
- **Brightness:** 30-225 (out of 255)
- **Sharpness:** Minimum 0.3 (0-1 scale)
- **Contrast:** Minimum 0.2 (0-1 scale)

## Hat Detection Algorithm

The hat detection algorithm looks for:

1. **High Upper Density:** > 90% hair pixels in upper third of bounding box
2. **Concentrated Upper Region:** Upper density > 1.5x overall density
3. **Unusual Aspect Ratio:** Width/height > 2.5 or < 0.4

If conditions 1 AND 2 are met, OR condition 3 is met, a hat is detected.

## Multiple Face Selection Algorithm

When multiple faces are detected, the primary face is selected using:

**Score = (Size Score × 0.6) + (Centrality Score × 0.4)**

Where:
- **Size Score:** Face area / Image area
- **Centrality Score:** 1 - (Distance from center / Max possible distance)

The face with the highest combined score is selected.

## Integration Example

```typescript
import { EdgeCaseHandler } from './EdgeCaseHandler';
import { HairSegmentationModule } from './HairSegmentationModule';
import { HairFlatteningEngine } from './HairFlatteningEngine';

class ARTryOnWithEdgeCases {
  private edgeCaseHandler = new EdgeCaseHandler();
  private segmentation = new HairSegmentationModule();
  private flattening = new HairFlatteningEngine();
  
  async processFrame(imageData: ImageData, faces: BoundingBox[]) {
    // Segment hair
    const segResult = await this.segmentation.segmentHair(imageData);
    
    // Check edge cases
    const edgeCase = this.edgeCaseHandler.checkAllEdgeCases(
      segResult,
      imageData,
      faces
    );
    
    // Handle result
    if (edgeCase.shouldSkipFlattening) {
      this.showMessage(edgeCase.message);
      return this.renderWithoutFlattening(imageData);
    }
    
    if (edgeCase.message) {
      this.showWarning(edgeCase.message);
    }
    
    // Select primary face if multiple
    const primaryFace = faces.length > 1
      ? this.edgeCaseHandler.handleMultipleFaces(faces, imageData.width, imageData.height)
      : faces[0];
    
    // Continue with flattening
    const flattened = await this.flattening.applyFlattening(
      imageData,
      segResult.hairMask,
      primaryFace
    );
    
    return this.renderWithFlattening(flattened);
  }
}
```

## Performance

- **Bald Detection:** O(1) - Simple threshold check
- **Hat Detection:** O(n) - Analyzes pixels in bounding box
- **Quality Analysis:** O(n) - Samples every 10th pixel for sharpness
- **Multiple Face Selection:** O(m) - Where m is number of faces

All operations are optimized for real-time performance.

## Error Handling

The handler is designed to be fault-tolerant:
- Returns safe defaults if analysis fails
- Never throws exceptions (except `handleMultipleFaces` with empty array)
- Provides user-friendly messages for all edge cases
- Allows processing to continue even with quality warnings

## Testing

See `__tests__/EdgeCaseHandler.test.ts` for comprehensive unit tests covering:
- Bald user detection with various volume scores
- Hat detection with different segmentation patterns
- Quality analysis with various image conditions
- Multiple face selection with different configurations
