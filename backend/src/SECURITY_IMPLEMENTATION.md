# Security Implementation Summary

This document provides an overview of all security measures implemented in the Spooky Styles backend API.

## ✅ Implemented Security Measures

### 1. Rate Limiting

**Implementation:** `backend/src/middleware/rateLimiter.middleware.ts`

- **General API Rate Limiter**: 100 requests per 15 minutes per IP
  - Applied to all `/api/*` routes
  - Returns 429 status code when limit exceeded
  
- **Authentication Rate Limiter**: 5 requests per 15 minutes per IP
  - Applied to `/api/auth/*` routes
  - Stricter limit to prevent brute force attacks
  - Skips counting successful requests
  
- **Payment Rate Limiter**: 10 requests per 15 minutes per IP
  - Applied to `/api/payments/intent` and `/api/payments/confirm`
  - Prevents payment abuse

**Configuration:**
```typescript
// Configured in .env
RATE_LIMIT_WINDOW_MS=900000  // 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

### 2. CORS Configuration with Whitelist

**Implementation:** `backend/src/config/cors.ts`

- **Production Mode**: Whitelist-based origin validation
  - Only allows requests from configured domains
  - Blocks unauthorized cross-origin requests
  
- **Development Mode**: Permissive for local development
  - Allows all origins when `NODE_ENV=development`

**Allowed Origins:**
- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite default)
- `http://localhost:4173` (Vite preview)
- Environment variable: `FRONTEND_URL`
- Environment variable: `CORS_ORIGIN`

**CORS Options:**
- Credentials: Enabled (allows cookies and auth headers)
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Allowed Headers: Content-Type, Authorization, X-CSRF-Token, X-Requested-With
- Exposed Headers: X-CSRF-Token
- Max Age: 24 hours (preflight cache)

---

### 3. Input Validation and Sanitization

**Implementation:** `backend/src/middleware/sanitization.middleware.ts`

**Sanitization Functions:**
- `sanitizeString()`: Removes HTML tags, JavaScript protocols, event handlers
- `sanitizeObject()`: Recursively sanitizes all object properties
- `sanitizeEmail()`: Validates and normalizes email addresses
- `sanitizeNumber()`: Validates numeric input with min/max bounds
- `isValidUUID()`: Validates UUID format

**Applied To:**
- Request body
- Query parameters
- URL parameters

**Protection Against:**
- XSS (Cross-Site Scripting)
- HTML injection
- JavaScript injection
- Event handler injection

---

### 4. Enhanced Validation Utilities

**Implementation:** `backend/src/utils/validation.ts`

**Validation Functions:**
- `validateEmail()`: Email format and SQL injection prevention
- `validatePassword()`: Password strength requirements (8+ chars, mixed case, numbers)
- `validateName()`: Name validation with SQL injection prevention
- `validateUUID()`: UUID format validation
- `validatePositiveInteger()`: Integer validation with bounds
- `validatePrice()`: Price validation (positive, max 2 decimals)
- `validateStringLength()`: String length validation
- `validateEnum()`: Enum value validation
- `validateCategory()`: Product category validation
- `validateTheme()`: Product theme validation

**Protection Against:**
- SQL injection
- Invalid data types
- Out-of-bounds values
- Malformed input

---

### 5. Parameterized Database Queries

**Implementation:** All database queries use parameterized queries via `pg` library

**Example:**
```typescript
// ✅ SECURE - Parameterized query
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ INSECURE - String concatenation (NOT USED)
// const result = await pool.query(
//   `SELECT * FROM users WHERE email = '${email}'`
// );
```

**Applied To:**
- All database operations in services:
  - `auth.service.ts`
  - `product.service.ts`
  - `cart.service.ts`
  - `order.service.ts`
  - `payment.service.ts`
  - `inspiration.service.ts`

**Protection Against:**
- SQL injection attacks
- Database manipulation
- Unauthorized data access

---

### 6. CSRF Protection

**Implementation:** `backend/src/middleware/csrf.middleware.ts`

**How It Works:**
1. User logs in and receives a CSRF token via `/api/auth/csrf-token`
2. Token is stored in Redis with 1-hour TTL
3. Client includes token in `X-CSRF-Token` header for state-changing requests
4. Server validates token before processing request

