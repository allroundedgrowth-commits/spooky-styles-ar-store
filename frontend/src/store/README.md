# Zustand State Management

This directory contains all Zustand stores for the Spooky Styles AR Store application. Each store manages a specific domain of application state.

## Stores Overview

### 1. Cart Store (`cartStore.ts`)

Manages shopping cart state with persistence to localStorage.

**Features:**
- Add, update, remove items from cart
- Calculate cart totals and item counts
- Persist cart data to localStorage
- Handle loading and error states
- Integration with backend cart API

**Key Methods:**
- `fetchCart()` - Load cart from backend
- `addItem(item)` - Add product to cart
- `updateItemQuantity(productId, quantity, customizations)` - Update item quantity
- `removeItem(productId, customizations)` - Remove item from cart
- `clearCart()` - Clear all items
- `getCartTotal()` - Calculate total price
- `getCartItemCount()` - Get total item count

**Persistence:**
Cart data is automatically persisted to localStorage under the key `spooky-styles-cart`. Only the cart items are persisted, not loading/error states.

**Usage Example:**
```typescript
import { useCartStore } from '@/store';

function CartComponent() {
  const { cart, addItem, getCartTotal } = useCartStore();
  
  const handleAddToCart = async () => {
    await addItem({
      productId: 'product-123',
      quantity: 1,
      customizations: { color: '#ff6600' }
    });
  };
  
  const total = getCartTotal();
  
  return <div>Total: ${total.toFixed(2)}</div>;
}
```

---

### 2. User Store (`userStore.ts`)

Manages user authentication state and profile information.

**Features:**
- Track authentication status
- Store user profile data
- Load user from backend
- Handle authentication errors

**Key Methods:**
- `setUser(user)` - Set current user
- `loadUser()` - Load user from backend
- `clearUser()` - Clear user state (logout)
- `setError(error)` - Set error message

**State:**
- `user` - Current user object or null
- `isAuthenticated` - Boolean authentication status
- `isLoading` - Loading state
- `error` - Error message if any

**Usage Example:**
```typescript
import { useUserStore } from '@/store';

function ProfileComponent() {
  const { user, isAuthenticated, loadUser } = useUserStore();
  
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.name}!</div>;
}
```

---

### 3. AR Session Store (`arSessionStore.ts`)

Manages active AR try-on session state including product, color customizations, and accessory layers.

**Features:**
- Track current product being tried on
- Manage color customization
- Handle up to 3 accessory layers
- Session lifecycle management

**Key Methods:**
- `loadProduct(product)` - Load product and reset customizations
- `selectColor(colorHex, colorName)` - Apply color customization
- `addAccessory(accessory)` - Add accessory to layer
- `removeAccessory(accessoryId)` - Remove accessory by ID
- `removeAccessoryByLayer(layer)` - Remove accessory by layer number
- `getAccessoryByLayer(layer)` - Get accessory at specific layer
- `getOccupiedLayers()` - Get list of occupied layer numbers
- `getAvailableLayers()` - Get list of available layer numbers (0-2)
- `resetCustomization()` - Clear all customizations
- `startSession()` - Start AR session
- `endSession()` - End session and clear state

**State:**
- `currentProduct` - Product being tried on
- `customization` - Color and accessory customizations
- `isActive` - Whether AR session is active

**Usage Example:**
```typescript
import { useARSessionStore } from '@/store';

function ARTryOnComponent() {
  const { 
    currentProduct, 
    customization, 
    loadProduct, 
    selectColor,
    addAccessory 
  } = useARSessionStore();
  
  const handleTryOn = (product: Product) => {
    loadProduct(product);
  };
  
  const handleColorChange = (hex: string, name: string) => {
    selectColor(hex, name);
  };
  
  return (
    <div>
      <h2>{currentProduct?.name}</h2>
      <p>Selected Color: {customization.selectedColorName}</p>
      <p>Accessories: {customization.accessories.length}</p>
    </div>
  );
}
```

---

### 4. Product Filter Store (`productFilterStore.ts`)

Manages product catalog filtering state.

**Features:**
- Filter by category, theme, and accessory type
- Search functionality
- Track active filter count
- Clear all filters

**Key Methods:**
- `setCategory(category)` - Set category filter
- `setTheme(theme)` - Set theme filter
- `setSearch(search)` - Set search query
- `setIsAccessory(isAccessory)` - Filter by accessory type
- `setFilters(filters)` - Set multiple filters at once
- `clearFilters()` - Clear all filters
- `getActiveFilterCount()` - Get count of active filters

**State:**
- `filters` - Current filter values
- `searchQuery` - Current search query string

**Usage Example:**
```typescript
import { useProductFilterStore } from '@/store';

function ProductFiltersComponent() {
  const { 
    filters, 
    setCategory, 
    setTheme, 
    clearFilters,
    getActiveFilterCount 
  } = useProductFilterStore();
  
  const activeCount = getActiveFilterCount();
  
  return (
    <div>
      <select onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="wigs">Wigs</option>
        <option value="accessories">Accessories</option>
      </select>
      
      <select onChange={(e) => setTheme(e.target.value)}>
        <option value="">All Themes</option>
        <option value="witch">Witch</option>
        <option value="zombie">Zombie</option>
      </select>
      
      <button onClick={clearFilters}>
        Clear Filters ({activeCount})
      </button>
    </div>
  );
}
```

---

## Store Architecture

All stores follow these principles:

1. **Type Safety**: Full TypeScript support with explicit interfaces
2. **Separation of Concerns**: Each store manages a specific domain
3. **Immutable Updates**: State updates use immutable patterns
4. **Computed Values**: Getter methods for derived state
5. **Error Handling**: Consistent error state management
6. **Performance**: Minimal re-renders through selective subscriptions

## Persistence Strategy

Only the cart store uses persistence middleware to maintain cart state across sessions. Other stores manage ephemeral session data that should not persist:

- **Cart Store**: Persisted to localStorage (cart items only)
- **User Store**: Not persisted (relies on JWT token)
- **AR Session Store**: Not persisted (session-specific)
- **Product Filter Store**: Not persisted (temporary UI state)

## Testing Stores

Stores can be tested by importing them directly:

```typescript
import { useCartStore } from '@/store';

describe('Cart Store', () => {
  it('should calculate cart total correctly', () => {
    const store = useCartStore.getState();
    // Test store methods
  });
});
```

## Requirements Coverage

This implementation satisfies the following requirements:

- **Requirement 4.1**: Cart persistence with customizations
- **Requirement 4.2**: Cart total calculation
- **Requirement 4.3**: Cart item management
- **Requirement 5.1**: User authentication state
- **Requirement 5.2**: User profile management

## Future Enhancements

Potential improvements for future iterations:

1. Add optimistic updates for better UX
2. Implement undo/redo for cart operations
3. Add middleware for analytics tracking
4. Implement state synchronization across tabs
5. Add devtools integration for debugging
