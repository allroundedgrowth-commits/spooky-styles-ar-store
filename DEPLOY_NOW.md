# Deploy Your App NOW - Command Line Guide

Quick commands to get your app online in 30 minutes.

## Step 1: Push to GitHub (5 minutes)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your code
git commit -m "Ready for deployment with Paystack"

# Create main branch
git branch -M main

# Add your GitHub repository (replace with your username/repo)
git remote add origin https://github.com/YOUR_USERNAME/spooky-wigs-store.git

# Push to GitHub
git push -u origin main
```

## Step 2: Get Free Database (2 minutes)

1. Go to https://neon.tech
2. Click "Sign up" → Use GitHub
3. Click "Create Project"
4. Name it: `spooky-wigs-store`
5. Copy the connection string (looks like):
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. Save it somewhere - you'll need it!

## Step 3: Get Free Redis (2 minutes)

1. Go to https://upstash.com
2. Click "Sign up" → Use GitHub
3. Click "Create Database"
4. Name it: `spooky-redis`
5. Copy the Redis URL (looks like):
   ```
   redis://default:pass@xxx.upstash.io:6379
   ```
6. Save it!

## Step 4: Deploy Backend on Render (5 minutes)

1. Go to https://render.com
2. Click "Sign up" → Use GitHub
3. Click "New +" → "Web Service"
4. Select your `spooky-wigs-store` repository
5. Fill in:
   - **Name**: `spooky-wigs-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

6. Click "Advanced" and add these Environment Variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<paste-your-neon-database-url>
REDIS_URL=<paste-your-upstash-redis-url>
JWT_SECRET=super-secret-change-this-to-random-string-12345
CORS_ORIGIN=https://your-app.vercel.app
```

7. Click "Create Web Service"
8. Wait 5-10 minutes for deployment
9. Copy your backend URL: `https://spooky-wigs-backend.onrender.com`

## Step 5: Deploy Frontend on Vercel (3 minutes)

1. Go to https://vercel.com
2. Click "Sign up" → Use GitHub
3. Click "Add New" → "Project"
4. Select your `spooky-wigs-store` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variable:
   ```
   VITE_API_URL=<paste-your-render-backend-url>
   ```

7. Click "Deploy"
8. Wait 2-3 minutes
9. Copy your frontend URL: `https://spooky-wigs-store.vercel.app`

## Step 6: Update Backend CORS (1 minute)

1. Go back to Render dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://spooky-wigs-store.vercel.app
   ```
5. Click "Save Changes" (will auto-redeploy)

## Step 7: Set Up Database (3 minutes)

### Option A: Using Neon SQL Editor (Easiest)

1. Go to your Neon dashboard
2. Click "SQL Editor"
3. Run these commands one by one:

```bash
# In your local terminal, get the SQL files
cd backend/src/db/migrations

# Copy and paste each file content into Neon SQL Editor in order:
# 001_create_users_table.sql
# 002_create_products_table.sql
# 003_create_product_colors_table.sql
# 004_create_orders_table.sql
# 005_create_order_items_table.sql
# 006_create_costume_inspirations_tables.sql
# 007_create_analytics_tables.sql
# 008_create_cart_tables.sql
# 009_add_guest_fields_to_orders.sql
# 010_update_products_for_2d_ar.sql
```

### Option B: Using Render Shell

1. In Render dashboard, open your backend service
2. Click "Shell" tab
3. Run:
```bash
npm run db:migrate
npm run db:seed
```

## Step 8: Get Paystack Keys (2 minutes)

1. Go to https://paystack.com
2. Sign up for account
3. Go to Settings → API Keys & Webhooks
4. Copy your Test Keys:
   - Public Key: `pk_test_xxx`
   - Secret Key: `sk_test_xxx`

## Step 9: Add Paystack to Your App (2 minutes)

### Add to Render (Backend):
1. Go to Render → Your Service → Environment
2. Add:
   ```
   PAYSTACK_SECRET_KEY=sk_test_xxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxx
   ```
3. Save (will redeploy)

### Add to Vercel (Frontend):
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add:
   ```
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
   ```
3. Go to Deployments → Click "..." → Redeploy

## Step 10: Test Your App! (5 minutes)

1. Visit your Vercel URL
2. Register a new account
3. Browse products
4. Add to cart
5. Checkout
6. Use Paystack test card:
   - **Card**: `4084 0840 8408 4081`
   - **CVV**: `408`
   - **Expiry**: `12/25`
   - **PIN**: `0000`
   - **OTP**: `123456`

## 🎉 You're Live!

Your app is now deployed and accepting payments!

## 📊 Your URLs

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Database**: Neon PostgreSQL
- **Redis**: Upstash

## ⚠️ Important Notes

### Free Tier Limitations

**Render Free Tier**:
- Backend sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- **Solution**: Use https://uptimerobot.com (free) to ping your backend every 14 minutes

**How to set up UptimeRobot**:
1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend.onrender.com/health`
   - Interval: 14 minutes
4. Done! Your backend stays awake

## 🔄 Making Updates

After deployment, any time you push to GitHub:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

- Vercel auto-deploys in ~2 minutes
- Render auto-deploys in ~5 minutes

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Verify all environment variables are set
# Make sure DATABASE_URL is correct
```

### Frontend can't connect
```bash
# Check VITE_API_URL in Vercel
# Check CORS_ORIGIN in Render
# Make sure backend is running
```

### Database errors
```bash
# Run migrations in Render Shell:
npm run db:migrate
npm run db:seed
```

## 💰 Total Cost: $0/month

Everything is completely free!

## 📚 Next Steps

1. ✅ Test all features
2. ✅ Set up Paystack webhooks (see PAYSTACK_INTEGRATION.md)
3. ✅ Add custom domain (optional)
4. ✅ Complete Paystack business verification for live keys
5. ✅ Switch to live mode when ready

## 🎯 Quick Reference

**Test Paystack Card**: `4084 0840 8408 4081`
**CVV**: `408`
**PIN**: `0000`
**OTP**: `123456`

Your app is live! 🚀
