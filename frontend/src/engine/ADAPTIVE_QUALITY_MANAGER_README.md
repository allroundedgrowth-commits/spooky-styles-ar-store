# AdaptiveQualityManager

## Overview

The `AdaptiveQualityManager` automatically adjusts quality settings for the hair flattening AR system based on real-time performance metrics. It ensures smooth frame rates while maximizing visual quality by dynamically switching between three quality levels.

## Features

- **Automatic Quality Adjustment**: Monitors FPS and adjusts quality to maintain smooth performance
- **Three Quality Levels**: High, Medium, and Low with different resolution and feature settings
- **Hysteresis**: Prevents rapid quality switching by requiring sustained performance changes
- **Manual Control**: Allows explicit quality level changes when needed
- **Event Notifications**: Notifies listeners when quality changes occur

## Quality Levels

### High Quality
- **Segmentation Resolution**: 512x512 pixels
- **Segmentation FPS**: 20+ frames per second
- **Blend Radius**: 10 pixels
- **Comparison View**: Enabled with real-time updates
- **Use Case**: High-end devices with good performance

### Medium Quality
- **Segmentation Resolution**: 384x384 pixels
- **Segmentation FPS**: 15 frames per second
- **Blend Radius**: 5 pixels
- **Comparison View**: Enabled with lower update rate
- **Use Case**: Mid-range devices, balanced performance

### Low Quality
- **Segmentation Resolution**: 256x256 pixels
- **Segmentation FPS**: 10 frames per second
- **Blend Radius**: 3 pixels
- **Comparison View**: Disabled
- **Use Case**: Low-end devices, prioritize performance

## Usage

### Basic Setup

```typescript
import { AdaptiveQualityManager } from './AdaptiveQualityManager';

// Create manager with default settings
const qualityManager = new AdaptiveQualityManager();

// Or with custom options
const qualityManager = new AdaptiveQualityManager({
  initialQuality: 'medium',
  onQualityChange: (event) => {
    console.log(`Quality changed from ${event.previousQuality} to ${event.newQuality}`);
    console.log(`Reason: ${event.reason}`);
  }
});
```

### Automatic Quality Adjustment

```typescript
// In your render loop
function renderFrame() {
  // Get current performance metrics
  const metrics = {
    overallFPS: fpsMonitor.getCurrentFPS(),
    segmentationFPS: segmentationMonitor.getFPS(),
    lastSegmentationTime: segmentationTimer.getLastTime(),
    lastFlatteningTime: flatteningTimer.getLastTime(),
    memoryUsage: performance.memory?.usedJSHeapSize || 0
  };
  
  // Let the manager adjust quality based on performance
  qualityManager.adjustQuality(metrics);
  
  // Get current settings and apply them
  const settings = qualityManager.getCurrentSettings();
  applyQualitySettings(settings);
  
  requestAnimationFrame(renderFrame);
}
```

### Manual Quality Control

```typescript
// Get current quality level
const currentQuality = qualityManager.getQualityLevel();
console.log(`Current quality: ${currentQuality}`);

// Set quality explicitly
qualityManager.setQuality('low', 'User preference');

// Upgrade/downgrade by one level
if (qualityManager.canUpgrade()) {
  qualityManager.upgradeQuality();
}

if (qualityManager.canDowngrade()) {
  qualityManager.downgradeQuality();
}

// Reset to default (high quality)
qualityManager.reset();
```

### Getting Quality Settings

```typescript
// Get settings for current quality level
const currentSettings = qualityManager.getCurrentSettings();
console.log(`Resolution: ${currentSettings.segmentationResolution}x${currentSettings.segmentationResolution}`);
console.log(`Target FPS: ${currentSettings.segmentationFPS}`);
console.log(`Blend radius: ${currentSettings.blendRadius}px`);
console.log(`Comparison enabled: ${currentSettings.enableComparison}`);

// Get settings for a specific quality level
const highSettings = qualityManager.getSettingsForQuality('high');
const mediumSettings = qualityManager.getSettingsForQuality('medium');
const lowSettings = qualityManager.getSettingsForQuality('low');
```

## Performance Thresholds

The manager uses the following thresholds for automatic quality adjustment:

- **Degradation Threshold**: 20 FPS - Quality is lowered when average FPS drops below this
- **Recovery Threshold**: 29 FPS - Quality is raised when average FPS exceeds this
- **Hysteresis Period**: 30 frames - Minimum frames between quality changes to prevent oscillation

## Integration Example

