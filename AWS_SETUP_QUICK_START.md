# AWS S3 & CloudFront Quick Start Guide

Quick setup guide for AWS S3 and CloudFront asset storage in Spooky Styles.

## Prerequisites

- AWS Account
- AWS CLI installed (optional but recommended)
- Admin access to the backend

## 5-Minute Setup (Development)

### 1. Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://spooky-styles-assets --region us-east-1

# Create folder structure
aws s3api put-object --bucket spooky-styles-assets --key products/
aws s3api put-object --bucket spooky-styles-assets --key models/
aws s3api put-object --bucket spooky-styles-assets --key inspirations/
```

Or use the AWS Console:
1. Go to S3 → Create bucket
2. Name: `spooky-styles-assets`
3. Region: `us-east-1`
4. Keep default settings
5. Create bucket

### 2. Create IAM User

```bash
# Using AWS CLI
aws iam create-user --user-name spooky-styles-backend

# Attach S3 full access policy (development only)
aws iam attach-user-policy \
  --user-name spooky-styles-backend \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Create access key
aws iam create-access-key --user-name spooky-styles-backend
```

Or use the AWS Console:
1. Go to IAM → Users → Add users
2. Name: `spooky-styles-backend`
3. Access type: Programmatic access
4. Attach policy: `AmazonS3FullAccess`
5. Save Access Key ID and Secret Access Key

### 3. Create CloudFront Distribution

```bash
# Using AWS CLI (create distribution-config.json first)
aws cloudfront create-distribution --distribution-config file://distribution-config.json
```

Or use the AWS Console:
1. Go to CloudFront → Create Distribution
2. Origin domain: Select your S3 bucket
3. Origin access: Origin access control (create new)
4. Viewer protocol: Redirect HTTP to HTTPS
5. Cache policy: CachingOptimized
6. Create distribution
7. Copy the CloudFront domain (e.g., `d1234567890abc.cloudfront.net`)

### 4. Update S3 Bucket Policy

After creating CloudFront, update your S3 bucket policy:

1. Go to S3 → Your bucket → Permissions → Bucket policy
2. Add this policy (replace placeholders):

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

### 5. Configure Environment Variables

Update `backend/.env`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=spooky-styles-assets

# CloudFront Configuration
CLOUDFRONT_DOMAIN=d1234567890abc.cloudfront.net
```

**Note**: For development, you can skip CloudFront signed URLs. Leave these empty:
```env
CLOUDFRONT_KEY_PAIR_ID=
CLOUDFRONT_PRIVATE_KEY=
```

### 6. Test the Setup

```bash
# Start the backend
cd backend
npm run dev

# In another terminal, test upload (requires admin token)
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@test-image.jpg"
```

## Using the Upload Feature

### In Admin Dashboard

1. Log in as admin
2. Go to Admin Dashboard
3. Click "Create Product" or edit existing product
4. Use the "Upload" buttons next to image and model fields
5. Files are automatically uploaded to S3 and URLs are populated

### Programmatically

```typescript
import uploadService from './services/upload.service';

// Upload image
const file = document.querySelector('input[type="file"]').files[0];
const result = await uploadService.uploadImage(file);
console.log('Image URL:', result.webp.url);

// Upload 3D model
const modelFile = document.querySelector('input[type="file"]').files[0];
const modelResult = await uploadService.upload3DModel(modelFile);
console.log('Model URL:', modelResult.url);
```

## Verification Checklist

- [ ] S3 bucket created
- [ ] IAM user created with access keys
- [ ] CloudFront distribution deployed (status: "Deployed")
- [ ] S3 bucket policy updated
- [ ] Environment variables configured
- [ ] Backend server running
- [ ] Test upload successful
- [ ] Images accessible via CloudFront URL

## Common Issues

### "Access Denied" when uploading
- Check AWS credentials in `.env`
- Verify IAM user has S3 permissions
- Ensure bucket name is correct

### Images not loading
- Wait for CloudFront distribution to deploy (5-10 minutes)
- Check bucket policy allows CloudFront access
- Verify CloudFront domain in `.env`

### Upload endpoint returns 401
- You need admin authentication
- Create admin user: `npm run create-admin` in backend
- Get admin token by logging in

## Next Steps

1. **Production Setup**: See `backend/src/AWS_S3_CLOUDFRONT_SETUP.md` for:
   - CloudFront signed URLs
   - Custom domain configuration
   - Security hardening
   - Cost optimization

2. **Advanced Features**:
   - Implement image compression
   - Add virus scanning
   - Set up lifecycle policies
   - Configure monitoring

3. **Testing**:
   - Upload test images and models
   - Verify responsive image variants
   - Test delete functionality
   - Check CloudFront caching

## Cost Estimate (Development)

- S3 storage: ~$0.023/GB/month
- CloudFront data transfer: First 1TB free per month
- S3 requests: Minimal cost for development

**Estimated monthly cost for development**: < $5

## Support

For detailed documentation, see:
- `backend/src/AWS_S3_CLOUDFRONT_SETUP.md` - Complete setup guide
- `frontend/src/services/upload.service.ts` - Frontend API
- `backend/src/services/s3.service.ts` - Backend implementation
