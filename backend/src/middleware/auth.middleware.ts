import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted
    const isBlacklisted = await authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been invalidated');
    }

    // Verify token
    const payload = authService.verifyToken(token);

    // Attach user info to request
    req.userId = payload.userId;
    req.userEmail = payload.email;
    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Alias for consistency with other middleware
export const authenticateToken = authenticate;
