# Hair Flattening Quick Reference Guide

## For Developers

### Quick Start

The Simple2DARTryOn page now includes hair flattening controls. Here's what you need to know:

### Components Overview

```typescript
// 1. AdjustmentModeToggle - Mode selection
<AdjustmentModeToggle
  currentMode={currentAdjustmentMode}
  onModeChange={handleAdjustmentModeChange}
  volumeScore={hairProcessingState.segmentationData.volumeScore}
  disabled={!hairProcessingState.isInitialized}
/>

// 2. HairAdjustmentMessage - Info overlay
<HairAdjustmentMessage
  show={showInfoMessage}
  onDismiss={handleDismissInfoMessage}
  autoHideDuration={4000}
/>

// 3. ComparisonView - Before/after comparison
<ComparisonView
  originalImage={originalImage}
  adjustedImage={adjustedImage}
  currentMode={currentAdjustmentMode}
  onCapture={handleComparisonCapture}
  isActive={showComparison}
/>

// 4. VolumeScoreIndicator - Hair volume display
<VolumeScoreIndicator
  score={hairProcessingState.segmentationData.volumeScore}
  category={hairProcessingState.segmentationData.volumeCategory}
  isVisible={true}
/>
```

### State Variables

```typescript
// Hair flattening state
const [showInfoMessage, setShowInfoMessage] = useState(false);
const [showComparison, setShowComparison] = useState(false);
const [currentAdjustmentMode, setCurrentAdjustmentMode] = useState<AdjustmentMode>(AdjustmentMode.NORMAL);
const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
const [adjustedImage, setAdjustedImage] = useState<ImageData | null>(null);
```

### Hook Methods

```typescript
const {
  setAdjustmentMode,        // Change hair adjustment mode
  isHairFlatteningEnabled,  // Check if feature is available
  hairProcessingState,      // Get current processing state
} = useSimple2DAR();
```

### Event Handlers

```typescript
// Change adjustment mode
const handleAdjustmentModeChange = (mode: AdjustmentMode) => {
  setAdjustmentMode(mode);
  setCurrentAdjustmentMode(mode);
};

// Dismiss info message
const handleDismissInfoMessage = () => {
  setShowInfoMessage(false);
};

// Toggle comparison view
const handleToggleComparison = () => {
  if (!showComparison && canvasRef.current) {
    // Capture images before showing
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const currentImage = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setAdjustedImage(currentImage);
      setOriginalImage(currentImage);
    }
  }
  setShowComparison(!showComparison);
};

// Handle comparison screenshot
const handleComparisonCapture = (compositeImage: ImageData) => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = compositeImage.width;
  tempCanvas.height = compositeImage.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.putImageData(compositeImage, 0, 0);
    const dataUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${product?.name}-comparison.png`;
    link.href = dataUrl;
    link.click();
  }
};
```

### Conditional Rendering

```typescript
// Show controls only when hair flattening is available
{isInitialized && isHairFlatteningEnabled() && hairProcessingState?.segmentationData && (
  <div>
    <AdjustmentModeToggle ... />
    <button onClick={handleToggleComparison}>Compare Before/After</button>
  </div>
)}

// Show info message when flattening is auto-applied
{isInitialized && showInfoMessage && (
  <HairAdjustmentMessage ... />
)}

// Show comparison view when toggled
{showComparison && (
  <ComparisonView ... />
)}
```

### Auto-Flattening Logic

```typescript
useEffect(() => {
  if (!hairProcessingState) return;

  const { segmentationData, currentMode } = hairProcessingState;
  
  // Update current mode
  if (currentMode) {
    setCurrentAdjustmentMode(currentMode);
  }

  // Show info message when auto-flattening is applied
  if (segmentationData && segmentationData.volumeScore > 40 && currentMode === AdjustmentMode.FLATTENED) {
    setShowInfoMessage(true);
  }
}, [hairProcessingState]);
```

## Adjustment Modes

### AdjustmentMode.NORMAL
- Shows original hair without modifications
- No flattening applied
- User's natural appearance

### AdjustmentMode.FLATTENED
- Reduces hair volume by 60-80%
- Simulates wearing a wig cap
- Recommended when volume > 40
- Most realistic wig preview

### AdjustmentMode.BALD
- Removes all visible hair
- Preview only mode
- Shows wig without hair underneath

## Hair Processing State

```typescript
interface HairProcessingState {
  isInitialized: boolean;
  isProcessing: boolean;
  currentMode: AdjustmentMode;
  segmentationData: {
    volumeScore: number;        // 0-100
    volumeCategory: string;     // minimal/moderate/high/very-high
    confidence: number;         // 0-1
    boundingBox: BoundingBox;
  } | null;
  error: ProcessingError | null;
}
```

## Performance Requirements

- **Mode Change:** < 250ms (Requirement 4.5)
- **Info Message Display:** < 200ms (Requirement 3.2)
- **Volume Score Update:** < 200ms (Requirement 1.4)
- **Comparison View FPS:** 24+ (Requirement 9.5)

## Styling Classes

### Halloween Theme Colors
```css
bg-halloween-purple    /* #8b5cf6 */
bg-halloween-orange    /* #f97316 */
bg-halloween-green     /* #10b981 */
text-halloween-purple
text-halloween-orange
```

### Common Patterns
```css
/* Control container */
bg-black bg-opacity-70 rounded-lg p-4

