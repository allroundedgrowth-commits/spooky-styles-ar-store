# 📊 Analytics Cheat Sheet

## Quick Access
**Dashboard:** http://localhost:3001/admin/analytics  
**Login:** admin@spookystyles.com / Admin123!

## Track Events (Copy & Paste)

```typescript
import analyticsService from '../services/analytics.service';

// Product viewed
analyticsService.trackProductView(product.id, product.name);

// Add to cart
analyticsService.trackAddToCart(product.id, product.name, product.price);

// Checkout
analyticsService.trackCheckoutStart(cartTotal, itemCount);

// Purchase
analyticsService.trackPurchase(orderId, total, itemCount);

// AR session
analyticsService.trackARSession('start');
analyticsService.trackARSession('end', duration);

// Search
analyticsService.trackSearch(query, resultsCount);

// Share
analyticsService.trackShare('facebook', productId);

// Custom
analyticsService.trackEvent('event_name', 'category', { custom: 'data' });
```

## API Endpoints

```bash
# Track page view
POST /api/analytics/pageview
Body: { sessionId, pagePath, referrer }

# Track event
POST /api/analytics/event
Body: { sessionId, eventName, eventCategory, eventData }

# Get dashboard (admin)
GET /api/analytics/dashboard?days=7

# Get error rate (admin)
GET /api/analytics/error-rate?hours=24

# Get funnel (admin)
GET /api/analytics/funnel?days=7
```

## Database Queries

```sql
-- Top products viewed
SELECT event_data->>'productId' as product_id, COUNT(*) as views
FROM events
WHERE event_name = 'product_view'
GROUP BY product_id
ORDER BY views DESC
LIMIT 10;

-- Conversion rate
SELECT 
  COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN session_id END) as views,
  COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN session_id END) as purchases,
  (COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN session_id END)::float / 
   COUNT(DISTINCT CASE WHEN event_name = 'product_view' THEN session_id END) * 100) as conversion_rate
FROM events;

-- Error rate
SELECT 
  (SELECT COUNT(*) FROM error_logs WHERE created_at >= NOW() - INTERVAL '24 hours') as errors,
  (SELECT COUNT(*) FROM page_views WHERE created_at >= NOW() - INTERVAL '24 hours') as requests,
  ((SELECT COUNT(*) FROM error_logs WHERE created_at >= NOW() - INTERVAL '24 hours')::float /
   (SELECT COUNT(*) FROM page_views WHERE created_at >= NOW() - INTERVAL '24 hours') * 100) as error_rate;
```

## Key Metrics to Watch

- **Conversion Rate:** Target > 2%
- **Error Rate:** Keep < 5%
- **Avg Response Time:** Keep < 200ms
- **Cart Abandonment:** Track checkout_start vs purchase

## Files Reference

**Backend:**
- Service: `backend/src/services/analytics.service.ts`
- Routes: `backend/src/routes/analytics.routes.ts`
- Middleware: `backend/src/middleware/analytics.middleware.ts`
- Migration: `backend/src/db/migrations/007_create_analytics_tables.sql`

**Frontend:**
- Service: `frontend/src/services/analytics.service.ts`
- Dashboard: `frontend/src/components/Admin/AnalyticsDashboard.tsx`
- Route: Added to `frontend/src/App.tsx`

**Docs:**
- Full Guide: `ANALYTICS_IMPLEMENTATION.md`
- Quick Start: `ANALYTICS_QUICK_START.md`
- Summary: `ANALYTICS_SUMMARY.md`
