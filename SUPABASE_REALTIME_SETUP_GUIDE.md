# Supabase Realtime Setup Guide

## Overview

This guide walks you through setting up Supabase Realtime features for the Spooky Styles platform. You'll enable real-time inventory updates and order notifications using Supabase's free tier.

**What You'll Get:**
- ✅ Real-time product inventory updates (all users see stock changes instantly)
- ✅ Real-time order status notifications (users get notified when their orders update)
- ✅ Automatic reconnection on connection loss
- ✅ All on Supabase free tier (up to 200 concurrent connections)

**What's Already Done:**
- ✅ Frontend Realtime services and hooks
- ✅ Error handling and connection management
- ✅ UI components for notifications
- ✅ RLS migration file created

**What You Need to Do:**
1. Get Supabase credentials
2. Configure environment variables
3. Run the RLS migration (optional but recommended)
4. Enable Realtime in Supabase dashboard
5. Test the features

---

## Prerequisites

- Supabase account (free tier is fine)
- Existing Supabase project with your database
- Node.js 18+ installed
- Project already running locally

---

## Step 1: Get Supabase Credentials

### 1.1 Navigate to Your Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (or create a new one)

### 1.2 Get Your Project URL

1. In the Supabase dashboard, click **Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. Find **Project URL** - it looks like: `https://xxxxxxxxxxxxx.supabase.co`
4. Copy this URL

### 1.3 Get Your API Keys

In the same **API** settings page:

1. Find **Project API keys** section
2. Copy the **anon public** key (starts with `eyJ...`)
   - This is safe to use in frontend code
   - RLS policies protect your data
3. Copy the **service_role** key (also starts with `eyJ...`)
   - ⚠️ **NEVER** expose this in frontend code
   - Only use in backend/server code
   - Has full database access (bypasses RLS)

---

## Step 2: Configure Environment Variables

### 2.1 Frontend Environment Variables

Edit `frontend/.env`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

Also update `frontend/.env.example` for other developers:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 2.2 Backend Environment Variables (Optional)

If you want to use RLS on the backend (not required for Realtime to work):

Edit `backend/.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Also update `backend/.env.example`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2.3 Verify Configuration

Check that the Supabase client files exist:
- ✅ `frontend/src/config/supabase.ts` - Frontend client
- ✅ `backend/src/config/supabase.ts` - Backend client (optional)

---

## Step 3: Enable Realtime in Supabase Dashboard

### 3.1 Enable Realtime for Products Table

1. In Supabase dashboard, go to **Database** → **Replication**
2. Find the **supabase_realtime** publication
3. Click **Edit** or **Add tables**
4. Check the box next to **products** table
5. Click **Save**

### 3.2 Enable Realtime for Orders Table

In the same **Replication** page:

1. Check the box next to **orders** table
2. Check the box next to **order_items** table (optional, for detailed order updates)
3. Click **Save**

### 3.3 Verify Realtime is Enabled

1. Go to **Settings** → **API**
2. Scroll to **Realtime** section
3. Ensure **Enable Realtime** is toggled ON
4. Note the connection limit: **200 concurrent connections** (free tier)

---

## Step 4: Run RLS Migration (Optional but Recommended)

RLS (Row Level Security) ensures users only see their own data. While not required for Realtime to work, it adds an extra security layer.

### 4.1 Run the Migration

```bash
# From project root
cd backend
npm run tsx src/db/run-rls-migration.ts
```

### 4.2 Verify RLS is Enabled

In Supabase dashboard:

1. Go to **Database** → **Tables**
2. Click on **orders** table
3. Look for **RLS enabled** badge
4. Repeat for **users**, **products**, **cart_items**, **order_items**

### 4.3 If Migration Fails

If you get errors, you can manually run the SQL:

1. Go to **SQL Editor** in Supabase dashboard
2. Open `backend/src/db/migrations/013_enable_rls_policies.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run**

---

## Step 5: Test Realtime Features

### 5.1 Test Real-time Inventory

