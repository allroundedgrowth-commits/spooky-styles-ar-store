# 🧪 Spooky Styles - Manual Testing Checklist

**Last Updated:** November 20, 2025  
**Purpose:** Verify all features are working before production launch

---

## 🏠 Homepage Tests

### Navigation
- [ ] Logo links to homepage
- [ ] All navigation menu items work (Home, Products, Inspirations, Cart, Account)
- [ ] Cart icon shows correct item count
- [ ] Mobile menu works (hamburger icon)

### Content
- [ ] Hero section displays correctly
- [ ] Featured products load
- [ ] Halloween decorations animate (ghosts, bats, cobwebs)
- [ ] Call-to-action buttons work
- [ ] Footer links work

---

## 🛍️ Products Page Tests

### Product Display
- [ ] All 32 products display correctly
- [ ] Product images load
- [ ] Product names and prices show
- [ ] "Add to Cart" buttons work
- [ ] Product cards are clickable

### Filters
- [ ] Theme filter works (witch, zombie, vampire, skeleton, ghost)
- [ ] Category filter works (Wigs, Hats, Masks, Accessories, Costumes)
- [ ] Product type filter works (All, Accessories Only, Main Products)
- [ ] Multiple filters can be combined
- [ ] Clear filters button works

### Search
- [ ] Search bar accepts input
- [ ] Search results update in real-time
- [ ] Search works with partial matches
- [ ] "No results" message shows when appropriate

---

## 📦 Product Detail Page Tests

### Product Information
- [ ] Product image displays
- [ ] Product name and price show
- [ ] Description displays
- [ ] Available colors show (if applicable)
- [ ] Stock status displays

### Actions
- [ ] Color selection works
- [ ] Quantity selector works
- [ ] "Add to Cart" button works
- [ ] "Try in AR" button works
- [ ] Back button returns to products page

---

## 🛒 Shopping Cart Tests

### Cart Display
- [ ] Cart items display correctly
- [ ] Product images show
- [ ] Quantities are correct
- [ ] Prices calculate correctly
- [ ] Subtotal is accurate

### Cart Actions
- [ ] Increase quantity button works
- [ ] Decrease quantity button works
- [ ] Remove item button works
- [ ] "Continue Shopping" button works
- [ ] "Proceed to Checkout" button works
- [ ] Empty cart message shows when cart is empty

---

## 💳 Checkout Tests

### Checkout Form
- [ ] Shipping address form displays
- [ ] All form fields are required
- [ ] Email validation works
- [ ] Phone number validation works
- [ ] Stripe payment form loads

### Payment
- [ ] Test card number works (4242 4242 4242 4242)
- [ ] Expiry date validation works
- [ ] CVC validation works
- [ ] "Place Order" button works
- [ ] Loading state shows during payment
- [ ] Error messages display for invalid cards

### Order Confirmation
- [ ] Redirects to order confirmation page
- [ ] Order number displays
- [ ] Order details are correct
- [ ] "View Order History" button works

---

## 👤 Account Page Tests

### Login
- [ ] Login form displays
- [ ] Email validation works
- [ ] Password validation works
- [ ] "Login" button works
- [ ] Error messages show for invalid credentials
- [ ] Success message shows on login
- [ ] Redirects to account page after login

### Registration
- [ ] "Register here" link works
- [ ] Registration form displays
- [ ] All fields are required
- [ ] Email format validation works
- [ ] Password strength validation works (8+ chars, uppercase, lowercase, number)
- [ ] "Register" button works
- [ ] Success message shows on registration
- [ ] Auto-login after registration

### Profile
- [ ] User name displays
- [ ] Email displays
- [ ] Profile information is correct
- [ ] "Edit Profile" button works (if implemented)

### Order History
- [ ] Past orders display
- [ ] Order details are correct
- [ ] Order status shows
- [ ] "View Details" button works

