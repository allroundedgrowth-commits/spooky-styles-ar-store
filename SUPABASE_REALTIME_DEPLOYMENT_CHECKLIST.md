# Supabase Realtime Deployment Checklist

## Pre-Deployment Checklist

Use this checklist to ensure Supabase Realtime features are properly configured before deploying to production.

---

## ✅ Phase 1: Supabase Project Setup

### 1.1 Supabase Account & Project
- [ ] Supabase account created
- [ ] Production Supabase project created (separate from development)
- [ ] Project name documented
- [ ] Project region selected (choose closest to your users)

### 1.2 Database Connection
- [ ] Database is accessible
- [ ] Connection pooling configured (if needed)
- [ ] Database migrations run successfully
- [ ] Seed data loaded (if applicable)

---

## ✅ Phase 2: Environment Variables

### 2.1 Frontend Environment Variables
- [ ] `VITE_SUPABASE_URL` set in production `.env`
- [ ] `VITE_SUPABASE_ANON_KEY` set in production `.env`
- [ ] Variables added to deployment platform (Vercel/Netlify/etc.)
- [ ] Variables verified in build logs

### 2.2 Backend Environment Variables (Optional)
- [ ] `SUPABASE_URL` set in production `.env`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in production `.env`
- [ ] ⚠️ Service role key kept secret (never in frontend)
- [ ] Variables added to deployment platform

### 2.3 Security Check
- [ ] No API keys committed to git
- [ ] `.env` files in `.gitignore`
- [ ] Production keys different from development keys
- [ ] Service role key stored securely (environment variables only)

---

## ✅ Phase 3: RLS Migration (Optional but Recommended)

### 3.1 Run RLS Migration
- [ ] Migration file exists: `backend/src/db/migrations/013_enable_rls_policies.sql`
- [ ] Migration run against production database
- [ ] No errors in migration output
- [ ] All tables have RLS enabled

### 3.2 Verify RLS Policies
- [ ] RLS enabled on `users` table
- [ ] RLS enabled on `orders` table
- [ ] RLS enabled on `order_items` table
- [ ] RLS enabled on `cart_items` table
- [ ] RLS enabled on `products` table

### 3.3 Test RLS Policies
- [ ] Users can only see their own orders
- [ ] Users cannot see other users' data
- [ ] Admins can see all data
- [ ] Public can read products
- [ ] Only admins can modify products

---

## ✅ Phase 4: Realtime Configuration

### 4.1 Enable Realtime in Supabase Dashboard
- [ ] Navigate to **Database** → **Replication**
- [ ] `products` table added to `supabase_realtime` publication
- [ ] `orders` table added to `supabase_realtime` publication
- [ ] `order_items` table added to `supabase_realtime` publication (optional)
- [ ] Changes saved

### 4.2 Verify Realtime Settings
- [ ] Go to **Settings** → **API**
- [ ] **Enable Realtime** toggle is ON
- [ ] Connection limit noted (200 for free tier, 500+ for Pro)
- [ ] Realtime URL documented

### 4.3 Test Realtime Connection
- [ ] Frontend can connect to Realtime
- [ ] Product updates broadcast successfully
- [ ] Order updates broadcast successfully
- [ ] Connection status indicator works
- [ ] Reconnection works after disconnect

---

## ✅ Phase 5: Performance & Indexes

### 5.1 Database Indexes
- [ ] Index on `orders(user_id)` exists
- [ ] Index on `order_items(order_id)` exists
- [ ] Index on `users(is_admin)` exists
- [ ] Index on `cart_items(user_id)` exists

### 5.2 Query Performance
- [ ] RLS queries perform well (< 100ms)
- [ ] Realtime updates arrive within 1-2 seconds
- [ ] No slow query warnings in Supabase dashboard

---

## ✅ Phase 6: Testing

### 6.1 Functional Testing
- [ ] Real-time inventory updates work
- [ ] Multiple users see same inventory updates
- [ ] Real-time order notifications work
- [ ] Users only see their own order updates
- [ ] Connection status indicator accurate
- [ ] Reconnection after network loss works

### 6.2 Security Testing
- [ ] Users cannot access other users' orders
- [ ] Non-admins cannot modify products
- [ ] RLS policies enforced on Realtime subscriptions
- [ ] JWT tokens validated correctly
- [ ] Expired tokens handled gracefully

### 6.3 Load Testing
- [ ] Test with 10+ concurrent users
- [ ] Monitor connection count in Supabase dashboard
- [ ] Verify no connection limit errors
- [ ] Check for memory leaks (connections not cleaned up)

