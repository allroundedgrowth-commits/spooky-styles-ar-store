# ✅ Quick Deploy Checklist

Use this checklist to deploy your app in 30 minutes.

## Before You Start

- [ ] Code is working locally
- [ ] You have a GitHub account
- [ ] You have your Paystack test keys

## Deployment Steps

### 1. Push to GitHub (5 min)
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```
- [ ] Code pushed to GitHub

### 2. Database Setup (2 min)
- [ ] Sign up at https://neon.tech
- [ ] Create project: `spooky-wigs-store`
- [ ] Copy DATABASE_URL
- [ ] Save it somewhere safe

### 3. Redis Setup (2 min)
- [ ] Sign up at https://upstash.com
- [ ] Create database: `spooky-redis`
- [ ] Copy REDIS_URL
- [ ] Save it somewhere safe

### 4. Deploy Backend (5 min)
- [ ] Sign up at https://render.com
- [ ] Create Web Service
- [ ] Connect GitHub repo
- [ ] Set Root Directory: `backend`
- [ ] Add environment variables:
  - [ ] NODE_ENV=production
  - [ ] PORT=3000
  - [ ] DATABASE_URL
  - [ ] REDIS_URL
  - [ ] JWT_SECRET
  - [ ] PAYSTACK_SECRET_KEY
  - [ ] PAYSTACK_PUBLIC_KEY
  - [ ] CORS_ORIGIN (add later)
- [ ] Deploy and copy backend URL

### 5. Deploy Frontend (3 min)
- [ ] Sign up at https://vercel.com
- [ ] Import GitHub repo
- [ ] Set Root Directory: `frontend`
- [ ] Add environment variable:
  - [ ] VITE_API_URL=<backend-url>
  - [ ] VITE_PAYSTACK_PUBLIC_KEY
- [ ] Deploy and copy frontend URL

### 6. Update CORS (1 min)
- [ ] Go to Render backend settings
- [ ] Update CORS_ORIGIN to frontend URL
- [ ] Save (auto-redeploys)

### 7. Initialize Database (3 min)
- [ ] Go to Neon SQL Editor
- [ ] Run migration files in order (001 to 010)
- [ ] Or use Render Shell: `npm run db:migrate && npm run db:seed`

### 8. Test Everything (5 min)
- [ ] Visit frontend URL
- [ ] Register account
- [ ] Browse products
- [ ] Add to cart
- [ ] Test checkout with Paystack test card
- [ ] Verify order confirmation

### 9. Set Up Monitoring (2 min)
- [ ] Sign up at https://uptimerobot.com
- [ ] Add monitor for backend health endpoint
- [ ] Set interval to 14 minutes

### 10. Final Checks
- [ ] All pages load correctly
- [ ] Payment works with test card
- [ ] Order confirmation shows
- [ ] Backend stays awake (UptimeRobot)

## 🎉 You're Live!

Your app is now deployed and accepting payments!

## Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=random-secret-string
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
CORS_ORIGIN=https://your-app.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
```

## Test Card
```
Card: 4084 0840 8408 4081
CVV: 408
Expiry: 12/25
PIN: 0000
OTP: 123456
```

## Your URLs
- Frontend: ___________________________
- Backend: ___________________________
- Database: Neon PostgreSQL
- Redis: Upstash

## Troubleshooting

### Backend won't start
1. Check Render logs
2. Verify all environment variables
3. Check DATABASE_URL format

### Frontend can't connect
1. Check VITE_API_URL in Vercel
2. Check CORS_ORIGIN in Render
3. Verify backend is running

### Payment fails
1. Check Paystack keys are correct
2. Verify keys are test keys (pk_test_, sk_test_)
3. Check backend logs for errors

## Next Steps After Deployment

1. [ ] Test all features thoroughly
2. [ ] Set up Paystack webhooks
3. [ ] Add custom domain (optional)
4. [ ] Complete Paystack business verification
5. [ ] Switch to live keys when ready

## Cost: $0/month

Everything is free! 🎉

## Need Help?

- **Detailed Guide**: See DEPLOY_NOW.md
- **Paystack Setup**: See PAYSTACK_INTEGRATION.md
- **Local Testing**: See TEST_LOCALLY_FIRST.md
- **Full Deployment**: See FREE_DEPLOYMENT_GUIDE.md
