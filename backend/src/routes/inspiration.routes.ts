import { Router, Request, Response, NextFunction } from 'express';
import inspirationService from '../services/inspiration.service.js';
import cartService from '../services/cart.service.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/inspirations - Get all costume inspirations
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const inspirations = await inspirationService.getAllInspirations();
    res.json(inspirations);
  } catch (error) {
    next(error);
  }
});

// GET /api/inspirations/:id - Get inspiration details with products
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const inspiration = await inspirationService.getInspirationById(id);
    res.json(inspiration);
  } catch (error) {
    next(error);
  }
});

// GET /api/inspirations/:id/products - Get all products for an inspiration
router.get('/:id/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const products = await inspirationService.getInspirationProducts(id);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// POST /api/inspirations/:id/add-to-cart - Add all products from inspiration to cart
router.post('/:id/add-to-cart', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user!.id;

    // Get all products for this inspiration
    const products = await inspirationService.getInspirationProducts(id);

    // Add each product to cart
    for (const product of products) {
      await cartService.addItem(
        userId,
        product.product_id,
        1, // Add 1 of each product
        {} // No customizations by default
      );
    }

    // Get updated cart
    const cart = await cartService.getCart(userId);

    res.json({
      message: 'All products added to cart successfully',
      cart,
      productsAdded: products.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
