import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import pool from '../config/database.js';
import { ValidationError } from '../utils/errors.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

const router = express.Router();

/**
 * GET /api/user/profile
 * Get current user profile including saved address
 */
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    
    const result = await pool.query(
      `SELECT id, email, name, phone, address, city, state, zip_code, country, is_admin, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zip_code,
        country: user.country || 'US',
        isAdmin: user.is_admin,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/user/address
 * Update user's saved shipping address
 */
router.put('/address', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { phone, address, city, state, zipCode, country } = req.body;
    
    // Validation
    if (!address || address.trim().length < 5) {
      throw new ValidationError('Street address is required');
    }
    if (!city || city.trim().length < 2) {
      throw new ValidationError('City is required');
    }
    if (!state || state.trim().length < 2) {
      throw new ValidationError('State is required');
    }
    if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
      throw new ValidationError('Valid ZIP code is required');
    }
    
    const result = await pool.query(
      `UPDATE users
       SET phone = $1, address = $2, city = $3, state = $4, zip_code = $5, country = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, email, name, phone, address, city, state, zip_code, country`,
      [phone || null, address, city, state, zipCode, country || 'US', userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zip_code,
        country: user.country
      },
      message: 'Address saved successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
