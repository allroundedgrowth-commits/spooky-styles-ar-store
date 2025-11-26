# Complete Purchase & AR Test Guide

## ✅ Redis Status: ENABLED

Redis is now enabled and running on port 6379.

---

## 🧪 Test 1: Complete Guest Purchase Flow

### Step-by-Step Test:

1. **Open Store**
   ```
   http://localhost:3001
   ```

2. **Browse Products**
   - Click "Shop All Wigs" or go to http://localhost:3001/products
   - Verify all products display with images
   - Test filters (category, theme, price)
   - Test search functionality

3. **Select a Product**
   - Click any product card
   - Verify product detail page loads
   - Check price, description, images display
   - Note the product ID for AR testing

4. **Add to Cart**
   - Click "Add to Cart" button
   - Verify success message
   - Check cart icon shows item count (1)
   - Verify savings banner appears (green banner for guests)

5. **View Cart**
   - Click cart icon or go to http://localhost:3001/cart
   - Verify product appears with correct price
   - Test quantity update (increase/decrease)
   - Verify total updates correctly
   - Check savings banner shows: "Create an account to save 5% + FREE shipping!"

6. **Proceed to Checkout**
   - Click "Proceed to Checkout"
   - Verify checkout page loads
   - Check incentive banner appears: "Create Account & Save $X.XX"

7. **Fill Shipping Information** (Guest)
   - Email: test@example.com
   - Name: Test User
   - Address: 123 Test St
   - City: Test City
   - State: CA
   - ZIP: 12345
   - Phone: 555-1234

8. **Review Order Summary**
   - Verify subtotal correct
   - Verify shipping: $9.99
   - Verify tax calculated
   - Verify total correct

9. **Enter Payment** (Stripe Test Card)
   - Card: 4242 4242 4242 4242
   - Expiry: 12/34
   - CVC: 123
   - ZIP: 12345

10. **Complete Purchase**
    - Click "Place Order"
    - Wait for processing
    - Verify redirect to order confirmation
    - Check order number displays
    - Verify order details correct

11. **Verify Backend**
    ```bash
    # Check order was created
    curl http://localhost:5000/api/orders
    ```

### Expected Results:
- ✅ Order completes successfully
- ✅ Order confirmation page displays
- ✅ Order number shown
- ✅ Cart cleared after purchase
- ✅ Guest info saved in order

---

## 🧪 Test 2: Registered User Purchase (with Discount)

### Step-by-Step Test:

1. **Register Account**
   - Go to http://localhost:3001/account
   - Click "Register" tab
   - Fill form:
     - Name: Test User
     - Email: testuser@example.com
     - Password: Test1234!
   - Click "Register"
   - Verify login successful

2. **Add Product to Cart**
   - Browse products
   - Add item to cart
   - Verify savings banner is GREEN (registered user)
   - Text should say: "You're saving 5% + FREE shipping!"

3. **View Cart**
   - Go to cart
   - Verify savings banner shows benefits
   - Verify no incentive to register (already registered)

4. **Checkout**
   - Click "Proceed to Checkout"
   - Verify NO incentive banner (already registered)
   - Shipping info may be pre-filled

5. **Review Order Summary**
   - Verify subtotal
   - Verify 5% discount applied
   - Verify shipping: $0.00 (FREE)
   - Verify total is lower than guest

6. **Complete Payment**
   - Use test card: 4242 4242 4242 4242
   - Complete purchase

7. **Verify Order History**
   - Go to http://localhost:3001/account
   - Click "Order History" tab
   - Verify order appears
   - Check discount was applied

### Expected Results:
- ✅ 5% discount applied
- ✅ FREE shipping ($0.00)
- ✅ Order appears in history
- ✅ Savings banner shows benefits

---

## 🧪 Test 3: AR Try-On Flow

### Step-by-Step Test:

1. **Select Product with AR**
   - Go to http://localhost:3001/products
   - Click any wig product
   - Click "📸 Virtual Try-On" button

2. **AR Page Loads**
   - Verify AR page loads: http://localhost:3001/ar-tryon/:id
   - Check product info displays
   - Verify two options shown:
     - "📤 Upload Your Photo" (recommended)
     - "📷 Use Camera"

3. **Test Photo Upload**
   - Click "Upload Your Photo"
   - Select a photo from your computer
   - Verify photo loads in canvas
   - Verify wig overlays on photo

4. **Test Customization**
   - **Size Adjustment:**
     - Move "Size" slider
     - Verify wig scales up/down
   
   - **Position Adjustment:**
     - Move "Position" slider
     - Verify wig moves up/down
   
   - **Color Selection:**
     - Click different color circles
     - Verify wig color changes
     - Test at least 3 colors

5. **Test Screenshot**
   - Click "📷 Take Photo" button
   - Verify screenshot downloads
   - Check image quality

6. **Test Add to Cart from AR**
   - Customize wig (color, size, position)
   - Click "🛒 Add to Cart"
   - Verify success message
   - Verify redirect to cart
   - Check customization saved (color)

7. **Test Camera Mode** (Optional)
   - Click "📷 Switch to Camera"
   - Allow camera permissions
   - Verify camera feed shows
   - Test same customizations

### Expected Results:
- ✅ Photo upload works
- ✅ Wig overlays correctly
- ✅ Size adjustment works
- ✅ Position adjustment works
- ✅ Color changes work
- ✅ Screenshot captures
- ✅ Add to cart works
- ✅ Customization saved

