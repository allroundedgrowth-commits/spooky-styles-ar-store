import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General API rate limiter: 500 requests per 15 minutes per IP (relaxed for development)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: {
    error: {
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        message: 'Too many requests from this IP, please try again after 15 minutes.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
    });
  },
  skip: (_req: Request) => {
    // Skip rate limiting for admin users in development
    return process.env.NODE_ENV === 'development';
  },
});

// Stricter rate limiter for authentication endpoints: 50 requests per 15 minutes (relaxed for development)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs (increased for development)
  message: {
    error: {
      message: 'Too many authentication attempts, please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
    });
  },
});

// Payment endpoint rate limiter: 10 requests per 15 minutes
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: {
      message: 'Too many payment requests, please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        message: 'Too many payment requests from this IP, please try again after 15 minutes.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
    });
  },
});

export default {
  apiLimiter,
  authLimiter,
  paymentLimiter,
};
