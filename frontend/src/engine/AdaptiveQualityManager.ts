/**
 * AdaptiveQualityManager
 * 
 * Manages adaptive quality settings for the hair flattening AR system.
 * Automatically adjusts quality levels based on performance metrics to
 * maintain smooth frame rates while maximizing visual quality.
 * 
 * Quality Levels:
 * - High: 512x512 segmentation, 20+ FPS, full features
 * - Medium: 384x384 segmentation, 15 FPS, balanced settings
 * - Low: 256x256 segmentation, 10 FPS, minimal features
 * 
 * Requirements:
 * - 8.1: Maintain minimum 15 FPS for segmentation updates
 * - 8.4: Maintain minimum 24 FPS overall frame rate
 */

export type QualityLevel = 'high' | 'medium' | 'low';

export interface QualitySettings {
  segmentationResolution: number;
  segmentationFPS: number;
  blendRadius: number;
  enableComparison: boolean;
}

export interface PerformanceMetrics {
  overallFPS: number;
  segmentationFPS: number;
  lastSegmentationTime: number;
  lastFlatteningTime: number;
  memoryUsage: number;
}

export interface QualityChangeEvent {
  previousQuality: QualityLevel;
  newQuality: QualityLevel;
  reason: string;
  timestamp: number;
}

/**
 * AdaptiveQualityManager class
 * 
 * Monitors performance and automatically adjusts quality settings to
 * maintain smooth performance while maximizing visual quality.
 */
export class AdaptiveQualityManager {
  private currentQuality: QualityLevel = 'high';
  
  // Thresholds for quality adjustments
  private readonly DEGRADE_THRESHOLD = 20; // FPS below this triggers degradation
  private readonly RECOVER_THRESHOLD = 29; // FPS above this allows recovery
  private readonly HYSTERESIS_FRAMES = 30; // Frames to wait before changing quality
  
  private performanceHistory: number[] = [];
  private framesSinceLastChange: number = 0;
  
  private onQualityChange?: (event: QualityChangeEvent) => void;
  
  constructor(options?: {
    initialQuality?: QualityLevel;
    onQualityChange?: (event: QualityChangeEvent) => void;
  }) {
    if (options?.initialQuality) {
      this.currentQuality = options.initialQuality;
    }
    if (options?.onQualityChange) {
      this.onQualityChange = options.onQualityChange;
    }
  }
  
  /**
   * Adjust quality based on current performance metrics
   * Requirements: 8.1, 8.4
   */
  adjustQuality(performanceMetrics: PerformanceMetrics): void {
    // Track performance history
    this.performanceHistory.push(performanceMetrics.overallFPS);
    if (this.performanceHistory.length > 60) {
      this.performanceHistory.shift();
    }
    
    this.framesSinceLastChange++;
    
    // Don't change quality too frequently (hysteresis)
    if (this.framesSinceLastChange < this.HYSTERESIS_FRAMES) {
      return;
    }
    
    // Calculate average FPS over recent history
    const avgFPS = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
    
    // Determine if we need to change quality
    let newQuality: QualityLevel = this.currentQuality;
    let reason = '';
    
    if (avgFPS < this.DEGRADE_THRESHOLD) {
      // Performance is poor, degrade quality
      if (this.currentQuality === 'high') {
        newQuality = 'medium';
        reason = `FPS dropped to ${avgFPS.toFixed(1)} (threshold: ${this.DEGRADE_THRESHOLD})`;
      } else if (this.currentQuality === 'medium') {
        newQuality = 'low';
        reason = `FPS dropped to ${avgFPS.toFixed(1)} (threshold: ${this.DEGRADE_THRESHOLD})`;
      }
    } else if (avgFPS > this.RECOVER_THRESHOLD) {
      // Performance is good, try to recover quality
      if (this.currentQuality === 'low') {
        newQuality = 'medium';
        reason = `FPS improved to ${avgFPS.toFixed(1)} (threshold: ${this.RECOVER_THRESHOLD})`;
      } else if (this.currentQuality === 'medium') {
        newQuality = 'high';
        reason = `FPS improved to ${avgFPS.toFixed(1)} (threshold: ${this.RECOVER_THRESHOLD})`;
      }
    }
    
    // Apply quality change if needed
    if (newQuality !== this.currentQuality) {
      this.setQuality(newQuality, reason);
    }
  }
  
