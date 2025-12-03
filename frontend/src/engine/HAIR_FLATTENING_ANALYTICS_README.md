# Hair Flattening Analytics Tracker

## Overview

The `HairFlatteningAnalyticsTracker` provides comprehensive analytics tracking for the smart hair flattening feature. It integrates seamlessly with the existing analytics service to monitor user interactions, performance metrics, and error scenarios.

## Features

- **Session Tracking**: Monitor complete hair flattening sessions from start to finish
- **Segmentation Metrics**: Track hair segmentation performance, volume scores, and confidence levels
- **Mode Changes**: Record user preferences and adjustment mode transitions
- **Error Tracking**: Capture and categorize all error types for debugging and improvement
- **Performance Monitoring**: Track performance degradation and quality adjustments
- **Edge Case Detection**: Monitor how the system handles unusual scenarios

## Usage

### Basic Integration

```typescript
import hairFlatteningAnalytics from './engine/HairFlatteningAnalyticsTracker';

// Start tracking when AR session begins
hairFlatteningAnalytics.trackSessionStart();

// Track segmentation completion
hairFlatteningAnalytics.trackSegmentationCompletion({
  duration: 245,
  volumeScore: 65,
  confidence: 0.92,
  autoFlatteningApplied: true,
  imageWidth: 640,
  imageHeight: 480,
});

// Track mode changes
hairFlatteningAnalytics.trackModeChange({
  fromMode: AdjustmentMode.FLATTENED,
  toMode: AdjustmentMode.NORMAL,
  volumeScore: 65,
  userInitiated: true,
});

// Track errors
hairFlatteningAnalytics.trackError({
  errorType: 'SEGMENTATION_FAILED',
  errorMessage: 'Failed to process image',
  context: { imageSize: '640x480' },
});

// End tracking when session ends
hairFlatteningAnalytics.trackSessionEnd();
```

### Integration with HairSegmentationModule

```typescript
class HairSegmentationModule {
  async segmentHair(imageData: ImageData): Promise<SegmentationResult> {
    const startTime = performance.now();
    
    try {
      const result = await this.performSegmentation(imageData);
      const duration = performance.now() - startTime;
      
      // Track successful segmentation
      hairFlatteningAnalytics.trackSegmentationCompletion({
        duration,
        volumeScore: this.calculateVolumeScore(result),
        confidence: result.confidence,
        autoFlatteningApplied: this.shouldAutoFlatten(result),
        imageWidth: imageData.width,
        imageHeight: imageData.height,
      });
      
      return result;
    } catch (error) {
      // Track error
      hairFlatteningAnalytics.trackError({
        errorType: 'SEGMENTATION_FAILED',
        errorMessage: error.message,
        context: {
          imageWidth: imageData.width,
          imageHeight: imageData.height,
        },
      });
      throw error;
    }
  }
}
```

### Integration with HairFlatteningEngine

```typescript
class HairFlatteningEngine {
  setMode(mode: AdjustmentMode): void {
    const previousMode = this.mode;
    this.mode = mode;
    
    // Track mode change
    hairFlatteningAnalytics.trackModeChange({
      fromMode: previousMode,
      toMode: mode,
      userInitiated: true,
    });
  }
  
  async applyFlattening(
    originalImage: ImageData,
    hairMask: ImageData,
    faceRegion: BoundingBox
  ): Promise<FlattenedResult> {
    const startTime = performance.now();
    
    const result = await this.processFlattening(originalImage, hairMask, faceRegion);
    const processingTime = performance.now() - startTime;
    
    // Track flattening application
    hairFlatteningAnalytics.trackFlatteningApplication({
      mode: this.mode,
      processingTime,
      volumeReduction: this.volumeReduction * 100,
      blendRadius: this.blendRadius,
    });
    
    return result;
  }
}
```

### Integration with PerformanceManager

```typescript
class PerformanceManager {
  private degradeGracefully(): void {
    const metrics = this.getCurrentMetrics();
    
    // Track performance degradation
    hairFlatteningAnalytics.trackPerformanceDegradation({
      currentFPS: metrics.overallFPS,
      targetFPS: this.targetFPS,
      segmentationFPS: metrics.segmentationFPS,
      degradationLevel: this.calculateDegradationLevel(metrics),
      qualityLevel: this.currentQualityLevel,
    });
    
    // Apply degradation...
  }
}
```

### Integration with EdgeCaseHandler

```typescript
class EdgeCaseHandler {
  handleBaldUser(segmentationData: HairSegmentationData): void {
    hairFlatteningAnalytics.trackEdgeCase(
      'bald_user',
      true,
      { volumeScore: segmentationData.volumeScore }
    );
    
    // Skip flattening...
  }
  
  handleMultipleFaces(faces: BoundingBox[]): BoundingBox {
    const primaryFace = this.selectPrimaryFace(faces);
    
    hairFlatteningAnalytics.trackEdgeCase(
      'multiple_faces',
      true,
      { faceCount: faces.length, primaryFaceIndex: 0 }
    );
    
    return primaryFace;
  }
}
```

## Event Types

### Session Events

**hair_flattening_session_start**
- Tracks when a user starts using the hair flattening feature
- Data: timestamp

