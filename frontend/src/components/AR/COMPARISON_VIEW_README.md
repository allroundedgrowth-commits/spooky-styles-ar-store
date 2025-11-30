# ComparisonView Component

## Overview

The `ComparisonView` component provides a split-screen interface for comparing original and adjusted hair images side-by-side. It enables users to see the difference between their natural hair and the selected adjustment mode (Normal, Flattened, or Bald) in real-time.

## Features

- **Split-Screen Layout**: Shows original and adjusted images side-by-side with clear labels
- **Real-Time Updates**: Automatically updates when adjustment mode changes
- **Screenshot Capture**: Allows users to save comparison screenshots with both views
- **Performance Optimized**: Maintains 24+ FPS for smooth rendering
- **FPS Monitoring**: Displays current frame rate and warns if performance drops
- **Responsive Design**: Adapts to different screen sizes while maintaining aspect ratio

## Requirements Validation

This component validates the following requirements from the design document:

- **Requirement 9.1**: Provides a "Compare" button toggle (integrated via parent component)
- **Requirement 9.2**: Displays split-screen view showing before and after side-by-side
- **Requirement 9.3**: Updates in real-time as user changes adjustment modes
- **Requirement 9.4**: Allows capturing screenshots in comparison mode showing both views
- **Requirement 9.5**: Includes labels clearly identifying "Original" and selected mode name

## Props

```typescript
interface ComparisonViewProps {
  originalImage: ImageData | null;      // Original unmodified image
  adjustedImage: ImageData | null;      // Image with current adjustment applied
  currentMode: AdjustmentMode;          // Current adjustment mode
  onCapture: (compositeImage: ImageData) => void;  // Callback for screenshot capture
  isActive: boolean;                    // Whether comparison view is active
}
```

## Usage Example

```typescript
import { ComparisonView } from './components/AR/ComparisonView';
import { AdjustmentMode } from './engine/HairFlatteningEngine';

function ARTryOnPage() {
  const [showComparison, setShowComparison] = useState(false);
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [adjustedImage, setAdjustedImage] = useState<ImageData | null>(null);
  const [currentMode, setCurrentMode] = useState(AdjustmentMode.FLATTENED);

  const handleCapture = (compositeImage: ImageData) => {
    // Save or share the composite image
    console.log('Captured comparison:', compositeImage);
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button onClick={() => setShowComparison(!showComparison)}>
        {showComparison ? 'Hide' : 'Show'} Comparison
      </button>

      {/* Comparison view */}
      <ComparisonView
        originalImage={originalImage}
        adjustedImage={adjustedImage}
        currentMode={currentMode}
        onCapture={handleCapture}
        isActive={showComparison}
      />
    </div>
  );
}
```

## Performance Characteristics

### Rendering Performance

- **Target FPS**: 24+ frames per second
- **Render Method**: Uses `putImageData()` for optimal canvas performance
- **Canvas Optimization**: Disables alpha channel for faster rendering
- **FPS Monitoring**: Real-time FPS display with warnings if below 24 FPS

### Memory Management

- **Canvas Reuse**: Reuses canvas elements instead of recreating
- **Efficient Updates**: Only updates canvases when images change
- **Composite Canvas**: Hidden canvas for screenshot generation

## Styling

The component uses Halloween-themed styling consistent with the project:

- **Background**: Black with 90% opacity overlay
- **Header**: Purple gradient with orange border
- **Divider**: Orange with glow effect
- **Labels**: White text with black stroke for visibility
- **Buttons**: Orange with hover effects

## Accessibility

- **ARIA Labels**: Proper labels for capture button
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Hidden composite canvas marked with `aria-hidden`
- **Visual Feedback**: Clear visual indicators for all states

## Integration Points

### With Hair Flattening Engine

```typescript
import { HairFlatteningEngine, AdjustmentMode } from './engine/HairFlatteningEngine';

const engine = new HairFlatteningEngine();

// Get original and adjusted images
const originalImage = captureOriginalFrame();
const adjustedImage = await engine.applyFlattening(
  originalImage,
  hairMask,
  faceRegion
);

// Pass to ComparisonView
<ComparisonView
  originalImage={originalImage}
  adjustedImage={adjustedImage.flattenedImage}
  currentMode={engine.getMode()}
  onCapture={handleCapture}
  isActive={true}
/>
```

### With Screenshot Service

```typescript
import { screenshotService } from './services/screenshot.service';

const handleCapture = async (compositeImage: ImageData) => {
  // Convert ImageData to blob
  const canvas = document.createElement('canvas');
  canvas.width = compositeImage.width;
  canvas.height = compositeImage.height;
  const ctx = canvas.getContext('2d');
  ctx?.putImageData(compositeImage, 0, 0);
  
  canvas.toBlob(async (blob) => {
    if (blob) {
      await screenshotService.saveScreenshot(blob, 'comparison');
    }
  });
};
```

## Testing

### Unit Tests

```typescript
describe('ComparisonView', () => {
  it('should render split-screen layout', () => {
    // Test rendering
  });

  it('should update when mode changes', () => {
    // Test real-time updates
  });

  it('should capture composite screenshot', () => {
    // Test capture functionality
  });

  it('should maintain 24+ FPS', () => {
    // Test performance
  });
});
```

### Performance Testing

```typescript
// Monitor FPS during comparison view
const fpsMonitor = new FPSMonitor();

for (let i = 0; i < 100; i++) {
  // Update images
  updateComparisonView(originalImage, adjustedImage);
  fpsMonitor.recordFrame();
}

expect(fpsMonitor.getAverageFPS()).toBeGreaterThanOrEqual(24);
```

## Troubleshooting

### Low FPS

If FPS drops below 24:
1. Check image resolution (reduce if too high)
2. Verify canvas rendering optimization
3. Check for memory leaks
4. Reduce update frequency if needed

### Images Not Displaying

If images don't appear:
1. Verify `ImageData` objects are valid
2. Check canvas dimensions match image dimensions
3. Ensure `isActive` prop is true
4. Check browser console for errors

### Capture Not Working

If screenshot capture fails:
1. Verify both images are available
2. Check composite canvas is created
3. Ensure `onCapture` callback is provided
4. Check browser console for errors

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14+)
- **Mobile**: Optimized for mobile devices

## Future Enhancements

Potential improvements:
- Slider for adjustable split position
- Zoom controls for detailed comparison
- Multiple comparison modes (side-by-side, overlay, swipe)
- Annotation tools for marking differences
- Video recording of comparison view
- Export to different image formats

## Related Components

- `AdjustmentModeToggle`: Controls which adjustment mode is active
- `HairAdjustmentMessage`: Informs users about automatic adjustments
- `HairFlatteningEngine`: Generates adjusted images
- `Simple2DAREngine`: Provides original and adjusted frames

## References

- Design Document: `.kiro/specs/smart-hair-flattening/design.md`
- Requirements: `.kiro/specs/smart-hair-flattening/requirements.md`
- Task List: `.kiro/specs/smart-hair-flattening/tasks.md`
