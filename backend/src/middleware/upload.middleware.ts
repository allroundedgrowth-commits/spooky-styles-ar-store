import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors.js';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
      )
    );
  }
};

// File filter for 3D models
const modelFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'model/gltf-binary',
    'model/gltf+json',
    'application/octet-stream', // GLB files
  ];

  const allowedExtensions = ['.glb', '.gltf'];
  const fileExtension = file.originalname.toLowerCase().slice(-4);

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Invalid file type. Only GLTF and GLB 3D model files are allowed.'
      )
    );
  }
};

// Image upload middleware (max 5MB)
export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// 3D model upload middleware (max 50MB)
export const upload3DModel = multer({
  storage,
  fileFilter: modelFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Multiple images upload middleware
export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Max 10 files
  },
});
