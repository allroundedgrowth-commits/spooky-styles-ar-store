import { supabase } from '../config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Order } from '../types/order';

/**
 * Order update payload from Realtime subscription
 */
export interface OrderUpdate {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  updated_at: string;
}

/**
 * Callback function for order updates
 */
export type OrderUpdateCallback = (update: OrderUpdate) => void;

/**
 * Realtime Orders Service
 * 
 * Manages Realtime subscriptions for order status updates.
 * Allows clients to subscribe to order changes with automatic RLS filtering.
 * Only users who own orders will receive updates for those orders.
 * 
 * Requirements: 3.1, 3.2
 */
class RealtimeOrdersService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Set JWT token for RLS authentication
   * Must be called before subscribing to ensure RLS policies are enforced
   * 
   * @param jwtToken - JWT access token from authentication
   * 
   * Requirement 3.2: THE Supabase SHALL filter Realtime order updates to only notify the user who owns the order
   */
  setAuthToken(jwtToken: string): void {
    // Set the JWT token in Supabase client for RLS enforcement
    supabase.auth.setSession({
      access_token: jwtToken,
      refresh_token: '', // Not needed for RLS
    } as any);
  }

  /**
   * Subscribe to order updates for the authenticated user
   * RLS policies automatically filter to only show user's own orders
   * 
   * @param userId - The user ID (for logging/debugging purposes)
   * @param callback - Function called when order status changes
   * @returns Unsubscribe function
   * 
   * Requirement 3.1: WHEN an order status changes, THE Supabase SHALL send a Realtime notification
   * Requirement 3.2: THE Supabase SHALL filter Realtime order updates to only notify the user who owns the order
   * Requirement 3.3: WHEN a user views their order history, THE Supabase SHALL subscribe to updates for all their orders
   */
  subscribeToUserOrders(
    userId: string,
    callback: OrderUpdateCallback
  ): () => void {
    const channelName = `user-orders-${userId}`;

    // Reuse existing channel if available
    if (this.channels.has(channelName)) {
      console.log(`Reusing existing channel for user ${userId} orders`);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          // RLS policy automatically filters to user's orders
        },
        (payload) => {
          const update: OrderUpdate = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            status: payload.new.status,
            total: payload.new.total,
            updated_at: payload.new.updated_at,
          };
          callback(update);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to user ${userId} order updates`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Failed to subscribe to user ${userId} orders`);
        }
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to updates for a single order
   * RLS policies ensure user can only receive updates for their own orders
   * 
   * @param orderId - The order ID to monitor
   * @param callback - Function called when order status changes
   * @returns Unsubscribe function
   * 
   * Requirement 3.1: WHEN an order status changes, THE Supabase SHALL send a Realtime notification
   * Requirement 3.2: THE Supabase SHALL filter Realtime order updates to only notify the user who owns the order
   */
  subscribeToOrder(
    orderId: string,
    callback: OrderUpdateCallback
  ): () => void {
    const channelName = `order-${orderId}`;

    // Reuse existing channel if available
    if (this.channels.has(channelName)) {
      console.log(`Reusing existing channel for order ${orderId}`);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const update: OrderUpdate = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            status: payload.new.status,
            total: payload.new.total,
            updated_at: payload.new.updated_at,
          };
          callback(update);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to order ${orderId} updates`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Failed to subscribe to order ${orderId}`);
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
   * Requirement 3.4: THE Supabase SHALL unsubscribe from Realtime channels when the user navigates away
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
   * 
   * Requirement 3.4: THE Supabase SHALL unsubscribe from Realtime channels when the user navigates away
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
export const realtimeOrdersService = new RealtimeOrdersService();

export default realtimeOrdersService;
