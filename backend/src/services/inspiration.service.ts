import pool from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export interface CostumeInspiration {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: Date;
}

export interface InspirationProduct {
  id: string;
  product_id: string;
  name: string;
  description: string;
  price: number;
  promotional_price: number | null;
  category: string;
  theme: string;
  model_url: string;
  thumbnail_url: string;
  stock_quantity: number;
  is_accessory: boolean;
  display_order: number;
}

export interface InspirationWithProducts extends CostumeInspiration {
  products: InspirationProduct[];
}

class InspirationService {
  async getAllInspirations(): Promise<CostumeInspiration[]> {
    try {
      const result = await pool.query(
        `SELECT id, name, description, image_url, created_at 
         FROM costume_inspirations 
         ORDER BY created_at DESC`
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching inspirations:', error);
      throw error;
    }
  }

  async getInspirationById(id: string): Promise<InspirationWithProducts> {
    try {
      // Get inspiration details
      const inspirationResult = await pool.query(
        `SELECT id, name, description, image_url, created_at 
         FROM costume_inspirations 
         WHERE id = $1`,
        [id]
      );

      if (inspirationResult.rows.length === 0) {
        throw new NotFoundError('Costume inspiration not found');
      }

      const inspiration = inspirationResult.rows[0];

      // Get all products for this inspiration
      const productsResult = await pool.query(
        `SELECT 
          cip.id,
          cip.product_id,
          p.name,
          p.description,
          p.price,
          p.promotional_price,
          p.category,
          p.theme,
          p.model_url,
          p.thumbnail_url,
          p.stock_quantity,
          p.is_accessory,
          cip.display_order
         FROM costume_inspiration_products cip
         JOIN products p ON cip.product_id = p.id
         WHERE cip.inspiration_id = $1
         ORDER BY cip.display_order ASC`,
        [id]
      );

      return {
        ...inspiration,
        products: productsResult.rows,
      };
    } catch (error) {
      console.error('Error fetching inspiration by id:', error);
      throw error;
    }
  }

  async getInspirationProducts(id: string): Promise<InspirationProduct[]> {
    try {
      const result = await pool.query(
        `SELECT 
          cip.id,
          cip.product_id,
          p.name,
          p.description,
          p.price,
          p.promotional_price,
          p.category,
          p.theme,
          p.model_url,
          p.thumbnail_url,
          p.stock_quantity,
          p.is_accessory,
          cip.display_order
         FROM costume_inspiration_products cip
         JOIN products p ON cip.product_id = p.id
         WHERE cip.inspiration_id = $1
         ORDER BY cip.display_order ASC`,
        [id]
      );

      if (result.rows.length === 0) {
        // Check if inspiration exists
        const inspirationCheck = await pool.query(
          'SELECT id FROM costume_inspirations WHERE id = $1',
          [id]
        );
        
        if (inspirationCheck.rows.length === 0) {
          throw new NotFoundError('Costume inspiration not found');
        }
      }

      return result.rows;
    } catch (error) {
      console.error('Error fetching inspiration products:', error);
      throw error;
    }
  }
}

export default new InspirationService();
