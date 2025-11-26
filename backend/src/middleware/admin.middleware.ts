import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { ForbiddenError } from '../utils/errors.js';
import pool from '../config/database.js';

/**
 * Middleware to check if the authenticated user is an admin
 * Must be used after the authenticate middleware
 */
export const requireAdmin = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new ForbiddenError('Authentication required');
    }

    // Check if user has admin role
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      throw new ForbiddenError('User not found');
    }

    const user = result.rows[0];

    if (!user.is_admin) {
      throw new ForbiddenError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
