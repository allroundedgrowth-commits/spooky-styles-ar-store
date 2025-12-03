# PrivacyManager

## Overview

The `PrivacyManager` ensures user privacy and data security for the AR hair flattening feature. It guarantees that all processing happens client-side with no server uploads, implements automatic data cleanup, and provides model integrity verification.

## Key Features

- **Client-Side Processing**: All AR and hair segmentation processing happens in the browser
- **Automatic Data Cleanup**: Removes camera frames from memory automatically
- **Session Management**: Tracks active sessions and cleans up on session end
- **Model Integrity Verification**: Verifies ML models using checksums and SRI hashes
- **Memory Management**: Limits frame retention and provides memory usage metrics
- **Privacy Metrics**: Tracks frames processed, cleared, and memory freed

## Requirements

Validates **Requirement 1.1**: All processing happens client-side with proper security measures.

## Usage

### Basic Usage

```typescript
import { PrivacyManager } from './PrivacyManager';

// Create privacy manager
const privacyManager = new PrivacyManager();

// Start AR session
privacyManager.startSession();

// Track camera frames (for memory management)
const frame = captureFrame();
privacyManager.trackCameraFrame(frame);

// Track processed frames
const processed = processFrame(frame);
privacyManager.trackProcessedFrame(processed);

// End session (automatic cleanup)
privacyManager.handleSessionEnd();
```

### Model Integrity Verification

```typescript
// Verify model with checksum
const modelConfig = {
  url: 'https://cdn.example.com/model.tflite',
  checksum: 'abc123...', // Expected SHA-256 hash
  algorithm: 'SHA-256' as const,
};

const isValid = await privacyManager.verifyModelIntegrity(modelConfig);
if (!isValid) {
  console.error('Model integrity check failed!');
  // Handle error - don't load the model
}

// Verify model with SRI hash
const modelConfigSRI = {
  url: 'https://cdn.example.com/model.tflite',
  integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC',
};

await privacyManager.verifyModelIntegrity(modelConfigSRI);
```

### Manual Data Cleanup

```typescript
// Clear all camera data manually
privacyManager.clearCameraData();

// Get memory usage
const memoryUsage = privacyManager.getMemoryUsage();
console.log(`Current memory usage: ${memoryUsage} bytes`);
```

### Privacy Metrics

```typescript
// Get privacy metrics
const metrics = privacyManager.getMetrics();
console.log('Privacy Metrics:', {
  framesProcessed: metrics.framesProcessed,
  framesCleared: metrics.framesCleared,
  memoryFreed: metrics.memoryFreed,
  sessionActive: metrics.sessionActive,
  lastCleanup: new Date(metrics.lastCleanup),
});
```

## Integration with AR Engine

```typescript
import { Simple2DAREngine } from './Simple2DAREngine';
import { PrivacyManager } from './PrivacyManager';

class ARSession {
  private arEngine: Simple2DAREngine;
  private privacyManager: PrivacyManager;

  constructor() {
    this.arEngine = new Simple2DAREngine();
    this.privacyManager = new PrivacyManager();
  }

  async start() {
    // Start privacy tracking
    this.privacyManager.startSession();

    // Verify model integrity before loading
    const modelConfig = {
      url: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      checksum: 'your-checksum-here',
      algorithm: 'SHA-256' as const,
    };

    const isValid = await this.privacyManager.verifyModelIntegrity(modelConfig);
    if (!isValid) {
      throw new Error('Model integrity verification failed');
    }

    // Initialize AR engine
    await this.arEngine.initialize();
  }

  processFrame(frame: ImageData) {
    // Track frame for privacy
    this.privacyManager.trackCameraFrame(frame);

    // Process frame
    const result = this.arEngine.processFrame(frame);

    // Track processed result
    if (result) {
      this.privacyManager.trackProcessedFrame(result);
    }

    return result;
  }

  stop() {
    // Clean up AR engine
    this.arEngine.dispose();

    // Clean up privacy manager (automatic data cleanup)
    this.privacyManager.handleSessionEnd();
  }
}
```

## Configuration

### Frame Retention Limits

The PrivacyManager limits the number of frames kept in memory:

```typescript
private readonly MAX_FRAME_RETENTION = 10; // Maximum frames to keep
```

This ensures memory usage stays bounded even during long sessions.

### Automatic Cleanup Interval

