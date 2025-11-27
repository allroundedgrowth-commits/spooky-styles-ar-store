# Supabase Realtime - Quick Start

## 🚀 Activate in 3 Steps (12 Minutes)

### Step 1: Add Environment Variables (5 min)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → Settings → API
3. Copy **Project URL** and **anon public** key
4. Add to `frontend/.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Enable Realtime (2 min)

1. In Supabase Dashboard → Database → Replication
2. Find `supabase_realtime` publication
3. Click **Edit** → Check boxes for:
   - ✅ `products`
   - ✅ `orders`
4. Click **Save**

### Step 3: Test It (5 min)

```bash
# Restart frontend
npm run dev:frontend
```

1. Open product page: `http://localhost:3000/products/1`
2. In Supabase Dashboard → Table Editor → products
3. Change `stock_quantity` for product ID 1
4. **Watch it update instantly!** 🎉

---

## ✅ What You Get

- 🔄 **Real-time inventory** - Stock updates instantly
- 📬 **Order notifications** - Users get notified of status changes
- 🔌 **Auto-reconnect** - Seamless experience
- 🆓 **Free tier** - $0/month (200 concurrent connections)

---

## 📖 Full Documentation

- **Setup Guide:** `SUPABASE_REALTIME_SETUP_GUIDE.md`
- **Deployment:** `SUPABASE_REALTIME_DEPLOYMENT_CHECKLIST.md`
- **Overview:** `SUPABASE_REALTIME_COMPLETE.md`

---

## 🔧 Optional: Run RLS Migration

For extra database-level security:

```bash
cd backend
npm run tsx src/db/run-rls-migration.ts
```

This adds Row Level Security policies. Not required for Realtime to work.

---

## 🧪 Manual Testing

### Test Inventory Updates
1. Open product page
2. Change stock in Supabase dashboard
3. Verify instant update

### Test Order Notifications
1. Create an order
2. Go to Order History
3. Change order status in Supabase dashboard
4. Verify notification appears

---

## 🚨 Troubleshooting

**Not connecting?**
- Check env vars are correct
- Verify Realtime is enabled in Settings → API
- Check tables are in Database → Replication

**No updates appearing?**
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Verify tables added to Realtime publication

**Need help?**
- See `SUPABASE_REALTIME_SETUP_GUIDE.md` for detailed troubleshooting

---

## 📊 Free Tier Limits

- **Connections:** 200 concurrent (you'll use ~10-50)
- **Database:** 500 MB (you'll use ~50-100 MB)
- **Bandwidth:** 5 GB/month (you'll use ~1-2 GB)

**You have plenty of headroom!** 🎉

---

**Status:** ✅ Ready to use

**Setup Time:** ~12 minutes

**Cost:** $0/month
