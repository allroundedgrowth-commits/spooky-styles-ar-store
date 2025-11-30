# Hair Segmentation Module

## Overview

The Hair Segmentation Module provides AI-powered hair detection and segmentation using MediaPipe Selfie Segmentation. This module is a core component of the Smart Hair Flattening feature, enabling realistic wig try-on experiences by detecting and adjusting for users' existing hair volume.

## Features

- **Real-time Hair Detection**: Identifies hair regions in camera frames with high accuracy
- **Performance Optimized**: Completes segmentation within 500ms as per requirements
- **Lazy Loading**: Models are loaded on-demand with CDN fallback support
- **Confidence Scoring**: Provides confidence metrics for segmentation quality
- **Resource Management**: Proper cleanup and disposal of ML models

## Installation

The required dependencies are:

```bash
npm install @mediapipe/selfie_segmentation @tensorflow/tfjs
```

These are already included in the project's `package.json`.

## Usage

### Basic Usage

```typescript
import { HairSegmentationModule } from './engine/HairSegmentationModule';

// Create and initialize the module
const segmentation = new HairSegmentationModule();
await segmentation.initialize();

// Process a video frame
const videoFrame = getVideoFrame(); // Your video capture logic
const imageData = videoFrameToImageData(videoFrame);

const result = await segmentation.segmentHair(imageData);

console.log('Hair mask:', result.hairMask);
console.log('Confidence:', result.confidence);
console.log('Processing time:', result.processingTime, 'ms');

// Clean up when done
segmentation.dispose();
```

### With Custom Configuration

```typescript
const segmentation = new HairSegmentationModule({
  url: 'https://custom-cdn.example.com/selfie_segmentation',
  fallbackUrl: 'https://backup-cdn.example.com/selfie_segmentation',
  timeout: 15000,
  retries: 3
});
```

### React Component Integration

```typescript
import React, { useEffect, useState } from 'react';
import { HairSegmentationModule } from './engine/HairSegmentationModule';
import { HairSegmentationLoader } from './components/AR/HairSegmentationLoader';

function ARComponent() {
  const [segmentation] = useState(() => new HairSegmentationModule());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await segmentation.initialize();
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      segmentation.dispose();
    };
  }, [segmentation]);

  return (
    <>
      <HairSegmentationLoader isLoading={isLoading} error={error} />
      {/* Your AR UI */}
    </>
  );
}
```

## API Reference

### `HairSegmentationModule`

#### Constructor

```typescript
constructor(config?: Partial<ModelConfig>)
```

Creates a new hair segmentation module instance.

**Parameters:**
- `config` (optional): Configuration for model loading
  - `url`: Primary CDN URL for the model
  - `fallbackUrl`: Fallback CDN URL if primary fails
  - `timeout`: Maximum time to wait for model loading (ms)
  - `retries`: Number of retry attempts

#### Methods

##### `initialize(): Promise<void>`

Initializes the MediaPipe Selfie Segmentation model. Must be called before using `segmentHair()`.

**Throws:** Error if model fails to load after retries

##### `segmentHair(imageData: ImageData): Promise<SegmentationResult>`

Processes an image to detect and segment hair regions.

**Parameters:**
- `imageData`: Input image as ImageData

**Returns:** Promise resolving to SegmentationResult containing:
- `hairMask`: ImageData with segmented hair regions
- `confidence`: Confidence score (0-1)
- `processingTime`: Time taken in milliseconds

**Throws:** Error if segmentation fails or times out (>500ms)

##### `getHairMask(): ImageData | null`

Returns the most recent hair mask, or null if no segmentation has been performed.

##### `getConfidence(): number`

Returns the confidence score (0-1) of the most recent segmentation.

##### `isReady(): boolean`

Checks if the module is initialized and ready to use.

##### `dispose(): void`

Cleans up resources and disposes of the model. Should be called when the module is no longer needed.

## Performance Considerations

### Timing Requirements

The module is designed to meet strict performance requirements:

- **Initialization**: Lazy loaded on first use
- **Segmentation**: < 500ms per frame (as per requirements)
- **Memory**: Efficient buffer management to minimize footprint

### Optimization Tips

1. **Reuse the module instance**: Create once and reuse for multiple frames
2. **Dispose properly**: Always call `dispose()` when done to free resources
3. **Monitor performance**: Use the `processingTime` in results to track performance
4. **Handle errors gracefully**: Implement fallback behavior for segmentation failures

## Error Handling

The module throws errors in the following cases:

- **Initialization failure**: Model cannot be loaded from CDN
- **Segmentation failure**: Processing fails or times out
- **Invalid state**: Attempting to segment before initialization

Example error handling:

```typescript
try {
  await segmentation.initialize();
  const result = await segmentation.segmentHair(imageData);
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout - maybe reduce frame rate
    console.warn('Segmentation timeout, reducing quality');
  } else if (error.message.includes('not initialized')) {
    // Reinitialize
    await segmentation.initialize();
  } else {
    // Fall back to standard AR without hair adjustment
    console.error('Segmentation failed:', error);
  }
}
```

## Browser Compatibility

The module requires:

- **WebGL**: For TensorFlow.js acceleration
- **Canvas API**: For image processing
- **Modern JavaScript**: ES2017+ features

Supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Privacy and Security

- **Client-side processing**: All segmentation happens in the browser
- **No data transmission**: Camera frames are never sent to servers
- **Model integrity**: CDN URLs use HTTPS for secure model loading
- **Resource cleanup**: Proper disposal ensures no data leaks

## Testing

The module includes comprehensive testing:

- Unit tests for core functionality
- Performance benchmarks for timing requirements
- Integration tests with AR engine
- Property-based tests for correctness

Run tests:

```bash
npm test -- HairSegmentationModule
```

## Related Components

- **HairSegmentationLoader**: Loading UI component
- **HairVolumeDetector**: Analyzes segmentation results for volume
- **HairFlatteningEngine**: Applies flattening effects based on segmentation
- **Simple2DAREngine**: Integrates hair segmentation into AR pipeline

## Troubleshooting

### Model fails to load

- Check network connectivity
- Verify CDN URLs are accessible
- Try using fallback URL
- Check browser console for CORS errors

### Segmentation is slow (>500ms)

- Reduce input image resolution
- Check device performance capabilities
- Consider using lower quality settings
- Monitor for memory pressure

### Low confidence scores

- Improve lighting conditions
- Ensure face is clearly visible
- Check camera quality
- Verify proper camera positioning

## Future Enhancements

Potential improvements for future versions:

- Adaptive resolution based on device performance
- Caching of segmentation results for similar frames
- Multi-threaded processing with Web Workers
- Custom model training for improved hair detection
- Support for different hair types and styles

## License

Part of the Spooky Wigs AR Try-On system.