---

## 🧪 Test 4: Mobile Responsiveness

### Test on Mobile or Resize Browser:

1. **Homepage** (< 768px width)
   - Verify mobile menu works
   - Check hero section responsive
   - Verify buttons accessible

2. **Products Page**
   - Verify grid adjusts (1-2 columns)
   - Check filters work on mobile
   - Verify cards stack properly

3. **Product Detail**
   - Verify images responsive
   - Check buttons accessible
   - Verify text readable

4. **Cart**
   - Verify items display correctly
   - Check quantity controls work
   - Verify totals visible

5. **Checkout**
   - Verify form fields accessible
   - Check payment form works
   - Verify buttons reachable

6. **AR Try-On**
   - Verify canvas responsive
   - Check controls accessible
   - Test photo upload on mobile
   - Test camera on mobile device

### Expected Results:
- ✅ All pages responsive
- ✅ No horizontal scroll
- ✅ Touch targets 44px+
- ✅ Text readable
- ✅ Forms usable

---

## 🧪 Test 5: Error Handling

### Test Error Scenarios:

1. **Invalid Email**
   - Try checkout with: "notanemail"
   - Verify error message

2. **Invalid ZIP**
   - Try checkout with: "abc"
   - Verify error message

3. **Declined Card**
   - Use card: 4000 0000 0000 0002
   - Verify error message
   - Verify order not created

4. **Out of Stock**
   - Find product with 0 stock
   - Verify "Out of Stock" shown
   - Verify can't add to cart

5. **Network Error**
   - Stop backend
   - Try to load products
   - Verify error message
   - Start backend again

### Expected Results:
- ✅ Clear error messages
- ✅ No crashes
- ✅ Graceful degradation

---

## 🧪 Test 6: Performance

### Check Performance:

1. **Page Load Times**
   - Homepage: < 3 seconds
   - Products: < 3 seconds
   - Product Detail: < 2 seconds
   - Cart: < 2 seconds
   - Checkout: < 3 seconds

2. **AR Performance**
   - AR initialization: < 5 seconds
   - Photo upload: < 2 seconds
   - Color change: < 300ms
   - Size adjustment: Real-time

3. **API Response Times**
   ```bash
   # Test API speed
   curl -w "@-" -o /dev/null -s http://localhost:5000/api/products <<'EOF'
   time_total: %{time_total}s
   EOF
   ```

### Expected Results:
- ✅ Fast page loads
- ✅ Smooth interactions
- ✅ No lag or jank

---

## 🧪 Test 7: Browser Compatibility

### Test in Multiple Browsers:

1. **Chrome** (latest)
   - Test all features
   - Check console for errors

2. **Firefox** (latest)
   - Test all features
   - Check console for errors

3. **Safari** (if available)
   - Test all features
   - Check console for errors

4. **Edge** (latest)
   - Test all features
   - Check console for errors

### Expected Results:
- ✅ Works in all browsers
- ✅ No console errors
- ✅ Consistent experience

---

## 📊 Test Results Checklist

### Guest Purchase Flow:
- [ ] Products display correctly
- [ ] Add to cart works
- [ ] Cart persists
- [ ] Savings banner shows
- [ ] Checkout form validates
- [ ] Payment processes
- [ ] Order confirmation displays
- [ ] Order created in database

### Registered User Flow:
- [ ] Registration works
- [ ] Login works
- [ ] 5% discount applied
- [ ] FREE shipping applied
- [ ] Order appears in history
- [ ] Savings banner shows benefits

### AR Try-On:
- [ ] Photo upload works
- [ ] Wig overlays correctly
- [ ] Size adjustment works
- [ ] Position adjustment works
- [ ] Color changes work
- [ ] Screenshot works
- [ ] Add to cart from AR works
- [ ] Camera mode works (optional)

### Mobile:
- [ ] Responsive on all pages
- [ ] Touch interactions work
- [ ] No horizontal scroll
- [ ] Forms usable

### Performance:
- [ ] Pages load quickly
- [ ] AR performs well
- [ ] No lag or jank
- [ ] Redis connected

### Errors:
- [ ] Validation works
- [ ] Error messages clear
- [ ] No crashes
- [ ] Graceful degradation

---

## 🚀 Quick Test Commands

### Check Services:
```bash
# Check Redis
docker exec spooky-styles-redis redis-cli ping

# Check PostgreSQL
docker exec spooky-styles-postgres pg_isready -U spooky_user

# Check backend
curl http://localhost:5000/api/products

# Check frontend
curl http://localhost:3001
```

### Check Database:
```bash
# Count products
docker exec spooky-styles-postgres psql -U spooky_user -d spooky_styles_db -c "SELECT COUNT(*) FROM products;"

# Check recent orders
docker exec spooky-styles-postgres psql -U spooky_user -d spooky_styles_db -c "SELECT id, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5;"
```

### Monitor Logs:
```bash
# Backend logs
docker logs -f spooky-styles-backend

# Redis logs
docker logs -f spooky-styles-redis
```

---

## ✅ Success Criteria

**All tests pass if:**
1. Guest can complete purchase
2. Registered user gets discount
3. AR try-on works with photo upload
4. Mobile experience is smooth
5. No critical errors
6. Performance is acceptable
7. Redis is connected

**Ready to launch if all checkboxes are checked!** 🎃🚀