### Logout
- [ ] "Logout" button displays
- [ ] Logout button works
- [ ] Redirects to homepage after logout
- [ ] User is logged out (can't access protected pages)

---

## 🎭 AR Try-On Tests

### AR Initialization
- [ ] Camera permission request shows
- [ ] Camera feed displays
- [ ] Face detection works
- [ ] Tracking guidance shows

### AR Controls
- [ ] Product selector works
- [ ] Color picker works
- [ ] Accessory selector works
- [ ] Lighting adjustment works
- [ ] Screenshot button works

### AR Performance
- [ ] Frame rate is smooth (30+ FPS)
- [ ] Face tracking is accurate
- [ ] Wig renders correctly on face
- [ ] Colors change in real-time
- [ ] No lag or stuttering

### AR Sharing
- [ ] Screenshot captures correctly
- [ ] Share modal opens
- [ ] Social media buttons work
- [ ] Download button works

---

## 🎨 Inspirations Page Tests

### Gallery Display
- [ ] Inspiration cards display
- [ ] Images load correctly
- [ ] Titles and descriptions show
- [ ] "View Details" button works

### Inspiration Details
- [ ] Detail page displays
- [ ] Full description shows
- [ ] Related products display
- [ ] "Add to Cart" buttons work
- [ ] Back button works

---

## 👨‍💼 Admin Dashboard Tests

### Admin Access
- [ ] Admin login works (admin@spookystyles.com / Admin123!)
- [ ] Non-admin users can't access admin pages
- [ ] Admin menu shows in header

### Product Management
- [ ] Product list displays all products
- [ ] "Add Product" button works
- [ ] Product form displays
- [ ] All form fields work
- [ ] Image upload works (if implemented)
- [ ] "Save Product" button works
- [ ] "Edit" button works
- [ ] "Delete" button works
- [ ] Delete confirmation dialog shows

### Low Stock Alerts
- [ ] Low stock products display
- [ ] Stock counts are accurate
- [ ] Alert threshold works

### Analytics Dashboard
- [ ] Analytics page loads (http://localhost:3001/admin/analytics)
- [ ] Key metrics display (views, visitors, revenue, conversions)
- [ ] Conversion funnel shows
- [ ] Error rate displays
- [ ] Performance metrics show
- [ ] Top pages list displays
- [ ] Top events list displays
- [ ] Time range selector works (24h, 7d, 30d, 90d)

---

## 🔒 Security Tests

### Authentication
- [ ] Protected routes redirect to login
- [ ] JWT token is stored in localStorage
- [ ] Token is sent with API requests
- [ ] Invalid token logs user out
- [ ] Session persists on page refresh

### Authorization
- [ ] Admin routes require admin role
- [ ] Non-admin users can't access admin endpoints
- [ ] Users can only see their own orders
- [ ] Users can only modify their own cart

### Rate Limiting
- [ ] Too many login attempts show error
- [ ] Rate limit resets after time window
- [ ] Rate limit doesn't block normal usage

---

## 🎃 Halloween Theme Tests

### Visual Elements
- [ ] Halloween colors display correctly (orange, purple, black)
- [ ] Spooky fonts load
- [ ] Decorations animate smoothly
- [ ] Hover effects work
- [ ] Transitions are smooth

### Animations
- [ ] Floating ghosts animate
- [ ] Bats fly across screen
- [ ] Cobwebs display in corners
- [ ] Page transitions work
- [ ] Loading spinners show (pumpkin)

### Sounds (if implemented)
- [ ] Background music plays
- [ ] Sound effects work
- [ ] Mute button works
- [ ] Volume control works

---

## 📱 Responsive Design Tests

### Mobile (< 768px)
- [ ] Layout adapts to mobile
- [ ] Navigation menu collapses
- [ ] Images scale correctly
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] Forms work on mobile
- [ ] AR works on mobile

### Tablet (768px - 1024px)
- [ ] Layout adapts to tablet
- [ ] Grid layouts adjust
- [ ] Images scale correctly
- [ ] Navigation works

### Desktop (> 1024px)
- [ ] Full layout displays
- [ ] Sidebar filters show
- [ ] Multi-column grids work
- [ ] Hover effects work

---

## ⚡ Performance Tests

### Page Load
- [ ] Homepage loads in < 3 seconds
- [ ] Products page loads in < 3 seconds
- [ ] Images lazy load
- [ ] Code splitting works
- [ ] Service worker caches assets

### API Performance
- [ ] API responses in < 500ms
- [ ] No unnecessary API calls
- [ ] Loading states show during API calls
- [ ] Error states show on API failures

### AR Performance
- [ ] AR initializes in < 5 seconds
- [ ] Face tracking runs at 30+ FPS
- [ ] 3D models load progressively
- [ ] No memory leaks during long sessions

---

## 🐛 Error Handling Tests

### Network Errors
- [ ] Offline message shows when no internet
- [ ] Retry button works
- [ ] Graceful degradation

### API Errors
- [ ] 404 errors show appropriate message
- [ ] 500 errors show appropriate message
- [ ] Validation errors show field-specific messages
- [ ] Error messages are user-friendly

### Form Errors
- [ ] Required field errors show
- [ ] Format validation errors show
- [ ] Error messages clear on correction
- [ ] Submit button disabled during submission

---

## 🔄 Integration Tests

### Complete Purchase Flow
1. [ ] Browse products
2. [ ] Add item to cart
3. [ ] View cart
4. [ ] Proceed to checkout
5. [ ] Fill shipping info
6. [ ] Enter payment details
7. [ ] Place order
8. [ ] View order confirmation
9. [ ] Check order in history

### Complete AR Flow
1. [ ] Go to AR try-on
2. [ ] Allow camera access
3. [ ] Select product
4. [ ] Try on wig
5. [ ] Change colors
6. [ ] Add accessories
7. [ ] Take screenshot
8. [ ] Share on social media
9. [ ] Add to cart from AR

---

## ✅ Testing Summary

**Total Tests:** ~150+  
**Critical Tests:** ~50  
**Nice-to-Have Tests:** ~100

### Priority Levels
- 🔴 **Critical:** Must work for launch (auth, checkout, payment)
- 🟡 **Important:** Should work for good UX (filters, search, AR)
- 🟢 **Nice-to-Have:** Can be fixed post-launch (animations, sounds)

---

## 📝 Bug Report Template

When you find a bug, document it like this:

```
**Bug:** [Short description]
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error...

**Expected:** [What should happen]
**Actual:** [What actually happens]
**Browser:** Chrome / Firefox / Safari
**Device:** Desktop / Mobile / Tablet
**Screenshot:** [If applicable]
```

---

**Testing Status:** ⏳ In Progress  
**Last Tested:** November 20, 2025  
**Tested By:** [Your Name]
