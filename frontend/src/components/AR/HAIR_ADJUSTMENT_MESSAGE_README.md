# Hair Adjustment Message Component

## Overview

The `HairAdjustmentMessage` component displays an informational message when hair flattening is automatically applied in the AR try-on experience. It provides clear communication to users about what the system has done and how they can control it.

## Features

- **Auto-show**: Appears within 200ms when flattening is applied (Requirement 3.2)
- **Auto-hide**: Automatically dismisses after 4 seconds (Requirement 3.3)
- **Manual dismiss**: Users can close the message early using the X button
- **Visual indicator**: Animated arrow points to the adjustment toggle below (Requirement 3.4)
- **Progress bar**: Visual countdown showing time until auto-hide
- **Halloween theme**: Uses purple, orange, and black color scheme
- **Accessible**: Includes proper ARIA labels and keyboard support

## Requirements Validation

This component satisfies the following requirements from the Smart Hair Flattening specification:

- **3.1**: Displays message when flattening is automatically applied
- **3.2**: Message appears within 200ms of flattening effect being applied
- **3.3**: Message remains visible for minimum 4 seconds or until manually dismissed
- **3.4**: Includes visual indicator (arrow) pointing to adjustment toggle control

## Usage

### Basic Usage

```tsx
import { HairAdjustmentMessage } from './components/AR/HairAdjustmentMessage';

function ARTryOn() {
  const [showMessage, setShowMessage] = useState(false);

  // Show message when flattening is applied
  useEffect(() => {
    if (volumeScore > 40) {
      setShowMessage(true);
    }
  }, [volumeScore]);

  return (
    <div className="relative">
      <HairAdjustmentMessage
        show={showMessage}
        onDismiss={() => setShowMessage(false)}
      />
      
      {/* Your AR content */}
    </div>
  );
}
```

### With Custom Auto-Hide Duration

```tsx
<HairAdjustmentMessage
  show={showMessage}
  onDismiss={() => setShowMessage(false)}
  autoHideDuration={6000} // 6 seconds instead of default 4
/>
```

### Integration with Hair Flattening Engine

```tsx
import { HairAdjustmentMessage } from './components/AR/HairAdjustmentMessage';
import { AdjustmentModeToggle } from './components/AR/AdjustmentModeToggle';
import { AdjustmentMode } from '../engine/HairFlatteningEngine';

function ARTryOnWithFlattening() {
  const [showMessage, setShowMessage] = useState(false);
  const [currentMode, setCurrentMode] = useState<AdjustmentMode>(AdjustmentMode.NORMAL);
  const [volumeScore, setVolumeScore] = useState(0);

  // Handle volume detection
  useEffect(() => {
    async function detectVolume() {
      const result = await hairSegmentation.segmentHair(imageData);
      const volume = volumeDetector.calculateVolume(result.hairMask, faceRegion);
      setVolumeScore(volume.score);

      // Auto-flatten if volume is high
      if (volume.score > 40) {
        setCurrentMode(AdjustmentMode.FLATTENED);
        setShowMessage(true);
      }
    }

    detectVolume();
  }, [imageData]);

  return (
    <div className="relative h-screen">
      {/* Info Message */}
      <HairAdjustmentMessage
        show={showMessage}
        onDismiss={() => setShowMessage(false)}
      />

      {/* AR Canvas */}
      <canvas ref={canvasRef} />

      {/* Adjustment Toggle (positioned at bottom) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <AdjustmentModeToggle
          currentMode={currentMode}
          onModeChange={(mode) => {
            setCurrentMode(mode);
            if (mode === AdjustmentMode.FLATTENED) {
              setShowMessage(true);
            }
          }}
          volumeScore={volumeScore}
        />
      </div>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | required | Controls visibility of the message |
| `onDismiss` | `() => void` | required | Callback when message is dismissed (auto or manual) |
| `autoHideDuration` | `number` | `4000` | Duration in milliseconds before auto-hide (minimum 4000ms per requirements) |

## Styling

The component uses Tailwind CSS with Halloween theme colors:

- **Background**: `halloween-purple/95` with backdrop blur
- **Border**: `halloween-orange/30`
- **Icon background**: `halloween-orange/20`
- **Icon color**: `halloween-orange`
- **Progress bar**: `halloween-orange`

### Custom Styling

You can customize the appearance by modifying the Tailwind classes in the component or by wrapping it in a container with custom styles.

## Accessibility

- **ARIA labels**: Close button has `aria-label="Dismiss message"`
- **Keyboard support**: Close button is keyboard accessible
- **Visual feedback**: Progress bar provides visual countdown
- **Clear messaging**: Uses non-technical language appropriate for all users

## Performance

- **Show timing**: Tracks and logs if display takes > 200ms (requirement validation)
- **Animations**: Uses CSS animations for smooth transitions
- **Auto-cleanup**: Properly cleans up timers on unmount

## Testing

### Manual Testing

1. Trigger hair flattening with volume score > 40
2. Verify message appears within 200ms
3. Verify message auto-hides after 4 seconds
4. Test manual dismiss with X button
5. Verify arrow indicator is visible and animated
6. Check progress bar animation

### Automated Testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HairAdjustmentMessage } from './HairAdjustmentMessage';

describe('HairAdjustmentMessage', () => {
  it('should display when show is true', () => {
    render(
      <HairAdjustmentMessage
        show={true}
        onDismiss={() => {}}
      />
    );
    
    expect(screen.getByText(/hair has been adjusted/i)).toBeInTheDocument();
  });

  it('should call onDismiss when close button is clicked', async () => {
    const onDismiss = jest.fn();
    render(
      <HairAdjustmentMessage
        show={true}
        onDismiss={onDismiss}
      />
    );
    
    const closeButton = screen.getByLabelText('Dismiss message');
    await userEvent.click(closeButton);
    
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should auto-hide after specified duration', async () => {
    const onDismiss = jest.fn();
    render(
      <HairAdjustmentMessage
        show={true}
        onDismiss={onDismiss}
        autoHideDuration={1000}
      />
    );
    
    await waitFor(() => expect(onDismiss).toHaveBeenCalled(), {
      timeout: 1500,
    });
  });
});
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires support for:
- CSS animations
- CSS backdrop-filter
- Flexbox
- CSS Grid

## Related Components

- **AdjustmentModeToggle**: The control that this message points to
- **HairSegmentationLoader**: Shows loading state during hair detection
- **LightingWarning**: Similar message component for lighting issues

## Example

See `frontend/src/examples/HairAdjustmentMessageExample.tsx` for a complete working example with:
- Auto-show on flattening
- Integration with AdjustmentModeToggle
- Manual controls for testing
- Feature documentation

## Troubleshooting

### Message not appearing

- Verify `show` prop is set to `true`
- Check console for timing warnings
- Ensure component is rendered in a positioned container

### Message appearing too slowly

- Check console for timing warnings (> 200ms)
- Verify no heavy operations blocking render
- Consider optimizing parent component renders

### Auto-hide not working

- Verify `autoHideDuration` is set correctly
- Check that component isn't being unmounted prematurely
- Ensure `onDismiss` callback is provided

### Arrow not pointing correctly

- Verify AdjustmentModeToggle is positioned below the message
- Check z-index values aren't conflicting
- Ensure parent container has proper positioning

## Future Enhancements

- [ ] Add option to disable auto-hide
- [ ] Support custom message text
- [ ] Add animation variants (slide, fade, scale)
- [ ] Support different arrow directions
- [ ] Add sound effect option
- [ ] Persist user preference to not show again
