# 🗺️ Spooky Wigs - Site Map

```
🎃 SPOOKY WIGS STORE
│
├── 🏠 HOME (/)
│   ├── Hero Section
│   ├── Featured Products
│   ├── AR Try-On CTA
│   └── Quick Links
│
├── 👻 PRODUCTS (/products)
│   ├── Search Bar
│   ├── Category Filters
│   ├── Product Grid
│   └── → Product Detail (/products/:id)
│       ├── Image Gallery
│       ├── Product Info
│       ├── Color Selector
│       ├── Add to Cart Button
│       ├── Try in AR Button
│       └── Back to Products Button
│
├── 🎭 INSPIRATIONS (/inspirations)
│   ├── Costume Ideas Grid
│   ├── Style Gallery
│   └── → Inspiration Detail (/inspirations/:id)
│       ├── Full Description
│       ├── Product Links
│       └── Share Buttons
│
├── 📸 AR TRY-ON (/ar-tryon)
│   ├── Camera Access
│   ├── Product Selector
│   ├── Real-time Overlay
│   ├── Screenshot Button
│   └── Share Options
│
├── 🛒 CART (/cart)
│   ├── Cart Items List
│   ├── Quantity Controls
│   ├── Remove Items
│   ├── Total Calculator
│   ├── Continue Shopping Link
│   └── Proceed to Checkout Button
│
├── 💳 CHECKOUT (/checkout)
│   ├── Shipping Form
│   ├── Payment Form
│   ├── Order Review
│   ├── Back to Cart Link
│   └── → Order Confirmation (/order-confirmation)
│       ├── Success Message
│       ├── Order Details
│       └── Order Number
│
├── 👤 ACCOUNT (/account)
│   ├── Login Form
│   ├── Register Form
│   ├── Profile Section
│   ├── Order History
│   └── Logout Button
│
└── ⚙️ ADMIN (/admin) [Admin Only]
    ├── Products Tab
    │   ├── Product List
    │   ├── Add New Product Button
    │   ├── Edit Product
    │   └── Delete Product
    │
    ├── Stock Alerts Tab
    │   ├── Low Stock Warnings
    │   └── Quick Edit Links
    │
    └── Analytics Link → (/admin/analytics)
        ├── Back to Admin Button
        ├── Time Range Selector
        ├── Key Metrics Cards
        ├── Conversion Funnel
        ├── System Health
        ├── Top Pages
        └── Top Events
```

## 🧭 Navigation Flow

### Public User Journey
```
┌─────────┐
│  HOME   │
└────┬────┘
     │
     ├──→ PRODUCTS ──→ PRODUCT DETAIL ──→ ADD TO CART
     │                      │
     │                      └──→ TRY IN AR ──→ AR TRY-ON
     │
     ├──→ INSPIRATIONS ──→ GET IDEAS ──→ PRODUCTS
     │
     ├──→ AR TRY-ON ──→ SCREENSHOT ──→ SHARE
     │
     └──→ CART ──→ CHECKOUT ──→ ORDER CONFIRMATION
```

### Admin User Journey
```
┌─────────┐
│  LOGIN  │
└────┬────┘
     │
     └──→ ADMIN DASHBOARD
            │
            ├──→ PRODUCTS TAB
            │      ├──→ Add Product
            │      ├──→ Edit Product
            │      └──→ Delete Product
            │
            ├──→ STOCK ALERTS TAB
            │      └──→ View Low Stock
            │
            └──→ ANALYTICS
                   ├──→ View Metrics
                   ├──→ Conversion Funnel
                   └──→ System Health
```

## 📱 Header Menu Structure

```
┌─────────────────────────────────────────────────────────┐
│  🎃 Spooky Wigs                                         │
│                                                          │
│  Home | Wigs | Wig Styles | AR Try-On | 🛒 Cart | Account │
│                                                          │
│  [Admin Only: ⚙️ Admin]                                 │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Access Levels

### Public (No Login Required)
- ✅ Home
- ✅ Products
- ✅ Product Detail
- ✅ Inspirations
- ✅ AR Try-On
- ✅ Cart (view only)
- ✅ Account (login/register)

### Authenticated Users
- ✅ All public pages
- ✅ Cart (full functionality)
- ✅ Checkout
- ✅ Order History
- ✅ Profile Management

### Admin Users
- ✅ All authenticated pages
- ✅ Admin Dashboard
- ✅ Product Management
- ✅ Stock Alerts
- ✅ Analytics Dashboard

## 🎯 Quick Actions

### From Any Page
- **Go Home:** Click logo
- **Browse:** Click "Wigs"
- **Try AR:** Click "AR Try-On"
- **View Cart:** Click "🛒 Cart"
- **Login:** Click "Account"

### From Product Page
- **Add to Cart:** Orange button
- **Try in AR:** Purple button
- **Go Back:** "Back to Products"

### From Admin
- **Add Product:** "Add New Product"
- **View Analytics:** "Analytics" tab
- **Check Alerts:** "Stock Alerts" tab

## 📊 Page Hierarchy

```
Level 1: Main Pages (Header Links)
├── Home
├── Products
├── Inspirations
├── AR Try-On
├── Cart
└── Account

Level 2: Detail Pages
├── Product Detail
├── Inspiration Detail
├── Checkout
└── Order Confirmation

Level 3: Admin Pages
├── Admin Dashboard
└── Analytics Dashboard
```

## 🎨 Navigation Elements

### Always Visible
- Header (sticky top)
- Footer (bottom)
- Cart badge (item count)

### Contextual
- Back buttons (detail pages)
- Breadcrumbs (where applicable)
- Tab navigation (admin)
- Progress indicators (checkout)

### Interactive
- Hover effects (orange glow)
- Active states (orange underline)
- Loading states (pumpkin spinner)
- Success/Error messages

---

**Total Pages:** 12 main pages + detail pages
**Navigation Depth:** Maximum 3 levels
**Mobile Friendly:** ✅ Yes
**Admin Access:** ✅ Controlled
**User Experience:** ✅ Intuitive
