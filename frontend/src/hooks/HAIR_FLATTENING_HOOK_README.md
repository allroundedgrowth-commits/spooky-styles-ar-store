# useHairFlattening Hook

A custom React hook for managing hair flattening state in AR wig try-on sessions. This hook provides a clean, declarative interface for controlling hair segmentation, adjustment modes, and comparison views.

## Features

- **State Management**: Centralized management of hair flattening state
- **Mode Control**: Easy switching between Normal, Flattened, and Bald modes
- **Comparison View**: Toggle before/after comparison display
- **Error Handling**: Comprehensive error tracking and reporting
- **Auto-initialization**: Optional automatic segmentation initialization
- **Callbacks**: Hooks for state and mode change events

## Requirements

Validates Requirements: 1.1, 1.2, 4.1

## Installation

The hook is part of the frontend hooks directory and requires the Simple2DAR engine:

```typescript
import { useHairFlattening } from '../hooks/useHairFlattening';
import { useSimple2DAR } from '../hooks/useSimple2DAR';
```

## Basic Usage

### Integration with useSimple2DAR

```typescript
import React from 'react';
import { useSimple2DAR } from '../hooks/useSimple2DAR';
import { useHairFlattening } from '../hooks/useHairFlattening';
import { AdjustmentMode } from '../engine/Simple2DAREngine';

const ARTryOnPage: React.FC = () => {
  // Initialize AR engine
  const {
    videoRef,
    canvasRef,
    isInitialized,
    hairProcessingState,
    setAdjustmentMode,
    initialize,
    loadWig,
  } = useSimple2DAR();

  // Initialize hair flattening
  const {
    volumeScore,
    currentMode,
    isComparisonMode,
    changeMode,
    toggleComparison,
  } = useHairFlattening(hairProcessingState, setAdjustmentMode);

  // Start AR session
  const startAR = async () => {
    await initialize();
    await loadWig({
      wigImageUrl: '/wigs/purple-wig.png',
      enableHairFlattening: true,
    });
  };

  return (
    <div>
      <video ref={videoRef} />
      <canvas ref={canvasRef} />
      
      {volumeScore !== null && (
        <div>Volume Score: {volumeScore}</div>
      )}
      
      <button onClick={() => changeMode(AdjustmentMode.NORMAL)}>
        Normal
      </button>
      <button onClick={() => changeMode(AdjustmentMode.FLATTENED)}>
        Flattened
      </button>
      <button onClick={() => changeMode(AdjustmentMode.BALD)}>
        Bald
      </button>
      
      <button onClick={toggleComparison}>
        {isComparisonMode ? 'Hide' : 'Show'} Comparison
      </button>
    </div>
  );
};
```

## API Reference

### Parameters

```typescript
useHairFlattening(
  hairProcessingState: HairProcessingState | null,
  setAdjustmentMode: (mode: AdjustmentMode) => void,
  options?: UseHairFlatteningOptions
): UseHairFlatteningReturn
```

#### `hairProcessingState`
The current hair processing state from the Simple2DAREngine. Obtained via `useSimple2DAR().hairProcessingState`.

#### `setAdjustmentMode`
Function to set the adjustment mode in the engine. Obtained via `useSimple2DAR().setAdjustmentMode`.

#### `options` (optional)
Configuration options for the hook:

```typescript
interface UseHairFlatteningOptions {
  onStateChange?: (state: HairProcessingState) => void;
  onModeChange?: (mode: AdjustmentMode) => void;
  autoInitialize?: boolean;
}
```

- **`onStateChange`**: Callback invoked when hair processing state changes
- **`onModeChange`**: Callback invoked when adjustment mode changes
- **`autoInitialize`**: If true, automatically initializes segmentation when the hook mounts

### Return Value

```typescript
interface UseHairFlatteningReturn {
  // State
  isInitialized: boolean;
  isProcessing: boolean;
  currentMode: AdjustmentMode;
  volumeScore: number | null;
  volumeCategory: string | null;
  confidence: number | null;
  error: string | null;
  isComparisonMode: boolean;
  
  // Methods
  initializeSegmentation: () => Promise<void>;
  changeMode: (mode: AdjustmentMode) => void;
  toggleComparison: () => void;
  reset: () => void;
  
  // Raw state
  hairProcessingState: HairProcessingState | null;
}
```

