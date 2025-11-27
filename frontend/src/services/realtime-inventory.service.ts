import { supabase } from '../config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Product update payload from Realtime subscription
 */
export interface ProductUpdate {
  id: string;
  stock_quantity: number;
  updated_at: string;
}

/**
 * Callback function for product updates
 */
export type ProductUpdateCallback = (update: ProductUpdate) => void;

/**
 * Realtime Inventory Service
 * 
 * Manages Realtime subscriptions for product inventory updates.
 * Allows clients to subscribe to stock changes for individual products
 * or all products in the catalog.
 * 
 * Requirements: 2.1, 2.2
 */
class RealtimeInventoryService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to stock updates for a single product
   * 
   * @param productId - The product ID to monitor
   * @param callback - Function called when stock changes
   * @returns Unsubscribe function
   * 
   * Requirement 2.1: WHEN product stock levels change, THE Supabase SHALL broadcast updates
   * Requirement 2.3: WHEN a user views a product detail page, THE Supabase SHALL establish a Realtime connection
   */
  subscribeToProduct(
    productId: string,
    callback: ProductUpdateCallback
  ): () => void {
    const channelName = `product-${productId}`;

    // Reuse existing channel if available
    if (this.channels.has(channelName)) {
      console.log(`Reusing existing channel for product ${productId}`);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          const update: ProductUpdate = {
            id: payload.new.id,
            stock_quantity: payload.new.stock_quantity,
            updated_at: payload.new.updated_at,
          };
          callback(update);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to product ${productId} inventory updates`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Failed to subscribe to product ${productId}`);
        }
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to stock updates for all products
   * 
   * @param callback - Function called when any product stock changes
   * @returns Unsubscribe function
   * 
   * Requirement 2.1: WHEN product stock levels change, THE Supabase SHALL broadcast updates
   * Requirement 2.5: WHEN multiple users view the same product, THE Supabase SHALL efficiently broadcast updates
   */
  subscribeToAllProducts(callback: ProductUpdateCallback): () => void {
    const channelName = 'all-products';

    // Reuse existing channel if available
    if (this.channels.has(channelName)) {
      console.log('Reusing existing channel for all products');
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          const update: ProductUpdate = {
            id: payload.new.id,
            stock_quantity: payload.new.stock_quantity,
            updated_at: payload.new.updated_at,
          };
          callback(update);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to all products inventory updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to all products');
        }
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Unsubscribe from a Realtime channel
   * 
   * @param channelName - Name of the channel to unsubscribe from
   * 
   * Requirement 2.4: THE Supabase SHALL automatically reconnect Realtime subscriptions if the connection is lost
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
      console.log(`Unsubscribed from channel: ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all active channels
   * Call this on app unmount or logout
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      channel.unsubscribe();
      console.log(`Unsubscribed from channel: ${name}`);
    });
    this.channels.clear();
  }

  /**
   * Get the number of active subscriptions
   */
  getActiveSubscriptionCount(): number {
    return this.channels.size;
  }

  /**
   * Check if a specific channel is active
   */
  isSubscribed(channelName: string): boolean {
    return this.channels.has(channelName);
  }
}

// Export singleton instance
export const realtimeInventoryService = new RealtimeInventoryService();

export default realtimeInventoryService;