  /**
   * Set quality level explicitly
   */
  setQuality(quality: QualityLevel, reason: string = 'Manual change'): void {
    const previousQuality = this.currentQuality;
    this.currentQuality = quality;
    this.framesSinceLastChange = 0;
    
    // Apply quality settings
    switch (quality) {
      case 'high':
        this.applyHighQualitySettings();
        break;
      case 'medium':
        this.applyMediumQualitySettings();
        break;
      case 'low':
        this.applyLowQualitySettings();
        break;
    }
    
    // Notify listeners
    if (this.onQualityChange && previousQuality !== quality) {
      this.onQualityChange({
        previousQuality,
        newQuality: quality,
        reason,
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Apply low quality settings
   * - Reduce resolution to 256x256
   * - Lower FPS to 10
   * - Disable comparison view
   * - Reduce blend radius to 3 pixels
   * 
   * Requirements: 8.1, 8.4
   */
  private applyLowQualitySettings(): void {
    // Settings are retrieved via getCurrentSettings()
    // This method is called to trigger any side effects
    console.log('[AdaptiveQuality] Applied LOW quality settings:', this.getCurrentSettings());
  }
  
  /**
   * Apply medium quality settings
   * - Use resolution 384x384
   * - Maintain 15 FPS
   * - Enable comparison with lower update rate
   * - Use blend radius of 5 pixels
   * 
   * Requirements: 8.1, 8.4
   */
  private applyMediumQualitySettings(): void {
    // Settings are retrieved via getCurrentSettings()
    // This method is called to trigger any side effects
    console.log('[AdaptiveQuality] Applied MEDIUM quality settings:', this.getCurrentSettings());
  }
  
  /**
   * Apply high quality settings
   * - Full resolution 512x512
   * - Segmentation at 20+ FPS
   * - Full real-time comparison view
   * - Full blend radius of 10 pixels
   * 
   * Requirements: 8.1, 8.4
   */
  private applyHighQualitySettings(): void {
    // Settings are retrieved via getCurrentSettings()
    // This method is called to trigger any side effects
    console.log('[AdaptiveQuality] Applied HIGH quality settings:', this.getCurrentSettings());
  }
  
  /**
   * Get current quality level
   */
  getQualityLevel(): QualityLevel {
    return this.currentQuality;
  }
  
  /**
   * Get current quality settings
   */
  getCurrentSettings(): QualitySettings {
    return this.getSettingsForQuality(this.currentQuality);
  }
  
  /**
   * Get settings for a specific quality level
   */
  getSettingsForQuality(quality: QualityLevel): QualitySettings {
    switch (quality) {
      case 'high':
        return {
          segmentationResolution: 512,
          segmentationFPS: 20,
          blendRadius: 10,
          enableComparison: true
        };
      case 'medium':
        return {
          segmentationResolution: 384,
          segmentationFPS: 15,
          blendRadius: 5,
          enableComparison: true
        };
      case 'low':
        return {
          segmentationResolution: 256,
          segmentationFPS: 10,
          blendRadius: 3,
          enableComparison: false
        };
    }
  }
  
  /**
   * Check if quality can be upgraded based on current level
   */
  canUpgrade(): boolean {
    return this.currentQuality !== 'high';
  }
  
  /**
   * Check if quality can be downgraded based on current level
   */
  canDowngrade(): boolean {
    return this.currentQuality !== 'low';
  }
  
  /**
   * Force upgrade quality by one level
   */
  upgradeQuality(): boolean {
    if (!this.canUpgrade()) {
      return false;
    }
    
    const newQuality: QualityLevel = this.currentQuality === 'low' ? 'medium' : 'high';
    this.setQuality(newQuality, 'Manual upgrade');
    return true;
  }
  
  /**
   * Force downgrade quality by one level
   */
  downgradeQuality(): boolean {
    if (!this.canDowngrade()) {
      return false;
    }
    
    const newQuality: QualityLevel = this.currentQuality === 'high' ? 'medium' : 'low';
    this.setQuality(newQuality, 'Manual downgrade');
    return true;
  }
  
  /**
   * Reset to default quality
   */
  reset(): void {
    this.currentQuality = 'high';
    this.performanceHistory = [];
    this.framesSinceLastChange = 0;
  }
}
