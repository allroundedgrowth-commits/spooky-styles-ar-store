# Realtime Order Notifications - Quick Start Guide

## What's New?

Users now receive **live notifications** when their order status changes! No more refreshing the page to check order updates.

## Features

✅ **Live Order Updates** - See status changes in real-time  
✅ **Toast Notifications** - Beautiful notifications for status changes  
✅ **Auto-Dismiss** - Notifications disappear after 5 seconds  
✅ **Connection Status** - See if live updates are active  
✅ **Secure** - RLS ensures users only see their own orders  

## How It Works

### For Users

1. **Place an Order**
   - Complete checkout as normal
   - You'll be redirected to the Order Confirmation page

2. **View Order Confirmation**
   - See your order details
   - Notice the "Live Updates" indicator (green wifi icon)
   - Status updates appear automatically

3. **Check Order History**
   - Go to Account → Order History
   - All your orders are monitored for updates
   - Notifications appear when any order status changes

4. **Receive Notifications**
   - When admin updates your order status
   - A toast notification appears in the top-right
   - Shows order ID and new status
   - Auto-dismisses after 5 seconds

### For Admins

1. **Update Order Status**
   - Go to Admin Dashboard
   - Update any order status
   - User receives notification within 2 seconds

2. **Monitor Orders**
   - All order updates broadcast in real-time
   - Users only see their own orders (RLS filtering)

## Usage Examples

### In OrderHistory Component

```tsx
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';
import { OrderNotificationContainer } from '../components/Orders/OrderNotification';

const OrderHistory = () => {
  const { user } = useUserStore();
  
  // Subscribe to all user's orders
  const { orders, notifications, isConnected, clearNotifications } = 
    useRealtimeOrders(user?.id);

  return (
    <div>
      {/* Show notifications */}
      <OrderNotificationContainer
        notifications={notifications}
        onDismiss={clearNotifications}
      />
      
      {/* Connection status */}
      {isConnected ? '🟢 Live' : '🔴 Offline'}
      
      {/* Your orders UI */}
    </div>
  );
};
```

### In OrderConfirmation Component

```tsx
import { useRealtimeOrder } from '../hooks/useRealtimeOrders';

const OrderConfirmation = () => {
  const orderId = 'order-123';
  
  // Subscribe to single order
  const { order, notifications, isConnected } = useRealtimeOrder(orderId);

  return (
    <div>
      <p>Status: {order?.status}</p>
      <p>{isConnected ? '🟢 Live Updates' : '🔴 Offline'}</p>
    </div>
  );
};
```

## Testing

### Test Live Updates

1. **Setup:**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

2. **Test as User:**
   - Login as regular user
   - Place an order
   - Go to Order History page
   - Keep page open

3. **Test as Admin:**
   - Open new browser/incognito window
   - Login as admin
   - Go to Admin Dashboard
   - Update the user's order status

4. **Verify:**
   - User sees notification appear
   - Order status updates automatically
   - No page refresh needed!

### Test RLS Security

1. **Create Test Orders:**
   - Login as User A, place order
   - Login as User B, place order

2. **Test Filtering:**
   - Login as User A
   - Go to Order History
   - Update User B's order (as admin)
   - Verify User A does NOT see notification
   - Verify User A only sees their own orders

## Connection Status Indicators

### Live Updates Active
```
🟢 Wifi Icon (green) + "Live Updates"
```
- Realtime connection established
- Order updates will appear automatically

### Offline
```
🔴 WifiOff Icon (gray) + "Offline"
```
- No Realtime connection
- Refresh page to see latest updates

## Notification Types

### Status Change Notification
```
┌─────────────────────────────────┐
│ 📦 Order Status Update          │
│ Order #abc12345 is now shipped  │
│ Changed from processing to      │
│ shipped                          │
│ [Progress Bar]                   │
└─────────────────────────────────┘
```

### Status Icons
- 📦 **Pending** - Yellow
- 📦 **Processing** - Blue  
- 🚚 **Shipped** - Purple
- ✅ **Delivered** - Green
- ⚠️ **Cancelled** - Red

## Troubleshooting

### Notifications Not Appearing

1. **Check Connection Status**
   - Look for "Live Updates" indicator
   - If offline, check internet connection

2. **Verify Authentication**
   - Ensure you're logged in
   - JWT token must be valid

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for Supabase connection errors

### Connection Keeps Dropping

1. **Check Supabase Status**
   - Visit Supabase dashboard
   - Verify Realtime is enabled

2. **Check Connection Limit**
   - Free tier: 200 concurrent connections
   - Check active connection count

3. **Refresh Page**
   - Sometimes helps re-establish connection

## Configuration

### Environment Variables

Already configured in `.env`:
```bash
# Frontend
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Dashboard

1. **Enable Realtime:**
   - Go to Database → Replication
   - Verify `orders` table is in publication
   - Verify `order_items` table is in publication

2. **Check RLS Policies:**
   - Go to Database → Tables → orders
   - Verify RLS is enabled
   - Verify policies exist for user access

## Performance

### Free Tier Limits
- **Concurrent Connections:** 200
- **Current Usage:** ~2-5 per active user
- **Capacity:** ~40-100 concurrent users

### Optimization
- Channels are reused when possible
- Automatic cleanup on page navigation
- Only subscribe when viewing relevant pages

## API Reference

### useRealtimeOrders Hook

```typescript
const {
  orders,          // Map<string, OrderUpdate>
  notifications,   // OrderNotification[]
  isConnected,     // boolean
  error,           // string | null
  clearNotifications // () => void
} = useRealtimeOrders(userId, orderId?);
```

### useRealtimeOrder Hook

```typescript
const {
  order,           // OrderUpdate | null
  notifications,   // OrderNotification[]
  isConnected,     // boolean
  error,           // string | null
  clearNotifications // () => void
} = useRealtimeOrder(orderId);
```

### OrderNotification Component

```typescript
<OrderNotification
  notification={{
    orderId: 'order-123',
    newStatus: 'shipped',
    oldStatus: 'processing',
    timestamp: '2024-01-01T12:00:00Z',
    message: 'Order #order-123 is now shipped'
  }}
  onDismiss={(id) => console.log('Dismissed', id)}
  autoHideDuration={5000} // optional, default 5000ms
/>
```

## Support

### Common Issues

**Q: Notifications not showing?**  
A: Check connection status indicator. Ensure you're logged in and internet is working.

**Q: Seeing other users' orders?**  
A: This should never happen due to RLS. Report immediately if it does!

**Q: Connection keeps dropping?**  
A: Check Supabase dashboard for service status. May need to refresh page.

**Q: How to disable notifications?**  
A: Currently always enabled when viewing order pages. Can be made optional in future.

### Need Help?

1. Check browser console for errors
2. Verify Supabase configuration
3. Test with different browsers
4. Check network tab for WebSocket connections

## Next Steps

- ✅ Realtime order notifications working
- 🔄 Consider adding email notifications
- 🔄 Consider adding browser push notifications
- 🔄 Consider adding sound notifications
- 🔄 Add admin dashboard Realtime monitoring

---

**Status:** ✅ Fully Implemented and Tested  
**Cost:** $0 (Supabase Free Tier)  
**Requirements:** All validated ✅
