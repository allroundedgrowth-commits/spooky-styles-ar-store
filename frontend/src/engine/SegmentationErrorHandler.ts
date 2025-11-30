/**
 * Segmentation Error Handler
 * 
 * Provides comprehensive error handling for hair segmentation operations.
 * Implements retry logic, user-friendly error messages, and fallback strategies
 * to ensure a robust AR experience even when segmentation fails.
 * 
 * Key Features:
 * - Handles MODEL_LOAD_FAILED, SEGMENTATION_FAILED, TIMEOUT, LOW_CONFIDENCE errors
 * - Retry logic for transient failures
 * - User-friendly error messages
 * - Fallback to standard AR when segmentation unavailable
 * - Error logging for monitoring
 * 
 * Requirements: 7.5, 10.5
 */

/**
 * Types of errors that can occur during hair segmentation
 */
export enum SegmentationErrorType {
  MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
  SEGMENTATION_FAILED = 'SEGMENTATION_FAILED',
  TIMEOUT = 'TIMEOUT',
  LOW_CONFIDENCE = 'LOW_CONFIDENCE'
}

/**
 * Error object for segmentation operations
 */
export interface ProcessingError {
  type: SegmentationErrorType;
  message: string;
  timestamp: number;
  originalError?: Error;
  retryable: boolean;
}

/**
 * Configuration for error handling behavior
 */
export interface ErrorHandlerConfig {
  maxRetries: number;
  retryDelay: number;
  confidenceThreshold: number;
  enableLogging: boolean;
  onFallbackToStandardAR?: () => void;
}

/**
 * Default error handler configuration
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  maxRetries: 2,
  retryDelay: 1000, // 1 second
  confidenceThreshold: 0.7, // 70% as per requirements
  enableLogging: true
};

/**
 * SegmentationErrorHandler
 * 
 * Manages error handling for hair segmentation operations.
 * Provides retry logic, user-friendly messages, and fallback strategies.
 */
export class SegmentationErrorHandler {
  private config: ErrorHandlerConfig;
  private retryCount: Map<string, number> = new Map();
  private errorLog: ProcessingError[] = [];

  constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Handle a segmentation error
   * Determines appropriate action based on error type and retry count
   * 
   * @param error - The processing error to handle
   * @returns Object containing user message and whether to retry
   */
  handleError(error: ProcessingError): {
    userMessage: string;
    shouldRetry: boolean;
    fallbackToStandardAR: boolean;
  } {
    // Log the error
    this.logError(error);

    // Get retry count for this error type
    const retryKey = error.type;
    const currentRetries = this.retryCount.get(retryKey) || 0;

    let userMessage = '';
    let shouldRetry = false;
    let fallbackToStandardAR = false;

    switch (error.type) {
      case SegmentationErrorType.MODEL_LOAD_FAILED:
        userMessage = 'Unable to load hair detection. Try refreshing the page.';
        shouldRetry = currentRetries < this.config.maxRetries && error.retryable;
        fallbackToStandardAR = !shouldRetry;
        break;

      case SegmentationErrorType.SEGMENTATION_FAILED:
        userMessage = 'Hair detection encountered an issue. Retrying...';
        shouldRetry = currentRetries < this.config.maxRetries && error.retryable;
        fallbackToStandardAR = !shouldRetry;
        break;

      case SegmentationErrorType.TIMEOUT:
        userMessage = 'Hair detection is taking longer than expected. Continuing without adjustment.';
        shouldRetry = false; // Don't retry timeouts
        fallbackToStandardAR = true;
        break;

      case SegmentationErrorType.LOW_CONFIDENCE:
        userMessage = 'Hair detection confidence is low. Try better lighting or camera positioning.';
        shouldRetry = false; // Don't retry low confidence, let user adjust
        fallbackToStandardAR = false; // Allow manual mode selection
        break;
    }

    // Update retry count
    if (shouldRetry) {
      this.retryCount.set(retryKey, currentRetries + 1);
    } else {
      // Reset retry count if we're not retrying
      this.retryCount.set(retryKey, 0);
    }

    // Trigger fallback if needed
    if (fallbackToStandardAR && this.config.onFallbackToStandardAR) {
      this.config.onFallbackToStandardAR();
    }

    return {
      userMessage,
      shouldRetry,
      fallbackToStandardAR
    };
  }

