# AWS S3 and CloudFront Asset Storage

This document describes the AWS S3 and CloudFront integration for secure asset storage and delivery in the Spooky Styles application.

## Overview

The application uses AWS S3 for storing product images, 3D models, and costume inspiration images. CloudFront CDN is used for fast, global content delivery with optional signed URLs for secure access.

## Features

### 1. S3 Bucket Storage
- **Product Images**: JPEG, PNG, WebP, GIF (max 5MB)
- **3D Models**: GLB, GLTF files (max 50MB)
- **Inspiration Images**: Same as product images

### 2. Automatic WebP Conversion
All uploaded images are automatically converted to WebP format for optimal performance:
- Original format preserved
- WebP version created (85% quality)
- ~30-50% smaller file sizes

### 3. Responsive Image Variants
Three responsive variants are automatically generated for each image:
- **Thumbnail**: 320px width
- **Medium**: 640px width
- **Large**: 1280px width

All variants are in WebP format with srcset support.

### 4. CloudFront CDN Distribution
- Global content delivery
- Edge caching for fast access
- Optional signed URLs for secure content

### 5. Signed URL Generation
Two types of signed URLs:
- **S3 Presigned URLs**: Direct S3 access (1 hour default)
- **CloudFront Signed URLs**: CDN access with custom expiration

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=spooky-styles-assets

# CloudFront Configuration (optional)
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=your_cloudfront_key_pair_id
CLOUDFRONT_PRIVATE_KEY=your_cloudfront_private_key
```

### AWS Setup

#### 1. Create S3 Bucket

```bash
aws s3 mb s3://spooky-styles-assets --region us-east-1
```

#### 2. Configure Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::spooky-styles-assets/*"
    }
  ]
}
```

#### 3. Enable CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

#### 4. Create CloudFront Distribution

1. Go to CloudFront console
2. Create distribution with S3 bucket as origin
3. Enable compression
4. Set cache behavior (1 year for assets)
5. (Optional) Create key pair for signed URLs

## API Endpoints

All upload endpoints require authentication and admin privileges.

### Upload Single Image

```http
POST /api/upload/image
Content-Type: multipart/form-data

{
  "image": <file>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original": {
      "key": "products/uuid.jpg",
      "url": "https://cdn.example.com/products/uuid.jpg",
      "size": 245678
    },
    "webp": {
      "key": "products/uuid.webp",
      "url": "https://cdn.example.com/products/uuid.webp",
      "size": 123456
    },
    "variants": [
      {
        "key": "products/uuid-thumb.webp",
        "url": "https://cdn.example.com/products/uuid-thumb.webp",
        "width": 320,
        "format": "webp"
      },
      {
        "key": "products/uuid-medium.webp",
        "url": "https://cdn.example.com/products/uuid-medium.webp",
        "width": 640,
        "format": "webp"
      },
      {
        "key": "products/uuid-large.webp",
        "url": "https://cdn.example.com/products/uuid-large.webp",
        "width": 1280,
        "format": "webp"
      }
    ],
    "srcset": "https://cdn.example.com/products/uuid-thumb.webp 320w, https://cdn.example.com/products/uuid-medium.webp 640w, https://cdn.example.com/products/uuid-large.webp 1280w"
  }
}
```

### Upload Multiple Images

```http
POST /api/upload/images
Content-Type: multipart/form-data

{
  "images": [<file1>, <file2>, ...]
}
```

### Upload 3D Model

```http
POST /api/upload/model
Content-Type: multipart/form-data

{
  "model": <file>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "models/uuid.glb",
    "url": "https://cdn.example.com/models/uuid.glb",
    "size": 1234567,
    "contentType": "model/gltf-binary"
  }
}
```

### Upload Inspiration Image

```http
POST /api/upload/inspiration
Content-Type: multipart/form-data

{
  "image": <file>
}
```

### Delete File

```http
DELETE /api/upload/:key
```

Example:
```http
DELETE /api/upload/products/uuid.jpg
```

### Generate Signed URL

```http
POST /api/upload/signed-url
Content-Type: application/json

{
  "key": "products/uuid.jpg",
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signedUrl": "https://bucket.s3.amazonaws.com/products/uuid.jpg?X-Amz-...",
    "cdnSignedUrl": "https://cdn.example.com/products/uuid.jpg?Expires=...",
    "expiresIn": 3600
  }
}
```

## Usage Examples

### Backend Service Usage

```typescript
import { s3Service } from './services/s3.service';

// Upload an image
const result = await s3Service.uploadImage(file, 'products');
console.log('Image URL:', result.webp.cdnUrl);
console.log('Srcset:', s3Service.generateSrcSet(result.variants));

// Upload a 3D model
const modelResult = await s3Service.upload3DModel(modelFile);
console.log('Model URL:', modelResult.cdnUrl);

// Delete a file
await s3Service.deleteFile('products/uuid.jpg');

// Generate signed URL
const signedUrl = await s3Service.generateSignedUrl('products/uuid.jpg', 3600);

// Get public URL
const publicUrl = s3Service.getPublicUrl('products/uuid.jpg');
```

### Frontend Integration

```typescript
// Upload product image
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const { data } = await response.json();

// Use responsive images
<picture>
  <source
    type="image/webp"
    srcSet={data.srcset}
    sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
  />
  <img src={data.webp.url} alt="Product" />
</picture>
```

## File Organization

Files are organized in S3 with the following structure:

```
spooky-styles-assets/
├── products/
│   ├── uuid-1.jpg (original)
│   ├── uuid-1.webp (webp version)
│   ├── uuid-1-thumb.webp (320px)
│   ├── uuid-1-medium.webp (640px)
│   └── uuid-1-large.webp (1280px)
├── models/
│   ├── uuid-2.glb
│   └── uuid-3.gltf
└── inspirations/
    ├── uuid-4.jpg
    └── uuid-4.webp
```

## Performance Optimizations

1. **Automatic WebP Conversion**: 30-50% smaller file sizes
2. **Responsive Variants**: Serve appropriate image sizes
3. **CloudFront CDN**: Global edge caching
4. **Cache Headers**: 1-year cache for immutable assets
5. **Compression**: Gzip/Brotli at CloudFront edge

## Security Features

1. **Admin-Only Uploads**: All upload endpoints require admin authentication
2. **File Type Validation**: Strict MIME type and extension checking
3. **File Size Limits**: 5MB for images, 50MB for models
4. **Signed URLs**: Optional secure access with expiration
5. **CORS Configuration**: Restricted to allowed origins

## Error Handling

The service handles various error scenarios:

- Invalid file types
- File size exceeded
- S3 upload failures
- File not found
- Permission errors

All errors are properly logged and returned with appropriate HTTP status codes.

## Monitoring

Monitor these metrics:

- S3 storage usage
- CloudFront bandwidth
- Upload success/failure rates
- Average file sizes
- CDN cache hit ratio

## Cost Optimization

1. Use CloudFront for frequently accessed assets
2. Set appropriate cache headers
3. Use WebP format to reduce bandwidth
4. Implement lifecycle policies for old assets
5. Monitor and optimize storage usage

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 1.2**: 3D model storage and delivery for AR try-on
- **Requirement 3.1**: Product image storage and display
- **Requirement 7.1**: Admin product management with image/model uploads

## Next Steps

1. Configure AWS credentials in production
2. Set up CloudFront distribution
3. Configure DNS for custom domain
4. Set up monitoring and alerts
5. Implement asset cleanup policies