Periodic cleanup runs every 30 seconds:

```typescript
private readonly CLEANUP_INTERVAL_MS = 30000; // 30 seconds
```

This removes old frames and frees memory automatically.

## Privacy Guarantees

### 1. Client-Side Processing

All processing happens in the browser:
- Camera frames never leave the device
- No server uploads of user images
- ML models run locally using TensorFlow.js

### 2. Automatic Data Cleanup

Data is automatically cleared:
- On session end
- Periodically during active sessions
- When frame retention limits are exceeded

### 3. Memory Management

Memory usage is actively managed:
- Frame retention limits prevent unbounded growth
- Periodic cleanup removes old frames
- Memory metrics track usage

### 4. Model Integrity

ML models are verified before use:
- Checksum verification using Web Crypto API
- Support for SHA-256, SHA-384, SHA-512
- SRI hash support for CDN-loaded models

## API Reference

### Constructor

```typescript
constructor()
```

Creates a new PrivacyManager instance.

### Methods

#### `startSession(): void`

Starts a new AR session with privacy tracking. Enables automatic cleanup.

#### `trackCameraFrame(frame: ImageData): void`

Tracks a camera frame for memory management. Enforces retention limits.

#### `trackProcessedFrame(frame: ImageData): void`

Tracks a processed frame for memory management. Enforces retention limits.

#### `clearCameraData(): void`

Clears all camera data from memory immediately. Updates metrics.

#### `handleSessionEnd(): void`

Handles session end by clearing all data and stopping automatic cleanup.

#### `verifyModelIntegrity(config: ModelIntegrityConfig): Promise<boolean>`

Verifies model integrity using checksum or SRI hash.

**Parameters:**
- `config.url`: Model URL
- `config.checksum`: Expected checksum (optional)
- `config.algorithm`: Hash algorithm (optional)
- `config.integrity`: SRI hash (optional)

**Returns:** `true` if verification passes, `false` otherwise.

#### `getMetrics(): PrivacyMetrics`

Returns current privacy metrics.

#### `isSessionActive(): boolean`

Returns whether a session is currently active.

#### `getMemoryUsage(): number`

Returns estimated memory usage in bytes.

#### `dispose(): void`

Disposes of the privacy manager and cleans up all resources.

## Types

### `ModelIntegrityConfig`

```typescript
interface ModelIntegrityConfig {
  url: string;
  integrity?: string; // SRI hash
  checksum?: string; // Expected checksum
  algorithm?: 'SHA-256' | 'SHA-384' | 'SHA-512';
}
```

### `PrivacyMetrics`

```typescript
interface PrivacyMetrics {
  framesProcessed: number;
  framesCleared: number;
  memoryFreed: number; // bytes
  lastCleanup: number; // timestamp
  sessionActive: boolean;
}
```

## Best Practices

1. **Always Start Sessions**: Call `startSession()` before processing frames
2. **Always End Sessions**: Call `handleSessionEnd()` when done to clean up
3. **Verify Models**: Always verify model integrity before loading
4. **Monitor Metrics**: Check privacy metrics periodically
5. **Handle Errors**: Check verification results and handle failures

## Security Considerations

- **No Server Uploads**: Never send camera frames to a server
- **Model Verification**: Always verify ML models before use
- **Memory Limits**: Enforce frame retention limits to prevent memory leaks
- **Automatic Cleanup**: Rely on automatic cleanup for data removal
- **HTTPS Only**: Load models only from HTTPS URLs

## Performance

- **Minimal Overhead**: Frame tracking has negligible performance impact
- **Efficient Cleanup**: Periodic cleanup runs in the background
- **Memory Bounded**: Frame retention limits prevent unbounded growth
- **Async Verification**: Model verification doesn't block rendering

## Browser Compatibility

- **Web Crypto API**: Required for checksum verification (all modern browsers)
- **Fetch API**: Required for model loading (all modern browsers)
- **ArrayBuffer**: Required for binary data handling (all modern browsers)

## Testing

See `__tests__/PrivacyManager.test.ts` for comprehensive unit tests.

## Related Components

- `HairSegmentationModule`: Uses PrivacyManager for model verification
- `Simple2DAREngine`: Integrates PrivacyManager for session management
- `BufferManager`: Complements PrivacyManager for memory management

## License

Part of the Spooky Wigs AR Try-On system.
