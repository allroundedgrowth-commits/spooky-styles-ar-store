# AWS S3 and CloudFront Setup Guide

This guide covers the complete setup of AWS S3 for asset storage and CloudFront CDN for fast, secure content delivery.

## Overview

The Spooky Styles platform uses AWS S3 to store:
- Product images (with automatic WebP conversion)
- 3D model files (GLB/GLTF)
- Costume inspiration images

CloudFront CDN is used to:
- Deliver assets with low latency globally
- Provide signed URLs for secure access
- Cache assets at edge locations
- Reduce S3 bandwidth costs

## Features Implemented

✅ S3 bucket configuration for asset storage
✅ CloudFront CDN distribution
✅ Signed URL generation for secure access
✅ Admin upload endpoints (images and 3D models)
✅ Automatic WebP conversion for images
✅ Responsive image variants (320w, 640w, 1280w)
✅ Srcset generation for responsive images
✅ File validation and size limits
✅ Frontend upload service integration

## AWS Setup Instructions

### Step 1: Create S3 Bucket

1. Log in to AWS Console and navigate to S3
2. Click "Create bucket"
3. Configure the bucket:
   - **Bucket name**: `spooky-styles-assets` (or your preferred name)
   - **Region**: `us-east-1` (or your preferred region)
   - **Block Public Access**: Keep all blocks enabled (we'll use CloudFront)
   - **Versioning**: Optional (recommended for production)
   - **Encryption**: Enable server-side encryption (SSE-S3)

4. Create folder structure:
   ```
   spooky-styles-assets/
   ├── products/      (product images)
   ├── models/        (3D GLB/GLTF files)
   └── inspirations/  (costume inspiration images)
   ```

### Step 2: Configure S3 Bucket Policy

Add this bucket policy to allow CloudFront access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::spooky-styles-assets/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

### Step 3: Create CloudFront Distribution

1. Navigate to CloudFront in AWS Console
2. Click "Create Distribution"
3. Configure the distribution:

**Origin Settings:**
- **Origin domain**: Select your S3 bucket
- **Origin access**: Origin access control settings (recommended)
- **Origin access control**: Create new OAC
- **Enable Origin Shield**: Optional (for additional caching)

**Default Cache Behavior:**
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Allowed HTTP methods**: GET, HEAD, OPTIONS
- **Cache policy**: CachingOptimized
- **Origin request policy**: CORS-S3Origin

**Distribution Settings:**
- **Price class**: Use all edge locations (or select based on your needs)
- **Alternate domain name (CNAME)**: Optional (e.g., `cdn.spookystyles.com`)
- **SSL certificate**: Default CloudFront certificate (or custom)
- **Default root object**: Leave empty

4. Click "Create Distribution"
5. Note your CloudFront domain: `d1234567890abc.cloudfront.net`

### Step 4: Create IAM User for Backend Access

1. Navigate to IAM in AWS Console
2. Click "Users" → "Add users"
3. Configure user:
   - **User name**: `spooky-styles-backend`
   - **Access type**: Programmatic access

4. Attach permissions:
   - Create custom policy or use `AmazonS3FullAccess` (for development)
   - For production, use this minimal policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::spooky-styles-assets/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::spooky-styles-assets"
    }
  ]
}
```

5. Save the Access Key ID and Secret Access Key

### Step 5: Configure CloudFront Signed URLs (Optional)

For secure, time-limited access to assets:

1. Create a CloudFront key pair:
   - Navigate to CloudFront → Key management → Public keys
   - Click "Create public key"
   - Upload your RSA public key or generate one:

```bash
# Generate RSA key pair
openssl genrsa -out private_key.pem 2048
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

2. Create a key group:
   - Navigate to Key groups → Create key group
   - Add your public key to the group

3. Update your CloudFront distribution:
   - Edit the cache behavior
   - Under "Restrict viewer access": Yes
   - Select your key group

4. Note your Key Pair ID

### Step 6: Configure Environment Variables

Update `backend/.env`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=spooky-styles-assets

# CloudFront Configuration
CLOUDFRONT_DOMAIN=d1234567890abc.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=K2JCJMDEHXQW5F
CLOUDFRONT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----
```

**Note**: For the private key, replace newlines with `\n` or store it in a file and reference the path.

## API Endpoints

### Upload Image
```http
POST /api/upload/image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body:
- image: File (JPEG, PNG, WebP, GIF, max 5MB)

