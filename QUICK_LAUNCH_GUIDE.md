# 🚀 Quick Launch Guide - 5 Minutes to Live

## Prerequisites
- Node.js 18+ installed
- Docker & Docker Compose installed
- Git repository cloned

---

## Step 1: Install Dependencies (1 min)
```bash
npm install
```

---

## Step 2: Setup Environment (1 min)
```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit .env files with your values
# Required:
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET
# - STRIPE_SECRET_KEY (backend)
# - VITE_STRIPE_PUBLISHABLE_KEY (frontend)
```

---

## Step 3: Start Services (1 min)
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services running
docker-compose ps
```

---

## Step 4: Setup Database (1 min)
```bash
cd backend

# Build TypeScript
npm run build

# Run all migrations
node dist/db/migrate.js

# Seed products (94 items)
node dist/db/seed.js

# Run guest checkout migration
node dist/db/run-guest-checkout-migration.js

# Verify
node dist/db/test-connection.js
```

---

## Step 5: Launch Application (1 min)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## Step 6: Verify (30 seconds)

### Open Browser
Visit: http://localhost:3000

### Quick Test
1. ✅ Homepage loads
2. ✅ Click "Shop All Wigs"
3. ✅ Products display
4. ✅ Add item to cart
5. ✅ Cart icon shows count
6. ✅ No console errors

---

## Step 7: Test Purchase (2 min)

### Guest Checkout
1. Go to cart
2. Click "Proceed to Checkout"
3. Fill shipping form:
   - Email: test@example.com
   - Name: Test User
   - Address: 123 Main St
   - City: New York
   - State: NY
   - ZIP: 10001
4. Enter test card: 4242 4242 4242 4242
5. Expiry: 12/25, CVC: 123
6. Click "Complete Payment"
7. ✅ Order confirmation shows

### Verify Order
```bash
# Check database
psql -U spooky_user -d spooky_styles_db -c "SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;"
```

---

## Troubleshooting

### Services Not Starting?
```bash
# Check Docker
docker ps

# Restart services
docker-compose down
docker-compose up -d
```

### Database Connection Failed?
```bash
# Check PostgreSQL
docker logs spooky-styles-ar-store-postgres-1

# Verify connection
cd backend && node dist/db/test-connection.js
```

### Frontend Not Loading?
```bash
# Check .env file
cat frontend/.env

# Verify API URL
# Should be: VITE_API_URL=http://localhost:5000/api
```

### Payment Not Working?
```bash
# Check Stripe keys
cat backend/.env | grep STRIPE
cat frontend/.env | grep STRIPE

# Verify test mode
# Keys should start with sk_test_ and pk_test_
```

---

## Admin Access

### Create Admin User
```bash
cd backend
npm run build
node dist/db/create-admin.js
```

### Login
- URL: http://localhost:3000/account
- Email: admin@spookystyles.com
- Password: Admin123!

---

## Production Deployment

### Build for Production
```bash
# Frontend
cd frontend
npm run build
# Output: dist/

# Backend
cd backend
npm run build
# Output: dist/
```

### Environment Variables
Update `.env.production` with:
- Production database URL
- Production Redis URL
- Production Stripe keys (live mode)
- Production domain
- Secure JWT secret

### Deploy
```bash
# Using Docker
docker-compose -f docker-compose.prod.yml up -d

# Or using your hosting provider
# Follow their deployment guide
```

---

## Success Checklist

- [ ] All services running
- [ ] Database migrated
- [ ] Products seeded
- [ ] Frontend loads
- [ ] Backend responds
- [ ] Guest checkout works
- [ ] Payment processes
- [ ] Order created
- [ ] No console errors
- [ ] Ready to launch! 🚀

---

## Quick Commands

### Start Everything
```bash
docker-compose up -d && npm run dev
```

### Stop Everything
```bash
docker-compose down
```

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
cd backend && npm run build && node dist/db/migrate.js && node dist/db/seed.js
```

### View Logs
```bash
# Backend logs
cd backend && npm run dev

# Database logs
docker logs spooky-styles-ar-store-postgres-1

# Redis logs
docker logs spooky-styles-ar-store-redis-1
```

---

## Support

### Documentation
- `LAUNCH_CHECKLIST.md` - Complete testing checklist
- `FINAL_LAUNCH_SUMMARY.md` - Full project summary
- `README.md` - Project overview
- `test-guest-checkout.md` - Guest checkout testing

### Common Issues
- Database: Check Docker, verify connection
- Redis: Check Docker, verify connection
- Stripe: Verify test keys, check dashboard
- Frontend: Check .env, verify API URL

---

## You're Ready! 🎉

**Time to Launch:** ~10 minutes  
**Confidence Level:** HIGH  
**Status:** READY TO GO

### Launch Command
```bash
npm run dev
```

### Then Visit
http://localhost:3000

## HAPPY LAUNCHING! 🚀👻🎃
