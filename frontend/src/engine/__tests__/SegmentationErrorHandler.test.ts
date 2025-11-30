/**
 * Unit Tests for SegmentationErrorHandler
 * 
 * Tests error handling, retry logic, user messages, and fallback behavior
 * for hair segmentation operations.
 * 
 * Requirements: 7.5, 10.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SegmentationErrorHandler,
  SegmentationErrorType,
  ProcessingError,
  ErrorHandlerConfig
} from '../SegmentationErrorHandler';

describe('SegmentationErrorHandler', () => {
  let errorHandler: SegmentationErrorHandler;
  let mockFallbackCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFallbackCallback = vi.fn();
    errorHandler = new SegmentationErrorHandler({
      maxRetries: 2,
      retryDelay: 100,
      confidenceThreshold: 0.7,
      enableLogging: false, // Disable logging in tests
      onFallbackToStandardAR: mockFallbackCallback
    });
  });

  describe('Error Handling', () => {
    it('should handle MODEL_LOAD_FAILED error with appropriate message', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.MODEL_LOAD_FAILED,
        message: 'Failed to load model',
        timestamp: Date.now(),
        retryable: true
      };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toContain('Unable to load hair detection');
      expect(result.shouldRetry).toBe(true);
      expect(result.fallbackToStandardAR).toBe(false);
    });

    it('should handle SEGMENTATION_FAILED error with retry', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.SEGMENTATION_FAILED,
        message: 'Segmentation failed',
        timestamp: Date.now(),
        retryable: true
      };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toContain('Hair detection encountered an issue');
      expect(result.shouldRetry).toBe(true);
      expect(result.fallbackToStandardAR).toBe(false);
    });

    it('should handle TIMEOUT error without retry', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.TIMEOUT,
        message: 'Operation timed out',
        timestamp: Date.now(),
        retryable: false
      };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toContain('taking longer than expected');
      expect(result.shouldRetry).toBe(false);
      expect(result.fallbackToStandardAR).toBe(true);
      expect(mockFallbackCallback).toHaveBeenCalled();
    });

    it('should handle LOW_CONFIDENCE error with helpful message', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.LOW_CONFIDENCE,
        message: 'Confidence below threshold',
        timestamp: Date.now(),
        retryable: false
      };

      const result = errorHandler.handleError(error);

      expect(result.userMessage).toContain('confidence is low');
      expect(result.userMessage).toContain('lighting');
      expect(result.shouldRetry).toBe(false);
      expect(result.fallbackToStandardAR).toBe(false);
    });
  });

  describe('Retry Logic', () => {
    it('should retry up to maxRetries times', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.SEGMENTATION_FAILED,
        message: 'Failed',
        timestamp: Date.now(),
        retryable: true
      };

      // First attempt
      const result1 = errorHandler.handleError(error);
      expect(result1.shouldRetry).toBe(true);
      expect(errorHandler.getRetryCount(SegmentationErrorType.SEGMENTATION_FAILED)).toBe(1);

      // Second attempt
      const result2 = errorHandler.handleError(error);
      expect(result2.shouldRetry).toBe(true);
      expect(errorHandler.getRetryCount(SegmentationErrorType.SEGMENTATION_FAILED)).toBe(2);

      // Third attempt - should not retry (maxRetries = 2)
      const result3 = errorHandler.handleError(error);
      expect(result3.shouldRetry).toBe(false);
      expect(result3.fallbackToStandardAR).toBe(true);
    });

    it('should reset retry count after successful operation', async () => {
      let attemptCount = 0;
      const operation = vi.fn(async () => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await errorHandler.retryOperation(
        operation,
        SegmentationErrorType.SEGMENTATION_FAILED
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
      expect(errorHandler.getRetryCount(SegmentationErrorType.SEGMENTATION_FAILED)).toBe(0);
    });

    it('should throw error after max retries exceeded', async () => {
      const operation = vi.fn(async () => {
        throw new Error('Persistent failure');
      });

      await expect(
        errorHandler.retryOperation(
          operation,
          SegmentationErrorType.SEGMENTATION_FAILED
        )
      ).rejects.toThrow('Persistent failure');

      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should apply exponential backoff for retries', async () => {
      const delays: number[] = [];
      let attemptCount = 0;

      const operation = vi.fn(async () => {
        const now = Date.now();
        if (attemptCount > 0) {
          delays.push(now);
        }
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Retry me');
        }
        return 'success';
      });

      const startTime = Date.now();
      await errorHandler.retryOperation(
        operation,
        SegmentationErrorType.SEGMENTATION_FAILED
      );

      // Verify exponential backoff (100ms, 200ms)
      expect(delays.length).toBe(2);
      // Allow some tolerance for timing
      expect(delays[0] - startTime).toBeGreaterThanOrEqual(90);
      expect(delays[1] - delays[0]).toBeGreaterThanOrEqual(180);
    });
  });

  describe('Confidence Checking', () => {
    it('should return null for confidence above threshold', () => {
      const result = errorHandler.checkConfidence(0.75);
      expect(result).toBeNull();
    });

    it('should return error for confidence below threshold', () => {
      const result = errorHandler.checkConfidence(0.65);
      
      expect(result).not.toBeNull();
      expect(result?.type).toBe(SegmentationErrorType.LOW_CONFIDENCE);
      expect(result?.message).toContain('65.0%');
      expect(result?.message).toContain('70%');
      expect(result?.retryable).toBe(false);
    });

    it('should return error for confidence exactly at threshold', () => {
      const result = errorHandler.checkConfidence(0.7);
      expect(result).toBeNull(); // At threshold is acceptable
    });

    it('should handle edge case confidence values', () => {
      expect(errorHandler.checkConfidence(0)).not.toBeNull();
      expect(errorHandler.checkConfidence(1)).toBeNull();
      expect(errorHandler.checkConfidence(0.69)).not.toBeNull();
      expect(errorHandler.checkConfidence(0.71)).toBeNull();
    });
  });

  describe('Error Creation', () => {
    it('should create error from Error object', () => {
      const originalError = new Error('Test error');
      const error = errorHandler.createError(
        originalError,
        SegmentationErrorType.SEGMENTATION_FAILED
      );

      expect(error.type).toBe(SegmentationErrorType.SEGMENTATION_FAILED);
      expect(error.message).toBe('Test error');
      expect(error.originalError).toBe(originalError);
      expect(error.retryable).toBe(true);
      expect(error.timestamp).toBeGreaterThan(0);
    });

    it('should create error from string message', () => {
      const error = errorHandler.createError(
        'String error message',
        SegmentationErrorType.MODEL_LOAD_FAILED
      );

      expect(error.type).toBe(SegmentationErrorType.MODEL_LOAD_FAILED);
      expect(error.message).toBe('String error message');
      expect(error.originalError).toBeUndefined();
      expect(error.retryable).toBe(true);
    });

    it('should mark timeout errors as non-retryable', () => {
      const error = errorHandler.createError(
        'Timeout occurred',
        SegmentationErrorType.TIMEOUT
      );

      expect(error.retryable).toBe(false);
    });

    it('should mark low confidence errors as non-retryable', () => {
      const error = errorHandler.createError(
        'Low confidence',
        SegmentationErrorType.LOW_CONFIDENCE
      );

      expect(error.retryable).toBe(false);
    });

    it('should mark unsupported errors as non-retryable', () => {
      const error = errorHandler.createError(
        new Error('Feature not supported'),
        SegmentationErrorType.MODEL_LOAD_FAILED
      );

      expect(error.retryable).toBe(false);
    });
  });

  describe('Error Logging', () => {
    it('should log errors when logging is enabled', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const loggingHandler = new SegmentationErrorHandler({
        enableLogging: true
      });

      const error: ProcessingError = {
        type: SegmentationErrorType.SEGMENTATION_FAILED,
        message: 'Test error',
        timestamp: Date.now(),
        retryable: true
      };

      loggingHandler.handleError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should maintain error log with max 50 entries', () => {
      const loggingHandler = new SegmentationErrorHandler({
        enableLogging: true
      });

      // Add 60 errors
      for (let i = 0; i < 60; i++) {
        const error: ProcessingError = {
          type: SegmentationErrorType.SEGMENTATION_FAILED,
          message: `Error ${i}`,
          timestamp: Date.now(),
          retryable: true
        };
        loggingHandler.handleError(error);
      }

      const errorLog = loggingHandler.getErrorLog();
      expect(errorLog.length).toBe(50);
      // Should keep the most recent errors
      expect(errorLog[errorLog.length - 1].message).toBe('Error 59');
    });

    it('should return copy of error log', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.SEGMENTATION_FAILED,
        message: 'Test',
        timestamp: Date.now(),
        retryable: true
      };

      errorHandler.handleError(error);
      const log1 = errorHandler.getErrorLog();
      const log2 = errorHandler.getErrorLog();

      expect(log1).not.toBe(log2); // Different array instances
      expect(log1).toEqual(log2); // Same content
    });
  });

  describe('Reset Functionality', () => {
    it('should clear error log and retry counts', () => {
      // Create handler with logging enabled for this test
      const loggingHandler = new SegmentationErrorHandler({
        enableLogging: true,
        maxRetries: 2
      });

      const error: ProcessingError = {
        type: SegmentationErrorType.SEGMENTATION_FAILED,
        message: 'Test',
        timestamp: Date.now(),
        retryable: true
      };

      loggingHandler.handleError(error);
      loggingHandler.handleError(error);

      expect(loggingHandler.getErrorLog().length).toBeGreaterThan(0);
      expect(loggingHandler.getRetryCount(SegmentationErrorType.SEGMENTATION_FAILED)).toBeGreaterThan(0);

      loggingHandler.reset();

      expect(loggingHandler.getErrorLog().length).toBe(0);
      expect(loggingHandler.getRetryCount(SegmentationErrorType.SEGMENTATION_FAILED)).toBe(0);
    });
  });

  describe('User Message Helpers', () => {
    it('should get user-friendly message from error', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.LOW_CONFIDENCE,
        message: 'Technical details',
        timestamp: Date.now(),
        retryable: false
      };

      const message = errorHandler.getUserMessage(error);
      
      expect(message).toContain('confidence is low');
      expect(message).not.toContain('Technical details');
    });

    it('should determine fallback requirement from error', () => {
      const timeoutError: ProcessingError = {
        type: SegmentationErrorType.TIMEOUT,
        message: 'Timeout',
        timestamp: Date.now(),
        retryable: false
      };

      const lowConfError: ProcessingError = {
        type: SegmentationErrorType.LOW_CONFIDENCE,
        message: 'Low conf',
        timestamp: Date.now(),
        retryable: false
      };

      expect(errorHandler.shouldFallbackToStandardAR(timeoutError)).toBe(true);
      expect(errorHandler.shouldFallbackToStandardAR(lowConfError)).toBe(false);
    });
  });

  describe('Fallback Callback', () => {
    it('should trigger fallback callback when appropriate', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.TIMEOUT,
        message: 'Timeout',
        timestamp: Date.now(),
        retryable: false
      };

      errorHandler.handleError(error);

      expect(mockFallbackCallback).toHaveBeenCalledTimes(1);
    });

    it('should not trigger fallback callback for retryable errors', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.SEGMENTATION_FAILED,
        message: 'Failed',
        timestamp: Date.now(),
        retryable: true
      };

      errorHandler.handleError(error);

      expect(mockFallbackCallback).not.toHaveBeenCalled();
    });

    it('should trigger fallback after max retries exceeded', () => {
      const error: ProcessingError = {
        type: SegmentationErrorType.MODEL_LOAD_FAILED,
        message: 'Failed',
        timestamp: Date.now(),
        retryable: true
      };

      // Exhaust retries
      errorHandler.handleError(error);
      errorHandler.handleError(error);
      errorHandler.handleError(error);

      expect(mockFallbackCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration when not provided', () => {
      const defaultHandler = new SegmentationErrorHandler();
      
      const error: ProcessingError = {
        type: SegmentationErrorType.SEGMENTATION_FAILED,
        message: 'Test',
        timestamp: Date.now(),
        retryable: true
      };

      // Should allow 2 retries by default
      defaultHandler.handleError(error);
      defaultHandler.handleError(error);
      const result = defaultHandler.handleError(error);

      expect(result.shouldRetry).toBe(false);
    });

    it('should respect custom maxRetries configuration', () => {
      const customHandler = new SegmentationErrorHandler({
        maxRetries: 5
      });

      const error: ProcessingError = {
        type: SegmentationErrorType.SEGMENTATION_FAILED,
        message: 'Test',
        timestamp: Date.now(),
        retryable: true
      };

      // Should allow 5 retries
      for (let i = 0; i < 5; i++) {
        const result = customHandler.handleError(error);
        expect(result.shouldRetry).toBe(true);
      }

      const finalResult = customHandler.handleError(error);
      expect(finalResult.shouldRetry).toBe(false);
    });

    it('should respect custom confidence threshold', () => {
      const customHandler = new SegmentationErrorHandler({
        confidenceThreshold: 0.8
      });

      expect(customHandler.checkConfidence(0.75)).not.toBeNull();
      expect(customHandler.checkConfidence(0.85)).toBeNull();
    });
  });
});
