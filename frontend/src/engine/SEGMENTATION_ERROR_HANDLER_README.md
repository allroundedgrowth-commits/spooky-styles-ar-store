# Segmentation Error Handler

## Overview

The `SegmentationErrorHandler` provides comprehensive error handling for hair segmentation operations in the Smart Hair Flattening feature. It implements retry logic, user-friendly error messages, and fallback strategies to ensure a robust AR experience even when segmentation fails.

## Features

- **Error Type Handling**: Manages four types of errors:
  - `MODEL_LOAD_FAILED`: Model failed to load from CDN
  - `SEGMENTATION_FAILED`: Segmentation operation failed
  - `TIMEOUT`: Operation exceeded time limit
  - `LOW_CONFIDENCE`: Segmentation confidence below 70% threshold

- **Retry Logic**: Automatic retry with exponential backoff for transient failures
- **User-Friendly Messages**: Clear, actionable messages for each error type
- **Fallback Strategy**: Graceful degradation to standard AR when segmentation unavailable
- **Error Logging**: Comprehensive logging for monitoring and debugging

## Requirements

Validates:
- **Requirement 7.5**: Low confidence warning when segmentation confidence < 70%
- **Requirement 10.5**: Fallback to standard AR when segmentation fails within 2 seconds

## Usage

### Basic Setup

```typescript
import { SegmentationErrorHandler, SegmentationErrorType } from './SegmentationErrorHandler';

// Create error handler with default config
const errorHandler = new SegmentationErrorHandler();

// Or with custom configuration
const errorHandler = new SegmentationErrorHandler({
  maxRetries: 3,
  retryDelay: 1500,
  confidenceThreshold: 0.75,
  enableLogging: true,
  onFallbackToStandardAR: () => {
    console.log('Falling back to standard AR');
    // Disable hair flattening features
    // Continue with standard wig rendering
  }
});
```

### Handling Errors

```typescript
try {
  await segmentationModule.initialize();
} catch (error) {
  const processingError = errorHandler.createError(
    error,
    SegmentationErrorType.MODEL_LOAD_FAILED
  );
  
  const result = errorHandler.handleError(processingError);
  
  // Show user message
  showNotification(result.userMessage);
  
  // Retry if appropriate
  if (result.shouldRetry) {
    await errorHandler.retryOperation(
      () => segmentationModule.initialize(),
      SegmentationErrorType.MODEL_LOAD_FAILED
    );
  }
  
  // Fallback to standard AR if needed
  if (result.fallbackToStandardAR) {
    enableStandardAR();
  }
}
```

### Checking Confidence

```typescript
const segmentationResult = await segmentationModule.segmentHair(imageData);

// Check if confidence is acceptable
const confidenceError = errorHandler.checkConfidence(segmentationResult.confidence);

if (confidenceError) {
  const result = errorHandler.handleError(confidenceError);
  
  // Show warning to user
  showWarning(result.userMessage);
  // "Hair detection confidence is low. Try better lighting or camera positioning."
  
  // Allow user to proceed with manual mode selection
  enableManualModeSelection();
}
```

### Retry Operations

```typescript
// Automatically retry with exponential backoff
try {
  const result = await errorHandler.retryOperation(
    async () => {
      return await segmentationModule.segmentHair(imageData);
    },
    SegmentationErrorType.SEGMENTATION_FAILED
  );
  
  console.log('Segmentation succeeded:', result);
} catch (error) {
  console.error('Segmentation failed after retries:', error);
  // Fallback to standard AR
}
```

### Monitoring and Analytics

```typescript
// Get error log for analytics
const errors = errorHandler.getErrorLog();

errors.forEach(error => {
  analytics.trackError({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    retryable: error.retryable
  });
});

// Check retry counts
const modelLoadRetries = errorHandler.getRetryCount(
  SegmentationErrorType.MODEL_LOAD_FAILED
);

console.log(`Model load attempted ${modelLoadRetries + 1} times`);
```

## Error Types and Messages

### MODEL_LOAD_FAILED

**User Message**: "Unable to load hair detection. Try refreshing the page."

**Behavior**:
- Retryable: Yes (up to maxRetries)
- Fallback: Yes (if retries exhausted)
- Action: Try fallback CDN, then fallback to standard AR

**Common Causes**:
- Network connectivity issues
- CDN unavailable
- Browser compatibility issues

### SEGMENTATION_FAILED

**User Message**: "Hair detection encountered an issue. Retrying..."

**Behavior**:
- Retryable: Yes (up to maxRetries)
- Fallback: Yes (if retries exhausted)
- Action: Retry operation, then fallback to standard AR

**Common Causes**:
- Invalid input image
- Model processing error
- Memory constraints

### TIMEOUT

**User Message**: "Hair detection is taking longer than expected. Continuing without adjustment."

**Behavior**:
- Retryable: No
- Fallback: Yes (immediate)
- Action: Cancel operation, proceed with standard AR

**Common Causes**:
- Slow device performance
- Large image size
- Model processing bottleneck

