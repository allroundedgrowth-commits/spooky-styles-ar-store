import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import orderService from '../services/order.service';
import { productService } from '../services/product.service';
import { Order, OrderWithItems } from '../types/order';
import { Product } from '../types/product';
import { useRealtimeOrder } from '../hooks/useRealtimeOrders';
import { OrderNotificationContainer } from '../components/Orders/OrderNotification';
import { Wifi, WifiOff } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentIntentId = searchParams.get('payment_intent');
  const orderId = searchParams.get('order_id');

  // Realtime order updates for this specific order
  const {
    order: realtimeOrder,
    notifications,
    isConnected,
    clearNotifications,
  } = useRealtimeOrder(orderId || '');

  /**
   * Update order status when Realtime updates arrive
   * Requirement 3.1: Update order status display in real-time
   */
  useEffect(() => {
    if (realtimeOrder && order) {
      setOrder((prevOrder) => {
        if (!prevOrder) return prevOrder;
        return {
          ...prevOrder,
          status: realtimeOrder.status,
          total: realtimeOrder.total,
          updated_at: new Date(realtimeOrder.updated_at),
        };
      });
    }
  }, [realtimeOrder, order]);

  /**
   * Handle notification dismissal
   */
  const handleDismissNotification = () => {
    clearNotifications();
  };

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderId && !paymentIntentId) {
        setError('No order information provided');
        setLoading(false);
        return;
      }

      try {
        // If we have orderId, fetch directly
        // Otherwise, we'll need to fetch orders and find by payment intent
        let orderData: OrderWithItems;
        
        if (orderId) {
          orderData = await orderService.getOrderById(orderId);
        } else if (paymentIntentId) {
          // Fetch all orders and find the one with matching payment intent
          const orders = await orderService.getOrders();
          const matchingOrder = orders.find((o: Order) => o.stripe_payment_intent_id === paymentIntentId);
          
          if (!matchingOrder) {
            // Order might not be created yet by webhook, wait and retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            const ordersRetry = await orderService.getOrders();
            const matchingOrderRetry = ordersRetry.find((o: Order) => o.stripe_payment_intent_id === paymentIntentId);
            
            if (!matchingOrderRetry) {
              setError('Order is being processed. Please check your account page in a moment.');
              setLoading(false);
              return;
            }
            
            orderData = await orderService.getOrderById(matchingOrderRetry.id);
          } else {
            orderData = await orderService.getOrderById(matchingOrder.id);
          }
        } else {
          setError('No order information provided');
          setLoading(false);
          return;
        }
        
        setOrder(orderData);

        // Load product details
        const productMap = new Map<string, Product>();
        const uniqueProductIds = [...new Set(orderData.items.map(item => item.product_id))];
        
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
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load order details');
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId, paymentIntentId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-halloween-orange mb-4"></div>
            <p className="text-halloween-purple">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Order Notifications */}
      <OrderNotificationContainer
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />

      {/* Success Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-halloween-orange mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-300 text-lg">
          Thank you for your purchase. Your spooky items are on their way!
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Order Details */}
        <div className="bg-halloween-darkPurple rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Order Details</h2>
            
            {/* Realtime Connection Status */}
            {orderId && (
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">Live Updates</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Offline</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p className="text-sm text-gray-400">Order Number</p>
              <p className="font-semibold text-white">{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Order Date</p>
              <p className="font-semibold text-white">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-halloween-orange capitalize">{order.status}</p>
                {isConnected && (
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live updates enabled" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="font-semibold text-white">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-halloween-darkPurple rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item) => {
              const product = products.get(item.product_id);
              return (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-halloween-purple last:border-0 last:pb-0"
                >
                  <div className="w-20 h-20 flex-shrink-0">
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
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-white">
                      {product?.name || 'Loading...'}
                    </h3>
                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                    {item.customizations.color && (
                      <p className="text-halloween-orange text-sm">
                        Color: {item.customizations.color}
                      </p>
                    )}
                    {item.customizations.accessories && item.customizations.accessories.length > 0 && (
                      <p className="text-halloween-orange text-sm">
                        Accessories: {item.customizations.accessories.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Tracking Info */}
        <div className="bg-halloween-darkPurple rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">What's Next?</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-halloween-orange flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <div>
                <p className="font-semibold text-white">Order Confirmation Email</p>
                <p className="text-sm">We've sent a confirmation email with your order details.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-halloween-orange flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <div>
                <p className="font-semibold text-white">Processing Your Order</p>
                <p className="text-sm">Your order is being prepared for shipment.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-halloween-orange flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-white">Track Your Order</p>
                <p className="text-sm">You can track your order status in your account page.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/account')}
            className="flex-1 py-3 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            View Order History
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 py-3 border border-halloween-purple text-white rounded-lg hover:bg-halloween-purple transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
