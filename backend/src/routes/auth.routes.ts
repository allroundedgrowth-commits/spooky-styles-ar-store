import { Router, Response } from 'express';
import authService from '../services/auth.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { RegisterRequest, LoginRequest } from '../types/user.types.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import { getCSRFToken } from '../middleware/csrf.middleware.js';

const router = Router();

// Apply stricter rate limiting to auth endpoints
router.use(authLimiter);

// Register new user
router.post('/register', async (req: AuthRequest, res: Response, next) => {
  try {
    const data: RegisterRequest = req.body;
    const result = await authService.register(data);
    
    res.status(201).json({
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req: AuthRequest, res: Response, next) => {
  try {
    const data: LoginRequest = req.body;
    const result = await authService.login(data);
    
    res.status(200).json({
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Logout user
router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const token = req.headers.authorization!.substring(7);
    
    await authService.logout(userId, token);
    
    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const user = await authService.getCurrentUser(userId);
    
    res.status(200).json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const updates = req.body;
    
    const user = await authService.updateProfile(userId, updates);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Get CSRF token (requires authentication)
router.get('/csrf-token', authenticate, getCSRFToken);

export default router;
