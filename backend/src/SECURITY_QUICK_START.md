# Security Quick Start Guide

Quick reference for developers working with the Spooky Styles backend security features.

## 🔐 For Frontend Developers

### 1. Getting a CSRF Token

After user logs in, fetch a CSRF token:

```typescript
const response = await fetch('http://localhost:5000/api/auth/csrf-token', {
  headers: {
    'Authorization': `Bearer ${userToken}`,
  },
});

const { csrfToken } = await response.json();
```

### 2. Using CSRF Token in Requests

Include the CSRF token in all state-changing requests (POST, PUT, DELETE):

```typescript
const response = await fetch('http://localhost:5000/api/cart/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`,
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    productId: '123',
    quantity: 1,
  }),
});
```

### 3. Handling Rate Limit Errors

```typescript
try {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 429) {
    // Rate limit exceeded
    const error = await response.json();
    alert('Too many requests. Please try again later.');
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

### 4. Handling CORS Errors

If you see CORS errors in development:
1. Check that your frontend URL is in the allowed origins list
2. Ensure you're using `http://localhost:3000` or another whitelisted origin
3. In production, add your domain to `FRONTEND_URL` environment variable

---

## 🛠️ For Backend Developers

### 1. Adding a New Protected Route

```typescript
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

const router = Router();

// GET requests don't need CSRF protection
router.get('/data', authenticateToken, async (req, res) => {
  // Your logic here
});

// POST/PUT/DELETE need CSRF protection
router.post('/data', authenticateToken, csrfProtection, async (req, res) => {
  // Your logic here
});

export default router;
```

### 2. Adding Custom Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: {
    error: {
      message: 'Too many requests',
      statusCode: 429,
    },
  },
});

router.post('/special-endpoint', customLimiter, async (req, res) => {
  // Your logic here
});
```

### 3. Validating Input

```typescript
import { validateUUID, validatePositiveInteger } from '../utils/validation.js';

router.post('/items/:id', async (req, res, next) => {
  try {
    // Validate UUID
    validateUUID(req.params.id, 'Product ID');
    
    // Validate quantity
    const quantity = validatePositiveInteger(req.body.quantity, 'Quantity');
    
    // Your logic here
  } catch (error) {
    next(error);
  }
});
```

### 4. Using Parameterized Queries

```typescript
// ✅ CORRECT - Always use parameterized queries
const result = await pool.query(
  'SELECT * FROM products WHERE category = $1 AND price < $2',
  [category, maxPrice]
);

// ❌ WRONG - Never use string concatenation
// const result = await pool.query(
//   `SELECT * FROM products WHERE category = '${category}'`
// );
```

### 5. Sanitizing User Input

Input sanitization is automatic via middleware, but you can also use utilities:

```typescript
import { sanitizeString, sanitizeEmail } from '../middleware/sanitization.middleware.js';

const cleanName = sanitizeString(req.body.name);
const cleanEmail = sanitizeEmail(req.body.email);
```

---

## 🚀 Deployment Checklist

### Environment Variables

Ensure these are set in production:

```bash
# Required
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
STRIPE_SECRET_KEY=<your-stripe-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# Security
TRUST_PROXY=true
FORCE_HTTPS=true

# Database
DATABASE_URL=<your-database-url>

# Redis
REDIS_URL=<your-redis-url>
```

### HTTPS/TLS Setup

1. **Using Nginx** (Recommended):
   - Follow guide in `backend/src/config/security.md`
   - Set up Let's Encrypt certificate
   - Configure reverse proxy

2. **Using Cloud Platform**:
   - AWS: Use Certificate Manager + ALB
   - Heroku: `heroku certs:auto:enable`
   - Vercel/Netlify: Automatic

### Security Headers

Verify these headers are present in production:

```bash
curl -I https://api.your-domain.com/health

# Should include:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

---

## 🧪 Testing Security

### Test Rate Limiting

```bash
# Send multiple requests quickly
for i in {1..10}; do
  curl http://localhost:5000/api/products
done
```

### Test CSRF Protection

```bash
# This should fail (no CSRF token)
curl -X POST http://localhost:5000/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"123","quantity":1}'

# This should succeed (with CSRF token)
curl -X POST http://localhost:5000/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"123","quantity":1}'
```

### Test Input Sanitization

```bash
# Try XSS injection
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","name":"<script>alert(1)</script>"}'

# Name should be sanitized (script tags removed)
```

---

## 📚 Additional Resources

- Full documentation: `backend/src/SECURITY_IMPLEMENTATION.md`
- HTTPS setup: `backend/src/config/security.md`
- Rate limiting: `backend/src/middleware/rateLimiter.middleware.ts`
- CSRF protection: `backend/src/middleware/csrf.middleware.ts`
- Input sanitization: `backend/src/middleware/sanitization.middleware.ts`
- Validation utilities: `backend/src/utils/validation.ts`

---

## 🆘 Common Issues

### Issue: CORS Error in Development

**Solution:** Make sure you're using `http://localhost:3000` or add your URL to allowed origins in `backend/src/config/cors.ts`

### Issue: 429 Rate Limit Error

**Solution:** Wait 15 minutes or adjust rate limits in development mode

### Issue: 403 CSRF Token Error

**Solution:** 
1. Fetch CSRF token from `/api/auth/csrf-token`
2. Include it in `X-CSRF-Token` header
3. Token expires after 1 hour - fetch a new one if needed

### Issue: Webhook Signature Verification Failed

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is set correctly
2. Use raw body for webhook endpoint (already configured)
3. Test with Stripe CLI: `stripe listen --forward-to localhost:5000/api/payments/webhook`

---

## 🔒 Security Contacts

For security vulnerabilities:
- **DO NOT** create public GitHub issues
- Contact the development team privately
- Include detailed reproduction steps
- Allow time for patch before disclosure
