/**
 * HairFlatteningAnalyticsTracker
 * 
 * Tracks analytics events for the smart hair flattening feature.
 * Integrates with the existing analytics service to monitor:
 * - Segmentation completion and performance
 * - Mode changes and user preferences
 * - Errors and failure scenarios
 * - Performance degradation events
 * 
 * All events are sent to the existing analytics service with the 'hair_flattening' category.
 */

import analyticsService from '../services/analytics.service';
import { AdjustmentMode } from './HairFlatteningEngine';

export interface SegmentationCompletionData {
  duration: number; // milliseconds
  volumeScore: number; // 0-100
  confidence: number; // 0-1
  autoFlatteningApplied: boolean;
  imageWidth: number;
  imageHeight: number;
}

export interface ModeChangeData {
  fromMode: AdjustmentMode;
  toMode: AdjustmentMode;
  volumeScore?: number;
  userInitiated: boolean; // true if user changed, false if auto-applied
}

export interface ErrorData {
  errorType: 'MODEL_LOAD_FAILED' | 'SEGMENTATION_FAILED' | 'TIMEOUT' | 'LOW_CONFIDENCE' | 'PROCESSING_ERROR';
  errorMessage: string;
  context?: Record<string, any>;
}

export interface PerformanceDegradationData {
  currentFPS: number;
  targetFPS: number;
  segmentationFPS: number;
  degradationLevel: 'low' | 'medium' | 'high';
  qualityLevel: 'high' | 'medium' | 'low';
}

export interface FlatteningApplicationData {
  mode: AdjustmentMode;
  processingTime: number; // milliseconds
  volumeReduction: number; // percentage
  blendRadius: number; // pixels
}

export interface ComparisonViewData {
  action: 'open' | 'close' | 'capture';
  currentMode: AdjustmentMode;
  viewDuration?: number; // milliseconds (for close action)
}

class HairFlatteningAnalyticsTracker {
  private readonly CATEGORY = 'hair_flattening';
  private sessionStartTime: number | null = null;
  private comparisonViewStartTime: number | null = null;
  private totalSegmentations = 0;
  private totalModeChanges = 0;
  private totalErrors = 0;

  /**
   * Track the start of a hair flattening session
   */
  trackSessionStart(): void {
    this.sessionStartTime = Date.now();
    this.totalSegmentations = 0;
    this.totalModeChanges = 0;
    this.totalErrors = 0;

    analyticsService.trackEvent(
      'hair_flattening_session_start',
      this.CATEGORY,
      {
        timestamp: this.sessionStartTime,
      }
    );
  }

  /**
   * Track the end of a hair flattening session
   */
  trackSessionEnd(): void {
    if (!this.sessionStartTime) {
      return;
    }

    const duration = Date.now() - this.sessionStartTime;

    analyticsService.trackEvent(
      'hair_flattening_session_end',
      this.CATEGORY,
      {
        duration,
        totalSegmentations: this.totalSegmentations,
        totalModeChanges: this.totalModeChanges,
        totalErrors: this.totalErrors,
      }
    );

    this.sessionStartTime = null;
  }

  /**
   * Track successful segmentation completion
   */
  trackSegmentationCompletion(data: SegmentationCompletionData): void {
    this.totalSegmentations++;

    analyticsService.trackEvent(
      'hair_segmentation_complete',
      this.CATEGORY,
      {
        duration: data.duration,
        volumeScore: data.volumeScore,
        confidence: data.confidence,
        autoFlatteningApplied: data.autoFlatteningApplied,
        imageWidth: data.imageWidth,
        imageHeight: data.imageHeight,
        segmentationNumber: this.totalSegmentations,
        // Performance classification
        performanceClass: this.classifySegmentationPerformance(data.duration),
        // Volume classification
        volumeCategory: this.classifyVolumeScore(data.volumeScore),
        // Confidence classification
        confidenceLevel: this.classifyConfidence(data.confidence),
      }
    );
  }

  /**
   * Track adjustment mode changes
   */
  trackModeChange(data: ModeChangeData): void {
    this.totalModeChanges++;

    analyticsService.trackEvent(
      'hair_adjustment_mode_change',
      this.CATEGORY,
      {
        fromMode: data.fromMode,
        toMode: data.toMode,
        volumeScore: data.volumeScore,
        userInitiated: data.userInitiated,
        modeChangeNumber: this.totalModeChanges,
        // Track common mode transitions
        transition: `${data.fromMode}_to_${data.toMode}`,
      }
    );
  }