**hair_flattening_session_end**
- Tracks when a user ends their session
- Data: duration, totalSegmentations, totalModeChanges, totalErrors

### Segmentation Events

**hair_segmentation_complete**
- Tracks successful hair segmentation
- Data: duration, volumeScore, confidence, autoFlatteningApplied, imageWidth, imageHeight, performanceClass, volumeCategory, confidenceLevel

### Mode Change Events

**hair_adjustment_mode_change**
- Tracks when users change adjustment modes
- Data: fromMode, toMode, volumeScore, userInitiated, transition

### Error Events

**hair_flattening_error**
- Tracks all errors in the hair flattening pipeline
- Data: errorType, errorMessage, context, errorNumber, sessionDuration

### Performance Events

**hair_flattening_performance_degradation**
- Tracks when performance degrades below acceptable levels
- Data: currentFPS, targetFPS, segmentationFPS, degradationLevel, qualityLevel, fpsDeficit, degradationPercentage

**hair_flattening_applied**
- Tracks when flattening effect is applied
- Data: mode, processingTime, volumeReduction, blendRadius, performanceClass

### UI Interaction Events

**hair_flattening_comparison_view**
- Tracks comparison view usage
- Data: action (open/close/capture), currentMode, viewDuration

**hair_flattening_info_message**
- Tracks info message interactions
- Data: action (shown/dismissed), autoHide

**hair_volume_score_display**
- Tracks volume score display
- Data: volumeScore, category

### Edge Case Events

**hair_flattening_edge_case**
- Tracks edge case handling
- Data: caseType, handled, details

### Initialization Events

**hair_flattening_initialization**
- Tracks feature initialization
- Data: success, loadTime, error

## Performance Classifications

### Segmentation Performance
- **excellent**: < 200ms
- **good**: 200-350ms
- **acceptable**: 350-500ms
- **slow**: > 500ms

### Processing Performance
- **excellent**: < 150ms
- **good**: 150-250ms
- **acceptable**: 250-300ms
- **slow**: > 300ms

### Volume Score Categories
- **minimal**: 0-5
- **low**: 5-25
- **moderate**: 25-50
- **high**: 50-75
- **very_high**: 75-100

### Confidence Levels
- **very_low**: < 0.5
- **low**: 0.5-0.7
- **medium**: 0.7-0.85
- **high**: 0.85-0.95
- **very_high**: > 0.95

## Analytics Dashboard

The tracked events can be viewed in the admin analytics dashboard:

```typescript
// Get hair flattening specific metrics
const hairFlatteningMetrics = await analyticsService.getDashboardStats(7);

// Filter for hair_flattening category events
const hairEvents = hairFlatteningMetrics.events.filter(
  e => e.event_category === 'hair_flattening'
);
```

## Best Practices

1. **Always track sessions**: Call `trackSessionStart()` and `trackSessionEnd()` to maintain session context
2. **Track errors immediately**: Don't wait to track errors - capture them as they occur
3. **Include context**: Provide relevant context data with errors and edge cases
4. **Track user-initiated changes**: Distinguish between automatic and user-initiated mode changes
5. **Monitor performance**: Track performance degradation to identify optimization opportunities

## Privacy Considerations

- All analytics are anonymous and tied to session IDs, not personal information
- No image data is sent to analytics - only metadata and metrics
- Users can opt out of analytics through browser settings
- All data is processed client-side before sending minimal metrics to the server

## Error Types

- **MODEL_LOAD_FAILED**: Failed to load the segmentation model
- **SEGMENTATION_FAILED**: Failed to segment hair in the image
- **TIMEOUT**: Segmentation took too long and was cancelled
- **LOW_CONFIDENCE**: Segmentation confidence below acceptable threshold
- **PROCESSING_ERROR**: General processing error during flattening

## Integration Checklist

- [ ] Track session start/end in AR component
- [ ] Track segmentation completion in HairSegmentationModule
- [ ] Track mode changes in HairFlatteningEngine
- [ ] Track errors in SegmentationErrorHandler
- [ ] Track performance degradation in PerformanceManager
- [ ] Track edge cases in EdgeCaseHandler
- [ ] Track UI interactions in React components
- [ ] Track initialization in setup code

## Testing

```typescript
// Test analytics tracking
describe('HairFlatteningAnalyticsTracker', () => {
  it('should track session lifecycle', () => {
    hairFlatteningAnalytics.trackSessionStart();
    
    // Perform operations...
    
    const stats = hairFlatteningAnalytics.getSessionStats();
    expect(stats.sessionDuration).toBeGreaterThan(0);
    
    hairFlatteningAnalytics.trackSessionEnd();
  });
});
```

## Requirements Validation

This analytics tracker helps validate all requirements by providing data on:

- **Requirement 1.1**: Segmentation timing (< 500ms)
- **Requirement 1.2**: Volume score calculation accuracy
- **Requirement 2.5**: Flattening effect timing (< 300ms)
- **Requirement 4.5**: Mode change timing (< 250ms)
- **Requirement 7.5**: Low confidence detection
- **Requirement 8.1**: Segmentation frame rate (15+ FPS)
- **Requirement 8.4**: Overall frame rate (24+ FPS)
- **All Requirements**: Error rates, edge case handling, user behavior patterns
