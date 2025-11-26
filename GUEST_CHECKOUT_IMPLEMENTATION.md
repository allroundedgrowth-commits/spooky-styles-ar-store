# Guest Checkout Implementation Plan

## Problem
Currently, users must be logged in to add items to cart, which creates friction in the purchase flow.

## Solution
Implement guest checkout with registration incentives.

---

## Phase 1: Guest Cart (LocalStorage)

### Frontend Changes

#### 1. Update Cart Store (`frontend/src/store/cartStore.ts`)
```typescript
// Add guest cart management
const GUEST_CART_KEY = 'guest_cart';

interface GuestCartItem {
  productId: string;
  quantity: number;
  customizations?: {
    color?: string;
    accessories?: string[];
  };
  product?: Product; // Cache product details
}

// Add methods:
- loadGuestCart() - Load from localStorage
- saveGuestCart() - Save to localStorage
- mergeWithServerCart() - Merge guest cart with server cart on login
- isGuest() - Check if user is guest
```

#### 2. Update Cart Service (`frontend/src/services/cart.service.ts`)
```typescript
// Add guest cart API calls
class CartService {
  // Check if user is authenticated
  private isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Get cart (guest or authenticated)
  async getCart() {
    if (this.isAuthenticated()) {
      return this.getServerCart();
    } else {
      return this.getGuestCart();
    }
  }

  // Add item (guest or authenticated)
  async addItem(item) {
    if (this.isAuthenticated()) {
      return this.addToServerCart(item);
    } else {
      return this.addToGuestCart(item);
    }
  }

  // Guest cart methods
  private getGuestCart() { /* localStorage */ }
  private addToGuestCart(item) { /* localStorage */ }
  private updateGuestCart(item) { /* localStorage */ }
  private removeFromGuestCart(productId) { /* localStorage */ }
}
```

---

## Phase 2: Guest Checkout Flow

### Backend Changes

#### 1. Create Guest Order Endpoint (`backend/src/routes/order.routes.ts`)
```typescript
// New route for guest checkout
router.post('/guest', async (req, res) => {
  const { 
    items,  // Cart items
    guestInfo: {
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zipCode,
      country
    },
    paymentIntentId 
  } = req.body;

  // Validate guest info
  // Create order without user_id
  // Send confirmation email
  // Return order details
});
```

#### 2. Update Order Service (`backend/src/services/order.service.ts`)
```typescript
async createGuestOrder(guestInfo, items, paymentIntentId) {
  // Create order with guest_email instead of user_id
  // Store guest information
  // Calculate totals
  // Process payment
  // Send confirmation email
}
```

#### 3. Update Orders Table Migration
```sql
-- Add guest order support
ALTER TABLE orders ADD COLUMN guest_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN guest_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(50);
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add index for guest orders
CREATE INDEX idx_orders_guest_email ON orders(guest_email);
```

### Frontend Changes

#### 1. Update Checkout Page (`frontend/src/pages/Checkout.tsx`)
```typescript
// Add guest checkout form
const [checkoutMode, setCheckoutMode] = useState<'guest' | 'registered'>('guest');
const [guestInfo, setGuestInfo] = useState({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US'
});

// Show registration benefits
<RegistrationIncentiveBanner />

// Guest checkout form
if (checkoutMode === 'guest') {
  return <GuestCheckoutForm />;
}
```

#### 2. Create Guest Checkout Form Component
```typescript
// frontend/src/components/Checkout/GuestCheckoutForm.tsx
const GuestCheckoutForm = () => {
  return (
    <div>
      <h2>Checkout as Guest</h2>
      <p>Or <Link to="/account">create an account</Link> for benefits!</p>
      
      {/* Contact Information */}
      <input name="email" placeholder="Email" />
      <input name="phone" placeholder="Phone" />
      
      {/* Shipping Address */}
      <input name="firstName" placeholder="First Name" />
      <input name="lastName" placeholder="Last Name" />
      <input name="address" placeholder="Address" />
      <input name="city" placeholder="City" />
      <input name="state" placeholder="State" />
      <input name="zipCode" placeholder="ZIP Code" />
      
      {/* Payment */}
      <StripeElements />
      
      <button>Complete Order</button>
    </div>
  );
};
```

---

## Phase 3: Registration Incentives

### Backend Changes

#### 1. Add Discount System
```typescript
// backend/src/services/discount.service.ts
class DiscountService {
  // Calculate discount for registered users
  calculateRegisteredUserDiscount(subtotal: number): number {
    return subtotal * 0.05; // 5% discount
  }

  // Check if user gets free shipping
  hasFreeShipping(userId: string): boolean {
    // Registered users get free shipping
    return true;
  }
}
```

#### 2. Update Order Calculation
```typescript
// In order service
async calculateOrderTotal(userId, items, isGuest) {
  let subtotal = calculateSubtotal(items);
  let shipping = calculateShipping(items);
  let discount = 0;

  if (!isGuest) {
    // Registered user benefits
    discount = subtotal * 0.05; // 5% discount
    shipping = 0; // Free shipping
  }

  const total = subtotal + shipping - discount;
  
  return { subtotal, shipping, discount, total };
}
```

### Frontend Changes

#### 1. Create Registration Incentive Banner
```typescript
// frontend/src/components/Checkout/RegistrationIncentiveBanner.tsx
const RegistrationIncentiveBanner = () => {
  return (
    <div className="bg-gradient-to-r from-halloween-purple to-halloween-orange p-6 rounded-lg mb-6">
      <h3 className="text-2xl font-bold text-white mb-3">
        🎁 Create an Account & Save!
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚚</span>
          <div>
            <p className="font-semibold">FREE Shipping</p>
            <p className="text-sm opacity-90">On all orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <div>
            <p className="font-semibold">5% Discount</p>
            <p className="text-sm opacity-90">On every purchase</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">📦</span>
          <div>
            <p className="font-semibold">Order Tracking</p>
            <p className="text-sm opacity-90">Track your orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">⭐</span>
          <div>
            <p className="font-semibold">Exclusive Deals</p>
            <p className="text-sm opacity-90">Member-only offers</p>
          </div>
        </div>
      </div>
      <button className="mt-4 bg-white text-halloween-purple font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors">
        Create Free Account
      </button>
    </div>
  );
};
```