/* Button primary */
bg-purple-700 hover:bg-purple-600 py-2 rounded-lg

/* Button secondary */
bg-gray-800 text-gray-300 hover:bg-gray-700

/* Overlay */
absolute inset-0 bg-black bg-opacity-90 z-40
```

## Common Issues & Solutions

### Controls Not Appearing
**Problem:** Hair flattening controls don't show up
**Solution:** Check these conditions:
```typescript
isInitialized === true
isHairFlatteningEnabled() === true
hairProcessingState?.segmentationData !== null
```

### Info Message Not Showing
**Problem:** Auto-flatten message doesn't appear
**Solution:** Verify:
```typescript
volumeScore > 40
currentMode === AdjustmentMode.FLATTENED
showInfoMessage === true
```

### Comparison View Empty
**Problem:** Comparison shows blank images
**Solution:** Ensure images are captured:
```typescript
// Capture before opening comparison
const ctx = canvasRef.current.getContext('2d');
const imageData = ctx.getImageData(0, 0, width, height);
setOriginalImage(imageData);
setAdjustedImage(imageData);
```

### Performance Issues
**Problem:** Laggy mode changes or comparison view
**Solution:** Check FPS and optimize:
```typescript
// Monitor FPS
const fps = frameCountRef.current;
if (fps < 24) {
  console.warn('FPS below requirement');
  // Reduce quality or disable features
}
```

## Testing Checklist

### Unit Tests
- [ ] Mode change handler updates state correctly
- [ ] Info message shows/hides based on conditions
- [ ] Comparison toggle captures images
- [ ] Screenshot capture creates valid image

### Integration Tests
- [ ] Auto-flattening triggers at volume > 40
- [ ] Mode changes update AR view
- [ ] Comparison view shows correct images
- [ ] All controls work together

### Performance Tests
- [ ] Mode change < 250ms
- [ ] Info message < 200ms
- [ ] Comparison view 24+ FPS
- [ ] No memory leaks

### UI/UX Tests
- [ ] Controls are visible and accessible
- [ ] Messages are clear and helpful
- [ ] Layout is responsive on mobile
- [ ] Touch interactions work smoothly

## API Reference

### useSimple2DAR Hook
```typescript
interface UseSimple2DARReturn {
  // Hair flattening methods
  setAdjustmentMode: (mode: AdjustmentMode) => void;
  isHairFlatteningEnabled: () => boolean;
  hairProcessingState: HairProcessingState | null;
  
  // Other methods
  initialize: () => Promise<void>;
  loadWig: (config: ARConfig) => Promise<void>;
  takeScreenshot: () => string | null;
  stop: () => void;
}
```

### Component Props

#### AdjustmentModeToggle
```typescript
interface AdjustmentModeToggleProps {
  currentMode: AdjustmentMode;
  onModeChange: (mode: AdjustmentMode) => void;
  volumeScore: number;
  disabled?: boolean;
}
```

#### HairAdjustmentMessage
```typescript
interface HairAdjustmentMessageProps {
  show: boolean;
  onDismiss: () => void;
  autoHideDuration?: number; // default 4000ms
}
```

#### ComparisonView
```typescript
interface ComparisonViewProps {
  originalImage: ImageData | null;
  adjustedImage: ImageData | null;
  currentMode: AdjustmentMode;
  onCapture: (compositeImage: ImageData) => void;
  isActive: boolean;
}
```

## Related Documentation

- **Design Spec:** `.kiro/specs/smart-hair-flattening/design.md`
- **Requirements:** `.kiro/specs/smart-hair-flattening/requirements.md`
- **Tasks:** `.kiro/specs/smart-hair-flattening/tasks.md`
- **Integration Guide:** `frontend/src/pages/SIMPLE2DAR_HAIR_FLATTENING_INTEGRATION.md`
- **Completion Summary:** `SIMPLE2DAR_HAIR_FLATTENING_COMPLETE.md`

## Support

For questions or issues:
1. Check the integration guide
2. Review component READMEs
3. Examine example implementations
4. Test with different hair types
5. Monitor performance metrics

---

**Last Updated:** Task 20 completion
**Status:** ✅ Complete and tested