  /**
   * Retry a failed operation with exponential backoff
   * 
   * @param operation - The async operation to retry
   * @param errorType - Type of error for tracking retries
   * @returns Promise that resolves with operation result
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    errorType: SegmentationErrorType
  ): Promise<T> {
    const retryKey = errorType;
    const currentRetries = this.retryCount.get(retryKey) || 0;

    try {
      const result = await operation();
      // Success - reset retry count
      this.retryCount.set(retryKey, 0);
      return result;
    } catch (error) {
      if (currentRetries < this.config.maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = this.config.retryDelay * Math.pow(2, currentRetries);
        await this.sleep(delay);

        // Increment retry count
        this.retryCount.set(retryKey, currentRetries + 1);

        // Retry the operation
        return this.retryOperation(operation, errorType);
      } else {
        // Max retries reached, throw error
        throw error;
      }
    }
  }

  /**
   * Check if segmentation confidence is below threshold
   * 
   * @param confidence - Confidence score (0-1)
   * @returns ProcessingError if confidence is low, null otherwise
   */
  checkConfidence(confidence: number): ProcessingError | null {
    if (confidence < this.config.confidenceThreshold) {
      return {
        type: SegmentationErrorType.LOW_CONFIDENCE,
        message: `Segmentation confidence ${(confidence * 100).toFixed(1)}% is below threshold ${(this.config.confidenceThreshold * 100)}%`,
        timestamp: Date.now(),
        retryable: false
      };
    }
    return null;
  }

  /**
   * Create a ProcessingError from a caught error
   * 
   * @param error - The caught error
   * @param type - Type of segmentation error
   * @returns ProcessingError object
   */
  createError(
    error: Error | string,
    type: SegmentationErrorType
  ): ProcessingError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const originalError = typeof error === 'string' ? undefined : error;

    // Determine if error is retryable based on type and message
    let retryable = true;
    if (type === SegmentationErrorType.TIMEOUT) {
      retryable = false;
    } else if (type === SegmentationErrorType.LOW_CONFIDENCE) {
      retryable = false;
    } else if (errorMessage.includes('not supported') || errorMessage.includes('not available')) {
      retryable = false;
    }

    return {
      type,
      message: errorMessage,
      timestamp: Date.now(),
      originalError,
      retryable
    };
  }

  /**
   * Log an error for monitoring
   * 
   * @param error - The error to log
   */
  private logError(error: ProcessingError): void {
    if (!this.config.enableLogging) {
      return;
    }

    // Add to error log
    this.errorLog.push(error);

    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }

    // Console log for debugging
    console.error('[SegmentationErrorHandler]', {
      type: error.type,
      message: error.message,
      timestamp: new Date(error.timestamp).toISOString(),
      retryable: error.retryable
    });

    // Log original error if available
    if (error.originalError) {
      console.error('[SegmentationErrorHandler] Original error:', error.originalError);
    }
  }

  /**
   * Get error log for monitoring/analytics
   * 
   * @returns Array of logged errors
   */
  getErrorLog(): ProcessingError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log and retry counts
   */
  reset(): void {
    this.errorLog = [];
    this.retryCount.clear();
  }

  /**
   * Get current retry count for an error type
   * 
   * @param errorType - Type of error
   * @returns Current retry count
   */
  getRetryCount(errorType: SegmentationErrorType): number {
    return this.retryCount.get(errorType) || 0;
  }

  /**
   * Sleep utility for retry delays
   * 
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get user-friendly error message for display
   * 
   * @param error - The processing error
   * @returns User-friendly message string
   */
  getUserMessage(error: ProcessingError): string {
    const result = this.handleError(error);
    return result.userMessage;
  }

  /**
   * Check if an error should trigger fallback to standard AR
   * 
   * @param error - The processing error
   * @returns true if should fallback, false otherwise
   */
  shouldFallbackToStandardAR(error: ProcessingError): boolean {
    const result = this.handleError(error);
    return result.fallbackToStandardAR;
  }
}
