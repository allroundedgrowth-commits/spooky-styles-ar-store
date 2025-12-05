import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import redisClient from '../config/redis.js';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_TTL = 3600; // 1 hour in seconds

/**
 * Generate a CSRF token for a user session
 */
export const generateCSRFToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  
  // Store token in Redis with TTL
  await redisClient.setEx(`csrf:${userId}`, CSRF_TOKEN_TTL, token);
  
  return token;
};

/**
 * Verify CSRF token from request
 */
export const verifyCSRFToken = async (userId: string, token: string): Promise<boolean> => {
  if (!token || !userId) return false;
  
  const storedToken = await redisClient.get(`csrf:${userId}`);
  
  if (!storedToken) return false;
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
};

/**
 * Middleware to validate CSRF token for state-changing operations
 * Should be applied to POST, PUT, PATCH, DELETE routes
 */
export const csrfProtection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip CSRF check for GET, HEAD, OPTIONS requests (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    // Skip CSRF check for webhook endpoints (they use signature verification)
    if (req.path.includes('/webhook')) {
      return next();
    }
    
    // Get user ID from authenticated request
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        error: {
          message: 'Authentication required',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    
    // Get CSRF token from header
    const csrfToken = req.headers['x-csrf-token'] as string;
    
    if (!csrfToken) {
      res.status(403).json({
        error: {
          message: 'CSRF token missing',
          statusCode: 403,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    
    // Verify token
    const isValid = await verifyCSRFToken(userId, csrfToken);
    
    if (!isValid) {
      res.status(403).json({
        error: {
          message: 'Invalid CSRF token',
          statusCode: 403,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    
    next();
  } catch (error) {
    console.error('CSRF verification error:', error);
    res.status(500).json({
      error: {
        message: 'CSRF verification failed',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Endpoint to get a new CSRF token
 * Should be called after login
 */
export const getCSRFToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        error: {
          message: 'Authentication required',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    
    const token = await generateCSRFToken(userId);
    
    res.json({
      csrfToken: token,
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    res.status(500).json({
      error: {
        message: 'Failed to generate CSRF token',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export default {
  csrfProtection,
  generateCSRFToken,
  verifyCSRFToken,
  getCSRFToken,
};
