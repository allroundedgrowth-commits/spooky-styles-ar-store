# 2D AR Layering Explanation

## Overview
The 2D AR engine uses a **2-layer rendering system** to composite the wig onto the user's face in real-time.

## Layer Structure

### Layer 1: Face/Video Layer (Bottom)
- **Source**: Live camera feed or uploaded static image
- **Rendering**: Drawn first using `ctx.drawImage()`
- **Position**: Fills the entire canvas
- **Purpose**: Provides the base image of the user's face

### Layer 2: Wig Layer (Top)
- **Source**: Product wig image (PNG with transparency)
- **Rendering**: Drawn second using `ctx.drawImage()` with `source-over` compositing
- **Position**: Positioned based on facial landmarks or face detection
- **Purpose**: Overlays the wig on top of the user's head
- **Opacity**: Configurable (default 0.85 for semi-transparency)

## Compositing Mode: `source-over`

The engine uses **`source-over`** (the default Canvas 2D compositing mode):
- Wig is drawn **ON TOP** of the face layer
- Wig pixels replace face pixels where they overlap
- Transparency in the wig image allows face to show through
- This ensures the wig is **always visible** and not hidden

### Previous Issue: `destination-over`

The code previously used `destination-over`, which:
- Drew the wig **BEHIND** the existing canvas content
- Caused the wig to be hidden if the face filled the canvas
- Made the wig appear "sent backwards" or invisible

## Rendering Flow

```
1. Clear canvas
2. Draw face/video (Layer 1)
3. [Optional] Process hair flattening on face layer
4. Detect face position using MediaPipe landmarks or fallback
5. Calculate wig position and size
6. Set opacity and compositing mode (source-over)
7. Draw wig image (Layer 2)
8. Restore canvas state
```

## Positioning Logic

### With MediaPipe Landmarks (Preferred)
- Uses 468 facial landmarks for precise positioning
- Key landmarks:
  - `hairlineCenter`: Where wig bottom edge sits
  - `leftTemple` & `rightTemple`: Determine wig width
  - `foreheadTop`: Reference for vertical positioning
- Wig extends **upward** from hairline to cover hair area

### Fallback (Bounding Box)
- Uses skin tone detection or assumes centered face
- Calculates approximate hairline position
- Less precise but works without MediaPipe

## Configuration Options

```typescript
interface ARConfig {
  wigImageUrl: string;      // Wig image URL
  wigColor?: string;        // Optional color tint
  scale?: number;           // Size multiplier (default 1.5)
  offsetY?: number;         // Vertical adjustment (default 0.2)
  offsetX?: number;         // Horizontal adjustment (default 0)
  opacity?: number;         // Transparency (default 0.85)
  enableHairFlattening?: boolean; // Smart hair flattening
}
```

### Offset Behavior
- **offsetY**: Percentage of wig height
  - Negative = move wig up (higher on head)
  - Positive = move wig down (lower on head)
  - Default 0.2 = slight overlap with forehead
- **offsetX**: Percentage of head width
  - Negative = move wig left
  - Positive = move wig right
  - Default 0 = centered

## Auto-Scaling

The engine automatically adjusts wig size based on head size:
- **Small/distant head**: Increases wig size (up to 2x)
- **Large/close head**: Decreases wig size (down to 0.5x)
- **Optimal head size** (60% of canvas): No adjustment

This ensures the wig always fits the head perfectly regardless of distance from camera.

## Hair Flattening Integration

When enabled, hair flattening adds processing between Layer 1 and Layer 2:

```
1. Draw face/video (Layer 1)
2. Segment user's hair using TensorFlow.js
3. Calculate hair volume score
4. Apply flattening if volume > 40
5. Composite flattened result back to Layer 1
6. Draw wig (Layer 2) on top of flattened hair
```

This creates a more realistic try-on by reducing bulky hair before applying the wig.

## Performance Considerations

- **Target FPS**: 30 FPS for smooth rendering
- **Hair segmentation**: Throttled to 15 FPS to maintain performance
- **Smooth interpolation**: Applied to landmarks to reduce jitter
- **Caching**: Flattened results cached between frames

## Debugging Tips

If the wig appears incorrect:

1. **Not visible**: Check compositing mode is `source-over`, not `destination-over`
2. **Wrong position**: Verify MediaPipe is initialized and landmarks are detected
3. **Wrong size**: Adjust `scale` parameter or check auto-scaling logic
4. **Too high/low**: Adjust `offsetY` parameter
5. **Jittery**: Increase `SMOOTHING_FACTOR` (currently 0.3)

## Code References

- **Main engine**: `frontend/src/engine/Simple2DAREngine.ts`
- **Face tracking**: `frontend/src/engine/MediaPipeFaceMesh.ts`
- **Hair flattening**: `frontend/src/engine/HairFlatteningEngine.ts`
- **UI component**: `frontend/src/pages/Simple2DARTryOn.tsx`
- **Hook**: `frontend/src/hooks/useSimple2DAR.ts`