#### State Properties

- **`isInitialized`**: Whether hair segmentation has been initialized
- **`isProcessing`**: Whether hair processing is currently in progress
- **`currentMode`**: Current adjustment mode (NORMAL, FLATTENED, or BALD)
- **`volumeScore`**: Hair volume score (0-100), null if not yet calculated
- **`volumeCategory`**: Volume category ('minimal', 'moderate', 'high', 'very-high')
- **`confidence`**: Segmentation confidence score (0-1)
- **`error`**: Error message if any error occurred
- **`isComparisonMode`**: Whether comparison view is active

#### Methods

- **`initializeSegmentation()`**: Manually initialize hair segmentation
- **`changeMode(mode)`**: Change the adjustment mode
- **`toggleComparison()`**: Toggle comparison view on/off
- **`reset()`**: Reset all state to defaults

## Advanced Usage

### With Callbacks

```typescript
const {
  volumeScore,
  currentMode,
  changeMode,
} = useHairFlattening(
  hairProcessingState,
  setAdjustmentMode,
  {
    onStateChange: (state) => {
      console.log('Hair processing state changed:', state);
      // Track analytics
      analytics.track('hair_processing_state_change', {
        volumeScore: state.segmentationData?.volumeScore,
        mode: state.currentMode,
      });
    },
    onModeChange: (mode) => {
      console.log('Mode changed to:', mode);
      // Update UI or trigger animations
    },
  }
);
```

### Auto-initialization

```typescript
const {
  isInitialized,
  error,
} = useHairFlattening(
  hairProcessingState,
  setAdjustmentMode,
  {
    autoInitialize: true, // Automatically initialize when ready
  }
);

useEffect(() => {
  if (error) {
    console.error('Auto-initialization failed:', error);
    // Show error message to user
  }
}, [error]);
```

### Manual Initialization

```typescript
const {
  isInitialized,
  initializeSegmentation,
} = useHairFlattening(hairProcessingState, setAdjustmentMode);

const handleEnableHairFlattening = async () => {
  try {
    await initializeSegmentation();
    console.log('Hair segmentation initialized successfully');
  } catch (err) {
    console.error('Failed to initialize:', err);
  }
};
```

### Conditional Rendering Based on State

```typescript
const {
  isInitialized,
  isProcessing,
  volumeScore,
  currentMode,
  error,
} = useHairFlattening(hairProcessingState, setAdjustmentMode);

return (
  <div>
    {!isInitialized && (
      <div>Initializing hair detection...</div>
    )}
    
    {isProcessing && (
      <div>Processing hair...</div>
    )}
    
    {error && (
      <div className="error">{error}</div>
    )}
    
    {isInitialized && volumeScore !== null && (
      <div>
        <p>Hair Volume: {volumeScore}/100</p>
        <p>Current Mode: {currentMode}</p>
      </div>
    )}
  </div>
);
```

## Integration with UI Components

### With AdjustmentModeToggle

```typescript
import { AdjustmentModeToggle } from '../components/AR/AdjustmentModeToggle';

const {
  currentMode,
  volumeScore,
  changeMode,
} = useHairFlattening(hairProcessingState, setAdjustmentMode);

<AdjustmentModeToggle
  currentMode={currentMode}
  onModeChange={changeMode}
  volumeScore={volumeScore ?? 0}
  disabled={!isInitialized}
/>
```

### With ComparisonView

```typescript
import { ComparisonView } from '../components/AR/ComparisonView';

const {
  isComparisonMode,
  toggleComparison,
} = useHairFlattening(hairProcessingState, setAdjustmentMode);

{isComparisonMode && (
  <ComparisonView
    originalImage={originalImageData}
    adjustedImage={adjustedImageData}
    currentMode={currentMode}
    onCapture={handleCapture}
  />
)}

<button onClick={toggleComparison}>
  {isComparisonMode ? 'Hide' : 'Show'} Comparison
</button>
```

### With VolumeScoreIndicator