  /**
   * Track errors by type
   */
  trackError(data: ErrorData): void {
    this.totalErrors++;

    analyticsService.trackEvent(
      'hair_flattening_error',
      this.CATEGORY,
      {
        errorType: data.errorType,
        errorMessage: data.errorMessage,
        context: data.context,
        errorNumber: this.totalErrors,
        sessionDuration: this.sessionStartTime ? Date.now() - this.sessionStartTime : null,
      }
    );
  }

  /**
   * Track performance degradation events
   */
  trackPerformanceDegradation(data: PerformanceDegradationData): void {
    analyticsService.trackEvent(
      'hair_flattening_performance_degradation',
      this.CATEGORY,
      {
        currentFPS: data.currentFPS,
        targetFPS: data.targetFPS,
        segmentationFPS: data.segmentationFPS,
        degradationLevel: data.degradationLevel,
        qualityLevel: data.qualityLevel,
        fpsDeficit: data.targetFPS - data.currentFPS,
        degradationPercentage: ((data.targetFPS - data.currentFPS) / data.targetFPS) * 100,
      }
    );
  }

  /**
   * Track flattening effect application
   */
  trackFlatteningApplication(data: FlatteningApplicationData): void {
    analyticsService.trackEvent(
      'hair_flattening_applied',
      this.CATEGORY,
      {
        mode: data.mode,
        processingTime: data.processingTime,
        volumeReduction: data.volumeReduction,
        blendRadius: data.blendRadius,
        performanceClass: this.classifyProcessingPerformance(data.processingTime),
      }
    );
  }

  /**
   * Track comparison view interactions
   */
  trackComparisonView(data: ComparisonViewData): void {
    if (data.action === 'open') {
      this.comparisonViewStartTime = Date.now();
    } else if (data.action === 'close' && this.comparisonViewStartTime) {
      data.viewDuration = Date.now() - this.comparisonViewStartTime;
      this.comparisonViewStartTime = null;
    }

    analyticsService.trackEvent(
      'hair_flattening_comparison_view',
      this.CATEGORY,
      {
        action: data.action,
        currentMode: data.currentMode,
        viewDuration: data.viewDuration,
      }
    );
  }

  /**
   * Track info message interactions
   */
  trackInfoMessage(action: 'shown' | 'dismissed', autoHide: boolean = false): void {
    analyticsService.trackEvent(
      'hair_flattening_info_message',
      this.CATEGORY,
      {
        action,
        autoHide,
      }
    );
  }

  /**
   * Track volume score display
   */
  trackVolumeScoreDisplay(volumeScore: number, category: string): void {
    analyticsService.trackEvent(
      'hair_volume_score_display',
      this.CATEGORY,
      {
        volumeScore,
        category,
      }
    );
  }

  /**
   * Track edge case handling
   */
  trackEdgeCase(
    caseType: 'bald_user' | 'hat_detected' | 'low_quality' | 'multiple_faces',
    handled: boolean,
    details?: Record<string, any>
  ): void {
    analyticsService.trackEvent(
      'hair_flattening_edge_case',
      this.CATEGORY,
      {
        caseType,
        handled,
        details,
      }
    );
  }

  /**
   * Track feature initialization
   */
  trackInitialization(success: boolean, loadTime?: number, error?: string): void {
    analyticsService.trackEvent(
      'hair_flattening_initialization',
      this.CATEGORY,
      {
        success,
        loadTime,
        error,
      }
    );
  }

  // Helper methods for classification

  private classifySegmentationPerformance(duration: number): string {
    if (duration < 200) return 'excellent';
    if (duration < 350) return 'good';
    if (duration < 500) return 'acceptable';
    return 'slow';
  }

  private classifyProcessingPerformance(duration: number): string {
    if (duration < 150) return 'excellent';
    if (duration < 250) return 'good';
    if (duration < 300) return 'acceptable';
    return 'slow';
  }

  private classifyVolumeScore(score: number): string {
    if (score < 5) return 'minimal';
    if (score < 25) return 'low';
    if (score < 50) return 'moderate';
    if (score < 75) return 'high';
    return 'very_high';
  }

  private classifyConfidence(confidence: number): string {
    if (confidence < 0.5) return 'very_low';
    if (confidence < 0.7) return 'low';
    if (confidence < 0.85) return 'medium';
    if (confidence < 0.95) return 'high';
    return 'very_high';
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      sessionDuration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
      totalSegmentations: this.totalSegmentations,
      totalModeChanges: this.totalModeChanges,
      totalErrors: this.totalErrors,
    };
  }
}

export default new HairFlatteningAnalyticsTracker();