1. Start your frontend: `npm run dev:frontend`
2. Open the app in your browser: `http://localhost:3000`
3. Navigate to any product detail page
4. Open a second browser window/tab to the same product
5. In Supabase dashboard, go to **Table Editor** → **products**
6. Find the product and change its `stock_quantity`
7. **Both browser windows should update instantly!**

### 5.2 Test Real-time Order Notifications

1. Make sure you're logged in as a user
2. Create an order (go through checkout)
3. Navigate to **Account** → **Order History**
4. In Supabase dashboard, go to **Table Editor** → **orders**
5. Find your order and change its `status` (e.g., from "pending" to "processing")
6. **You should see a notification appear in the app!**

### 5.3 Check Connection Status

Look for the Realtime status indicator in your app:
- 🟢 **Connected** - Realtime is working
- 🟡 **Reconnecting** - Temporary connection loss
- 🔴 **Disconnected** - Check your internet or Supabase status

---

## Troubleshooting

### Issue: "Failed to connect to Realtime"

**Possible causes:**
1. Wrong Supabase URL or anon key
2. Realtime not enabled in dashboard
3. Tables not added to replication

**Solutions:**
1. Double-check environment variables
2. Verify Realtime is enabled in **Settings** → **API**
3. Verify tables are in **Database** → **Replication**

### Issue: "No updates appearing"

**Possible causes:**
1. Tables not added to Realtime publication
2. Browser cache issues
3. Connection not established

**Solutions:**
1. Check **Database** → **Replication** for your tables
2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for connection errors

### Issue: "RLS policy violation" errors

**Possible causes:**
1. RLS migration not run
2. JWT token not set correctly
3. User not authenticated

**Solutions:**
1. Run the RLS migration (Step 4)
2. Check that user is logged in
3. Verify JWT token in browser DevTools → Application → Local Storage

### Issue: "Too many connections"

**Possible causes:**
1. Exceeded 200 concurrent connections (free tier limit)
2. Connections not being cleaned up

**Solutions:**
1. Check connection count in Supabase dashboard
2. Ensure components properly unsubscribe on unmount
3. Consider upgrading to Pro tier ($25/month) for more connections

---

## Monitoring and Limits

### Free Tier Limits

- **Realtime connections**: 200 concurrent
- **Database size**: 500 MB
- **Bandwidth**: 5 GB/month
- **API requests**: Unlimited

### Monitor Usage

1. Go to **Settings** → **Usage** in Supabase dashboard
2. Check **Realtime** section for connection count
3. Check **Database** section for storage usage
4. Set up alerts if approaching limits

### Expected Usage

For Spooky Styles:
- **Concurrent users**: 10-50 (well under 200 limit)
- **Database size**: ~50-100 MB (well under 500 MB limit)
- **Bandwidth**: ~1-2 GB/month (well under 5 GB limit)

You have plenty of headroom on the free tier!

---

## Security Best Practices

### ✅ DO:
- Use anon key in frontend code
- Use service role key only in backend code
- Keep service role key in `.env` (never commit to git)
- Enable RLS on all sensitive tables
- Test RLS policies with different user roles

### ❌ DON'T:
- Expose service role key in frontend
- Commit `.env` files to git
- Disable RLS without understanding implications
- Share API keys publicly

---

## Next Steps

Once Realtime is working:

1. ✅ Test with multiple users simultaneously
2. ✅ Monitor connection count in Supabase dashboard
3. ✅ Set up error tracking (Sentry, LogRocket, etc.)
4. ✅ Document any custom Realtime channels you add
5. ✅ Consider upgrading to Pro if you exceed free tier limits

---

## Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Troubleshooting Realtime](https://supabase.com/docs/guides/realtime/troubleshooting)

---

## Support

If you encounter issues:

1. Check the [Supabase Status Page](https://status.supabase.com/)
2. Search [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
3. Ask in [Supabase Discord](https://discord.supabase.com/)
4. Review implementation docs in this project:
   - `REALTIME_INVENTORY_IMPLEMENTATION.md`
   - `REALTIME_ORDERS_IMPLEMENTATION.md`
   - `REALTIME_ERROR_HANDLING_COMPLETE.md`
