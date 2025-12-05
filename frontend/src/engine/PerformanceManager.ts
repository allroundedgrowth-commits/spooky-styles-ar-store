/**
 * PerformanceManager
 * 
 * Monitors and manages performance of the hair flattening AR system.
 * Tracks FPS for overall rendering and segmentation, and gracefully
 * degrades quality when performance drops below acceptable thresholds.
 * 
 * Requirements:
 * - 8.1: Maintain minimum 15 FPS for segmentation updates
 * - 8.3: Update flattened regions within 100ms of hair movement
 * - 8.4: Maintain minimum 24 FPS overall frame rate
 * - 8.5: Prioritize wig rendering over segmentation when constrained
 */

export interface PerformanceMetrics {
  overallFPS: number;
  segmentationFPS: number;
  lastSegmentationTime: number;
  lastFlatteningTime: number;
  memoryUsage: number;
  frameCount: number;
  segmentationCount: number;
}

export interface PerformanceWarning {
  type: 'fps_drop' | 'high_memory' | 'slow_segmentation' | 'slow_flattening';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

export type QualityLevel = 'high' | 'medium' | 'low';

export interface QualitySettings {
  segmentationResolution: number;
  segmentationFPS: number;
  blendRadius: number;
  enableComparison: boolean;
}

/**
 * PerformanceManager class
 * 
 * Monitors FPS and performance metrics, automatically degrading quality
 * when performance drops below thresholds and recovering when it improves.
 */
export class PerformanceManager {
  private targetFPS: number = 24;
  private minSegmentationFPS: number = 15;
  private maxSegmentationTime: number = 500; // ms
  private maxFlatteningTime: number = 300; // ms
  
  private metrics: PerformanceMetrics = {
    overallFPS: 0,
    segmentationFPS: 0,
    lastSegmentationTime: 0,
    lastFlatteningTime: 0,
    memoryUsage: 0,
    frameCount: 0,
    segmentationCount: 0
  };
  
  private frameTimes: number[] = [];
  private segmentationTimes: number[] = [];
  private lastFrameTime: number = 0;
  private lastSegmentationFrameTime: number = 0;
  
  private currentQuality: QualityLevel = 'high';
  private isDegraded: boolean = false;
  
  private warnings: PerformanceWarning[] = [];
  private maxWarnings: number = 10;
  
  private onWarning?: (warning: PerformanceWarning) => void;
  private onQualityChange?: (quality: QualityLevel, settings: QualitySettings) => void;
  
  constructor(options?: {
    targetFPS?: number;
    minSegmentationFPS?: number;
    onWarning?: (warning: PerformanceWarning) => void;
    onQualityChange?: (quality: QualityLevel, settings: QualitySettings) => void;
  }) {
    if (options?.targetFPS) this.targetFPS = options.targetFPS;
    if (options?.minSegmentationFPS) this.minSegmentationFPS = options.minSegmentationFPS;
    if (options?.onWarning) this.onWarning = options.onWarning;
    if (options?.onQualityChange) this.onQualityChange = options.onQualityChange;
  }
  
  /**
   * Record a rendered frame for FPS calculation
   */
  recordFrame(): void {
    const now = performance.now();
    
    if (this.lastFrameTime > 0) {
      const frameTime = now - this.lastFrameTime;
      this.frameTimes.push(frameTime);
      
      // Keep only last 60 frames for rolling average
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift();
      }
      
      // Calculate FPS
      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      this.metrics.overallFPS = 1000 / avgFrameTime;
    }
    
    this.lastFrameTime = now;
    this.metrics.frameCount++;
  }
  
