# Environment Variables Guide

Complete list of all environment variables needed for Spooky Styles AR Store.

## 📋 Quick Reference

### Required for Local Development
- ✅ Already set in `backend/.env` (works with Docker)
- ⚠️ Need to obtain: Stripe keys, AWS keys (for production features)

### Required for Production
- All variables must be properly configured
- Use real credentials (not test/placeholder values)

---

## 🏠 Local Development (Docker)

### Backend (`backend/.env`)

#### ✅ Already Configured (Works Out of Box)
```bash
# Server
NODE_ENV=development
PORT=5000

# Database (Docker handles this)
DATABASE_URL=postgresql://spooky_user:spooky_pass@localhost:5432/spooky_styles_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spooky_styles_db
DB_USER=spooky_user
DB_PASSWORD=spooky_pass

# Redis (Docker handles this)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (default for development)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
TRUST_PROXY=false
FORCE_HTTPS=false
```

#### ⚠️ Need to Obtain (For Full Features)

**Stripe (Payment Processing)**
```bash
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Get from: https://dashboard.stripe.com/test/webhooks
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**AWS S3 (File Uploads)**
```bash
# Get from: AWS IAM Console
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=spooky-styles-assets

# Optional - for signed URLs
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=your_cloudfront_key_pair_id
CLOUDFRONT_PRIVATE_KEY=your_cloudfront_private_key
```

### Frontend (`frontend/.env`)

```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Stripe (Public Key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

---

## 🚀 Production Deployment

### Staging Environment (`.env.staging`)

```bash
# Environment
NODE_ENV=staging

# Database (Use managed PostgreSQL service)
DATABASE_URL=postgresql://user:password@staging-db-host:5432/spooky_styles_staging
POSTGRES_USER=spooky_user
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
POSTGRES_DB=spooky_styles_staging

# Redis (Use managed Redis service)
REDIS_URL=redis://staging-redis-host:6379

# Server
PORT=3000
CORS_ORIGIN=https://staging.spookystyles.com

# JWT (Generate strong secret)
JWT_SECRET=CHANGE_ME_MINIMUM_32_CHARACTERS_RANDOM_STRING

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_staging_key
STRIPE_WEBHOOK_SECRET=whsec_your_staging_webhook_secret

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_staging_access_key
AWS_SECRET_ACCESS_KEY=your_staging_secret_key
S3_BUCKET_NAME=spooky-styles-staging
CLOUDFRONT_DOMAIN=staging-cdn.spookystyles.com
CLOUDFRONT_KEY_PAIR_ID=your_staging_key_pair_id
CLOUDFRONT_PRIVATE_KEY=your_staging_private_key

# Docker
DOCKER_REGISTRY=your-registry.com
IMAGE_TAG=staging-latest
```

### Production Environment (`.env.production`)

```bash
# Environment
NODE_ENV=production

# Database (Use managed PostgreSQL with Multi-AZ)
DATABASE_URL=postgresql://user:password@prod-db-host:5432/spooky_styles_prod
POSTGRES_USER=spooky_user
POSTGRES_PASSWORD=CHANGE_ME_VERY_STRONG_PASSWORD
POSTGRES_DB=spooky_styles_prod

# Redis (Use managed Redis with Multi-AZ)
REDIS_URL=redis://prod-redis-host:6379

# Server
PORT=3000
CORS_ORIGIN=https://spookystyles.com

# JWT (Generate very strong secret)
JWT_SECRET=CHANGE_ME_MINIMUM_64_CHARACTERS_RANDOM_STRING

# Stripe (Live Mode)
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_production_access_key
AWS_SECRET_ACCESS_KEY=your_production_secret_key
S3_BUCKET_NAME=spooky-styles-production
CLOUDFRONT_DOMAIN=cdn.spookystyles.com
CLOUDFRONT_KEY_PAIR_ID=your_production_key_pair_id
CLOUDFRONT_PRIVATE_KEY=your_production_private_key

# Docker
DOCKER_REGISTRY=your-registry.com
IMAGE_TAG=production-latest

# Monitoring (Optional)
DATADOG_API_KEY=your_datadog_api_key
DATADOG_APP_KEY=your_datadog_app_key
```

---

## 🔑 How to Obtain Keys

### 1. Stripe Keys

**For Development (Test Mode):**
1. Sign up at https://stripe.com
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy:
   - Secret key (starts with `sk_test_`)
   - Publishable key (starts with `pk_test_`)
4. For webhook secret:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Create webhook pointing to `http://localhost:5000/api/payments/webhook`
   - Copy webhook signing secret (starts with `whsec_`)

**For Production (Live Mode):**
1. Complete Stripe account verification
2. Go to https://dashboard.stripe.com/apikeys
3. Copy live keys (start with `sk_live_` and `pk_live_`)
4. Create production webhook

### 2. AWS Keys

**Create IAM User:**
1. Go to AWS Console → IAM
2. Create new user: `spooky-styles-app`
3. Attach policies:
   - `AmazonS3FullAccess` (or custom policy)
   - `CloudFrontFullAccess` (if using CloudFront)
4. Create access key
5. Save:
   - Access Key ID
   - Secret Access Key

**Create S3 Bucket:**
1. Go to AWS Console → S3
2. Create bucket: `spooky-styles-assets`
3. Configure CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://spookystyles.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

**Create CloudFront Distribution (Optional):**
1. Go to AWS Console → CloudFront
2. Create distribution pointing to S3 bucket
3. Note the domain name
4. For signed URLs, create key pair in CloudFront

### 3. JWT Secret

**Generate Strong Secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use online generator
# https://randomkeygen.com/
```

### 4. Database Credentials

**Local (Docker):**
- Already configured in `docker-compose.yml`
- No action needed

**Production:**
- Use managed database service (AWS RDS, DigitalOcean, etc.)
- Create PostgreSQL instance
- Note connection details:
  - Host
  - Port (usually 5432)
  - Database name
  - Username
  - Password

### 5. Redis URL

**Local (Docker):**
- Already configured
- No action needed

**Production:**
- Use managed Redis service (AWS ElastiCache, Redis Cloud, etc.)
- Note connection URL

---

## 🔒 Security Best Practices

### Never Commit Secrets
```bash
# These files should NEVER be committed:
backend/.env
frontend/.env
.env.staging
.env.production
.env.*.local
```

### Use Strong Secrets
- JWT_SECRET: Minimum 32 characters (64+ for production)
- Database passwords: Minimum 16 characters
- Use random generation, not dictionary words

### Rotate Keys Regularly
- Rotate JWT secrets every 90 days
- Rotate AWS keys every 90 days
- Update Stripe webhook secrets if compromised

### Use Environment-Specific Keys
- Never use production keys in development
- Never use test Stripe keys in production
- Keep staging and production completely separate

---

## 📝 Setup Checklist

### For Local Development
- [ ] Docker Desktop installed
- [ ] `backend/.env` exists (already configured)
- [ ] `frontend/.env` created with API URL
- [ ] (Optional) Stripe test keys added
- [ ] (Optional) AWS keys added for uploads

### For Staging Deployment
- [ ] `.env.staging` created
- [ ] All placeholder values replaced
- [ ] Stripe test keys configured
- [ ] AWS staging resources created
- [ ] Database and Redis provisioned
- [ ] GitHub secrets configured

### For Production Deployment
- [ ] `.env.production` created
- [ ] All placeholder values replaced
- [ ] Stripe live keys configured
- [ ] AWS production resources created
- [ ] Database with Multi-AZ enabled
- [ ] Redis with Multi-AZ enabled
- [ ] Strong JWT secret generated
- [ ] GitHub secrets configured
- [ ] Monitoring configured

---

## 🚨 Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` is correct
- Verify database is running (Docker: `docker compose ps`)
- Check firewall rules for production

### "Redis connection refused"
- Check `REDIS_URL` is correct
- Verify Redis is running (Docker: `docker compose ps`)
- Check firewall rules for production

### "Stripe webhook signature verification failed"
- Check `STRIPE_WEBHOOK_SECRET` matches webhook in Stripe dashboard
- Verify webhook URL is correct
- Check webhook is enabled

### "AWS S3 access denied"
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Check IAM user has S3 permissions
- Verify bucket name is correct
- Check bucket CORS configuration

---

## 📞 Need Help?

- **Stripe Setup**: https://stripe.com/docs/keys
- **AWS Setup**: See `backend/src/AWS_SETUP_GUIDE.md`
- **Database Setup**: See `backend/DATABASE_SETUP.md`
- **Security**: See `backend/src/SECURITY_IMPLEMENTATION.md`

---

**Last Updated:** November 15, 2024
