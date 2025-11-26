import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, s3Config, generateCloudFrontSignedUrl } from '../config/aws.js';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  cdnUrl: string;
  size: number;
  contentType: string;
}

export interface ImageVariant {
  key: string;
  url: string;
  width: number;
  format: string;
}

export class S3Service {
  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: 'products' | 'models' | 'inspirations' = 'products'
  ): Promise<UploadResult> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'max-age=31536000', // 1 year
    });

    await s3Client.send(command);

    const s3Url = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${fileName}`;
    const cdnUrl = s3Config.cloudfrontDomain
      ? `https://${s3Config.cloudfrontDomain}/${fileName}`
      : s3Url;

    return {
      key: fileName,
      url: s3Url,
      cdnUrl,
      size: file.size,
      contentType: file.mimetype,
    };
  }

  /**
   * Upload an image with automatic WebP conversion and responsive variants
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: 'products' | 'inspirations' = 'products'
  ): Promise<{
    original: UploadResult;
    webp: UploadResult;
    variants: ImageVariant[];
  }> {
    // Upload original image
    const original = await this.uploadFile(file, folder);

    // Convert to WebP
    const webpBuffer = await sharp(file.buffer)
      .webp({ quality: 85 })
      .toBuffer();

    const webpFileName = `${folder}/${uuidv4()}.webp`;
    const webpCommand = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: webpFileName,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'max-age=31536000',
    });

    await s3Client.send(webpCommand);

    const webpS3Url = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${webpFileName}`;
    const webpCdnUrl = s3Config.cloudfrontDomain
      ? `https://${s3Config.cloudfrontDomain}/${webpFileName}`
      : webpS3Url;

    const webp: UploadResult = {
      key: webpFileName,
      url: webpS3Url,
      cdnUrl: webpCdnUrl,
      size: webpBuffer.length,
      contentType: 'image/webp',
    };

    // Create responsive variants (thumbnail, medium, large)
    const variants = await this.createImageVariants(file.buffer, folder);

    return {
      original,
      webp,
      variants,
    };
  }

  /**
   * Create responsive image variants for srcset
   */
  private async createImageVariants(
    buffer: Buffer,
    folder: string
  ): Promise<ImageVariant[]> {
    const sizes = [
      { width: 320, suffix: 'thumb' },
      { width: 640, suffix: 'medium' },
      { width: 1280, suffix: 'large' },
    ];

    const variants: ImageVariant[] = [];

    for (const size of sizes) {
      const resizedBuffer = await sharp(buffer)
        .resize(size.width, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      const fileName = `${folder}/${uuidv4()}-${size.suffix}.webp`;
      const command = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: fileName,
        Body: resizedBuffer,
        ContentType: 'image/webp',
        CacheControl: 'max-age=31536000',
      });

      await s3Client.send(command);

      const cdnUrl = s3Config.cloudfrontDomain
        ? `https://${s3Config.cloudfrontDomain}/${fileName}`
        : `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${fileName}`;

      variants.push({
        key: fileName,
        url: cdnUrl,
        width: size.width,
        format: 'webp',
      });
    }

    return variants;
  }

  /**
   * Upload a 3D model file (GLTF/GLB)
   */
  async upload3DModel(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadFile(file, 'models');
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a signed URL for secure access (S3 presigned URL)
   */
  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Generate a CloudFront signed URL for CDN access
   */
  generateCDNSignedUrl(key: string, expiresIn: number = 3600): string {
    return generateCloudFrontSignedUrl(key, expiresIn);
  }

  /**
   * Get public URL for an asset (via CloudFront if configured)
   */
  getPublicUrl(key: string): string {
    if (s3Config.cloudfrontDomain) {
      return `https://${s3Config.cloudfrontDomain}/${key}`;
    }
    return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
  }

  /**
   * Generate srcset string for responsive images
   */
  generateSrcSet(variants: ImageVariant[]): string {
    return variants
      .map((variant) => `${variant.url} ${variant.width}w`)
      .join(', ');
  }
}

export const s3Service = new S3Service();
