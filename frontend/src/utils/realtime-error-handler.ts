/**
 * Realtime Error Handler
 * 
 * Handles various Supabase Realtime connection and subscription errors
 * with appropriate user notifications and recovery strategies.
 */

import { RealtimeChannelSendResponse } from '@supabase/supabase-js';

export enum RealtimeErrorType {
  CONNECTION_LOST = 'CONNECTION_LOST',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CHANNEL_ERROR = 'CHANNEL_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface RealtimeError {
  type: RealtimeErrorType;
  message: string;
  originalError?: any;
  timestamp: Date;
}

export interface ErrorHandlerCallbacks {
  onConnectionLost?: () => void;
  onSubscriptionFailed?: () => void;
  onUnauthorized?: () => void;
  onError?: (error: RealtimeError) => void;
}

/**
 * Creates a Realtime error from a Supabase error response
 */
export const createRealtimeError = (
  error: any,
  context?: string
): RealtimeError => {
  let type = RealtimeErrorType.UNKNOWN;
  let message = 'An unknown error occurred';

  if (error?.message) {
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('connection') || errorMsg.includes('disconnect')) {
      type = RealtimeErrorType.CONNECTION_LOST;
      message = 'Connection to real-time updates lost. Reconnecting...';
    } else if (errorMsg.includes('subscription') || errorMsg.includes('subscribe')) {
      type = RealtimeErrorType.SUBSCRIPTION_FAILED;
      message = 'Failed to subscribe to real-time updates';
    } else if (errorMsg.includes('unauthorized') || errorMsg.includes('auth')) {
      type = RealtimeErrorType.UNAUTHORIZED;
      message = 'Authentication expired. Please refresh the page.';
    } else if (errorMsg.includes('channel')) {
      type = RealtimeErrorType.CHANNEL_ERROR;
      message = 'Real-time channel error occurred';
    }
  }

  if (context) {
    message = `${message} (${context})`;
  }

  return {
    type,
    message,
    originalError: error,
    timestamp: new Date(),
  };
};

/**
 * Handles Realtime errors with appropriate notifications and callbacks
 */
export const handleRealtimeError = (
  error: RealtimeError,
  callbacks?: ErrorHandlerCallbacks
): void => {
  console.error('[Realtime Error]', {
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    originalError: error.originalError,
  });

  // Call the general error callback if provided
  callbacks?.onError?.(error);

  // Handle specific error types
  switch (error.type) {
    case RealtimeErrorType.CONNECTION_LOST:
      showNotification(error.message, 'warning');
      callbacks?.onConnectionLost?.();
      break;

    case RealtimeErrorType.SUBSCRIPTION_FAILED:
      showNotification(error.message, 'error');
      callbacks?.onSubscriptionFailed?.();
      break;

    case RealtimeErrorType.UNAUTHORIZED:
      showNotification(error.message, 'error');
      callbacks?.onUnauthorized?.();
      // Trigger token refresh
      refreshAuthToken();
      break;

    case RealtimeErrorType.CHANNEL_ERROR:
      showNotification('Real-time updates temporarily unavailable', 'warning');
      break;

    default:
      showNotification('Real-time update error occurred', 'error');
  }
};

/**
 * Shows a notification to the user
 * This is a simple implementation - can be replaced with a toast library
 */
const showNotification = (
  message: string,
  type: 'info' | 'warning' | 'error' = 'info'
): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  // Try to use a custom event for toast notifications
  const event = new CustomEvent('realtime-notification', {
    detail: { message, type },
  });
  window.dispatchEvent(event);

  // Fallback to console for development
  if (import.meta.env.DEV) {
    const logMethod = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log';
    console[logMethod](`[Realtime Notification] ${message}`);
  }
};

/**
 * Attempts to refresh the authentication token
 */
const refreshAuthToken = (): void => {
  // Dispatch event for auth refresh
  const event = new CustomEvent('realtime-auth-refresh');
  window.dispatchEvent(event);

  // Log for debugging
  console.log('[Realtime] Triggering auth token refresh');
};

/**
 * Handles subscription status changes
 */
export const handleSubscriptionStatus = (
  status: string,
  error?: any,
  callbacks?: ErrorHandlerCallbacks
): void => {
  console.log('[Realtime] Subscription status:', status);

  switch (status) {
    case 'SUBSCRIBED':
      showNotification('Connected to real-time updates', 'info');
      break;

    case 'CHANNEL_ERROR':
      const realtimeError = createRealtimeError(
        error || new Error('Channel error'),
        'subscription status'
      );
      handleRealtimeError(realtimeError, callbacks);
      break;

    case 'TIMED_OUT':
      const timeoutError = createRealtimeError(
        new Error('Subscription timed out'),
        'subscription status'
      );
      handleRealtimeError(timeoutError, callbacks);
      break;

    case 'CLOSED':
      showNotification('Real-time connection closed', 'warning');
      break;
  }
};

/**
 * Creates a retry handler for failed operations
 */
export const createRetryHandler = (
  operation: () => Promise<void>,
  maxRetries: number = 3,
  delayMs: number = 1000
) => {
  let retryCount = 0;

  const retry = async (): Promise<void> => {
    try {
      await operation();
      retryCount = 0; // Reset on success
    } catch (error) {
      retryCount++;
      
      if (retryCount < maxRetries) {
        console.log(`[Realtime] Retry attempt ${retryCount}/${maxRetries}`);
        setTimeout(retry, delayMs * retryCount); // Exponential backoff
      } else {
        const realtimeError = createRealtimeError(
          error,
          `Failed after ${maxRetries} retries`
        );
        handleRealtimeError(realtimeError);
      }
    }
  };

  return retry;
};

/**
 * Validates Realtime connection health
 */
export const validateConnection = (channel: any): boolean => {
  if (!channel) {
    console.warn('[Realtime] No channel provided for validation');
    return false;
  }

  // Check if channel is in a valid state
  const state = channel.state;
  const isValid = state === 'joined' || state === 'joining';

  if (!isValid) {
    console.warn('[Realtime] Channel in invalid state:', state);
  }

  return isValid;
};
