import { Request, Response, NextFunction } from 'express';
import { APIError } from '../utils/errors.js';

export const errorHandler = (
  err: Error | APIError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  console.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle APIError
  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  });
};
