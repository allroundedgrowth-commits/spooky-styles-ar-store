# 🚀 Guest Checkout - Quick Reference

## TL;DR

Users can now buy without creating an account. Guest info is collected at checkout and stored with the order.

---

## Quick Start

### 1. Run Migration
```bash
cd backend && npm run build && node dist/db/run-guest-checkout-migration.js
```

### 2. Test It
1. Add product to cart (no login)
2. Go to checkout
3. Fill shipping form
4. Pay with 4242 4242 4242 4242
5. ✅ Order created!

---

## API Quick Reference

### Create Payment Intent (Guest)
```bash
POST /api/payments/intent
{
  "amount": 9999,
  "guestInfo": {
    "email": "guest@example.com",
    "name": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  }
}
```

### Create Payment Intent (Authenticated)
```bash
POST /api/payments/intent
Authorization: Bearer <token>
{
  "amount": 9999
}
```

---

## Database Quick Reference

### Query Guest Orders
```sql
SELECT * FROM orders WHERE user_id IS NULL;
```

### Query User Orders
```sql
SELECT * FROM orders WHERE user_id IS NOT NULL;
```

### Get Guest Order Details
```sql
SELECT 
  id,
  guest_email,
  guest_name,
  guest_address->>'address' as street,
  guest_address->>'city' as city,
  guest_address->>'state' as state,
  guest_address->>'zipCode' as zip,
  total,
  status
FROM orders 
WHERE guest_email = 'guest@example.com';
```

---

## Code Quick Reference

### Frontend - Check if Guest
```typescript
const isGuest = !req.user;
```

### Backend - Get Cart ID
```typescript
const cartId = req.user?.id || req.sessionID || 'guest';
```

### Backend - Create Guest Order
```typescript
await orderService.createOrder(userId, paymentIntentId, cart, guestInfo);
```

---

## Troubleshooting

### Issue: Migration fails
```bash
# Check if columns already exist
psql -U spooky_user -d spooky_styles_db -c "\d orders"
```

### Issue: Guest orders not created
```bash
# Check webhook logs
tail -f backend/logs/webhook.log

# Verify Stripe metadata
stripe payment_intents retrieve pi_xxx
```

### Issue: Validation errors
```bash
# Check backend logs
cd backend && npm run dev
# Look for validation error messages
```

---

## Testing Checklist

- [ ] Guest can add to cart
- [ ] Guest can checkout
- [ ] Form validation works
- [ ] Payment processes
- [ ] Order created in DB
- [ ] Cart cleared
- [ ] Authenticated users still work

---

## Files to Know

### Frontend:
- `frontend/src/pages/Checkout.tsx` - Guest form
- `frontend/src/services/payment.service.ts` - API calls

### Backend:
- `backend/src/routes/payment.routes.ts` - Optional auth
- `backend/src/services/payment.service.ts` - Stripe integration
- `backend/src/services/order.service.ts` - Order creation

### Database:
- `backend/src/db/migrations/009_add_guest_fields_to_orders.sql` - Migration

---

## Next Steps

1. ✅ Run migration
2. ✅ Test guest checkout
3. ✅ Test authenticated checkout
4. 🔄 Add registration incentives (Day 3)
5. 🔄 Polish and launch (Day 4)

---

**Questions?** Check `DAY_2_GUEST_CHECKOUT_COMPLETE.md` for full details.
