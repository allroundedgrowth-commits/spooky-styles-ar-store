import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analytics.service.js';

// Track API performance
export const trackPerformance = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const duration = Date.now() - startTime;
    
    // Track performance metric
    analyticsService.trackPerformance({
      metricName: 'api_response_time',
      metricValue: duration,
      metricUnit: 'ms',
      endpoint: req.path,
      method: req.method,
      metadata: {
        statusCode: res.statusCode,
      },
    }).catch(err => console.error('Analytics tracking error:', err));

    return originalJson(body);
  };

  next();
};

// Track errors
export const trackErrors = (err: any, req: Request, _res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  
  analyticsService.logError({
    userId,
    errorType: err.name || 'Error',
    errorMessage: err.message,
    stackTrace: err.stack,
    requestPath: req.path,
    requestMethod: req.method,
    statusCode: err.statusCode || 500,
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
    metadata: {
      body: req.body,
      query: req.query,
      params: req.params,
    },
  }).catch(console.error);

  next(err);
};

// Extract device info from user agent
// Utility functions for analytics (currently unused but kept for future use)
/*
function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function getBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/edge/i.test(userAgent)) return 'Edge';
  return 'Other';
}
*/
