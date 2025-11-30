# Stripe Test Card Numbers

## For Testing Payments in Development

### ✅ Successful Payment
**Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)
- **Result:** Payment succeeds

### 🔄 3D Secure Authentication Required
**Card Number:** `4000 0027 6000 3184`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Result:** Requires 3D Secure authentication (test modal will appear)

### ❌ Payment Declined
**Card Number:** `4000 0000 0000 0002`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Result:** Payment declined (generic decline)

### 💰 Insufficient Funds
**Card Number:** `4000 0000 0000 9995`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Result:** Payment declined (insufficient funds)

### 🚫 Card Expired
**Card Number:** `4000 0000 0000 0069`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Result:** Payment declined (expired card)

### 🔒 CVC Check Fails
**Card Number:** `4000 0000 0000 0127`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Result:** Payment declined (incorrect CVC)

## International Cards

### 🇬🇧 UK Card (Visa)
**Card Number:** `4000 0082 6000 0000`
- **Country:** United Kingdom
- **Result:** Payment succeeds

### 🇨🇦 Canadian Card (Visa)
**Card Number:** `4000 0012 4000 0000`
- **Country:** Canada
- **Result:** Payment succeeds

### 🇦🇺 Australian Card (Visa)
**Card Number:** `4000 0003 6000 0006`
- **Country:** Australia
- **Result:** Payment succeeds

## Other Card Brands

### Mastercard (Success)
**Card Number:** `5555 5555 5555 4444`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Result:** Payment succeeds

### American Express (Success)
**Card Number:** `3782 822463 10005`
- **Expiry:** Any future date
- **CVC:** Any 4 digits
- **Result:** Payment succeeds

### Discover (Success)
**Card Number:** `6011 1111 1111 1117`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Result:** Payment succeeds

### Diners Club (Success)
**Card Number:** `3056 9300 0902 0004`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Result:** Payment succeeds

## Quick Reference

### Most Common for Testing

| Purpose | Card Number | Result |
|---------|-------------|--------|
| ✅ Success | `4242 4242 4242 4242` | Payment succeeds |
| ❌ Decline | `4000 0000 0000 0002` | Generic decline |
| 💰 No Funds | `4000 0000 0000 9995` | Insufficient funds |
| 🔄 3D Secure | `4000 0027 6000 3184` | Requires authentication |

## How to Use

1. **Go to Checkout Page**
   - Add items to cart
   - Click "Proceed to Checkout"

2. **Fill in Guest Information**
   - Email: any@email.com
   - Name: Test User
   - Address: 123 Test St
   - City: Test City
   - State: TS
   - ZIP: 12345

3. **Enter Card Details**
   - Use one of the test card numbers above
   - Enter any future expiry date
   - Enter any CVC code
   - Enter any ZIP code

4. **Complete Payment**
   - Click "Complete Payment"
   - Wait for processing
   - Should redirect to order confirmation

## Important Notes

⚠️ **These cards ONLY work in test mode!**
- Your Stripe account must be in test mode
- Test keys must be used (starts with `pk_test_` and `sk_test_`)
- Real money is never charged

✅ **What Happens:**
- Payment intent is created
- Stripe processes the test payment
- Webhook receives payment.succeeded event
- Order is created in database
- User sees order confirmation

🔒 **Security:**
- Test cards cannot be used in production
- Production requires real card numbers
- Always use test mode for development

## Troubleshooting

### Payment Not Processing
- Check that Stripe test keys are configured
- Verify backend is running
- Check browser console for errors
- Ensure webhook endpoint is accessible

### Order Not Created
- Check backend logs for webhook errors
- Verify webhook signature is correct
- Ensure database is accessible
- Check that order service is working

### 3D Secure Modal Not Appearing
- This is normal for most test cards
- Use `4000 0027 6000 3184` to test 3D Secure
- Modal should appear automatically

## Testing Checklist

- [ ] Test successful payment with `4242 4242 4242 4242`
- [ ] Test declined payment with `4000 0000 0000 0002`
- [ ] Test insufficient funds with `4000 0000 0000 9995`
- [ ] Verify order is created in database
- [ ] Check order confirmation page displays
- [ ] Verify cart is cleared after purchase
- [ ] Test with different card brands (Mastercard, Amex)
- [ ] Test 3D Secure flow

## More Information

For complete list of test cards, visit:
https://stripe.com/docs/testing

---

**Current Setup:**
- Stripe Test Mode: ✅ Enabled
- Test Publishable Key: Configured in `frontend/.env`
- Test Secret Key: Configured in `backend/.env`
