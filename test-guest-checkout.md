# 🧪 Guest Checkout Testing Guide

## Quick Test Steps

### 1. Run the Migration

```bash
cd backend
npm run build
node dist/db/run-guest-checkout-migration.js
```

### 2. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Test Guest Checkout Flow

#### Step 1: Add Product to Cart (No Login)
1. Go to http://localhost:3000
2. Click "Shop All Wigs"
3. Click on any product
4. Click "Add to Cart"
5. ✅ Verify: Cart icon shows item count

#### Step 2: View Cart
1. Click cart icon in header
2. ✅ Verify: Product appears in cart
3. ✅ Verify: Quantity and price correct
4. Click "Proceed to Checkout"

#### Step 3: Fill Shipping Information
1. ✅ Verify: Shipping form appears
2. Fill in all fields:
   - Email: test@example.com
   - Name: John Doe
   - Address: 123 Main St
   - City: New York
   - State: NY
   - ZIP: 10001

#### Step 4: Test Validation
1. Clear email field, try to submit
2. ✅ Verify: "Valid email is required" error shows
3. Enter invalid ZIP (123), try to submit
4. ✅ Verify: "Valid ZIP code is required" error shows
5. Fill all fields correctly

#### Step 5: Complete Payment
1. Enter test card: 4242 4242 4242 4242
2. Expiry: Any future date (12/25)
3. CVC: Any 3 digits (123)
4. Click "Complete Payment"
5. ✅ Verify: Processing indicator shows
6. ✅ Verify: Redirects to order confirmation

#### Step 6: Verify Order Created
1. Check order confirmation page
2. ✅ Verify: Order number displayed
3. Check database:
```sql
SELECT id, guest_email, guest_name, guest_address, total, status 
FROM orders 
WHERE guest_email = 'test@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```
4. ✅ Verify: Order exists with guest info

### 4. Test Authenticated Checkout

#### Step 1: Register/Login
1. Click "Account" in header
2. Register or login
3. ✅ Verify: Logged in successfully

#### Step 2: Add Product and Checkout
1. Add product to cart
2. Go to checkout
3. ✅ Verify: Shipping form still shows (will be pre-filled in future)
4. Fill form and complete payment
5. ✅ Verify: Order created with user_id

#### Step 3: Check Order History
1. Go to Account page
2. Click "Order History"
3. ✅ Verify: Order appears in history

---

## Test Cases

### ✅ Happy Path - Guest
- [ ] Add to cart without login
- [ ] Fill shipping form
- [ ] Complete payment
- [ ] Order created with guest info
- [ ] Cart cleared

### ✅ Happy Path - Authenticated
- [ ] Login
- [ ] Add to cart
- [ ] Complete checkout
- [ ] Order in history

### ❌ Error Cases
- [ ] Empty cart → Redirects to cart page
- [ ] Missing shipping info → Validation errors
- [ ] Invalid email → Error message
- [ ] Invalid ZIP → Error message
- [ ] Payment declined → Error message
- [ ] Network error → Retry option

### 🔒 Security
- [ ] Rate limiting works (try 10+ payment intents quickly)
- [ ] Guest info validated on backend
- [ ] SQL injection prevented (try `'; DROP TABLE orders; --` in name)
- [ ] XSS prevented (try `<script>alert('xss')</script>` in name)

---

## Expected Results

### Database - Guest Order:
```sql
id: uuid
user_id: NULL
guest_email: 'test@example.com'
guest_name: 'John Doe'
guest_address: {
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "US"
}
total: 89.99
status: 'processing'
```

### Database - Authenticated Order:
```sql
id: uuid
user_id: <user-uuid>
guest_email: NULL
guest_name: NULL
guest_address: NULL
total: 89.99
status: 'processing'
```

---

## Troubleshooting

### Cart not working?
```bash
# Check backend logs
cd backend
npm run dev

# Check if Redis is running
docker ps | grep redis
```

### Payment not processing?
```bash
# Check Stripe keys
cat backend/.env | grep STRIPE

# Check webhook endpoint
curl http://localhost:5000/api/payments/webhook
```

### Migration failed?
```bash
# Check database connection
cd backend
node dist/db/test-connection.js

# Run migration manually
psql -U spooky_user -d spooky_styles_db -f src/db/migrations/009_add_guest_fields_to_orders.sql
```

---

## Success Criteria

✅ Guest can complete purchase without account  
✅ All shipping fields validated  
✅ Order created with guest info  
✅ Cart cleared after order  
✅ Authenticated users still work  
✅ No TypeScript errors  
✅ No console errors  

---

**Status:** Ready for testing! 🚀
