# CompatibilityChecker

## Overview

The `CompatibilityChecker` class provides comprehensive browser and device compatibility checking for the Smart Hair Flattening feature. It verifies support for required technologies (WebGL, camera access, TensorFlow.js) and detects device capabilities to ensure optimal user experience.

## Features

- **WebGL Support Detection**: Checks for WebGL 1.0 and 2.0 support
- **Camera Access Verification**: Tests getUserMedia API and camera availability
- **TensorFlow.js Compatibility**: Validates browser support for ML operations
- **Device Performance Detection**: Identifies low-end devices and GPU capabilities
- **User-Friendly Messages**: Provides clear guidance for compatibility issues
- **Automatic Fallback**: Enables standard AR when hair flattening is unavailable

## Requirements

Validates: Requirements 1.1, 1.5

## Usage

### Basic Compatibility Check

```typescript
import { CompatibilityChecker } from './engine/CompatibilityChecker';

const checker = new CompatibilityChecker();

// Perform full compatibility check
const result = await checker.checkCompatibility();

if (result.isCompatible) {
  console.log('Hair flattening is available!');
  // Initialize hair flattening features
} else {
  console.log('Falling back to standard AR');
  console.log('Errors:', result.errors);
  // Use standard AR without hair flattening
}
```

### Quick Availability Check

```typescript
const checker = new CompatibilityChecker();

// Simple boolean check
const isAvailable = await checker.isHairFlatteningAvailable();

if (isAvailable) {
  // Enable hair flattening UI
} else {
  // Hide hair flattening controls
}
```

### Display User Messages

```typescript
const checker = new CompatibilityChecker();
const result = await checker.checkCompatibility();

// Get user-friendly message
const message = checker.getCompatibilityMessage(result);
console.log(message);
// Example: "Your device is fully compatible with hair flattening features."
// Or: "Hair flattening is not available. Missing: WebGL. You can still use standard AR try-on."

// Check if should fallback
if (checker.shouldFallbackToStandardAR(result)) {
  // Disable hair flattening, use standard AR
}
```

### Performance Warnings

```typescript
const checker = new CompatibilityChecker();

// Get performance warnings for low-end devices
const warnings = await checker.getPerformanceWarnings();

if (warnings.length > 0) {
  warnings.forEach(warning => {
    console.warn(warning);
    // Display warning to user
  });
}
```

### Detailed Report

```typescript
const checker = new CompatibilityChecker();

// Get detailed compatibility report for debugging
const report = await checker.getDetailedReport();
console.log(report);

/* Output:
=== Hair Flattening Compatibility Report ===

Overall Compatible: YES

Features:
  WebGL: ✓
  Camera: ✓
  TensorFlow.js: ✓

Device Info:
  Mobile: No
  Browser: chrome
  OS: windows
  GPU Tier: high
  Low-End: No
*/
```

## API Reference

### `checkCompatibility(): Promise<CompatibilityResult>`

Performs comprehensive compatibility check for all required features.

**Returns:** `CompatibilityResult` object containing:
- `isCompatible`: Overall compatibility status
- `features`: Individual feature support (webgl, camera, tensorflowjs)
- `warnings`: Array of warning messages
- `errors`: Array of error messages
- `deviceInfo`: Device capabilities and information

### `checkWebGLSupport(): boolean`

Checks if WebGL is supported in the browser.

**Returns:** `true` if WebGL 1.0 or 2.0 is available

### `checkCameraAccess(): Promise<boolean>`

Checks if camera access is available.

**Returns:** `true` if getUserMedia API is available and camera is detected

### `checkTensorFlowJS(): Promise<boolean>`

Checks if TensorFlow.js can run in the browser.

**Returns:** `true` if required APIs (WebAssembly, WebGL) are available

### `detectDevice(): DeviceInfo`

Detects device type, browser, OS, and performance capabilities.

**Returns:** `DeviceInfo` object with device characteristics

### `getCompatibilityMessage(result: CompatibilityResult): string`

Generates user-friendly message based on compatibility check.

**Parameters:**
- `result`: CompatibilityResult from checkCompatibility()

**Returns:** Human-readable message string

### `shouldFallbackToStandardAR(result: CompatibilityResult): boolean`

Determines if hair flattening should be disabled.

**Parameters:**
- `result`: CompatibilityResult from checkCompatibility()

**Returns:** `true` if should use standard AR without hair flattening

### `isHairFlatteningAvailable(): Promise<boolean>`

Quick check if hair flattening can be used.

**Returns:** `true` if all required features are available

### `getPerformanceWarnings(): Promise<string[]>`

Gets performance warnings for low-end devices.

**Returns:** Array of warning messages to display to user

### `getDetailedReport(): Promise<string>`

Generates detailed compatibility report for debugging.

**Returns:** Formatted string with all compatibility information

### `clearCache(): void`

Clears cached compatibility result, forcing re-check on next call.

## Integration Example