### LOW_CONFIDENCE

**User Message**: "Hair detection confidence is low. Try better lighting or camera positioning."

**Behavior**:
- Retryable: No
- Fallback: No (allow manual mode selection)
- Action: Show warning, continue with segmentation in background

**Common Causes**:
- Poor lighting conditions
- Blurry image
- Unusual hair colors/styles
- Obstructions (hats, hands)

## Configuration Options

```typescript
interface ErrorHandlerConfig {
  // Maximum number of retry attempts
  maxRetries: number; // Default: 2
  
  // Initial delay between retries (ms)
  // Uses exponential backoff: delay * 2^retryCount
  retryDelay: number; // Default: 1000
  
  // Confidence threshold (0-1)
  // Values below this trigger LOW_CONFIDENCE error
  confidenceThreshold: number; // Default: 0.7 (70%)
  
  // Enable error logging to console
  enableLogging: boolean; // Default: true
  
  // Callback when falling back to standard AR
  onFallbackToStandardAR?: () => void;
}
```

## Integration with HairSegmentationModule

```typescript
import { HairSegmentationModule } from './HairSegmentationModule';
import { SegmentationErrorHandler, SegmentationErrorType } from './SegmentationErrorHandler';

class HairSegmentationService {
  private segmentation: HairSegmentationModule;
  private errorHandler: SegmentationErrorHandler;
  
  constructor() {
    this.segmentation = new HairSegmentationModule();
    this.errorHandler = new SegmentationErrorHandler({
      onFallbackToStandardAR: () => this.disableHairFlattening()
    });
  }
  
  async initialize(): Promise<void> {
    try {
      await this.errorHandler.retryOperation(
        () => this.segmentation.initialize(),
        SegmentationErrorType.MODEL_LOAD_FAILED
      );
    } catch (error) {
      const processingError = this.errorHandler.createError(
        error,
        SegmentationErrorType.MODEL_LOAD_FAILED
      );
      
      const result = this.errorHandler.handleError(processingError);
      
      if (result.fallbackToStandardAR) {
        this.disableHairFlattening();
      }
      
      throw new Error(result.userMessage);
    }
  }
  
  async processFrame(imageData: ImageData): Promise<SegmentationResult | null> {
    try {
      const result = await this.segmentation.segmentHair(imageData);
      
      // Check confidence
      const confidenceError = this.errorHandler.checkConfidence(result.confidence);
      if (confidenceError) {
        const errorResult = this.errorHandler.handleError(confidenceError);
        this.showWarning(errorResult.userMessage);
      }
      
      return result;
    } catch (error) {
      const processingError = this.errorHandler.createError(
        error,
        error.message.includes('timeout') 
          ? SegmentationErrorType.TIMEOUT 
          : SegmentationErrorType.SEGMENTATION_FAILED
      );
      
      const result = this.errorHandler.handleError(processingError);
      
      if (result.shouldRetry) {
        return this.processFrame(imageData);
      }
      
      if (result.fallbackToStandardAR) {
        this.disableHairFlattening();
      }
      
      return null;
    }
  }
  
  private disableHairFlattening(): void {
    // Disable hair flattening features
    // Continue with standard AR rendering
  }
  
  private showWarning(message: string): void {
    // Display warning to user
  }
}
```

## Best Practices

1. **Always Check Confidence**: Use `checkConfidence()` after successful segmentation
2. **Use Retry Logic**: Wrap transient operations in `retryOperation()`
3. **Provide Fallback**: Always implement `onFallbackToStandardAR` callback
4. **Monitor Errors**: Regularly check error log for patterns
5. **User Communication**: Show clear, actionable messages to users
6. **Graceful Degradation**: Ensure AR works even without hair flattening

## Performance Considerations

- Error handling adds minimal overhead (< 1ms)
- Retry delays use exponential backoff to avoid overwhelming resources
- Error log is capped at 50 entries to prevent memory issues
- Logging can be disabled in production for performance

## Testing

```typescript
describe('SegmentationErrorHandler', () => {
  it('should handle MODEL_LOAD_FAILED with retry', async () => {
    const handler = new SegmentationErrorHandler({ maxRetries: 2 });
    
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Load failed');
      }
      return 'success';
    };
    
    const result = await handler.retryOperation(
      operation,
      SegmentationErrorType.MODEL_LOAD_FAILED
    );
    
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });
  
  it('should detect low confidence', () => {
    const handler = new SegmentationErrorHandler({ confidenceThreshold: 0.7 });
    
    const error = handler.checkConfidence(0.65);
    
    expect(error).not.toBeNull();
    expect(error?.type).toBe(SegmentationErrorType.LOW_CONFIDENCE);
  });
});
```

## See Also

- [HairSegmentationModule](./HAIR_SEGMENTATION_README.md)
- [Smart Hair Flattening Design](../../.kiro/specs/smart-hair-flattening/design.md)
- [Requirements Document](../../.kiro/specs/smart-hair-flattening/requirements.md)
