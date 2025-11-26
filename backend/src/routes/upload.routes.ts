import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import {
  uploadImage,
  upload3DModel,
  uploadMultipleImages,
} from '../middleware/upload.middleware.js';
import { s3Service } from '../services/s3.service.js';
import { BadRequestError } from '../utils/errors.js';

const router = Router();

// All upload routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

/**
 * Upload a single product image
 * POST /api/upload/image
 */
router.post(
  '/image',
  uploadImage.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No image file provided');
      }

      const result = await s3Service.uploadImage(req.file, 'products');

      res.json({
        success: true,
        data: {
          original: {
            key: result.original.key,
            url: result.original.cdnUrl,
            size: result.original.size,
          },
          webp: {
            key: result.webp.key,
            url: result.webp.cdnUrl,
            size: result.webp.size,
          },
          variants: result.variants,
          srcset: s3Service.generateSrcSet(result.variants),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Upload multiple product images
 * POST /api/upload/images
 */
router.post(
  '/images',
  uploadMultipleImages.array('images', 10),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new BadRequestError('No image files provided');
      }

      const uploadPromises = req.files.map((file) =>
        s3Service.uploadImage(file, 'products')
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        data: results.map((result) => ({
          original: {
            key: result.original.key,
            url: result.original.cdnUrl,
            size: result.original.size,
          },
          webp: {
            key: result.webp.key,
            url: result.webp.cdnUrl,
            size: result.webp.size,
          },
          variants: result.variants,
          srcset: s3Service.generateSrcSet(result.variants),
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Upload a 3D model file (GLB/GLTF)
 * POST /api/upload/model
 */
router.post(
  '/model',
  upload3DModel.single('model'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No 3D model file provided');
      }

      const result = await s3Service.upload3DModel(req.file);

      res.json({
        success: true,
        data: {
          key: result.key,
          url: result.cdnUrl,
          size: result.size,
          contentType: result.contentType,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Upload inspiration image
 * POST /api/upload/inspiration
 */
router.post(
  '/inspiration',
  uploadImage.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No image file provided');
      }

      const result = await s3Service.uploadImage(req.file, 'inspirations');

      res.json({
        success: true,
        data: {
          original: {
            key: result.original.key,
            url: result.original.cdnUrl,
            size: result.original.size,
          },
          webp: {
            key: result.webp.key,
            url: result.webp.cdnUrl,
            size: result.webp.size,
          },
          variants: result.variants,
          srcset: s3Service.generateSrcSet(result.variants),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete a file from S3
 * DELETE /api/upload/:key
 */
router.delete(
  '/:key(*)',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.params.key;

      if (!key) {
        throw new BadRequestError('File key is required');
      }

      // Check if file exists
      const exists = await s3Service.fileExists(key);
      if (!exists) {
        throw new BadRequestError('File not found');
      }

      await s3Service.deleteFile(key);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Generate a signed URL for secure access
 * POST /api/upload/signed-url
 */
router.post(
  '/signed-url',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, expiresIn = 3600 } = req.body;

      if (!key) {
        throw new BadRequestError('File key is required');
      }

      // Check if file exists
      const exists = await s3Service.fileExists(key);
      if (!exists) {
        throw new BadRequestError('File not found');
      }

      const signedUrl = await s3Service.generateSignedUrl(key, expiresIn);
      const cdnSignedUrl = s3Service.generateCDNSignedUrl(key, expiresIn);

      res.json({
        success: true,
        data: {
          signedUrl,
          cdnSignedUrl,
          expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