```typescript
import { VolumeScoreIndicator } from '../components/AR/VolumeScoreIndicator';

const {
  volumeScore,
  volumeCategory,
} = useHairFlattening(hairProcessingState, setAdjustmentMode);

{volumeScore !== null && (
  <VolumeScoreIndicator
    score={volumeScore}
    category={volumeCategory ?? 'minimal'}
  />
)}
```

## Error Handling

The hook provides comprehensive error handling:

```typescript
const {
  error,
  initializeSegmentation,
  changeMode,
} = useHairFlattening(hairProcessingState, setAdjustmentMode);

// Handle initialization errors
const handleInit = async () => {
  try {
    await initializeSegmentation();
  } catch (err) {
    // Error is automatically captured in the error state
    console.error('Initialization failed:', err);
  }
};

// Display errors to user
{error && (
  <div className="error-banner">
    <p>{error}</p>
    <button onClick={() => initializeSegmentation()}>
      Retry
    </button>
  </div>
)}
```

## Performance Considerations

The hook is designed to be lightweight and efficient:

1. **Minimal Re-renders**: Only updates when relevant state changes
2. **Memoized Callbacks**: All methods are memoized with `useCallback`
3. **Efficient State Extraction**: Extracts only necessary values from processing state
4. **No Polling**: Relies on state updates from the engine

## Testing

Example test for the hook:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useHairFlattening } from './useHairFlattening';
import { AdjustmentMode } from '../engine/Simple2DAREngine';

describe('useHairFlattening', () => {
  it('should initialize with default state', () => {
    const mockSetMode = jest.fn();
    const { result } = renderHook(() =>
      useHairFlattening(null, mockSetMode)
    );

    expect(result.current.isInitialized).toBe(false);
    expect(result.current.currentMode).toBe(AdjustmentMode.NORMAL);
    expect(result.current.isComparisonMode).toBe(false);
  });

  it('should change mode when changeMode is called', () => {
    const mockSetMode = jest.fn();
    const { result } = renderHook(() =>
      useHairFlattening(null, mockSetMode)
    );

    act(() => {
      result.current.changeMode(AdjustmentMode.FLATTENED);
    });

    expect(mockSetMode).toHaveBeenCalledWith(AdjustmentMode.FLATTENED);
  });

  it('should toggle comparison mode', () => {
    const mockSetMode = jest.fn();
    const { result } = renderHook(() =>
      useHairFlattening(null, mockSetMode)
    );

    expect(result.current.isComparisonMode).toBe(false);

    act(() => {
      result.current.toggleComparison();
    });

    expect(result.current.isComparisonMode).toBe(true);
  });
});
```

## Related Components

- **AdjustmentModeToggle**: UI for switching between adjustment modes
- **ComparisonView**: Side-by-side before/after comparison
- **VolumeScoreIndicator**: Visual display of hair volume score
- **HairAdjustmentMessage**: Info message about hair adjustment

## Related Hooks

- **useSimple2DAR**: Main AR engine hook
- **useARSession**: AR session management
- **useFaceTracking**: Face tracking functionality

## Troubleshooting

### Hook returns null values

**Problem**: `volumeScore`, `confidence`, etc. are null

**Solution**: Ensure the AR engine is initialized and hair flattening is enabled:

```typescript
await loadWig({
  wigImageUrl: '/wigs/wig.png',
  enableHairFlattening: true, // Must be true
});
```

### Mode changes don't take effect

**Problem**: Calling `changeMode()` doesn't update the display

**Solution**: Ensure you're passing the correct `setAdjustmentMode` function from `useSimple2DAR`:

```typescript
const { setAdjustmentMode } = useSimple2DAR();
const { changeMode } = useHairFlattening(hairProcessingState, setAdjustmentMode);
```

### Initialization fails

**Problem**: `initializeSegmentation()` throws an error

**Solution**: Check that:
1. The AR engine is initialized first
2. Hair flattening is enabled in the config
3. The browser supports required features (WebGL, camera access)

## Best Practices

1. **Always check initialization state** before using hair flattening features
2. **Handle errors gracefully** and provide user feedback
3. **Use callbacks** for analytics and side effects
4. **Reset state** when unmounting or switching AR sessions
5. **Combine with UI components** for a complete user experience

## License

Part of the Spooky Wigs AR Try-On system.
