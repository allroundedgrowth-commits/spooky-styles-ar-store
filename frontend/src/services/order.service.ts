import api from './apiService';
import { Order, OrderWithItems } from '../types/order';

/**
 * Order Service
 * Uses the new API integration layer with automatic loading states and error handling
 */
class OrderService {
  async getOrderHistory(): Promise<Order[]> {
    return await api.orders.getOrders();
  }

  async getOrders(): Promise<Order[]> {
    return this.getOrderHistory();
  }

  async getOrderById(orderId: string): Promise<OrderWithItems> {
    // Note: The API returns Order, but we expect OrderWithItems
    // This may need adjustment based on actual API response
    return await api.orders.getOrderById(orderId) as unknown as OrderWithItems;
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return await api.orders.updateOrderStatus(id, status);
  }
}

export default new OrderService();
