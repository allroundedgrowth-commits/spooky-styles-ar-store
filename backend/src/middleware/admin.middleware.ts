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
    console.log('[AdminMiddleware] Checking admin access for userId:', req.userId);
    
    if (!req.userId) {
      console.log('[AdminMiddleware] ❌ No userId in request');
      throw new ForbiddenError('Authentication required');
    }

    // Check if user has admin role
    const result = await pool.query(
      'SELECT is_admin, email FROM users WHERE id = $1',
      [req.userId]
    );

    console.log('[AdminMiddleware] Database query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('[AdminMiddleware] ❌ User not found in database');
      throw new ForbiddenError('User not found');
    }

    const user = result.rows[0];
    console.log('[AdminMiddleware] User found:', user.email, 'is_admin:', user.is_admin);

    if (!user.is_admin) {
      console.log('[AdminMiddleware] ❌ User is NOT admin');
      throw new ForbiddenError('Admin access required');
    }

    console.log('[AdminMiddleware] ✅ Admin access granted');
    next();
  } catch (error) {
    console.log('[AdminMiddleware] ❌ Error:', error);
    next(error);
  }
};
