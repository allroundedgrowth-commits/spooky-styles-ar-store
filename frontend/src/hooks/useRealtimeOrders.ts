import { useState, useEffect, useCallback } from 'react';
import { realtimeOrdersService, OrderUpdate } from '../services/realtime-orders.service';
import authService from '../services/auth.service';

/**
 * Order notification for status changes
 */
export interface OrderNotification {
  orderId: string;
  oldStatus?: string;
  newStatus: string;
  timestamp: string;
  message: string;
}

/**
 * Hook return type
 */
interface UseRealtimeOrdersReturn {
  orders: Map<string, OrderUpdate>;
  notifications: OrderNotification[];
  isConnected: boolean;
  error: string | null;
  clearNotifications: () => void;
}

/**
 * Custom hook for subscribing to real-time order status updates
 * 
 * Automatically subscribes to order status changes on mount and
 * unsubscribes on unmount. Updates local state when Realtime updates arrive.
 * Generates user notifications for status changes.
 * 
 * @param userId - The user ID to monitor orders for
 * @param orderId - Optional specific order ID to monitor (if not provided, monitors all user orders)
 * @returns Object containing orders map, notifications, connection status, and error state
 * 
 * Requirements: 3.1, 3.3, 3.4, 3.5
 * 
 * @example
 * ```tsx
 * const { orders, notifications, isConnected } = useRealtimeOrders(userId);
 * 
 * return (
 *   <div>
 *     {notifications.map(notif => (
 *       <Toast key={notif.orderId}>{notif.message}</Toast>
 *     ))}
 *     <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
 *   </div>
 * );
 * ```
 */
export const useRealtimeOrders = (
  userId?: string,
  orderId?: string
): UseRealtimeOrdersReturn => {
  const [orders, setOrders] = useState<Map<string, OrderUpdate>>(new Map());
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Handle order update from Realtime subscription
   * Requirement 3.1: Subscribe to order status changes on mount
   * Requirement 3.3: Update orders list when Realtime updates arrive
   * Requirement 3.5: Generate user notifications for status changes
   */
  const handleOrderUpdate = useCallback(
    (update: OrderUpdate) => {
      // Get previous order state to detect status changes
      setOrders((prevOrders) => {
        const newOrders = new Map(prevOrders);
        const previousOrder = prevOrders.get(update.id);
        
        // Update orders map
        newOrders.set(update.id, update);

        // Generate notification if status changed
        if (previousOrder && previousOrder.status !== update.status) {
          const notification: OrderNotification = {
            orderId: update.id,
            oldStatus: previousOrder.status,
            newStatus: update.status,
            timestamp: update.updated_at,
            message: `Order #${update.id.slice(0, 8)} status changed to ${update.status}`,
          };

          setNotifications((prev) => [...prev, notification]);
        } else if (!previousOrder) {
          // First time seeing this order
          const notification: OrderNotification = {
            orderId: update.id,
            newStatus: update.status,
            timestamp: update.updated_at,
            message: `Order #${update.id.slice(0, 8)} is now ${update.status}`,
          };

          setNotifications((prev) => [...prev, notification]);
        }

        return newOrders;
      });

      setIsConnected(true);
      setError(null);
    },
    []
  );

  /**
   * Subscribe to Realtime updates on mount
   * Requirement 3.1: Set JWT token in Supabase client for RLS
   * Requirement 3.3: Subscribe to order status changes on mount
   * Requirement 3.4: Unsubscribe on component unmount
   */
  useEffect(() => {
    if (!userId) {
      return;
    }

    let unsubscribe: (() => void) | null = null;

    try {
      // Set JWT token for RLS authentication
      const token = authService.getToken();
      if (token) {
        realtimeOrdersService.setAuthToken(token);
      } else {
        throw new Error('No authentication token found');
      }

      // Subscribe to specific order or all user orders
      if (orderId) {
        unsubscribe = realtimeOrdersService.subscribeToOrder(
          orderId,
          handleOrderUpdate
        );
      } else {
        unsubscribe = realtimeOrdersService.subscribeToUserOrders(
          userId,
          handleOrderUpdate
        );
      }

      // Mark as connected after subscription
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Failed to subscribe to order updates:', err);
      setError(err instanceof Error ? err.message : 'Subscription failed');
      setIsConnected(false);
    }

    /**
     * Cleanup: Unsubscribe on component unmount
     * Requirement 3.4: Unsubscribe on component unmount
     */
    return () => {
      if (unsubscribe) {
        unsubscribe();
        setIsConnected(false);
      }
    };
  }, [userId, orderId, handleOrderUpdate]);

  /**
   * Monitor connection status
   * Requirement 3.5: Handle Realtime subscription errors gracefully
   */
  useEffect(() => {
    if (!userId) {
      return;
    }

    // Check if subscription is still active
    const checkConnection = () => {
      const channelName = orderId
        ? `order-${orderId}`
        : `user-orders-${userId}`;
      const isActive = realtimeOrdersService.isSubscribed(channelName);

      if (!isActive && isConnected) {
        setIsConnected(false);
        setError('Connection lost');
      }
    };

    // Check connection every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, [userId, orderId, isConnected]);

  return {
    orders,
    notifications,
    isConnected,
    error,
    clearNotifications,
  };
};

/**
 * Hook for monitoring a single order
 * Convenience wrapper around useRealtimeOrders for single order monitoring
 * 
 * @param orderId - The order ID to monitor
 * @returns Single order update and connection status
 * 
 * @example
 * ```tsx
 * const { order, isConnected } = useRealtimeOrder('order-123');
 * 
 * return (
 *   <div>
 *     <p>Status: {order?.status}</p>
 *   </div>
 * );
 * ```
 */
export const useRealtimeOrder = (orderId: string) => {
  const userId = 'current-user'; // This will be filtered by RLS anyway
  const { orders, notifications, isConnected, error, clearNotifications } =
    useRealtimeOrders(userId, orderId);

  const order = orders.get(orderId) || null;

  return {
    order,
    notifications,
    isConnected,
    error,
    clearNotifications,
  };
};

export default useRealtimeOrders;