```typescript
import { AdaptiveQualityManager } from './AdaptiveQualityManager';
import { HairSegmentationModule } from './HairSegmentationModule';
import { HairFlatteningEngine } from './HairFlatteningEngine';

class AREngine {
  private qualityManager: AdaptiveQualityManager;
  private segmentation: HairSegmentationModule;
  private flattening: HairFlatteningEngine;
  private fpsHistory: number[] = [];
  
  constructor() {
    this.qualityManager = new AdaptiveQualityManager({
      initialQuality: 'high',
      onQualityChange: (event) => {
        this.handleQualityChange(event);
      }
    });
    
    this.segmentation = new HairSegmentationModule();
    this.flattening = new HairFlatteningEngine();
  }
  
  private handleQualityChange(event: QualityChangeEvent): void {
    const settings = this.qualityManager.getCurrentSettings();
    
    // Apply new resolution to segmentation
    this.segmentation.setResolution(settings.segmentationResolution);
    
    // Apply new blend radius to flattening
    this.flattening.setBlendRadius(settings.blendRadius);
    
    // Show/hide comparison view
    this.updateComparisonView(settings.enableComparison);
    
    // Notify user if quality was degraded
    if (event.newQuality === 'low') {
      this.showPerformanceWarning();
    }
  }
  
  private async renderFrame(): Promise<void> {
    const frameStart = performance.now();
    
    // Perform rendering
    await this.segmentation.process();
    await this.flattening.apply();
    
    // Calculate FPS
    const frameTime = performance.now() - frameStart;
    const fps = 1000 / frameTime;
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }
    
    // Update quality based on performance
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    this.qualityManager.adjustQuality({
      overallFPS: avgFPS,
      segmentationFPS: this.segmentation.getFPS(),
      lastSegmentationTime: this.segmentation.getLastProcessTime(),
      lastFlatteningTime: this.flattening.getLastProcessTime(),
      memoryUsage: performance.memory?.usedJSHeapSize || 0
    });
    
    requestAnimationFrame(() => this.renderFrame());
  }
}
```

## Requirements Validation

This component validates the following requirements:

- **Requirement 8.1**: Maintains minimum 15 FPS for segmentation by adjusting quality
- **Requirement 8.4**: Maintains minimum 24 FPS overall by degrading quality when needed

## API Reference

### Constructor

```typescript
constructor(options?: {
  initialQuality?: QualityLevel;
  onQualityChange?: (event: QualityChangeEvent) => void;
})
```

### Methods

#### `adjustQuality(performanceMetrics: PerformanceMetrics): void`
Automatically adjusts quality based on current performance metrics.

#### `setQuality(quality: QualityLevel, reason?: string): void`
Explicitly sets the quality level.

#### `getQualityLevel(): QualityLevel`
Returns the current quality level.

#### `getCurrentSettings(): QualitySettings`
Returns the settings for the current quality level.

#### `getSettingsForQuality(quality: QualityLevel): QualitySettings`
Returns the settings for a specific quality level.

#### `canUpgrade(): boolean`
Returns true if quality can be upgraded.

#### `canDowngrade(): boolean`
Returns true if quality can be downgraded.

#### `upgradeQuality(): boolean`
Upgrades quality by one level. Returns true if successful.

#### `downgradeQuality(): boolean`
Downgrades quality by one level. Returns true if successful.

#### `reset(): void`
Resets to default high quality and clears performance history.

## Types

### QualityLevel
```typescript
type QualityLevel = 'high' | 'medium' | 'low';
```

### QualitySettings
```typescript
interface QualitySettings {
  segmentationResolution: number;
  segmentationFPS: number;
  blendRadius: number;
  enableComparison: boolean;
}
```

### PerformanceMetrics
```typescript
interface PerformanceMetrics {
  overallFPS: number;
  segmentationFPS: number;
  lastSegmentationTime: number;
  lastFlatteningTime: number;
  memoryUsage: number;
}
```

### QualityChangeEvent
```typescript
interface QualityChangeEvent {
  previousQuality: QualityLevel;
  newQuality: QualityLevel;
  reason: string;
  timestamp: number;
}
```

## Best Practices

1. **Monitor Consistently**: Call `adjustQuality()` on every frame or at regular intervals
2. **Use Hysteresis**: The built-in hysteresis prevents rapid quality switching
3. **Listen to Changes**: Use the `onQualityChange` callback to update UI and apply settings
4. **Provide Feedback**: Show users when quality is degraded and why
5. **Allow Manual Override**: Let users manually set quality if they prefer
6. **Test on Target Devices**: Test performance on low-end devices to ensure quality levels are appropriate

## Troubleshooting

### Quality keeps switching
- The hysteresis period (30 frames) should prevent this
- Check if performance is oscillating around the threshold
- Consider adjusting DEGRADE_THRESHOLD or RECOVER_THRESHOLD

### Quality never upgrades
- Ensure FPS consistently exceeds RECOVER_THRESHOLD (29 FPS)
- Check that performance history is being tracked correctly
- Verify that enough frames have passed since last change

### Low quality still has poor performance
- Consider adding an "ultra-low" quality level
- Check for other performance bottlenecks outside quality settings
- Verify device capabilities meet minimum requirements