import apiService from './apiService';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

export interface ImageUploadResult {
  original: UploadResult;
  webp: UploadResult;
  variants: Array<{
    key: string;
    url: string;
    width: number;
    format: string;
  }>;
  srcset: string;
}

export interface ModelUploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface SignedUrlResult {
  signedUrl: string;
  cdnSignedUrl: string;
  expiresIn: number;
}

class UploadService {
  /**
   * Upload a single product image
   */
  async uploadImage(file: File): Promise<ImageUploadResult> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiService.post<{ data: ImageUploadResult }>(
      '/upload/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Upload multiple product images
   */
  async uploadImages(files: File[]): Promise<ImageUploadResult[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiService.post<{ data: ImageUploadResult[] }>(
      '/upload/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Upload a 3D model file (GLB/GLTF)
   */
  async upload3DModel(file: File): Promise<ModelUploadResult> {
    const formData = new FormData();
    formData.append('model', file);

    const response = await apiService.post<{ data: ModelUploadResult }>(
      '/upload/model',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Upload inspiration image
   */
  async uploadInspirationImage(file: File): Promise<ImageUploadResult> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiService.post<{ data: ImageUploadResult }>(
      '/upload/inspiration',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    await apiService.delete(`/upload/${encodeURIComponent(key)}`);
  }

  /**
   * Generate a signed URL for secure access
   */
  async generateSignedUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<SignedUrlResult> {
    const response = await apiService.post<{ data: SignedUrlResult }>(
      '/upload/signed-url',
      { key, expiresIn }
    );

    return response.data;
  }

  /**
   * Validate file type for images
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    return { valid: true };
  }

  /**
   * Validate file type for 3D models
   */
  validate3DModelFile(file: File): { valid: boolean; error?: string } {
    const allowedExtensions = ['.glb', '.gltf'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return {
        valid: false,
        error: 'Invalid file type. Only GLTF and GLB 3D model files are allowed.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 50MB limit.',
      };
    }

    return { valid: true };
  }

  /**
   * Generate srcset attribute for responsive images
   */
  generateSrcSetAttribute(variants: ImageUploadResult['variants']): string {
    return variants.map((v) => `${v.url} ${v.width}w`).join(', ');
  }
}

export const uploadService = new UploadService();
export default uploadService;
