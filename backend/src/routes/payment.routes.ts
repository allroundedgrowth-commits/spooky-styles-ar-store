import { Router, Request, Response, NextFunction } from 'express';
import paymentService from '../services/payment.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { paymentLimiter } from '../middleware/rateLimiter.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = Router();

// Optional authentication - allows both guest and authenticated users
const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Try to authenticate if token exists
      const authService = (await import('../services/auth.service.js')).default;
      
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

// Apply stricter rate limiting to payment endpoints (except webhook)
router.use('/intent', paymentLimiter);
router.use('/confirm', paymentLimiter);

// Create payment intent (supports both guest and authenticated users)
router.post('/intent', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use user ID if authenticated, otherwise generate a guest ID from request
    const userId = (req as any).user?.id || `guest_${req.ip}_${Date.now()}`;
    const { guestInfo, amount } = req.body;
    
    // For guest checkout, amount must be provided
    if (!(req as any).user && !amount) {
      return res.status(400).json({
        error: {
          message: 'Amount is required for guest checkout',
          statusCode: 400,
        },
      });
    }
    
    // Validate guest info if user is not authenticated
    if (!(req as any).user && guestInfo) {
      if (!guestInfo.email || !guestInfo.name || !guestInfo.address || !guestInfo.city || !guestInfo.state || !guestInfo.zipCode) {
        return res.status(400).json({
          error: {
            message: 'Guest checkout requires complete shipping information',
            statusCode: 400,
          },
        });
      }
    }
    
    // For authenticated users, get cart total from cart service
    // For guests, use the provided amount
    let paymentIntent;
    if ((req as any).user) {
      paymentIntent = await paymentService.createPaymentIntent(userId, guestInfo);
    } else {
      // Guest checkout - create payment intent directly with provided amount
      const stripe = (await import('../config/stripe.js')).default;
      const amountInCents = Math.round(amount);
      
      if (amountInCents < 50) {
        return res.status(400).json({
          error: {
            message: 'Order total must be at least $0.50',
            statusCode: 400,
          },
        });
      }
      
      const metadata: any = {
        userId,
        isGuest: 'true',
      };
      
      if (guestInfo) {
        metadata.guestEmail = guestInfo.email;
        metadata.guestName = guestInfo.name;
        metadata.guestAddress = guestInfo.address;
        metadata.guestCity = guestInfo.city;
        metadata.guestState = guestInfo.state;
        metadata.guestZipCode = guestInfo.zipCode;
        metadata.guestCountry = guestInfo.country || 'US';
      }
      
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata,
        receipt_email: guestInfo?.email,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    }
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
});

// Confirm payment (requires authentication and CSRF protection)
router.post('/confirm', authenticateToken, csrfProtection, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        error: {
          message: 'Payment intent ID is required',
          statusCode: 400,
        },
      });
    }

    const paymentIntent = await paymentService.confirmPayment(paymentIntentId);
    
    res.json({
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
});

// Complete payment and create order (for local development without webhooks)
// This endpoint is called by the frontend after payment succeeds
router.post('/complete', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        error: {
          message: 'Payment intent ID is required',
          statusCode: 400,
        },
      });
    }

    // Verify payment intent succeeded and create order
    const order = await paymentService.completePayment(paymentIntentId);
    
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook endpoint (no authentication - verified by signature)
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({
        error: {
          message: 'Missing stripe-signature header',
          statusCode: 400,
        },
      });
    }

    // Get raw body for signature verification
    const payload = req.body;
    
    await paymentService.handleWebhookEvent(payload, signature);
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    next(error);
  }
});

export default router;