---

## ✅ Phase 7: Monitoring & Alerts

### 7.1 Supabase Dashboard Monitoring
- [ ] Bookmark Supabase dashboard URL
- [ ] Check **Settings** → **Usage** regularly
- [ ] Monitor Realtime connection count
- [ ] Monitor database size
- [ ] Monitor bandwidth usage

### 7.2 Set Up Alerts
- [ ] Alert when approaching 200 connections (free tier)
- [ ] Alert when database size > 400 MB (80% of free tier)
- [ ] Alert when bandwidth > 4 GB/month (80% of free tier)
- [ ] Alert for Realtime connection errors

### 7.3 Error Tracking
- [ ] Frontend error tracking configured (Sentry, LogRocket, etc.)
- [ ] Backend error tracking configured
- [ ] Realtime connection errors logged
- [ ] RLS policy violations logged

---

## ✅ Phase 8: Documentation

### 8.1 Internal Documentation
- [ ] Supabase project URL documented
- [ ] API keys location documented (where they're stored)
- [ ] RLS policies documented
- [ ] Realtime channels documented
- [ ] Troubleshooting guide created

### 8.2 Team Knowledge
- [ ] Team knows how to access Supabase dashboard
- [ ] Team knows how to check Realtime status
- [ ] Team knows how to run RLS migration
- [ ] Team knows free tier limits

---

## ✅ Phase 9: Deployment

### 9.1 Pre-Deployment
- [ ] All above checklist items completed
- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Staging environment tested

### 9.2 Deploy Frontend
- [ ] Frontend deployed with Supabase env vars
- [ ] Build successful
- [ ] Realtime client initialized correctly
- [ ] No console errors

### 9.3 Deploy Backend (if using RLS)
- [ ] Backend deployed with Supabase env vars
- [ ] Build successful
- [ ] Supabase client initialized correctly
- [ ] No startup errors

### 9.4 Post-Deployment Verification
- [ ] Production app loads successfully
- [ ] Realtime connection established
- [ ] Product updates work in production
- [ ] Order notifications work in production
- [ ] No errors in production logs

---

## ✅ Phase 10: Post-Deployment Monitoring

### 10.1 First 24 Hours
- [ ] Monitor Realtime connection count
- [ ] Check for connection errors
- [ ] Verify no RLS policy violations
- [ ] Monitor database performance
- [ ] Check user feedback

### 10.2 First Week
- [ ] Review Supabase usage metrics
- [ ] Check if approaching any limits
- [ ] Verify Realtime stability
- [ ] Review error logs
- [ ] Gather user feedback

### 10.3 Ongoing
- [ ] Weekly check of Supabase dashboard
- [ ] Monthly review of usage trends
- [ ] Plan for scaling if needed
- [ ] Keep Supabase client library updated

---

## 🚨 Rollback Plan

If issues occur after deployment:

### Immediate Actions
1. Check Supabase status page: https://status.supabase.com/
2. Review error logs in Supabase dashboard
3. Check frontend console for errors
4. Verify environment variables are correct

### Rollback Steps
1. Revert to previous deployment
2. Disable Realtime features temporarily (comment out subscriptions)
3. Fall back to polling for updates
4. Investigate and fix issues
5. Redeploy when ready

---

## 📊 Success Metrics

After deployment, track these metrics:

### Performance Metrics
- Realtime update latency: < 2 seconds
- Connection success rate: > 99%
- Reconnection time: < 5 seconds
- RLS query performance: < 100ms

### Usage Metrics
- Concurrent Realtime connections: < 200 (free tier)
- Database size: < 500 MB (free tier)
- Bandwidth: < 5 GB/month (free tier)

### User Experience Metrics
- User satisfaction with real-time updates
- Reduction in page refreshes
- Increase in user engagement
- Fewer support tickets about stale data

---

## 🎯 Upgrade Considerations

Consider upgrading to Supabase Pro ($25/month) if:

- [ ] Consistently > 150 concurrent connections
- [ ] Database size > 400 MB
- [ ] Bandwidth > 4 GB/month
- [ ] Need dedicated support
- [ ] Need daily backups
- [ ] Need custom domains

---

## 📚 Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Supabase Status Page](https://status.supabase.com/)

---

## ✅ Final Sign-Off

Before marking deployment complete:

- [ ] All checklist items completed
- [ ] Production tested and verified
- [ ] Team trained on monitoring
- [ ] Documentation updated
- [ ] Rollback plan tested
- [ ] Success metrics baseline established

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

**Notes:**
_______________________________________
_______________________________________
_______________________________________