**Applied To:**
- All POST, PUT, PATCH, DELETE requests (except webhooks)
- Cart operations
- Order operations
- Payment operations
- Product management (admin)

**Skipped For:**
- GET, HEAD, OPTIONS requests (safe methods)
- Webhook endpoints (use signature verification instead)

**Protection Against:**
- Cross-Site Request Forgery attacks
- Unauthorized state changes
- Session hijacking

---

### 7. Stripe Webhook Signature Verification

**Implementation:** `backend/src/services/payment.service.ts`

**How It Works:**
1. Stripe sends webhook with `stripe-signature` header
2. Server verifies signature using `STRIPE_WEBHOOK_SECRET`
3. Only processes webhook if signature is valid

**Code:**
```typescript
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

**Protection Against:**
- Fake payment events
- Webhook spoofing
- Unauthorized order creation
- Payment fraud

---

### 8. HTTPS/TLS Configuration

**Implementation:** `backend/src/config/security.md`

**Options Provided:**
1. **Nginx Reverse Proxy** (Recommended)
   - SSL/TLS termination at proxy level
   - TLS 1.2 and 1.3 only
   - Strong cipher suites
   - HSTS enabled
   
2. **Node.js HTTPS Server**
   - Direct HTTPS handling in Node.js
   - Certificate management
   
3. **Cloud Platform SSL/TLS**
   - AWS Certificate Manager
   - Heroku automatic SSL
   - Vercel/Netlify automatic SSL

**Security Headers:**
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

---

## Additional Security Features

### Helmet.js Security Headers

**Implementation:** `backend/src/index.ts`

```typescript
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
```

**Protection Against:**
- Clickjacking
- MIME type sniffing
- XSS attacks
- Insecure connections

---

### Account Lockout Protection

**Implementation:** `backend/src/services/auth.service.ts`

- **Failed Login Attempts**: Tracked per user
- **Lockout Threshold**: 3 failed attempts
- **Lockout Duration**: 15 minutes
- **Auto-Reset**: Failed attempts reset on successful login

**Protection Against:**
- Brute force attacks
- Password guessing
- Credential stuffing

---

### JWT Token Security

**Implementation:** `backend/src/services/auth.service.ts`

- **Token Expiration**: 24 hours
- **Token Blacklist**: Invalidated tokens stored in Redis
- **Secure Storage**: Tokens stored in Redis with TTL
- **Signature Verification**: JWT signature validated on each request

**Protection Against:**
- Token replay attacks
- Session hijacking
- Unauthorized access

---

### Password Security

**Implementation:** `backend/src/services/auth.service.ts`

- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 12
- **Password Requirements**:
  - Minimum 8 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number

**Protection Against:**
- Rainbow table attacks
- Password cracking
- Weak passwords

---

## Environment Variables

Required security-related environment variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Production Settings
NODE_ENV=production
TRUST_PROXY=true
FORCE_HTTPS=true
```

---

## Security Testing Checklist

- [ ] Test rate limiting with multiple requests
- [ ] Verify CORS blocks unauthorized origins
- [ ] Test SQL injection attempts
- [ ] Test XSS injection attempts
- [ ] Verify CSRF protection on state-changing operations
- [ ] Test Stripe webhook signature verification
- [ ] Verify account lockout after failed logins
- [ ] Test JWT token expiration and blacklisting
- [ ] Verify HTTPS redirect in production
- [ ] Test input sanitization with malicious payloads

---

## Security Best Practices

1. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Use Environment Variables**
   - Never commit secrets to version control
   - Use `.env` files for local development
   - Use secure secret management in production

3. **Monitor Security Logs**
   - Track failed login attempts
   - Monitor rate limit violations
   - Log suspicious activity

4. **Regular Security Audits**
   - Review code for security vulnerabilities
   - Update dependencies regularly
   - Perform penetration testing

5. **Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Use role-based access control (admin vs user)
   - Validate authorization on every request

---

## Compliance

This implementation addresses the following security requirements:

- **Requirement 4.4**: Secure payment processing with Stripe
- **Requirement 5.1**: Secure authentication with password hashing
- **Requirement 5.5**: Account lockout after failed login attempts

---

## Support and Maintenance

For security issues or questions:
1. Review this documentation
2. Check `backend/src/config/security.md` for HTTPS/TLS setup
3. Consult individual middleware files for implementation details
4. Report security vulnerabilities privately to the development team

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
