import { Router, Request, Response, NextFunction } from 'express';
import cartService from '../services/cart.service.js';
import authService from '../services/auth.service.js';
// import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = Router();

// Optional authentication - allows both guest and authenticated users
const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Check if token is blacklisted
      const isBlacklisted = await authService.isTokenBlacklisted(token);
      if (!isBlacklisted) {
        // Verify token
        const payload = authService.verifyToken(token);
        
        // Attach user info to request
        (req as any).user = {
          id: payload.userId,
          email: payload.email,
        };
      }
    } catch (error) {
      // Token is invalid, but continue as guest
      console.log('Invalid token, continuing as guest');
    }
  }
  
  // Continue regardless of authentication status
  next();
};

router.use(optionalAuth);

// CSRF protection for state-changing operations (POST, PUT, DELETE)
// Disabled for now to allow guest checkout
// router.use(csrfProtection);

// Get cart
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use user ID if authenticated, otherwise use session ID for guest
    const cartId = (req as any).user?.id || 'guest';
    const cart = await cartService.getCart(cartId);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartId = (req as any).user?.id || 'guest';
    const { productId, quantity, customizations } = req.body;

    const cart = await cartService.addItem(
      cartId,
      productId,
      quantity,
      customizations
    );

    res.status(201).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/items/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartId = (req as any).user?.id || 'guest';
    const { productId } = req.params;
    const { quantity, customizations } = req.body;

    const cart = await cartService.updateItemQuantity(
      cartId,
      productId,
      quantity,
      customizations
    );

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Remove item from cart
router.delete('/items/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartId = (req as any).user?.id || 'guest';
    const { productId } = req.params;
    const { customizations } = req.body;

    const cart = await cartService.removeItem(
      cartId,
      productId,
      customizations
    );

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartId = (req as any).user?.id || 'guest';
    await cartService.clearCart(cartId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get cart total
router.get('/total', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartId = (req as any).user?.id || 'guest';
    const total = await cartService.getCartTotal(cartId);
    res.json({ total });
  } catch (error) {
    next(error);
  }
});

export default router;
