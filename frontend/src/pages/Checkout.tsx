import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { paymentService } from '../services/payment.service';
import { productService } from '../services/product.service';
import { Product } from '../types/product';
import RegistrationIncentiveBanner from '../components/Checkout/RegistrationIncentiveBanner';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutForm: React.FC<{ clientSecret: string; onValidate: () => boolean }> = ({ onValidate }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate guest form first
    if (!onValidate()) {
      setErrorMessage('Please fill in all required shipping information');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful - navigate to confirmation page
        // The confirmation page will poll for the order to be created by webhook
        navigate(`/order-confirmation?payment_intent=${paymentIntent.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-halloween-darkPurple rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Payment Information</h3>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : 'Complete Payment'}
      </button>
    </form>
  );
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, fetchCart, getCartTotal } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  
  // Guest checkout form data
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateGuestForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!guestInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
      errors.email = 'Valid email is required';
    }
    if (!guestInfo.name || guestInfo.name.trim().length < 2) {
      errors.name = 'Full name is required';
    }
    if (!guestInfo.address || guestInfo.address.trim().length < 5) {
      errors.address = 'Street address is required';
    }
    if (!guestInfo.city || guestInfo.city.trim().length < 2) {
      errors.city = 'City is required';
    }
    if (!guestInfo.state || guestInfo.state.trim().length < 2) {
      errors.state = 'State is required';
    }
    if (!guestInfo.zipCode || !/^\d{5}(-\d{4})?$/.test(guestInfo.zipCode)) {
      errors.zipCode = 'Valid ZIP code is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // Fetch cart if not already loaded
        if (!cart) {
          await fetchCart();
        }

        // Check if cart is empty
        if (!cart?.items.length) {
          navigate('/cart');
          return;
        }

        // Load product details
        const productMap = new Map<string, Product>();
        const uniqueProductIds = [...new Set(cart.items.map(item => item.productId))];
        
        await Promise.all(
          uniqueProductIds.map(async (productId) => {
            try {
              const product = await productService.getProductById(productId);
              productMap.set(productId, product);
            } catch (err) {
              console.error(`Failed to load product ${productId}:`, err);
              // Continue even if product loading fails
            }
          })
        ).catch(err => {
          console.error('Error loading products:', err);
          // Continue even if some products fail to load
        });
        
        setProducts(productMap);

        // Calculate total amount in cents
        const totalAmount = Math.round(cart.items.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0) * 100); // Convert to cents

        // Create payment intent (guest info will be added when form is submitted)
        const paymentIntent = await paymentService.createPaymentIntent(totalAmount);
        setClientSecret(paymentIntent.clientSecret);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to initialize checkout');
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [cart, fetchCart, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-halloween-orange mb-4"></div>
            <p className="text-halloween-purple">Preparing checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-2 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-halloween-orange mb-8">Checkout</h1>

      {/* Registration Incentive Banner */}
      {!isAuthenticated && <RegistrationIncentiveBanner cartTotal={total} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-halloween-darkPurple rounded-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart?.items.map((item, index) => {
                const product = products.get(item.productId);
                return (
                  <div key={`${item.productId}-${index}`} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0">
                      {product ? (
                        <img
                          src={product.thumbnail_url}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-halloween-purple/20 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-halloween-purple/20 rounded animate-pulse" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-white font-semibold text-sm">
                        {product?.name || 'Loading...'}
                      </p>
                      <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                      {item.customizations.color && (
                        <p className="text-halloween-orange text-xs">
                          Color: {item.customizations.color}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-halloween-purple pt-4 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {isAuthenticated && (
                <>
                  <div className="flex justify-between text-halloween-green">
                    <span>Member Discount (5%)</span>
                    <span>-${(total * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-halloween-green">
                    <span>Member Shipping</span>
                    <span>FREE</span>
                  </div>
                </>
              )}
              
              {!isAuthenticated && (
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>$9.99</span>
                </div>
              )}
              
              <div className="flex justify-between text-xl font-bold text-white pt-2">
                <span>Total</span>
                <span className="text-halloween-orange">
                  ${isAuthenticated ? (total * 0.95).toFixed(2) : (total + 9.99).toFixed(2)}
                </span>
              </div>
              
              {isAuthenticated && (
                <div className="bg-halloween-green/10 border border-halloween-green rounded p-2 mt-2">
                  <p className="text-sm text-halloween-green text-center">
                    You're saving ${((total * 0.05) + 9.99).toFixed(2)} as a member! 🎉
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Checkout Forms */}
        <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
          {/* Guest Shipping Information */}
          <div className="bg-halloween-darkPurple rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                  placeholder="your@email.com"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                  placeholder="John Doe"
                />
                {formErrors.name && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={guestInfo.address}
                  onChange={(e) => setGuestInfo({ ...guestInfo, address: e.target.value })}
                  className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                  placeholder="123 Main St"
                />
                {formErrors.address && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={guestInfo.city}
                  onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value })}
                  className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                  placeholder="New York"
                />
                {formErrors.city && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={guestInfo.state}
                  onChange={(e) => setGuestInfo({ ...guestInfo, state: e.target.value })}
                  className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                  placeholder="NY"
                />
                {formErrors.state && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.state}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={guestInfo.zipCode}
                  onChange={(e) => setGuestInfo({ ...guestInfo, zipCode: e.target.value })}
                  className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple rounded-lg text-white focus:outline-none focus:border-halloween-orange"
                  placeholder="10001"
                />
                {formErrors.zipCode && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.zipCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#FF6B35',
                    colorBackground: '#3D0C4F',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <CheckoutForm clientSecret={clientSecret} onValidate={validateGuestForm} />
            </Elements>
          )}

          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