Response:
{
  "success": true,
  "data": {
    "original": {
      "key": "products/uuid.jpg",
      "url": "https://cdn.example.com/products/uuid.jpg",
      "size": 1234567
    },
    "webp": {
      "key": "products/uuid.webp",
      "url": "https://cdn.example.com/products/uuid.webp",
      "size": 654321
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
    "srcset": "https://cdn.example.com/products/uuid-thumb.webp 320w, ..."
  }
}
```

### Upload 3D Model
```http
POST /api/upload/model
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body:
- model: File (GLB or GLTF, max 50MB)

Response:
{
  "success": true,
  "data": {
    "key": "models/uuid.glb",
    "url": "https://cdn.example.com/models/uuid.glb",
    "size": 12345678,
    "contentType": "model/gltf-binary"
  }
}
```

### Upload Multiple Images
```http
POST /api/upload/images
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body:
- images: File[] (up to 10 images)

Response:
{
  "success": true,
  "data": [
    { /* same structure as single image upload */ }
  ]
}
```

### Delete File
```http
DELETE /api/upload/:key
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Generate Signed URL
```http
POST /api/upload/signed-url
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "key": "products/uuid.jpg",
  "expiresIn": 3600
}

Response:
{
  "success": true,
  "data": {
    "signedUrl": "https://bucket.s3.amazonaws.com/...",
    "cdnSignedUrl": "https://cdn.example.com/...",
    "expiresIn": 3600
  }
}
```

## Frontend Integration

### Using the Upload Service

```typescript
import uploadService from './services/upload.service';

// Upload an image
const handleImageUpload = async (file: File) => {
  // Validate file
  const validation = uploadService.validateImageFile(file);
  if (!validation.valid) {
    console.error(validation.error);
    return;
  }

  // Upload
  const result = await uploadService.uploadImage(file);
  console.log('Image URL:', result.webp.url);
  console.log('Srcset:', result.srcset);
};

// Upload a 3D model
const handleModelUpload = async (file: File) => {
  const validation = uploadService.validate3DModelFile(file);
  if (!validation.valid) {
    console.error(validation.error);
    return;
  }

  const result = await uploadService.upload3DModel(file);
  console.log('Model URL:', result.url);
};

// Generate signed URL
const getSecureUrl = async (key: string) => {
  const result = await uploadService.generateSignedUrl(key, 3600);
  console.log('Signed URL:', result.cdnSignedUrl);
};
```

### Using Responsive Images

```tsx
import { ImageUploadResult } from './services/upload.service';

const ProductImage: React.FC<{ image: ImageUploadResult }> = ({ image }) => {
  return (
    <picture>
      <source
        srcSet={image.srcset}
        sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
        type="image/webp"
      />
      <img
        src={image.webp.url}
        alt="Product"
        loading="lazy"
      />
    </picture>
  );
};
```

## Performance Optimization

### Image Optimization
- **Automatic WebP conversion**: 30-50% smaller than JPEG
- **Responsive variants**: Serve appropriate sizes for different devices
- **Lazy loading**: Use `loading="lazy"` attribute
- **Cache headers**: 1-year cache for immutable assets

### 3D Model Optimization
- **Draco compression**: Reduce GLB file sizes by 70%
- **Progressive loading**: Load low-poly first, then high-poly
- **Model caching**: Cache loaded models in memory

### CloudFront Optimization
- **Edge caching**: Assets cached at 200+ edge locations
- **Compression**: Automatic gzip/brotli compression
- **HTTP/2**: Multiplexed connections for faster loading

## Security Best Practices

1. **Never expose AWS credentials**: Use environment variables
2. **Use signed URLs**: For sensitive or premium content
3. **Implement rate limiting**: Prevent abuse of upload endpoints
4. **Validate file types**: Check MIME types and extensions
5. **Scan uploads**: Consider integrating virus scanning
6. **Set size limits**: Prevent large file uploads
7. **Use HTTPS only**: Enforce secure connections
8. **Implement CORS**: Restrict origins that can access assets

## Cost Optimization

1. **Use CloudFront**: Reduces S3 data transfer costs
2. **Set lifecycle policies**: Archive or delete old assets
3. **Use S3 Intelligent-Tiering**: Automatic cost optimization
4. **Monitor usage**: Set up billing alerts
5. **Optimize images**: Smaller files = lower storage and transfer costs

## Monitoring and Troubleshooting

### CloudWatch Metrics
- S3 bucket size and object count
- CloudFront requests and data transfer
- Error rates (4xx, 5xx)

### Common Issues

**Issue**: Images not loading
- Check CloudFront distribution status (must be "Deployed")
- Verify S3 bucket policy allows CloudFront access
- Check CORS configuration

**Issue**: Upload fails with 403
- Verify IAM user has correct permissions
- Check AWS credentials in environment variables
- Ensure bucket name is correct

**Issue**: Slow upload speeds
- Check file size (compress before upload)
- Verify network connection
- Consider multipart upload for large files

## Testing

Test the upload functionality:

```bash
# Test image upload
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@test-image.jpg"

# Test 3D model upload
curl -X POST http://localhost:5000/api/upload/model \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "model=@test-model.glb"
```

## Production Checklist

- [ ] S3 bucket created with proper naming
- [ ] CloudFront distribution deployed
- [ ] IAM user created with minimal permissions
- [ ] Environment variables configured
- [ ] Bucket policy allows CloudFront access
- [ ] CORS configured for frontend domain
- [ ] SSL certificate configured (if using custom domain)
- [ ] Signed URLs configured (if needed)
- [ ] Lifecycle policies set up
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented
- [ ] Cost alerts set up

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [CloudFront Signed URLs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html)
- [S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
