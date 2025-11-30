import { Router, Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = Router();

// Public endpoint: Get order by payment intent ID (for guest checkout confirmation)
router.get('/payment-intent/:paymentIntentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.params;
    
    const order = await orderService.getOrderByPaymentIntentId(paymentIntentId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found',
          statusCode: 404,
        },
      });
    }
    
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// All other order routes require authentication
router.use(authenticateToken);

// CSRF protection for state-changing operations (PUT)
router.use(csrfProtection);

// Get user's order history
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orders = await orderService.getOrdersByUserId(userId);
    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get specific order details
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const order = await orderService.getOrderById(id, userId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found',
          statusCode: 404,
        },
      });
    }
    
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// Update order status (admin only)
router.put('/:id/status', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Status is required',
          statusCode: 400,
        },
      });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          statusCode: 400,
        },
      });
    }
    
    const order = await orderService.updateOrderStatus(id, status);
    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
