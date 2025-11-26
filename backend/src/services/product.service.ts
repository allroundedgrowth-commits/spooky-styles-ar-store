import pool from '../config/database.js';
import redisClient from '../config/redis.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  created_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promotional_price?: number;
  category: string;
  theme: string;
  model_url: string;
  thumbnail_url: string;
  stock_quantity: number;
  is_accessory: boolean;
  created_at: Date;
  updated_at: Date;
  colors?: ProductColor[];
}

export interface ProductFilters {
  category?: string;
  theme?: string;
  search?: string;
  is_accessory?: boolean;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  category: string;
  theme: string;
  model_url?: string;
  thumbnail_url: string;
  image_url: string;
  ar_image_url: string;
  stock_quantity?: number;
  is_accessory?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  promotional_price?: number;
  category?: string;
  theme?: string;
  model_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  ar_image_url?: string;
  stock_quantity?: number;
  is_accessory?: boolean;
}

const CACHE_TTL = 3600;

class ProductService {
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    try {
      const cacheKey = `products:${JSON.stringify(filters)}`;
      
      // Check cache only if Redis is connected
      if (redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      let query = `
        SELECT p.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', pc.id,
                'product_id', pc.product_id,
                'color_name', pc.color_name,
                'color_hex', pc.color_hex,
                'created_at', pc.created_at
              )
            ) FILTER (WHERE pc.id IS NOT NULL),
            '[]'
          ) as colors
        FROM products p
        LEFT JOIN product_colors pc ON p.id = pc.product_id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramCount = 1;

      if (filters.category) {
        query += ` AND p.category = $${paramCount}`;
        params.push(filters.category);
        paramCount++;
      }

      if (filters.theme) {
        query += ` AND p.theme = $${paramCount}`;
        params.push(filters.theme);
        paramCount++;
      }

      if (filters.is_accessory !== undefined) {
        query += ` AND p.is_accessory = $${paramCount}`;
        params.push(filters.is_accessory);
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }

      query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

      const result = await pool.query(query, params);
      const products = result.rows;

      // Cache only if Redis is connected
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(products));
      }

      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    try {
      const cacheKey = `products:search:${keyword}`;
      
      // Check cache only if Redis is connected
      if (redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const query = `
        SELECT p.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', pc.id,
                'product_id', pc.product_id,
                'color_name', pc.color_name,
                'color_hex', pc.color_hex,
                'created_at', pc.created_at
              )
            ) FILTER (WHERE pc.id IS NOT NULL),
            '[]'
          ) as colors
        FROM products p
        LEFT JOIN product_colors pc ON p.id = pc.product_id
        WHERE p.name ILIKE $1 OR p.description ILIKE $1
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;

      const result = await pool.query(query, [`%${keyword}%`]);
      const products = result.rows;

      // Cache only if Redis is connected
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(products));
      }

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const cacheKey = `product:${id}`;
      
      // Check cache only if Redis is connected
      if (redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const query = `
        SELECT p.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', pc.id,
                'product_id', pc.product_id,
                'color_name', pc.color_name,
                'color_hex', pc.color_hex,
                'created_at', pc.created_at
              )
            ) FILTER (WHERE pc.id IS NOT NULL),
            '[]'
          ) as colors
        FROM products p
        LEFT JOIN product_colors pc ON p.id = pc.product_id
        WHERE p.id = $1
        GROUP BY p.id
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new NotFoundError('Product not found');
      }

      const product = result.rows[0];
      
      // Cache only if Redis is connected
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(product));
      }

      return product;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    try {
      if (!input.name || !input.price || !input.category || !input.theme || !input.thumbnail_url || !input.image_url || !input.ar_image_url) {
        throw new ValidationError('Missing required fields: name, price, category, theme, thumbnail_url, image_url, ar_image_url');
      }

      if (input.price <= 0) {
        throw new ValidationError('Price must be greater than 0');
      }

      if (input.promotional_price && input.promotional_price >= input.price) {
        throw new ValidationError('Promotional price must be less than regular price');
      }

      const query = `
        INSERT INTO products (
          name, description, price, promotional_price, category, theme,
          model_url, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        input.name,
        input.description || null,
        input.price,
        input.promotional_price || null,
        input.category,
        input.theme,
        input.model_url || null,
        input.thumbnail_url,
        input.image_url,
        input.ar_image_url,
        input.stock_quantity || 0,
        input.is_accessory || false,
      ];

      const result = await pool.query(query, values);
      const product = result.rows[0];

      await this.invalidateProductCache();

      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    try {
      const existingProduct = await this.getProductById(id);

      if (input.price && input.price <= 0) {
        throw new ValidationError('Price must be greater than 0');
      }

      if (input.promotional_price && input.promotional_price >= (input.price || existingProduct.price)) {
        throw new ValidationError('Promotional price must be less than regular price');
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (input.name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(input.name);
        paramCount++;
      }

      if (input.description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(input.description);
        paramCount++;
      }

      if (input.price !== undefined) {
        updates.push(`price = $${paramCount}`);
        values.push(input.price);
        paramCount++;
      }

      if (input.promotional_price !== undefined) {
        updates.push(`promotional_price = $${paramCount}`);
        values.push(input.promotional_price);
        paramCount++;
      }

      if (input.category !== undefined) {
        updates.push(`category = $${paramCount}`);
        values.push(input.category);
        paramCount++;
      }

      if (input.theme !== undefined) {
        updates.push(`theme = $${paramCount}`);
        values.push(input.theme);
        paramCount++;
      }

      if (input.model_url !== undefined) {
        updates.push(`model_url = $${paramCount}`);
        values.push(input.model_url);
        paramCount++;
      }

      if (input.thumbnail_url !== undefined) {
        updates.push(`thumbnail_url = $${paramCount}`);
        values.push(input.thumbnail_url);
        paramCount++;
      }

      if (input.image_url !== undefined) {
        updates.push(`image_url = $${paramCount}`);
        values.push(input.image_url);
        paramCount++;
      }

      if (input.ar_image_url !== undefined) {
        updates.push(`ar_image_url = $${paramCount}`);
        values.push(input.ar_image_url);
        paramCount++;
      }

      if (input.stock_quantity !== undefined) {
        updates.push(`stock_quantity = $${paramCount}`);
        values.push(input.stock_quantity);
        paramCount++;
      }

      if (input.is_accessory !== undefined) {
        updates.push(`is_accessory = $${paramCount}`);
        values.push(input.is_accessory);
        paramCount++;
      }

      if (updates.length === 0) {
        return existingProduct;
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE products
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      const product = result.rows[0];

      await this.invalidateProductCache();
      
      // Delete specific product cache if Redis is connected
      if (redisClient.isOpen) {
        await redisClient.del(`product:${id}`);
      }

      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.getProductById(id);

      const query = 'DELETE FROM products WHERE id = $1';
      await pool.query(query, [id]);

      await this.invalidateProductCache();
      
      // Delete specific product cache if Redis is connected
      if (redisClient.isOpen) {
        await redisClient.del(`product:${id}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async addProductColor(productId: string, colorName: string, colorHex: string): Promise<ProductColor> {
    try {
      if (!/^#[0-9A-F]{6}$/i.test(colorHex)) {
        throw new ValidationError('Invalid color hex format. Must be in format #RRGGBB');
      }

      await this.getProductById(productId);

      const query = `
        INSERT INTO product_colors (product_id, color_name, color_hex)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await pool.query(query, [productId, colorName, colorHex]);
      const color = result.rows[0];

      // Delete specific product cache if Redis is connected
      if (redisClient.isOpen) {
        await redisClient.del(`product:${productId}`);
      }
      
      await this.invalidateProductCache();

      return color;
    } catch (error) {
      console.error('Error adding product color:', error);
      throw error;
    }
  }

  async deleteProductColor(colorId: string): Promise<void> {
    try {
      const colorQuery = 'SELECT product_id FROM product_colors WHERE id = $1';
      const colorResult = await pool.query(colorQuery, [colorId]);

      if (colorResult.rows.length === 0) {
        throw new NotFoundError('Color not found');
      }

      const productId = colorResult.rows[0].product_id;

      const query = 'DELETE FROM product_colors WHERE id = $1';
      await pool.query(query, [colorId]);

      // Delete specific product cache if Redis is connected
      if (redisClient.isOpen) {
        await redisClient.del(`product:${productId}`);
      }
      
      await this.invalidateProductCache();
    } catch (error) {
      console.error('Error deleting product color:', error);
      throw error;
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      if (threshold < 0) {
        throw new ValidationError('Threshold must be a non-negative number');
      }

      const query = `
        SELECT p.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', pc.id,
                'product_id', pc.product_id,
                'color_name', pc.color_name,
                'color_hex', pc.color_hex,
                'created_at', pc.created_at
              )
            ) FILTER (WHERE pc.id IS NOT NULL),
            '[]'
          ) as colors
        FROM products p
        LEFT JOIN product_colors pc ON p.id = pc.product_id
        WHERE p.stock_quantity <= $1 AND p.stock_quantity > 0
        GROUP BY p.id
        ORDER BY p.stock_quantity ASC, p.name ASC
      `;

      const result = await pool.query(query, [threshold]);
      return result.rows;
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw error;
    }
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    try {
      const query = `
        SELECT p.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', pc.id,
                'product_id', pc.product_id,
                'color_name', pc.color_name,
                'color_hex', pc.color_hex,
                'created_at', pc.created_at
              )
            ) FILTER (WHERE pc.id IS NOT NULL),
            '[]'
          ) as colors
        FROM products p
        LEFT JOIN product_colors pc ON p.id = pc.product_id
        WHERE p.stock_quantity = 0
        GROUP BY p.id
        ORDER BY p.name ASC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting out of stock products:', error);
      throw error;
    }
  }

  private async invalidateProductCache(): Promise<void> {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return;
    }
    
    try {
      const keys = await redisClient.keys('products:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Error invalidating product cache:', error);
    }
  }
}

export default new ProductService();
