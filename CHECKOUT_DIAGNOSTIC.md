# Checkout Diagnostic Guide

## Current Status
✅ Backend checkout API is working correctly
✅ Cart functionality is working
✅ Payment intent creation is successful

## To Test Checkout in Browser

### Step 1: Add Items to Cart
1. Go to http://localhost:5173/products
2. Click on any product
3. Click "Add to Cart" button
4. Verify item appears in cart (check cart icon in header)

### Step 2: Go to Checkout
1. Click on cart icon or go to http://localhost:5173/cart
2. Click "Proceed to Checkout" button
3. You should be redirected to http://localhost:5173/checkout

### Step 3: Fill Shipping Information
Fill in the required fields:
- Email Address *
- Full Name *
- Street Address *
- City *
- State *
- ZIP Code *

### Step 4: Enter Payment Details
Use Stripe test card:
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

### Step 5: Complete Payment
Click "Complete Payment" button

## Common Issues & Solutions

### Issue 1: "Checkout page not loading"
**Symptoms:** Blank page or loading spinner forever
**Possible Causes:**
- Frontend not running
- Cart is empty
- API connection issue

**Solution:**
```bash
# Check if frontend is running
curl http://localhost:5173

# Check if backend is running
curl http://localhost:3000/api

# Restart frontend if needed
npm run dev --workspace=frontend
```

### Issue 2: "Payment form not appearing"
**Symptoms:** Shipping form shows but no payment form
**Possible Causes:**
- Stripe publishable key missing
- Payment intent creation failed

**Check:**
1. Open browser console (F12)
2. Look for errors related to Stripe or payment
3. Verify `VITE_STRIPE_PUBLISHABLE_KEY` in `frontend/.env`

### Issue 3: "Payment fails with error"
**Symptoms:** Error message after clicking "Complete Payment"
**Possible Causes:**
- Invalid shipping information
- Network error
- Backend payment processing issue

**Debug Steps:**
1. Open browser console (F12)
2. Check Network tab for failed requests
3. Look at the error message in the response

### Issue 4: "Order not created after payment"
**Symptoms:** Payment succeeds but no order confirmation
**Possible Causes:**
- `/payments/complete` endpoint failing
- Database connection issue

**Solution:**
Check backend logs:
```bash
docker logs spooky-styles-backend --tail 50
```

## Manual API Test

If you want to test the checkout API directly:

```bash
node test-checkout-flow.js
```

This will:
1. Add a product to cart
2. Calculate cart total
3. Create payment intent
4. Verify all endpoints are working

## Environment Variables

Ensure these are set in `frontend/.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Services Status

Check all services are running:
```bash
docker ps
```

Should show:
- ✅ spooky-styles-backend (port 3000)
- ✅ spooky-styles-postgres (port 5432)
- ✅ spooky-styles-redis (port 6379)

Frontend should be running on port 5173.

## What to Report

If checkout is still not working, please provide:
1. **Exact error message** you see on screen
2. **Browser console errors** (F12 → Console tab)
3. **Network errors** (F12 → Network tab, filter by "Fetch/XHR")
4. **Which step fails** (cart, checkout page load, payment form, payment submission)

This will help me identify the exact issue quickly.
