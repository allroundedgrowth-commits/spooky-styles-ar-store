import { useState, useEffect, useCallback } from 'react';
import { realtimeInventoryService, ProductUpdate } from '../services/realtime-inventory.service';

/**
 * Hook return type
 */
interface UseRealtimeInventoryReturn {
  stock: number | null;
  isConnected: boolean;
  lastUpdate: string | null;
  error: string | null;
}

/**
 * Custom hook for subscribing to real-time product inventory updates
 * 
 * Automatically subscribes to product stock changes on mount and
 * unsubscribes on unmount. Updates local state when Realtime updates arrive.
 * 
 * @param productId - The product ID to monitor (optional - if not provided, subscribes to all products)
 * @param initialStock - Initial stock value to display before first update
 * @returns Object containing current stock, connection status, last update time, and error state
 * 
 * Requirements: 2.1, 2.3, 2.4
 * 
 * @example
 * ```tsx
 * const { stock, isConnected, lastUpdate } = useRealtimeInventory('product-123', 10);
 * 
 * return (
 *   <div>
 *     <p>Stock: {stock ?? 'Loading...'}</p>
 *     <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
 *   </div>
 * );
 * ```
 */
export const useRealtimeInventory = (
  productId?: string,
  initialStock?: number
): UseRealtimeInventoryReturn => {
  const [stock, setStock] = useState<number | null>(initialStock ?? null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle product update from Realtime subscription
   * Requirement 2.1: Subscribe to product stock_quantity changes
   */
  const handleProductUpdate = useCallback(
    (update: ProductUpdate) => {
      // Only update if this is the product we're monitoring (or if we're monitoring all)
      if (!productId || update.id === productId) {
        setStock(update.stock_quantity);
        setLastUpdate(update.updated_at);
        setIsConnected(true);
        setError(null);
      }
    },
    [productId]
  );

  /**
   * Subscribe to Realtime updates on mount
   * Requirement 2.3: Subscribe to product stock_quantity changes on mount
   * Requirement 2.4: Handle connection status (connected/disconnected)
   */
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      // Subscribe to specific product or all products
      if (productId) {
        unsubscribe = realtimeInventoryService.subscribeToProduct(
          productId,
          handleProductUpdate
        );
      } else {
        unsubscribe = realtimeInventoryService.subscribeToAllProducts(
          handleProductUpdate
        );
      }

      // Mark as connected after subscription
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Failed to subscribe to inventory updates:', err);
      setError(err instanceof Error ? err.message : 'Subscription failed');
      setIsConnected(false);
    }

    /**
     * Cleanup: Unsubscribe on component unmount
     * Requirement 2.4: Unsubscribe on component unmount
     */
    return () => {
      if (unsubscribe) {
        unsubscribe();
        setIsConnected(false);
      }
    };
  }, [productId, handleProductUpdate]);

  /**
   * Monitor connection status
   * Requirement 2.4: Handle connection status (connected/disconnected)
   */
  useEffect(() => {
    // Check if subscription is still active
    const checkConnection = () => {
      const channelName = productId ? `product-${productId}` : 'all-products';
      const isActive = realtimeInventoryService.isSubscribed(channelName);
      
      if (!isActive && isConnected) {
        setIsConnected(false);
        setError('Connection lost');
      }
    };

    // Check connection every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, [productId, isConnected]);

  return {
    stock,
    isConnected,
    lastUpdate,
    error,
  };
};

/**
 * Hook for monitoring multiple products at once
 * 
 * @param productIds - Array of product IDs to monitor
 * @returns Map of product IDs to their stock levels
 * 
 * @example
 * ```tsx
 * const stockMap = useRealtimeInventoryMultiple(['prod-1', 'prod-2']);
 * 
 * return (
 *   <div>
 *     {Array.from(stockMap.entries()).map(([id, stock]) => (
 *       <p key={id}>{id}: {stock}</p>
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useRealtimeInventoryMultiple = (
  productIds: string[]
): Map<string, number> => {
  const [stockMap, setStockMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    productIds.forEach((productId) => {
      const unsubscribe = realtimeInventoryService.subscribeToProduct(
        productId,
        (update) => {
          setStockMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(update.id, update.stock_quantity);
            return newMap;
          });
        }
      );
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [productIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return stockMap;
};

export default useRealtimeInventory;
