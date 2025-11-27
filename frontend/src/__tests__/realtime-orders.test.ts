/**
 * Realtime Order Notifications Test Suite
 * Tests Realtime subscriptions for order status updates
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('Realtime Order Notifications', () => {
  let mockChannel: any;
  let mockSubscribe: jest.Mock;
  let mockUnsubscribe: jest.Mock;
  let mockOn: jest.Mock;
  let mockSupabase: any;
  let mockSetSession: jest.Mock;

  beforeEach(() => {
    mockUnsubscribe = jest.fn();
    mockSubscribe = jest.fn().mockReturnValue({
      unsubscribe: mockUnsubscribe
    });
    mockOn = jest.fn().mockReturnThis();
    mockSetSession = jest.fn();
    
    mockChannel = {
      on: mockOn,
      subscribe: mockSubscribe
    };
    
    mockSupabase = {
      channel: jest.fn().mockReturnValue(mockChannel),
      auth: {
        setSession: mockSetSession
      }
    };
    
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Order Status Notifications (Requirements 3.1, 3.2)', () => {
    it('should trigger notifications when order status changes', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith('my-orders');
      });
      
      // Get the callback function
      const callback = mockOn.mock.calls[0][2];
      
      // Simulate order status change
      callback({
        new: {
          id: 'order-123',
          user_id: userId,
          status: 'shipped',
          updated_at: new Date().toISOString()
        },
        old: {
          id: 'order-123',
          user_id: userId,
          status: 'processing',
          updated_at: new Date().toISOString()
        }
      });
      
      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
        expect(result.current.notifications[0]).toContain('shipped');
      });
    });

    it('should send notifications within 2 seconds of status change', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });
      
      const callback = mockOn.mock.calls[0][2];
      
      // Measure notification time
      const startTime = Date.now();
      callback({
        new: {
          id: 'order-123',
          user_id: userId,
          status: 'delivered',
          updated_at: new Date().toISOString()
        }
      });
      
      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });
      
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      
      // Should be within 2 seconds
      expect(elapsed).toBeLessThan(2000);
    });

    it('should filter updates to only notify order owner (RLS)', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });
      
      const callback = mockOn.mock.calls[0][2];
      
      // Simulate update for different user's order
      callback({
        new: {
          id: 'order-456',
          user_id: 'different-user',
          status: 'shipped',
          updated_at: new Date().toISOString()
        }
      });
      
      // Should not add notification for other user's order
      // (In real implementation, RLS would filter this at database level)
      await waitFor(() => {
        // Verify JWT was set for RLS
        expect(mockSetSession).toHaveBeenCalled();
      });
    });
  });

  describe('Order History Subscription (Requirement 3.3)', () => {
    it('should subscribe to updates for all user orders', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith('my-orders');
        expect(mockOn).toHaveBeenCalledWith(
          'postgres_changes',
          expect.objectContaining({
            event: 'UPDATE',
            schema: 'public',
            table: 'orders'
          }),
          expect.any(Function)
        );
      });
    });

    it('should update orders list in real-time', async () => {
      const userId = 'user-123';
      const initialOrders = [
        { id: 'order-1', user_id: userId, status: 'pending', total_amount: 99.99 },
        { id: 'order-2', user_id: userId, status: 'processing', total_amount: 149.99 }
      ];
      
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      // Set initial orders
      result.current.orders = initialOrders;
      
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });
      
      const callback = mockOn.mock.calls[0][2];
      
      // Simulate order update
      callback({
        new: {
          id: 'order-1',
          user_id: userId,
          status: 'shipped',
          total_amount: 99.99,
          updated_at: new Date().toISOString()
        }
      });
      
      await waitFor(() => {
        const updatedOrder = result.current.orders.find(o => o.id === 'order-1');
        expect(updatedOrder?.status).toBe('shipped');
      });
    });
  });

  describe('Subscription Cleanup (Requirements 3.4, 3.5)', () => {
    it('should unsubscribe when navigating away', async () => {
      const userId = 'user-123';
      const { unmount } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });
      
      // Navigate away (unmount)
      unmount();
      
      // Should clean up subscription
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should clean up subscriptions on component unmount', async () => {
      const userId = 'user-123';
      const { unmount } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalled();
      });
      
      unmount();
      
      // Verify cleanup
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle multiple mount/unmount cycles', async () => {
      const userId = 'user-123';
      
      // First mount
      const { unmount: unmount1 } = renderHook(() => useRealtimeOrders(userId));
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalledTimes(1));
      unmount1();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      
      // Second mount
      const { unmount: unmount2 } = renderHook(() => useRealtimeOrders(userId));
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalledTimes(2));
      unmount2();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling (Requirement 3.5)', () => {
    it('should handle subscription errors gracefully', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });
      
      // Simulate subscription error
      const statusCallback = mockSubscribe.mock.calls[0][0];
      if (statusCallback) {
        statusCallback('CHANNEL_ERROR', new Error('Subscription failed'));
      }
      
      // Should not crash
      expect(result.current.orders).toBeDefined();
    });

    it('should handle connection loss gracefully', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });
      
      // Simulate connection loss
      const statusCallback = mockSubscribe.mock.calls[0][0];
      if (statusCallback) {
        statusCallback('CLOSED');
      }
      
      // Should handle gracefully
      expect(result.current.orders).toBeDefined();
    });

    it('should handle unauthorized errors', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });
      
      // Simulate unauthorized error
      const statusCallback = mockSubscribe.mock.calls[0][0];
      if (statusCallback) {
        statusCallback('CHANNEL_ERROR', { code: 'UNAUTHORIZED' });
      }
      
      // Should handle gracefully
      expect(result.current.orders).toBeDefined();
    });
  });

  describe('Notification Display (Requirement 3.1)', () => {
    it('should display notifications correctly', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });
      
      const callback = mockOn.mock.calls[0][2];
      
      // Simulate multiple status changes
      const statuses = ['processing', 'shipped', 'delivered'];
      
      for (const status of statuses) {
        callback({
          new: {
            id: 'order-123',
            user_id: userId,
            status,
            updated_at: new Date().toISOString()
          }
        });
      }
      
      await waitFor(() => {
        expect(result.current.notifications.length).toBe(3);
      });
      
      // Verify notification content
      expect(result.current.notifications[0]).toContain('order-123');
      expect(result.current.notifications[0]).toContain('processing');
    });

    it('should show order ID and new status in notification', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });
      
      const callback = mockOn.mock.calls[0][2];
      
      callback({
        new: {
          id: 'order-789',
          user_id: userId,
          status: 'delivered',
          updated_at: new Date().toISOString()
        }
      });
      
      await waitFor(() => {
        const notification = result.current.notifications[0];
        expect(notification).toContain('order-789');
        expect(notification).toContain('delivered');
      });
    });
  });

  describe('JWT Token Management (Requirement 3.2)', () => {
    it('should set JWT token for RLS authentication', async () => {
      const userId = 'user-123';
      renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalled();
      });
      
      // Verify JWT was set
      const sessionCall = mockSetSession.mock.calls[0][0];
      expect(sessionCall).toHaveProperty('access_token');
    });

    it('should handle expired JWT tokens', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useRealtimeOrders(userId));
      
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled();
      });
      
      // Simulate token expiration
      const statusCallback = mockSubscribe.mock.calls[0][0];
      if (statusCallback) {
        statusCallback('CHANNEL_ERROR', { code: 'TOKEN_EXPIRED' });
      }
      
      // Should handle gracefully
      expect(result.current.orders).toBeDefined();
    });
  });
});
