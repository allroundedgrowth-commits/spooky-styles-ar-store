import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { productService } from '../services/product.service';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import SavingsBanner from '../components/Cart/SavingsBanner';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, loading, error, fetchCart, updateItemQuantity, removeItem, getCartTotal } = useCartStore();
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ productId: string; customizations: CartItem['customizations'] } | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!cart?.items.length) return;
      
      setLoadingProducts(true);
      try {
        const productMap = new Map<string, Product>();
        const uniqueProductIds = [...new Set(cart.items.map(item => item.productId))];
        
        await Promise.all(
          uniqueProductIds.map(async (productId) => {
            try {
              const product = await productService.getProductById(productId);
              productMap.set(productId, product);
            } catch (err) {
              console.error(`Failed to load product ${productId}:`, err);
            }
          })
        );
        
        setProducts(productMap);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [cart?.items]);

  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateItemQuantity(item.productId, newQuantity, item.customizations);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveItem = async (productId: string, customizations: CartItem['customizations']) => {
    try {
      await removeItem(productId, customizations);
      setItemToRemove(null);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && !cart) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-halloween-orange mb-4"></div>
            <p className="text-halloween-purple">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => fetchCart()}
            className="mt-4 px-6 py-2 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = !cart?.items.length;
  const total = getCartTotal();

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-halloween-orange mb-8">Shopping Cart</h1>
        <div className="bg-halloween-darkPurple rounded-lg p-12 text-center">
          <svg
            className="w-24 h-24 mx-auto mb-6 text-halloween-purple opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">
            Start adding some spooky items to your cart!
          </p>
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-3 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold blood-drip-orange"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-halloween-orange mb-8">Shopping Cart</h1>

      {/* Savings Banner */}
      <SavingsBanner cartTotal={total} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, index) => {
            const product = products.get(item.productId);
            
            return (
              <div
                key={`${item.productId}-${index}`}
                className="bg-halloween-darkPurple rounded-lg p-6 flex flex-col sm:flex-row gap-4"
              >
                {/* Product Image */}
                <div className="w-full sm:w-32 h-32 flex-shrink-0">
                  {product ? (
                    <img
                      src={product.thumbnail_url}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-halloween-purple/20 rounded-lg animate-pulse" />
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {product?.name || 'Loading...'}
                  </h3>
                  
                  {/* Customizations */}
                  {(item.customizations.color || item.customizations.accessories?.length) && (
                    <div className="text-sm text-gray-400 mb-2 space-y-1">
                      {item.customizations.color && (
                        <p>Color: <span className="text-halloween-orange">{item.customizations.color}</span></p>
                      )}
                      {item.customizations.accessories && item.customizations.accessories.length > 0 && (
                        <p>Accessories: <span className="text-halloween-orange">{item.customizations.accessories.join(', ')}</span></p>
                      )}
                    </div>
                  )}

                  <p className="text-2xl font-bold text-halloween-orange mb-4">
                    ${Number(item.price).toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-halloween-purple rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                        className="px-3 py-1 text-white hover:bg-halloween-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-white font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        disabled={loading}
                        className="px-3 py-1 text-white hover:bg-halloween-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => setItemToRemove({ productId: item.productId, customizations: item.customizations })}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">Subtotal</p>
                  <p className="text-xl font-bold text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-halloween-darkPurple rounded-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-halloween-purple pt-3 flex justify-between text-xl font-bold text-white">
                <span>Total</span>
                <span className="text-halloween-orange">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || loadingProducts}
              className="w-full py-3 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed blood-drip-orange glow-hover"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate('/products')}
              className="w-full mt-3 py-3 border border-halloween-purple text-white rounded-lg hover:bg-halloween-purple transition-colors blood-drip-button"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {itemToRemove && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-halloween-darkPurple rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Remove Item?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove this item from your cart?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRemoveItem(itemToRemove.productId, itemToRemove.customizations)}
                disabled={loading}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 blood-drip-orange"
              >
                Remove
              </button>
              <button
                onClick={() => setItemToRemove(null)}
                disabled={loading}
                className="flex-1 py-2 border border-halloween-purple text-white rounded-lg hover:bg-halloween-purple transition-colors blood-drip-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
