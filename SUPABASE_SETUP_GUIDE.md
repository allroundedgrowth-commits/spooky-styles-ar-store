# Supabase Setup Guide

This guide will help you configure Supabase for the Spooky Styles platform.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Your existing Supabase project (you're already using it for PostgreSQL)

## Getting Your Supabase Credentials

### 1. Access Your Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: `yreqvwoiuykxfxxgdusw`

### 2. Get Your API Keys

1. In your Supabase dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** under Project Settings
3. You'll see two important keys:
   - **Project URL**: `https://yreqvwoiuykxfxxgdusw.supabase.co` (already configured)
   - **anon public key**: Copy this for the frontend
   - **service_role key**: Copy this for the backend (⚠️ Keep this secret!)

### 3. Configure Environment Variables

#### Frontend Configuration

Edit `frontend/.env` and replace the placeholder:

```env
VITE_SUPABASE_URL=https://yreqvwoiuykxfxxgdusw.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

#### Backend Configuration

Edit `backend/.env` and replace the placeholder:

```env
SUPABASE_URL=https://yreqvwoiuykxfxxgdusw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

## Security Notes

⚠️ **Important Security Information:**

- **Anon Key**: Safe to use in frontend code, enforces Row Level Security (RLS)
- **Service Role Key**: NEVER expose in frontend, bypasses RLS, use only in backend
- Never commit actual keys to version control
- Use `.env.example` files as templates only

## What's Been Configured

✅ **Installed**: `@supabase/supabase-js` package in both frontend and backend
✅ **Created**: Frontend Supabase client (`frontend/src/config/supabase.ts`)
✅ **Created**: Backend Supabase client (`backend/src/config/supabase.ts`)
✅ **Updated**: Environment variable files with Supabase configuration

## Next Steps

After adding your actual Supabase keys:

1. **Enable Row Level Security (RLS)** - Run the RLS migration (Task 2)
2. **Enable Realtime** - Configure Realtime in Supabase dashboard (Task 3)
3. **Test the connection** - Verify Supabase client works correctly

## Supabase Client Usage

### Frontend

```typescript
import { supabase, setSupabaseAuth } from '@/config/supabase';

// After user login, set JWT for RLS
setSupabaseAuth(userJwtToken);

// Subscribe to realtime updates
const subscription = supabase
  .channel('my-channel')
  .on('postgres_changes', { ... }, callback)
  .subscribe();
```

### Backend

```typescript
import { supabaseAdmin, createSupabaseClientWithAuth } from '@/config/supabase';

// Admin operations (bypasses RLS)
const { data } = await supabaseAdmin.from('products').select('*');

// User-scoped operations (enforces RLS)
const userClient = createSupabaseClientWithAuth(req.user.token);
const { data } = await userClient.from('orders').select('*');
```

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Make sure you've added the keys to your `.env` files
- Restart your development servers after updating `.env` files

### Error: "Invalid API key"

- Double-check you copied the correct keys from Supabase dashboard
- Make sure there are no extra spaces or line breaks in the keys

### Realtime not working

- Ensure Realtime is enabled in Supabase dashboard (Settings > API > Realtime)
- Check that RLS policies allow the user to access the data
- Verify you're within the free tier limit (200 concurrent connections)

## Free Tier Limits

Supabase free tier includes:

- ✅ 500 MB database storage
- ✅ 5 GB bandwidth per month
- ✅ 200 concurrent Realtime connections
- ✅ Unlimited API requests
- ✅ Row Level Security (RLS)
- ✅ Realtime subscriptions

Your current usage should be well within these limits.

## Support

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
