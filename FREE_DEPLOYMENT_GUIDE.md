# Free Deployment Guide for Spooky Wigs Store

This guide will help you deploy your application **completely free** so you can set up Paystack for payments.

## 🎯 Recommended Free Deployment Stack

### Frontend: Vercel (Free Tier)
- Unlimited bandwidth
- Automatic HTTPS
- Global CDN
- CI/CD from GitHub

### Backend: Render (Free Tier)
- 750 hours/month free
- Automatic HTTPS
- Auto-deploy from GitHub
- Supports Node.js

### Database: Neon (Free Tier)
- PostgreSQL database
- 3GB storage free
- Serverless architecture
- No credit card required

### Redis: Upstash (Free Tier)
- 10,000 commands/day free
- Global edge network
- No credit card required

### File Storage: Cloudinary (Free Tier)
- 25GB storage
- 25GB bandwidth/month
- Image optimization
- No credit card required

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Code

1. **Push to GitHub** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spooky-wigs-store.git
git push -u origin main
```

### Step 2: Set Up Database (Neon)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub (free, no credit card)
3. Create a new project: "spooky-wigs-store"
4. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this as `DATABASE_URL`

### Step 3: Set Up Redis (Upstash)

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub (free, no credit card)
3. Create a new Redis database
4. Copy the Redis URL (looks like):
   ```
   redis://default:password@xxx.upstash.io:6379
   ```
5. Save this as `REDIS_URL`

### Step 4: Set Up File Storage (Cloudinary)

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard and copy:
   - Cloud Name
   - API Key
   - API Secret
4. Save these credentials

### Step 5: Deploy Backend (Render)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `spooky-wigs-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<your-neon-database-url>
   REDIS_URL=<your-upstash-redis-url>
   JWT_SECRET=<generate-random-string>
   CORS_ORIGIN=<your-frontend-url-will-add-later>
   ```

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL: `https://spooky-wigs-backend.onrender.com`

### Step 6: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
   ```
   VITE_API_URL=<your-render-backend-url>
   ```

7. Click "Deploy"
8. Wait for deployment (2-3 minutes)
9. Copy your frontend URL: `https://spooky-wigs-store.vercel.app`

### Step 7: Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment"
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://spooky-wigs-store.vercel.app
   ```
5. Save changes (will auto-redeploy)

### Step 8: Initialize Database

1. In Render dashboard, open your backend service
2. Go to "Shell" tab
3. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

Or use the Neon SQL Editor:
- Copy contents of `backend/src/db/migrations/*.sql`
- Run them in order in Neon's SQL Editor

### Step 9: Set Up Paystack

1. Go to [paystack.com](https://paystack.com)
2. Sign up for account
3. Go to Settings → API Keys & Webhooks
4. Copy your:
   - **Public Key**: `pk_test_xxx`
   - **Secret Key**: `sk_test_xxx`

5. Add to Render environment variables:
   ```
   PAYSTACK_SECRET_KEY=sk_test_xxx
   ```

6. Add to Vercel environment variables:
   ```
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
   ```

---

## 🔧 Alternative: Deploy Everything on Render

If you prefer a single platform:

### Deploy Full Stack on Render

1. **Backend**: Follow Step 5 above
2. **Frontend**: 
   - Create new "Static Site" on Render
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

---

## 💰 Cost Breakdown (All FREE)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel | ✅ Free | Unlimited bandwidth |
| Render | ✅ Free | 750 hours/month (enough for 1 service) |
| Neon | ✅ Free | 3GB storage, 1 project |
| Upstash | ✅ Free | 10K commands/day |
| Cloudinary | ✅ Free | 25GB storage, 25GB bandwidth |
| **Total** | **$0/month** | Perfect for testing & setup |

---

## ⚠️ Important Notes

### Render Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- **Solution**: Use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping your backend every 14 minutes

### Database Connections
- Neon free tier has connection limits
- Use connection pooling in production
- Close connections properly

### File Uploads
- Replace AWS S3 with Cloudinary
- Update upload service to use Cloudinary SDK
- Much simpler and free!

---

## 🚀 Quick Deploy Commands

### Update Backend for Cloudinary

Replace S3 service with Cloudinary:

```bash
cd backend
npm install cloudinary
```

### Update Frontend API URL

In `frontend/src/services/api.ts`, ensure it uses environment variable:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

---

## 📱 Testing Your Deployment

1. Visit your Vercel URL
2. Register a new account
3. Browse products
4. Add items to cart
5. Test checkout with Paystack test cards:
   - Card: `4084 0840 8408 4081`
   - CVV: `408`
   - Expiry: Any future date
   - PIN: `0000`
   - OTP: `123456`

---

## 🔄 Continuous Deployment

Both Vercel and Render auto-deploy when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

- Vercel: Deploys in ~2 minutes
- Render: Deploys in ~5 minutes

---

## 📊 Monitoring & Logs

### Vercel
- Dashboard → Your Project → Deployments
- Real-time logs
- Analytics included

### Render
- Dashboard → Your Service → Logs
- Real-time logs
- Metrics included

---

## 🆘 Troubleshooting

### Backend won't start
- Check environment variables in Render
- View logs in Render dashboard
- Ensure DATABASE_URL is correct

### Frontend can't connect to backend
- Check VITE_API_URL in Vercel
- Check CORS_ORIGIN in Render
- Ensure backend is running

### Database connection errors
- Verify Neon connection string
- Check if database is active
- Run migrations

---

## 🎉 Next Steps

Once deployed:

1. ✅ Test all features
2. ✅ Set up Paystack webhooks
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring
5. ✅ Add SSL certificate (automatic)

Your app is now live and ready for Paystack integration!
