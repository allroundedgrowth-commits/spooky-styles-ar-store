import pool from '../config/database.js';
import productService from './product.service.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export interface CartItemCustomization {
  color?: string;
  accessories?: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  customizations: CartItemCustomization;
  price: number;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

class CartService {
  private async getOrCreateCart(userId: string, sessionId?: string): Promise<string> {
    const isGuest = userId === 'guest' || !userId;
    
    if (isGuest) {
      // For guest users, use session_id only
      const sessionIdValue = sessionId || 'guest-session';
      
      // Try to get existing cart first
      const existing = await pool.query(
        'SELECT id FROM carts WHERE user_id IS NULL AND session_id = $1 LIMIT 1',
        [sessionIdValue]
      );

      if (existing.rows.length > 0) {
        return existing.rows[0].id;
      }

      // Create new cart if doesn't exist
      const result = await pool.query(
        `INSERT INTO carts (user_id, session_id, updated_at)
         VALUES (NULL, $1, CURRENT_TIMESTAMP)
         RETURNING id`,
        [sessionIdValue]
      );

      return result.rows[0].id;
    } else {
      // For authenticated users
      // Try to get existing cart first
      const existing = await pool.query(
        'SELECT id FROM carts WHERE user_id = $1 LIMIT 1',
        [userId]
      );

      if (existing.rows.length > 0) {
        return existing.rows[0].id;
      }

      // Create new cart if doesn't exist
      const result = await pool.query(
        `INSERT INTO carts (user_id, session_id, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         RETURNING id`,
        [userId, sessionId || null]
      );

      return result.rows[0].id;
    }
  }

  async getCart(userId: string, sessionId?: string): Promise<Cart> {
    try {
      // For guest users, use session_id only
      const isGuest = userId === 'guest' || !userId;
      
      let cartResult;
      if (isGuest) {
        cartResult = await pool.query(
          `SELECT c.id, c.updated_at, 
                  json_agg(
                    json_build_object(
                      'productId', ci.product_id,
                      'quantity', ci.quantity,
                      'price', ci.price,
                      'customizations', ci.customizations
                    )
                  ) FILTER (WHERE ci.id IS NOT NULL) as items
           FROM carts c
           LEFT JOIN cart_items ci ON c.id = ci.cart_id
           WHERE c.session_id = $1
           GROUP BY c.id, c.updated_at
           ORDER BY c.updated_at DESC
           LIMIT 1`,
          [sessionId || 'guest-session']
        );
      } else {
        cartResult = await pool.query(
          `SELECT c.id, c.updated_at, 
                  json_agg(
                    json_build_object(
                      'productId', ci.product_id,
                      'quantity', ci.quantity,
                      'price', ci.price,
                      'customizations', ci.customizations
                    )
                  ) FILTER (WHERE ci.id IS NOT NULL) as items
           FROM carts c
           LEFT JOIN cart_items ci ON c.id = ci.cart_id
           WHERE c.user_id = $1 OR c.session_id = $2
           GROUP BY c.id, c.updated_at
           ORDER BY c.updated_at DESC
           LIMIT 1`,
          [userId, sessionId || null]
        );
      }

      if (cartResult.rows.length === 0 || !cartResult.rows[0].items) {
        return {
          items: [],
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        items: cartResult.rows[0].items,
        updatedAt: cartResult.rows[0].updated_at,
      };
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    customizations: CartItemCustomization = {},
    sessionId?: string
  ): Promise<Cart> {
    try {
      if (quantity <= 0) {
        throw new ValidationError('Quantity must be greater than 0');
      }

      const product = await productService.getProductById(productId);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const cartId = await this.getOrCreateCart(userId, sessionId);
      const price = product.promotional_price || product.price;

      // Check if item exists
      const existingItem = await pool.query(
        `SELECT id, quantity FROM cart_items 
         WHERE cart_id = $1 AND product_id = $2 AND customizations = $3`,
        [cartId, productId, JSON.stringify(customizations)]
      );

      if (existingItem.rows.length > 0) {
        const newQuantity = existingItem.rows[0].quantity + quantity;
        
        if (newQuantity > product.stock_quantity) {
          throw new ValidationError(
            `Insufficient stock. Only ${product.stock_quantity} items available.`
          );
        }

        await pool.query(
          `UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [newQuantity, existingItem.rows[0].id]
        );
      } else {
        if (quantity > product.stock_quantity) {
          throw new ValidationError(
            `Insufficient stock. Only ${product.stock_quantity} items available.`
          );
        }

        await pool.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, price, customizations)
           VALUES ($1, $2, $3, $4, $5)`,
          [cartId, productId, quantity, price, JSON.stringify(customizations)]
        );
      }

      return this.getCart(userId, sessionId);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
    customizations: CartItemCustomization = {},
    sessionId?: string
  ): Promise<Cart> {
    try {
      if (quantity < 0) {
        throw new ValidationError('Quantity cannot be negative');
      }

      const cartId = await this.getOrCreateCart(userId, sessionId);

      if (quantity === 0) {
        await pool.query(
          `DELETE FROM cart_items 
           WHERE cart_id = $1 AND product_id = $2 AND customizations = $3`,
          [cartId, productId, JSON.stringify(customizations)]
        );
      } else {
        const product = await productService.getProductById(productId);
        
        if (quantity > product.stock_quantity) {
          throw new ValidationError(
            `Insufficient stock. Only ${product.stock_quantity} items available.`
          );
        }

        const result = await pool.query(
          `UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP
           WHERE cart_id = $2 AND product_id = $3 AND customizations = $4
           RETURNING id`,
          [quantity, cartId, productId, JSON.stringify(customizations)]
        );

        if (result.rows.length === 0) {
          throw new NotFoundError('Item not found in cart');
        }
      }

      return this.getCart(userId, sessionId);
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  async removeItem(
    userId: string,
    productId: string,
    customizations: CartItemCustomization = {},
    sessionId?: string
  ): Promise<Cart> {
    try {
      const cartId = await this.getOrCreateCart(userId, sessionId);

      const result = await pool.query(
        `DELETE FROM cart_items 
         WHERE cart_id = $1 AND product_id = $2 AND customizations = $3
         RETURNING id`,
        [cartId, productId, JSON.stringify(customizations)]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Item not found in cart');
      }

      return this.getCart(userId, sessionId);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }

  async clearCart(userId: string, sessionId?: string): Promise<void> {
    try {
      const isGuest = userId === 'guest' || !userId;
      
      if (isGuest) {
        // For guest users, delete cart items only
        await pool.query(
          `DELETE FROM cart_items 
           WHERE cart_id IN (
             SELECT id FROM carts WHERE user_id IS NULL AND session_id = $1
           )`,
          [sessionId || 'guest-session']
        );
      } else {
        // For authenticated users, delete cart items only
        await pool.query(
          `DELETE FROM cart_items 
           WHERE cart_id IN (
             SELECT id FROM carts WHERE user_id = $1
           )`,
          [userId]
        );
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  async getCartTotal(userId: string, sessionId?: string): Promise<number> {
    try {
      const cart = await this.getCart(userId, sessionId);
      
      const total = cart.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      return Math.round(total * 100) / 100;
    } catch (error) {
      console.error('Error calculating cart total:', error);
      throw error;
    }
  }
}

export default new CartService();
