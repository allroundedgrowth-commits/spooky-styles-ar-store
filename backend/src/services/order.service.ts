import pool from '../config/database.js';
import productService from './product.service.js';
import { Cart } from './cart.service.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripe_payment_intent_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  customizations: any;
  created_at: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Order Service
 * Handles order creation, retrieval, and management
 */
class OrderService {

  async createOrder(
    userId: string,
    stripePaymentIntentId: string,
    cart: Cart,
    guestInfo?: { email: string; name: string; address: string; city: string; state: string; zipCode: string; country: string }
  ): Promise<OrderWithItems> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Validate cart is not empty
      if (!cart.items || cart.items.length === 0) {
        throw new ValidationError('Cannot create order from empty cart');
      }

      // Calculate subtotal
      const subtotal = cart.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      // For guest orders, use a special guest user ID or null
      const orderUserId = userId.startsWith('guest') || userId === 'guest' ? null : userId;
      
      // Apply 5% discount for registered users
      const discount = orderUserId ? subtotal * 0.05 : 0;
      const shippingCost = orderUserId ? 0 : 9.99; // Free shipping for registered users
      const total = subtotal - discount + shippingCost;

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total, status, stripe_payment_intent_id, guest_email, guest_name, guest_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          orderUserId, 
          total, 
          'pending', 
          stripePaymentIntentId,
          guestInfo?.email || null,
          guestInfo?.name || null,
          guestInfo ? JSON.stringify({
            address: guestInfo.address,
            city: guestInfo.city,
            state: guestInfo.state,
            zipCode: guestInfo.zipCode,
            country: guestInfo.country
          }) : null
        ]
      );

      const order = orderResult.rows[0];

      // Create order items and decrement inventory
      const orderItems: OrderItem[] = [];
      
      for (const item of cart.items) {
        // Validate product exists and has sufficient stock
        const product = await productService.getProductById(item.productId);
        
        if (!product) {
          throw new NotFoundError(`Product ${item.productId} not found`);
        }

        if (product.stock_quantity < item.quantity) {
          throw new ValidationError(
            `Insufficient stock for product ${product.name}. Only ${product.stock_quantity} items available.`
          );
        }

        if (product.stock_quantity === 0) {
          throw new ValidationError(`Product ${product.name} is out of stock`);
        }

        // Insert order item
        const orderItemResult = await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price, customizations)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            order.id,
            item.productId,
            item.quantity,
            item.price,
            JSON.stringify(item.customizations)
          ]
        );

        orderItems.push(orderItemResult.rows[0]);

        // Decrement inventory
        await client.query(
          `UPDATE products 
           SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [item.quantity, item.productId]
        );
      }

      await client.query('COMMIT');

      return {
        ...order,
        items: orderItems,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getOrderById(orderId: string, userId?: string): Promise<OrderWithItems | null> {
    try {
      let query = `
        SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'order_id', oi.order_id,
                   'product_id', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'customizations', oi.customizations,
                   'created_at', oi.created_at
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
      `;
      
      const params: any[] = [orderId];
      
      if (userId) {
        query += ' AND o.user_id = $2';
        params.push(userId);
      }
      
      query += ' GROUP BY o.id';

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM orders 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<Order> {
    try {
      const result = await pool.query(
        `UPDATE orders 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, orderId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Order not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrderByPaymentIntentId(paymentIntentId: string): Promise<OrderWithItems | null> {
    try {
      const result = await pool.query(
        `SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'order_id', oi.order_id,
                   'product_id', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'customizations', oi.customizations,
                   'created_at', oi.created_at
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.stripe_payment_intent_id = $1
        GROUP BY o.id`,
        [paymentIntentId]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting order by payment intent:', error);
      throw error;
    }
  }
}

export default new OrderService();