#### 2. Show Savings in Cart
```typescript
// frontend/src/pages/Cart.tsx
const CartSummary = ({ subtotal, isGuest }) => {
  const registeredDiscount = subtotal * 0.05;
  const shipping = isGuest ? 9.99 : 0;
  const discount = isGuest ? 0 : registeredDiscount;
  const total = subtotal + shipping - discount;

  return (
    <div>
      <div>Subtotal: ${subtotal.toFixed(2)}</div>
      <div>Shipping: {isGuest ? `$${shipping.toFixed(2)}` : 'FREE'}</div>
      {!isGuest && <div>Discount (5%): -${discount.toFixed(2)}</div>}
      <div>Total: ${total.toFixed(2)}</div>
      
      {isGuest && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm">
            💡 <strong>Save ${(registeredDiscount + shipping).toFixed(2)}</strong> by creating an account!
          </p>
          <Link to="/account" className="text-blue-600 underline">
            Sign up now
          </Link>
        </div>
      )}
    </div>
  );
};
```

---

## Phase 4: Cart Merge on Login

### Implementation
```typescript
// When user logs in, merge guest cart with server cart
async function mergeCartsOnLogin(userId: string) {
  const guestCart = getGuestCartFromLocalStorage();
  
  if (guestCart.length > 0) {
    // Add all guest cart items to server cart
    for (const item of guestCart) {
      await cartService.addItem(userId, item.productId, item.quantity, item.customizations);
    }
    
    // Clear guest cart
    clearGuestCartFromLocalStorage();
  }
}
```

---

## Implementation Order

### Week 1: Guest Cart
1. ✅ Update cart store for guest support
2. ✅ Implement localStorage cart management
3. ✅ Update cart service to handle guest/auth
4. ✅ Test add to cart without login

### Week 2: Guest Checkout
1. ✅ Update database schema for guest orders
2. ✅ Create guest order endpoint
3. ✅ Update checkout page for guest flow
4. ✅ Create guest checkout form
5. ✅ Test complete guest purchase

### Week 3: Registration Incentives
1. ✅ Implement discount calculation
2. ✅ Create incentive banner component
3. ✅ Show savings in cart
4. ✅ Update order totals with benefits
5. ✅ Test discount application

### Week 4: Polish & Testing
1. ✅ Implement cart merge on login
2. ✅ Add email confirmation for guest orders
3. ✅ Test all flows (guest, registered, merge)
4. ✅ Update documentation

---

## Benefits Summary

### For Guests:
- ✅ Shop without creating account
- ✅ Quick checkout process
- ✅ No password required
- ✅ Email confirmation

### For Registered Users:
- 🎁 **FREE shipping** on all orders
- 💰 **5% discount** on every purchase
- 📦 Order history and tracking
- ⭐ Exclusive member deals
- 🔄 Faster checkout (saved info)
- 💾 Saved cart across devices

### For Business:
- 📈 Reduced cart abandonment
- 👥 More conversions (lower friction)
- 💌 Email list growth
- 🎯 Incentive for registration
- 📊 Better customer data

---

## Quick Start (Immediate Fix)

To quickly enable guest cart without full implementation:

1. **Remove auth requirement from cart routes** (temporary)
2. **Use session-based cart** instead of user-based
3. **Show registration benefits** prominently
4. **Implement full solution** gradually

### Temporary Fix:
```typescript
// backend/src/routes/cart.routes.ts
// Comment out: router.use(authenticateToken);

// Use session ID instead of user ID
const cartId = req.session.id || req.user?.id;
```

---

## Testing Checklist

- [ ] Guest can add items to cart
- [ ] Guest can view cart
- [ ] Guest can update quantities
- [ ] Guest can remove items
- [ ] Guest can complete checkout
- [ ] Guest receives order confirmation
- [ ] Registered user gets 5% discount
- [ ] Registered user gets free shipping
- [ ] Cart merges correctly on login
- [ ] Cart persists in localStorage
- [ ] Incentive banner displays correctly
- [ ] Savings calculation is accurate

---

## Files to Modify

### Backend:
- `backend/src/routes/cart.routes.ts` - Remove auth requirement or add session support
- `backend/src/routes/order.routes.ts` - Add guest order endpoint
- `backend/src/services/cart.service.ts` - Add session-based cart
- `backend/src/services/order.service.ts` - Add guest order creation
- `backend/src/services/discount.service.ts` - NEW: Discount calculation
- `backend/src/db/migrations/008_guest_orders.sql` - NEW: Guest order support

### Frontend:
- `frontend/src/store/cartStore.ts` - Add guest cart management
- `frontend/src/services/cart.service.ts` - Add guest/auth detection
- `frontend/src/pages/Checkout.tsx` - Add guest checkout flow
- `frontend/src/pages/Cart.tsx` - Show savings for registration
- `frontend/src/components/Checkout/GuestCheckoutForm.tsx` - NEW
- `frontend/src/components/Checkout/RegistrationIncentiveBanner.tsx` - NEW
- `frontend/src/components/Checkout/SavingsCalculator.tsx` - NEW

---

**Estimated Time:** 2-3 weeks for full implementation  
**Priority:** HIGH (blocking user purchases)  
**Impact:** HIGH (increases conversions significantly)
