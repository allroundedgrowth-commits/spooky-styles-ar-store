import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Allow self-signed certificates for Supabase pooler
if (process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('pooler')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('🔓 TLS certificate validation disabled for Supabase');
}
import { connectRedis } from './config/redis.js';
import getCorsOptions from './config/cors.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import orderRoutes from './routes/order.routes.js';
import inspirationRoutes from './routes/inspiration.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import paystackRoutes from './routes/paystack.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';
import { sanitizeInput } from './middleware/sanitization.middleware.js';
import { trackPerformance, trackErrors } from './middleware/analytics.middleware.js';

// Load .env file only if it exists and don't override existing environment variables
dotenv.config({ override: false });

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy when behind reverse proxy (Nginx, AWS ALB, etc.)
if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware - Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration with whitelist
app.use(cors(getCorsOptions()));

// Stripe webhook needs raw body, so we handle it before JSON parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware (applied to all routes)
app.use(sanitizeInput);

// Rate limiting middleware (applied to all API routes)
app.use('/api', apiLimiter);

// Analytics performance tracking (applied to all API routes)
app.use('/api', trackPerformance);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (_req, res) => {
  res.json({ message: 'Spooky Styles API' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// User profile routes
app.use('/api/user', userRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Cart routes
app.use('/api/cart', cartRoutes);

// Payment routes
app.use('/api/payments', paymentRoutes);

// Paystack routes
app.use('/api/paystack', paystackRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Inspiration routes
app.use('/api/inspirations', inspirationRoutes);

// Upload routes (admin only)
app.use('/api/upload', uploadRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Analytics error tracking middleware
app.use(trackErrors);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize Redis and start server
const startServer = async () => {
  try {
    await connectRedis();
    app.listen(PORT, () => {
      console.log(`🎃 Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
