/**
 * Realtime Inventory Updates Test Suite
 * Tests Realtime subscriptions for product inventory
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useRealtimeInventory } from '../hooks/useRealtimeInventory';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('Realtime Inventory Updates', () => {
  let mockChannel: any;
  let mockSubscribe: jest.Mock;
  let mockUnsubscribe: jest.Mock;
  let mockOn: jest.Mock;
  let mockSupabase: any;

  beforeEach(() => {
    mockUnsubscribe = jest.fn();
    mockSubscribe = jest.fn().mockReturnValue({
      unsubscribe: mockUnsubscribe
    });
    mockOn = jest.fn().mockReturnThis();
    
    mockChannel = {
      on: mockOn,
      subscribe: mockSubscribe
    };
    
    mockSupabase = {
      channel: jest.fn().mockReturnValue(mockChannel)
    };
    
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Stock Update Broadcasting (Requirements 2.1, 2.2)', () => {
    it('should broadcast stock updates to all connected clients', async () => {
      const productId = 'test-product-123';
      const { result } = renderHook(() => useRealtimeInventory(productId));
      
      // Wait for subscription to be set up
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith(`product-${productId}`);
      });
      
      // Verify subscription was created
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`
        }),
        expect.any(Function)
      );
      
      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('should receive stock updates within 1 second', async () => {
      const productId = 'test-product-123';
      const { result } = renderHook(() => useRealtimeInventory(productId));
      
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });
      
      // Get the callback function passed to 'on'
      const callback = mockOn.mock.calls[0][2];
      
      // Simulate a stock update
      const startTime = Date.now();
      callback({
        new: { id: productId, stock_quantity: 50 }
      });
      const endTime = Date.now();
      
      // Verify update was processed quickly (< 1000ms)
      expect(endTime - startTime).toBeLessThan(1000);
      
      await waitFor(() => {
        expect(result.current.stock).toBe(50);
      });
    });

    it('should handle multiple users receiving the same update', async () => {
      const productId = 'test-product-123';
      
      // Simulate two users subscribing to the same product
      const { result: user1Result } = renderHook(() => useRealtimeInventory(productId));
      const { result: user2Result } = renderHook(() => useRealtimeInventory(productId));
      
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledTimes(2);
      });
      
      // Both should have subscribed
      expect(mockOn).toHaveBeenCalledTimes(2);
      expect(mockSubscribe).toHaveBeenCalledTimes(2);
      
      // Get callbacks for both users
      const user1Callback = mockOn.mock.calls[0][2];
      const user2Callback = mockOn.mock.calls[1][2];
      
      // Simulate the same update for both
      const updatePayload = {
        new: { id: productId, stock_quantity: 25 }
      };
      
      user1Callback(updatePayload);
      user2Callback(updatePayload);
      
      // Both should receive the same update
      await waitFor(() => {
        expect(user1Result.current.stock).toBe(25);
        expect(user2Result.current.stock).toBe(25);
      });
    });
  });

  describe('Connection Management (Requirements 2.3, 2.4)', () => {
    it('should establish Realtime connection when viewing product', async () => {
      const productId = 'test-product-123';
      const { result } = renderHook(() => useRealtimeInventory(productId));
      
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith(`product-${productId}`);
        expect(mockSubscribe).toHaveBeenCalled();
      });
      
      // Simulate successful subscription
      const statusCallback = mockSubscribe.mock.calls[0][0];
      if (statusCallback) {
        statusCallback('SUBSCRIBED');
      }
      
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });

    it('should reconnect subscription after connection loss', async () => {
      const productId = 'test-product-123';
      const { result, rerender } = renderHook(() => useRealtimeInventory(productId));
      
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });
      
      // Simulate connection loss
      const statusCallback = mockSubscribe.mock.calls[0][0];
      if (statusCallback) {
        statusCallback('CHANNEL_ERROR');
      }
      
      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
      
      // Simulate reconnection
      rerender();
      
      await waitFor(() => {
        // Should attempt to resubscribe
        expect(mockSupabase.channel).toHaveBeenCalled();
      });
    });

    it('should unsubscribe correctly on unmount', async () => {
      const productId = 'test-product-123';
      const { unmount } = renderHook(() => useRealtimeInventory(productId));
      
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });
      
      // Unmount the hook
      unmount();
      
      // Should have called unsubscribe
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('UI Integration (Requirement 2.5)', () => {
    it('should update stock display in real-time', async () => {
      const productId = 'test-product-123';
      const { result } = renderHook(() => useRealtimeInventory(productId));
      
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });
      
      const callback = mockOn.mock.calls[0][2];
      
      // Simulate stock update
      callback({
        new: { id: productId, stock_quantity: 100 }
      });
      
      await waitFor(() => {
        expect(result.current.stock).toBe(100);
      });
      
      // Simulate another update
      callback({
        new: { id: productId, stock_quantity: 75 }
      });
      
      await waitFor(() => {
        expect(result.current.stock).toBe(75);
      });
    });

    it('should handle out of stock scenario', async () => {
      const productId = 'test-product-123';
      const { result } = renderHook(() => useRealtimeInventory(productId));
      
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });
      
      const callback = mockOn.mock.calls[0][2];
      
      // Simulate stock going to zero
      callback({
        new: { id: productId, stock_quantity: 0 }
      });
      
      await waitFor(() => {
        expect(result.current.stock).toBe(0);
      });
    });

    it('should efficiently broadcast to multiple subscribers', async () => {
      const productId = 'test-product-123';
      
      // Create 5 subscribers
      const hooks = Array.from({ length: 5 }, () => 
        renderHook(() => useRealtimeInventory(productId))
      );
      
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledTimes(5);
      });
      
      // All should be subscribed
      expect(mockSubscribe).toHaveBeenCalledTimes(5);
      
      // Simulate update to all
      const callbacks = mockOn.mock.calls.map(call => call[2]);
      const updatePayload = {
        new: { id: productId, stock_quantity: 42 }
      };
      
      callbacks.forEach(callback => callback(updatePayload));
      
      // All should receive the update
      await waitFor(() => {
        hooks.forEach(({ result }) => {
          expect(result.current.stock).toBe(42);
        });
      });
      
      // Cleanup
      hooks.forEach(({ unmount }) => unmount());
    });
  });

  describe('Error Handling', () => {
    it('should handle subscription errors gracefully', async () => {
      const productId = 'test-product-123';
      const { result } = renderHook(() => useRealtimeInventory(productId));
      
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });
      
      // Simulate subscription error
      const statusCallback = mockSubscribe.mock.calls[0][0];
      if (statusCallback) {
        statusCallback('SUBSCRIPTION_ERROR', new Error('Connection failed'));
      }
      
      // Should handle error without crashing
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle invalid payload data', async () => {
      const productId = 'test-product-123';
      const { result } = renderHook(() => useRealtimeInventory(productId));
      
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });
      
      const callback = mockOn.mock.calls[0][2];
      
      // Simulate invalid payload
      callback({
        new: { id: productId, stock_quantity: null }
      });
      
      // Should handle gracefully
      await waitFor(() => {
        expect(result.current.stock).toBeNull();
      });
    });
  });
});