  /**
   * Record a segmentation operation for segmentation FPS calculation
   */
  recordSegmentation(duration: number): void {
    const now = performance.now();
    
    this.metrics.lastSegmentationTime = duration;
    
    if (this.lastSegmentationFrameTime > 0) {
      const segmentationFrameTime = now - this.lastSegmentationFrameTime;
      this.segmentationTimes.push(segmentationFrameTime);
      
      // Keep only last 30 segmentation frames
      if (this.segmentationTimes.length > 30) {
        this.segmentationTimes.shift();
      }
      
      // Calculate segmentation FPS
      const avgSegTime = this.segmentationTimes.reduce((a, b) => a + b, 0) / this.segmentationTimes.length;
      this.metrics.segmentationFPS = 1000 / avgSegTime;
    }
    
    this.lastSegmentationFrameTime = now;
    this.metrics.segmentationCount++;
    
    // Check for slow segmentation
    if (duration > this.maxSegmentationTime) {
      this.addWarning({
        type: 'slow_segmentation',
        message: `Segmentation took ${duration.toFixed(0)}ms (target: ${this.maxSegmentationTime}ms)`,
        severity: 'medium',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Record a flattening operation
   */
  recordFlattening(duration: number): void {
    this.metrics.lastFlatteningTime = duration;
    
    // Check for slow flattening
    if (duration > this.maxFlatteningTime) {
      this.addWarning({
        type: 'slow_flattening',
        message: `Flattening took ${duration.toFixed(0)}ms (target: ${this.maxFlatteningTime}ms)`,
        severity: 'medium',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Update memory usage metric
   */
  updateMemoryUsage(): void {
    // @ts-expect-error - performance.memory is Chrome-specific
    if (performance.memory) {
      // @ts-expect-error - performance.memory is Chrome-specific
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
      
      // Warn if memory usage is high (> 80MB for hair flattening)
      if (this.metrics.memoryUsage > 80) {
        this.addWarning({
          type: 'high_memory',
          message: `Memory usage: ${this.metrics.memoryUsage.toFixed(1)}MB`,
          severity: 'low',
          timestamp: Date.now()
        });
      }
    }
  }
  
  /**
   * Monitor performance and trigger degradation/recovery as needed
   * Should be called regularly (e.g., every second)
   */
  monitorPerformance(): void {
    this.updateMemoryUsage();
    
    // Check if we need to degrade quality
    if (!this.isDegraded && this.shouldDegrade()) {
      this.degradeGracefully();
    }
    // Check if we can recover quality
    else if (this.isDegraded && this.canRecover()) {
      this.recoverPerformance();
    }
  }
  
  /**
   * Check if performance has dropped below acceptable thresholds
   */
  private shouldDegrade(): boolean {
    // Degrade if overall FPS drops below target
    if (this.metrics.overallFPS > 0 && this.metrics.overallFPS < this.targetFPS) {
      return true;
    }
    
    // Degrade if segmentation FPS is too low
    if (this.metrics.segmentationFPS > 0 && this.metrics.segmentationFPS < this.minSegmentationFPS) {
      return true;
    }
    
    // Degrade if segmentation is consistently slow
    if (this.metrics.lastSegmentationTime > this.maxSegmentationTime * 1.5) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if performance has improved enough to recover quality
   */
  private canRecover(): boolean {
    // Need sustained good performance before recovering
    const recoveryThreshold = this.targetFPS + 5; // 29 FPS
    
    if (this.metrics.overallFPS < recoveryThreshold) {
      return false;
    }
    
    if (this.metrics.segmentationFPS > 0 && this.metrics.segmentationFPS < this.minSegmentationFPS + 3) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Reduce quality settings to improve performance
   * Requirements: 8.4, 8.5
   */
  degradeGracefully(): void {
    this.isDegraded = true;
    
    // Determine new quality level based on current performance
    let newQuality: QualityLevel;
    
    if (this.metrics.overallFPS < 20) {
      newQuality = 'low';
    } else if (this.metrics.overallFPS < this.targetFPS) {
      newQuality = 'medium';
    } else {
      newQuality = 'medium'; // Default degradation
    }
    
    // Only degrade, never upgrade in this method
    if (this.getQualityLevelNumber(newQuality) < this.getQualityLevelNumber(this.currentQuality)) {
      this.currentQuality = newQuality;
      
      const settings = this.getQualitySettings(newQuality);
      
      // Notify about quality change
      if (this.onQualityChange) {
        this.onQualityChange(newQuality, settings);
      }
      
      // Add warning
      this.addWarning({
        type: 'fps_drop',
        message: `Performance degraded to ${newQuality} quality (FPS: ${this.metrics.overallFPS.toFixed(1)})`,
        severity: 'high',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Restore quality settings when performance improves
   * Requirements: 8.4
   */
  recoverPerformance(): void {
    // Try to upgrade quality level
    let newQuality: QualityLevel;
    
    if (this.currentQuality === 'low' && this.metrics.overallFPS >= this.targetFPS + 3) {
      newQuality = 'medium';
    } else if (this.currentQuality === 'medium' && this.metrics.overallFPS >= this.targetFPS + 5) {
      newQuality = 'high';
    } else {
      return; // No recovery possible yet
    }
    
    this.currentQuality = newQuality;
    
    const settings = this.getQualitySettings(newQuality);
    
    // Notify about quality change
    if (this.onQualityChange) {
      this.onQualityChange(newQuality, settings);
    }
    
    // Check if fully recovered
    if (newQuality === 'high') {
      this.isDegraded = false;
    }
  }
  
  /**
   * Get quality settings for a given quality level
   */
  private getQualitySettings(quality: QualityLevel): QualitySettings {
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
   * Get numeric quality level for comparison
   */
  private getQualityLevelNumber(quality: QualityLevel): number {
    switch (quality) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  }
  
  /**
   * Add a performance warning
   */
  private addWarning(warning: PerformanceWarning): void {
    this.warnings.push(warning);
    
    // Keep only recent warnings
    if (this.warnings.length > this.maxWarnings) {
      this.warnings.shift();
    }
    
    // Notify callback
    if (this.onWarning) {
      this.onWarning(warning);
    }
  }
  
  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
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
    return this.getQualitySettings(this.currentQuality);
  }
  
  /**
   * Check if performance is degraded
   */
  isDegradedMode(): boolean {
    return this.isDegraded;
  }
  
  /**
   * Get recent warnings
   */
  getWarnings(): PerformanceWarning[] {
    return [...this.warnings];
  }
  
  /**
   * Clear all warnings
   */
  clearWarnings(): void {
    this.warnings = [];
  }
  
  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      overallFPS: 0,
      segmentationFPS: 0,
      lastSegmentationTime: 0,
      lastFlatteningTime: 0,
      memoryUsage: 0,
      frameCount: 0,
      segmentationCount: 0
    };
    
    this.frameTimes = [];
    this.segmentationTimes = [];
    this.lastFrameTime = 0;
    this.lastSegmentationFrameTime = 0;
    this.warnings = [];
    this.currentQuality = 'high';
    this.isDegraded = false;
  }
}
