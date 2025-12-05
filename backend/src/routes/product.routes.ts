import { Router, Request, Response, NextFunction } from 'express';
import productService from '../services/product.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = Router();

/**
 * GET /api/products
 * Get all products with optional filtering
 * Query params: category, theme, search, is_accessory
 */
router.get('/', cacheMiddleware({ ttl: 3600, varyBy: ['query'] }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      category: req.query.category as string | undefined,
      theme: req.query.theme as string | undefined,
      search: req.query.search as string | undefined,
      is_accessory: req.query.is_accessory === 'true' ? true : req.query.is_accessory === 'false' ? false : undefined,
    };

    const products = await productService.getProducts(filters);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/alerts/low-stock
 * Get products with low stock (admin only)
 * Query params: threshold (default: 10)
 */
router.get(
  '/alerts/low-stock',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : 10;

      if (isNaN(threshold)) {
        return res.status(400).json({
          success: false,
          error: 'Threshold must be a valid number',
        });
      }

      const products = await productService.getLowStockProducts(threshold);

      res.json({
        success: true,
        data: products,
        count: products.length,
        threshold,
        message: products.length > 0 
          ? `Found ${products.length} product(s) with stock at or below ${threshold}` 
          : `No products with stock at or below ${threshold}`,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/products/alerts/out-of-stock
 * Get products that are out of stock (admin only)
 */
router.get(
  '/alerts/out-of-stock',
  authenticate,
  requireAdmin,
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const products = await productService.getOutOfStockProducts();

      res.json({
        success: true,
        data: products,
        count: products.length,
        message: products.length > 0 
          ? `Found ${products.length} out of stock product(s)` 
          : 'No out of stock products',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/products/search
 * Search products by keyword
 * Query params: q (keyword)
 */
router.get('/search', cacheMiddleware({ ttl: 1800, varyBy: ['query'] }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keyword = req.query.q as string;

    if (!keyword || keyword.trim().length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const products = await productService.searchProducts(keyword);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', cacheMiddleware({ ttl: 3600, varyBy: ['params'] }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products
 * Create a new product (admin only)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  csrfProtection,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/products/:id
 * Update a product (admin only)
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  csrfProtection,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/products/:id
 * Delete a product (admin only)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  csrfProtection,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await productService.deleteProduct(req.params.id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/products/:id/colors
 * Add a color to a product (admin only)
 */
router.post(
  '/:id/colors',
  authenticate,
  requireAdmin,
  csrfProtection,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { color_name, color_hex } = req.body;

      if (!color_name || !color_hex) {
        return res.status(400).json({
          success: false,
          error: 'color_name and color_hex are required',
        });
      }

      const color = await productService.addProductColor(req.params.id, color_name, color_hex);

      res.status(201).json({
        success: true,
        data: color,
        message: 'Color added successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/products/colors/:colorId
 * Delete a color from a product (admin only)
 */
router.delete(
  '/colors/:colorId',
  authenticate,
  requireAdmin,
  csrfProtection,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await productService.deleteProductColor(req.params.colorId);

      res.json({
        success: true,
        message: 'Color deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