```typescript
import { CompatibilityChecker } from './engine/CompatibilityChecker';
import { HairSegmentationModule } from './engine/HairSegmentationModule';

class ARTryOnApp {
  private compatibilityChecker: CompatibilityChecker;
  private hairFlatteningEnabled: boolean = false;

  async initialize() {
    // Check compatibility on startup
    this.compatibilityChecker = new CompatibilityChecker();
    const result = await this.compatibilityChecker.checkCompatibility();

    if (result.isCompatible) {
      // Enable hair flattening features
      this.hairFlatteningEnabled = true;
      console.log('Hair flattening enabled');
      
      // Show any performance warnings
      if (result.warnings.length > 0) {
        this.showWarning(result.warnings[0]);
      }
    } else {
      // Fallback to standard AR
      this.hairFlatteningEnabled = false;
      const message = this.compatibilityChecker.getCompatibilityMessage(result);
      this.showInfo(message);
      console.log('Using standard AR:', result.errors);
    }

    // Initialize appropriate AR mode
    if (this.hairFlatteningEnabled) {
      await this.initializeHairFlattening();
    } else {
      await this.initializeStandardAR();
    }
  }

  private async initializeHairFlattening() {
    // Initialize hair segmentation and flattening
    // ...
  }

  private async initializeStandardAR() {
    // Initialize standard AR without hair flattening
    // ...
  }

  private showWarning(message: string) {
    // Display warning to user
    console.warn(message);
  }

  private showInfo(message: string) {
    // Display info message to user
    console.info(message);
  }
}
```

## Compatibility Results

### CompatibilityResult Interface

```typescript
interface CompatibilityResult {
  isCompatible: boolean;
  features: {
    webgl: boolean;
    camera: boolean;
    tensorflowjs: boolean;
  };
  warnings: string[];
  errors: string[];
  deviceInfo: DeviceInfo;
}
```

### DeviceInfo Interface

```typescript
interface DeviceInfo {
  isLowEnd: boolean;
  isMobile: boolean;
  browser: string;
  os: string;
  gpuTier?: 'high' | 'medium' | 'low';
}
```

## Error Messages

The checker provides clear, user-friendly error messages:

- **WebGL not supported**: "WebGL is not supported in your browser. Hair flattening requires WebGL for optimal performance."
- **Camera not available**: "Camera access is not available. Please grant camera permissions to use AR try-on."
- **TensorFlow.js incompatible**: "TensorFlow.js is not compatible with your browser. Hair detection will not be available."

## Warning Messages

Performance warnings for low-end devices:

- **Low-end device**: "Your device may experience reduced performance. Consider using a more powerful device for the best experience."
- **Low GPU tier**: "Limited GPU capabilities detected. Hair flattening may run at reduced quality."

## Browser Support

### Fully Supported
- Chrome 90+ (desktop and mobile)
- Edge 90+
- Safari 14+ (desktop and iOS)
- Firefox 88+

### Partially Supported
- Older browsers with WebGL 1.0 (reduced performance)
- Mobile browsers on low-end devices (performance warnings)

### Not Supported
- Browsers without WebGL
- Browsers without camera access
- Browsers without WebAssembly

## Performance Considerations

- **Caching**: Results are cached after first check to avoid repeated tests
- **Async Operations**: Camera and TensorFlow.js checks are async
- **Lightweight**: Minimal overhead, runs quickly on all devices
- **Non-blocking**: Doesn't interfere with app initialization

## Best Practices

1. **Check Early**: Run compatibility check during app initialization
2. **Cache Results**: Use cached results to avoid repeated checks
3. **Show Messages**: Display clear messages to users about compatibility
4. **Graceful Fallback**: Always provide standard AR as fallback
5. **Log Details**: Use detailed report for debugging compatibility issues

## Troubleshooting

### WebGL Not Detected

- Check if hardware acceleration is enabled in browser settings
- Try updating graphics drivers
- Test in different browser

### Camera Not Available

- Check browser permissions
- Ensure HTTPS connection (required for camera access)
- Verify camera is not in use by another application

### TensorFlow.js Issues

- Verify WebAssembly is enabled
- Check browser console for specific errors
- Try clearing browser cache

## Related Components

- `HairSegmentationModule`: Uses compatibility check before initialization
- `SegmentationErrorHandler`: Handles errors when features are unavailable
- `EdgeCaseHandler`: Handles edge cases in compatible environments
- `PerformanceManager`: Adjusts quality based on device capabilities

## Testing

```typescript
// Test compatibility checker
const checker = new CompatibilityChecker();

// Test WebGL
console.log('WebGL:', checker.checkWebGLSupport());

// Test full compatibility
const result = await checker.checkCompatibility();
console.log('Compatible:', result.isCompatible);
console.log('Device:', result.deviceInfo);

// Test detailed report
const report = await checker.getDetailedReport();
console.log(report);
```

## Future Enhancements

- Add support for WebGPU when widely available
- Implement more granular GPU tier detection
- Add network speed detection for model loading
- Support for progressive enhancement based on capabilities
