import React from 'react';
import { 
  useCartStore, 
  useUserStore, 
  useARSessionStore, 
  useProductFilterStore 
} from '../store';

/**
 * Example component demonstrating usage of all Zustand stores
 */
export const StoreUsageExample: React.FC = () => {
  // Cart Store
  const { cart, getCartTotal, getCartItemCount } = useCartStore();
  
  // User Store
  const { user, isAuthenticated } = useUserStore();
  
  // AR Session Store
  const { currentProduct, customization, isActive } = useARSessionStore();
  
  // Product Filter Store
  const { filters, getActiveFilterCount } = useProductFilterStore();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Store Usage Example</h1>
      
      {/* Cart Store Example */}
      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold">Cart Store</h2>
        <p>Items in cart: {getCartItemCount()}</p>
        <p>Cart total: ${getCartTotal().toFixed(2)}</p>
        <p>Cart items: {cart?.items.length || 0}</p>
      </div>
      
      {/* User Store Example */}
      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold">User Store</h2>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user?.name || 'Not logged in'}</p>
      </div>
      
      {/* AR Session Store Example */}
      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold">AR Session Store</h2>
        <p>Session active: {isActive ? 'Yes' : 'No'}</p>
        <p>Current product: {currentProduct?.name || 'None'}</p>
        <p>Selected color: {customization.selectedColorName || 'None'}</p>
        <p>Accessories: {customization.accessories.length}</p>
      </div>
      
      {/* Product Filter Store Example */}
      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold">Product Filter Store</h2>
        <p>Active filters: {getActiveFilterCount()}</p>
        <p>Category: {filters.category || 'All'}</p>
        <p>Theme: {filters.theme || 'All'}</p>
        <p>Search: {filters.search || 'None'}</p>
      </div>
    </div>
  );
};
