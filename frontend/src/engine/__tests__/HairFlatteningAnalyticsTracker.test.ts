/**
 * Tests for HairFlatteningAnalyticsTracker
 * 
 * These tests verify that the analytics tracker correctly captures
 * and sends events to the analytics service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import hairFlatteningAnalytics from '../HairFlatteningAnalyticsTracker';
import analyticsService from '../../services/analytics.service';
import { AdjustmentMode } from '../HairFlatteningEngine';

// Mock the analytics service
vi.mock('../../services/analytics.service', () => ({
  default: {
    trackEvent: vi.fn(),
  },
}));

describe('HairFlatteningAnalyticsTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Tracking', () => {
    it('should track session start', () => {
      hairFlatteningAnalytics.trackSessionStart();

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_session_start',
        'hair_flattening',
        expect.objectContaining({
          timestamp: expect.any(Number),
        })
      );
    });

    it('should track session end with statistics', () => {
      hairFlatteningAnalytics.trackSessionStart();
      
      // Simulate some activity
      hairFlatteningAnalytics.trackSegmentationCompletion({
        duration: 245,
        volumeScore: 65,
        confidence: 0.92,
        autoFlatteningApplied: true,
        imageWidth: 640,
        imageHeight: 480,
      });

      hairFlatteningAnalytics.trackSessionEnd();

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_session_end',
        'hair_flattening',
        expect.objectContaining({
          duration: expect.any(Number),
          totalSegmentations: 1,
          totalModeChanges: 0,
          totalErrors: 0,
        })
      );
    });

    it('should provide session statistics', () => {
      hairFlatteningAnalytics.trackSessionStart();

      const stats = hairFlatteningAnalytics.getSessionStats();

      expect(stats).toEqual({
        sessionDuration: expect.any(Number),
        totalSegmentations: 0,
        totalModeChanges: 0,
        totalErrors: 0,
      });
    });
  });

  describe('Segmentation Tracking', () => {
    it('should track segmentation completion with all metrics', () => {
      hairFlatteningAnalytics.trackSegmentationCompletion({
        duration: 245,
        volumeScore: 65,
        confidence: 0.92,
        autoFlatteningApplied: true,
        imageWidth: 640,
        imageHeight: 480,
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_segmentation_complete',
        'hair_flattening',
        expect.objectContaining({
          duration: 245,
          volumeScore: 65,
          confidence: 0.92,
          autoFlatteningApplied: true,
          imageWidth: 640,
          imageHeight: 480,
          performanceClass: 'good',
          volumeCategory: 'high',
          confidenceLevel: 'high',
        })
      );
    });

    it('should classify segmentation performance correctly', () => {
      const testCases = [
        { duration: 150, expected: 'excellent' },
        { duration: 250, expected: 'good' },
        { duration: 400, expected: 'acceptable' },
        { duration: 600, expected: 'slow' },
      ];

      testCases.forEach(({ duration, expected }) => {
        hairFlatteningAnalytics.trackSegmentationCompletion({
          duration,
          volumeScore: 50,
          confidence: 0.9,
          autoFlatteningApplied: true,
          imageWidth: 640,
          imageHeight: 480,
        });

        expect(analyticsService.trackEvent).toHaveBeenCalledWith(
          'hair_segmentation_complete',
          'hair_flattening',
          expect.objectContaining({
            performanceClass: expected,
          })
        );
      });
    });

    it('should classify volume scores correctly', () => {
      const testCases = [
        { score: 2, expected: 'minimal' },
        { score: 15, expected: 'low' },
        { score: 35, expected: 'moderate' },
        { score: 60, expected: 'high' },
        { score: 85, expected: 'very_high' },
      ];

      testCases.forEach(({ score, expected }) => {
        hairFlatteningAnalytics.trackSegmentationCompletion({
          duration: 200,
          volumeScore: score,
          confidence: 0.9,
          autoFlatteningApplied: score > 40,
          imageWidth: 640,
          imageHeight: 480,
        });

        expect(analyticsService.trackEvent).toHaveBeenCalledWith(
          'hair_segmentation_complete',
          'hair_flattening',
          expect.objectContaining({
            volumeCategory: expected,
          })
        );
      });
    });

    it('should classify confidence levels correctly', () => {
      const testCases = [
        { confidence: 0.3, expected: 'very_low' },
        { confidence: 0.6, expected: 'low' },
        { confidence: 0.75, expected: 'medium' },
        { confidence: 0.9, expected: 'high' },
        { confidence: 0.98, expected: 'very_high' },
      ];

      testCases.forEach(({ confidence, expected }) => {
        hairFlatteningAnalytics.trackSegmentationCompletion({
          duration: 200,
          volumeScore: 50,
          confidence,
          autoFlatteningApplied: true,
          imageWidth: 640,
          imageHeight: 480,
        });

        expect(analyticsService.trackEvent).toHaveBeenCalledWith(
          'hair_segmentation_complete',
          'hair_flattening',
          expect.objectContaining({
            confidenceLevel: expected,
          })
        );
      });
    });
  });

  describe('Mode Change Tracking', () => {
    it('should track user-initiated mode changes', () => {
      hairFlatteningAnalytics.trackModeChange({
        fromMode: AdjustmentMode.NORMAL,
        toMode: AdjustmentMode.FLATTENED,
        volumeScore: 65,
        userInitiated: true,
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_adjustment_mode_change',
        'hair_flattening',
        expect.objectContaining({
          fromMode: AdjustmentMode.NORMAL,
          toMode: AdjustmentMode.FLATTENED,
          volumeScore: 65,
          userInitiated: true,
          transition: 'normal_to_flattened',
        })
      );
    });

    it('should track auto-applied mode changes', () => {
      hairFlatteningAnalytics.trackModeChange({
        fromMode: AdjustmentMode.NORMAL,
        toMode: AdjustmentMode.FLATTENED,
        volumeScore: 65,
        userInitiated: false,
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_adjustment_mode_change',
        'hair_flattening',
        expect.objectContaining({
          userInitiated: false,
        })
      );
    });
  });

  describe('Error Tracking', () => {
    it('should track errors with context', () => {
      hairFlatteningAnalytics.trackError({
        errorType: 'SEGMENTATION_FAILED',
        errorMessage: 'Failed to process image',
        context: { imageSize: '640x480' },
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_error',
        'hair_flattening',
        expect.objectContaining({
          errorType: 'SEGMENTATION_FAILED',
          errorMessage: 'Failed to process image',
          context: { imageSize: '640x480' },
        })
      );
    });

    it('should increment error count', () => {
      hairFlatteningAnalytics.trackSessionStart();

      hairFlatteningAnalytics.trackError({
        errorType: 'TIMEOUT',
        errorMessage: 'Segmentation timeout',
      });

      const stats = hairFlatteningAnalytics.getSessionStats();
      expect(stats.totalErrors).toBe(1);
    });
  });

  describe('Performance Degradation Tracking', () => {
    it('should track performance degradation events', () => {
      hairFlatteningAnalytics.trackPerformanceDegradation({
        currentFPS: 18,
        targetFPS: 24,
        segmentationFPS: 12,
        degradationLevel: 'medium',
        qualityLevel: 'medium',
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_performance_degradation',
        'hair_flattening',
        expect.objectContaining({
          currentFPS: 18,
          targetFPS: 24,
          segmentationFPS: 12,
          degradationLevel: 'medium',
          qualityLevel: 'medium',
          fpsDeficit: 6,
          degradationPercentage: 25,
        })
      );
    });
  });

  describe('Flattening Application Tracking', () => {
    it('should track flattening application with performance metrics', () => {
      hairFlatteningAnalytics.trackFlatteningApplication({
        mode: AdjustmentMode.FLATTENED,
        processingTime: 230,
        volumeReduction: 70,
        blendRadius: 5,
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_applied',
        'hair_flattening',
        expect.objectContaining({
          mode: AdjustmentMode.FLATTENED,
          processingTime: 230,
          volumeReduction: 70,
          blendRadius: 5,
          performanceClass: 'good',
        })
      );
    });
  });

  describe('Comparison View Tracking', () => {
    it('should track comparison view open', () => {
      hairFlatteningAnalytics.trackComparisonView({
        action: 'open',
        currentMode: AdjustmentMode.FLATTENED,
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_comparison_view',
        'hair_flattening',
        expect.objectContaining({
          action: 'open',
          currentMode: AdjustmentMode.FLATTENED,
        })
      );
    });

    it('should track comparison view close with duration', () => {
      // Open comparison view
      hairFlatteningAnalytics.trackComparisonView({
        action: 'open',
        currentMode: AdjustmentMode.FLATTENED,
      });

      // Wait a bit
      setTimeout(() => {
        // Close comparison view
        hairFlatteningAnalytics.trackComparisonView({
          action: 'close',
          currentMode: AdjustmentMode.FLATTENED,
        });

        expect(analyticsService.trackEvent).toHaveBeenCalledWith(
          'hair_flattening_comparison_view',
          'hair_flattening',
          expect.objectContaining({
            action: 'close',
            viewDuration: expect.any(Number),
          })
        );
      }, 100);
    });

    it('should track comparison view capture', () => {
      hairFlatteningAnalytics.trackComparisonView({
        action: 'capture',
        currentMode: AdjustmentMode.FLATTENED,
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_comparison_view',
        'hair_flattening',
        expect.objectContaining({
          action: 'capture',
        })
      );
    });
  });

  describe('Info Message Tracking', () => {
    it('should track info message shown', () => {
      hairFlatteningAnalytics.trackInfoMessage('shown', false);

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_info_message',
        'hair_flattening',
        expect.objectContaining({
          action: 'shown',
          autoHide: false,
        })
      );
    });

    it('should track info message dismissed', () => {
      hairFlatteningAnalytics.trackInfoMessage('dismissed', true);

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_info_message',
        'hair_flattening',
        expect.objectContaining({
          action: 'dismissed',
          autoHide: true,
        })
      );
    });
  });

  describe('Edge Case Tracking', () => {
    it('should track bald user edge case', () => {
      hairFlatteningAnalytics.trackEdgeCase('bald_user', true, {
        volumeScore: 2,
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_edge_case',
        'hair_flattening',
        expect.objectContaining({
          caseType: 'bald_user',
          handled: true,
          details: { volumeScore: 2 },
        })
      );
    });

    it('should track multiple faces edge case', () => {
      hairFlatteningAnalytics.trackEdgeCase('multiple_faces', true, {
        faceCount: 3,
        primaryFaceIndex: 0,
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_edge_case',
        'hair_flattening',
        expect.objectContaining({
          caseType: 'multiple_faces',
          handled: true,
        })
      );
    });
  });

  describe('Initialization Tracking', () => {
    it('should track successful initialization', () => {
      hairFlatteningAnalytics.trackInitialization(true, 1500);

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_initialization',
        'hair_flattening',
        expect.objectContaining({
          success: true,
          loadTime: 1500,
        })
      );
    });

    it('should track failed initialization', () => {
      hairFlatteningAnalytics.trackInitialization(
        false,
        undefined,
        'Failed to load model'
      );

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_flattening_initialization',
        'hair_flattening',
        expect.objectContaining({
          success: false,
          error: 'Failed to load model',
        })
      );
    });
  });

  describe('Volume Score Display Tracking', () => {
    it('should track volume score display', () => {
      hairFlatteningAnalytics.trackVolumeScoreDisplay(65, 'high');

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'hair_volume_score_display',
        'hair_flattening',
        expect.objectContaining({
          volumeScore: 65,
          category: 'high',
        })
      );
    });
  });

  describe('Session Statistics', () => {
    it('should track multiple operations in a session', () => {
      hairFlatteningAnalytics.trackSessionStart();

      // Perform multiple operations
      hairFlatteningAnalytics.trackSegmentationCompletion({
        duration: 245,
        volumeScore: 65,
        confidence: 0.92,
        autoFlatteningApplied: true,
        imageWidth: 640,
        imageHeight: 480,
      });

      hairFlatteningAnalytics.trackModeChange({
        fromMode: AdjustmentMode.NORMAL,
        toMode: AdjustmentMode.FLATTENED,
        userInitiated: true,
      });

      hairFlatteningAnalytics.trackError({
        errorType: 'LOW_CONFIDENCE',
        errorMessage: 'Confidence below threshold',
      });

      const stats = hairFlatteningAnalytics.getSessionStats();

      expect(stats.totalSegmentations).toBe(1);
      expect(stats.totalModeChanges).toBe(1);
      expect(stats.totalErrors).toBe(1);
    });
  });
});
