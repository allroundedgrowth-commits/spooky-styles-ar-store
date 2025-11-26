import { CorsOptions } from 'cors';

/**
 * CORS configuration with whitelist of allowed origins
 * In production, only specific domains should be allowed
 */

// Whitelist of allowed origins
const allowedOrigins = [
  'http://localhost:3000', // Local development frontend
  'http://localhost:3001', // Vite alternate port
  'http://localhost:5173', // Vite default port
  'http://localhost:4173', // Vite preview port
  process.env.FRONTEND_URL, // Production frontend URL from env
  process.env.CORS_ORIGIN, // Additional origin from env
].filter(Boolean) as string[]; // Remove undefined values

/**
 * CORS options configuration
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
    'X-Retry-Count',
  ],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400, // Cache preflight requests for 24 hours
  optionsSuccessStatus: 200,
};

/**
 * Development CORS options (more permissive)
 */
export const devCorsOptions: CorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
    'X-Retry-Count',
  ],
  exposedHeaders: ['X-CSRF-Token'],
};

/**
 * Get CORS options based on environment
 */
export const getCorsOptions = (): CorsOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log('🔓 Using development CORS configuration (permissive)');
    return devCorsOptions;
  }
  
  console.log('🔒 Using production CORS configuration (whitelist)');
  console.log('Allowed origins:', allowedOrigins);
  return corsOptions;
};

export default getCorsOptions;
