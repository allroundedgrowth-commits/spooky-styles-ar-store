/**
 * Realtime Connection Manager
 * 
 * Manages Supabase Realtime channel connections with connection pooling,
 * reuse of existing channels, and centralized cleanup.
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import {
  handleRealtimeError,
  createRealtimeError,
  ErrorHandlerCallbacks,
} from '../utils/realtime-error-handler';

export interface ChannelConfig {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema: string;
  table: string;
  filter?: string;
}

export interface ChannelSubscription {
  channel: RealtimeChannel;
  channelName: string;
  subscriberCount: number;
  createdAt: Date;
  lastUsedAt: Date;
}

/**
 * Singleton class for managing Realtime connections
 */
class RealtimeConnectionManager {
  private channels: Map<string, ChannelSubscription> = new Map();
  private callbacks: Map<string, ErrorHandlerCallbacks> = new Map();
  private maxChannels: number = 10; // Limit concurrent channels
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic cleanup of unused channels
    this.startCleanupInterval();
  }

  /**
   * Subscribe to a Realtime channel with connection pooling
   */
  subscribe(
    channelName: string,
    config: ChannelConfig,
    callback: (payload: any) => void,
    errorCallbacks?: ErrorHandlerCallbacks
  ): () => void {
    // Check if channel already exists
    const existing = this.channels.get(channelName);
    
    if (existing) {
      console.log(`[ConnectionManager] Reusing existing channel: ${channelName}`);
      existing.subscriberCount++;
      existing.lastUsedAt = new Date();
      
      // Add the new callback to the existing channel
      existing.channel.on(
        'postgres_changes' as any,
        config as any,
        callback
      );
      
      return () => this.unsubscribe(channelName);
    }

    // Check if we've hit the max channels limit
    if (this.channels.size >= this.maxChannels) {
      console.warn('[ConnectionManager] Max channels reached, cleaning up oldest');
      this.cleanupOldestChannel();
    }

    // Create new channel
    console.log(`[ConnectionManager] Creating new channel: ${channelName}`);
    const channel = supabase.channel(channelName);

    // Configure the channel
    channel.on(
      'postgres_changes' as any,
      config as any,
      callback
    );

    // Subscribe with error handling
    channel.subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[ConnectionManager] Channel subscribed: ${channelName}`);
      } else if (status === 'CHANNEL_ERROR') {
        const realtimeError = createRealtimeError(
          error || new Error('Channel error'),
          channelName
        );
        handleRealtimeError(realtimeError, errorCallbacks);
      } else if (status === 'TIMED_OUT') {
        const timeoutError = createRealtimeError(
          new Error('Subscription timed out'),
          channelName
        );
        handleRealtimeError(timeoutError, errorCallbacks);
      }
    });

    // Store the channel subscription
    const subscription: ChannelSubscription = {
      channel,
      channelName,
      subscriberCount: 1,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };

    this.channels.set(channelName, subscription);
    
    if (errorCallbacks) {
      this.callbacks.set(channelName, errorCallbacks);
    }

    // Return unsubscribe function
    return () => this.unsubscribe(channelName);
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channelName: string): void {
    const subscription = this.channels.get(channelName);
    
    if (!subscription) {
      console.warn(`[ConnectionManager] Channel not found: ${channelName}`);
      return;
    }

    subscription.subscriberCount--;
    console.log(
      `[ConnectionManager] Unsubscribed from ${channelName}, ` +
      `remaining subscribers: ${subscription.subscriberCount}`
    );

    // If no more subscribers, remove the channel
    if (subscription.subscriberCount <= 0) {
      this.removeChannel(channelName);
    }
  }

  /**
   * Remove a channel and clean up resources
   */
  private removeChannel(channelName: string): void {
    const subscription = this.channels.get(channelName);
    
    if (!subscription) return;

    console.log(`[ConnectionManager] Removing channel: ${channelName}`);
    
    // Unsubscribe from Supabase
    subscription.channel.unsubscribe();
    
    // Remove from maps
    this.channels.delete(channelName);
    this.callbacks.delete(channelName);
  }

  /**
   * Clean up the oldest unused channel
   */
  private cleanupOldestChannel(): void {
    let oldestChannel: string | null = null;
    let oldestTime = Date.now();

    for (const [name, subscription] of this.channels.entries()) {
      const lastUsed = subscription.lastUsedAt.getTime();
      if (lastUsed < oldestTime) {
        oldestTime = lastUsed;
        oldestChannel = name;
      }
    }

    if (oldestChannel) {
      console.log(`[ConnectionManager] Cleaning up oldest channel: ${oldestChannel}`);
      this.removeChannel(oldestChannel);
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    console.log(`[ConnectionManager] Cleaning up all ${this.channels.size} channels`);
    
    for (const [channelName] of this.channels.entries()) {
      this.removeChannel(channelName);
    }

    this.channels.clear();
    this.callbacks.clear();

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Start periodic cleanup of unused channels
   */
  private startCleanupInterval(): void {
    // Clean up channels unused for more than 5 minutes
    const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const MAX_IDLE_TIME = 10 * 60 * 1000; // 10 minutes

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const channelsToRemove: string[] = [];

      for (const [name, subscription] of this.channels.entries()) {
        const idleTime = now - subscription.lastUsedAt.getTime();
        
        if (idleTime > MAX_IDLE_TIME && subscription.subscriberCount === 0) {
          channelsToRemove.push(name);
        }
      }

      if (channelsToRemove.length > 0) {
        console.log(
          `[ConnectionManager] Cleaning up ${channelsToRemove.length} idle channels`
        );
        channelsToRemove.forEach(name => this.removeChannel(name));
      }
    }, CLEANUP_INTERVAL);
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalChannels: number;
    totalSubscribers: number;
    channels: Array<{
      name: string;
      subscribers: number;
      age: number;
      idleTime: number;
    }>;
  } {
    const now = Date.now();
    const channels = Array.from(this.channels.entries()).map(([name, sub]) => ({
      name,
      subscribers: sub.subscriberCount,
      age: now - sub.createdAt.getTime(),
      idleTime: now - sub.lastUsedAt.getTime(),
    }));

    const totalSubscribers = channels.reduce(
      (sum, ch) => sum + ch.subscribers,
      0
    );

    return {
      totalChannels: this.channels.size,
      totalSubscribers,
      channels,
    };
  }

  /**
   * Check if a channel exists
   */
  hasChannel(channelName: string): boolean {
    return this.channels.has(channelName);
  }

  /**
   * Get a channel by name
   */
  getChannel(channelName: string): RealtimeChannel | null {
    return this.channels.get(channelName)?.channel || null;
  }

  /**
   * Reconnect a specific channel
   */
  async reconnect(channelName: string): Promise<void> {
    const subscription = this.channels.get(channelName);
    
    if (!subscription) {
      console.warn(`[ConnectionManager] Cannot reconnect, channel not found: ${channelName}`);
      return;
    }

    console.log(`[ConnectionManager] Reconnecting channel: ${channelName}`);
    
    // Unsubscribe and resubscribe
    await subscription.channel.unsubscribe();
    await subscription.channel.subscribe();
    
    subscription.lastUsedAt = new Date();
  }

  /**
   * Reconnect all channels
   */
  async reconnectAll(): Promise<void> {
    console.log(`[ConnectionManager] Reconnecting all ${this.channels.size} channels`);
    
    const reconnectPromises = Array.from(this.channels.keys()).map(name =>
      this.reconnect(name)
    );
    
    await Promise.all(reconnectPromises);
  }
}

// Export singleton instance
export const realtimeConnectionManager = new RealtimeConnectionManager();

// Export for testing
export { RealtimeConnectionManager };
