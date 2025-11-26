# Asset Storage System - AWS S3 & CloudFront

Complete asset storage solution for Spooky Styles using AWS S3 and CloudFront CDN.

## 🎃 Quick Links

- **Quick Start**: [AWS_SETUP_QUICK_START.md](AWS_SETUP_QUICK_START.md) - 5-minute setup guide
- **Detailed Setup**: [backend/src/AWS_S3_CLOUDFRONT_SETUP.md](backend/src/AWS_S3_CLOUDFRONT_SETUP.md) - Complete configuration guide
- **Implementation Summary**: [S3_CLOUDFRONT_IMPLEMENTATION_SUMMARY.md](S3_CLOUDFRONT_IMPLEMENTATION_SUMMARY.md) - Technical details
- **Checklist**: [S3_CLOUDFRONT_CHECKLIST.md](S3_CLOUDFRONT_CHECKLIST.md) - Verification checklist

## 📋 What's Included

### Backend Implementation
- ✅ AWS S3 client configuration
- ✅ CloudFront CDN integration
- ✅ File upload service (images & 3D models)
- ✅ Automatic WebP conversion
- ✅ Responsive image variants (320w, 640w, 1280w)
- ✅ Signed URL generation (S3 & CloudFront)
- ✅ Admin upload API endpoints
- ✅ File validation and size limits
- ✅ Delete functionality

### Frontend Implementation
- ✅ Upload service with TypeScript types
- ✅ Admin UI with upload buttons
- ✅ Real-time upload progress
- ✅ Image preview
- ✅ Client-side validation
- ✅ Error handling

### Documentation
- ✅ Quick start guide
- ✅ Detailed setup instructions
- ✅ API documentation
- ✅ Usage examples
- ✅ Troubleshooting guide
- ✅ Verification checklist

## 🚀 Getting Started

### 1. AWS Setup (5 minutes)

```bash
# Create S3 bucket
aws s3 mb s3://spooky-styles-assets --region us-east-1

# Create IAM user and get credentials
aws iam create-user --user-name spooky-styles-backend
aws iam create-access-key --user-name spooky-styles-backend
```

See [AWS_SETUP_QUICK_START.md](AWS_SETUP_QUICK_START.md) for detailed steps.

### 2. Configure Environment

Update `backend/.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=spooky-styles-assets
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
```

### 3. Test Setup

```bash
cd backend
npm run test:s3-upload
```

### 4. Start Using

Upload files through the admin dashboard or API:

```bash
# Via API
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@product.jpg"

# Via Admin UI
# 1. Login as admin
# 2. Go to Admin Dashboard
# 3. Create/Edit Product
# 4. Click "Upload" buttons
```

## 📁 File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── aws.ts                    # AWS configuration
│   ├── services/
│   │   └── s3.service.ts             # Upload/delete operations
│   ├── routes/
│   │   └── upload.routes.ts          # API endpoints
│   ├── middleware/
│   │   └── upload.middleware.ts      # File validation
│   └── test-s3-upload.ts             # Test script

frontend/
├── src/
│   ├── services/
│   │   └── upload.service.ts         # Frontend API
│   └── components/
│       └── Admin/
│           └── ProductForm.tsx       # Upload UI

Documentation/
├── AWS_SETUP_QUICK_START.md          # Quick start
├── S3_CLOUDFRONT_IMPLEMENTATION_SUMMARY.md
├── S3_CLOUDFRONT_CHECKLIST.md
└── ASSET_STORAGE_README.md           # This file
```

## 🔧 API Endpoints

### Upload Image
```http
POST /api/upload/image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body: image (File, max 5MB)

Returns: original, webp, variants, srcset
```

### Upload 3D Model
```http
POST /api/upload/model
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body: model (GLB/GLTF, max 50MB)

Returns: key, url, size, contentType
```

### Delete File
```http
DELETE /api/upload/:key
Authorization: Bearer <admin_token>

Returns: success message
```

### Generate Signed URL
```http
POST /api/upload/signed-url
Authorization: Bearer <admin_token>
Content-Type: application/json

Body: { key, expiresIn }

Returns: signedUrl, cdnSignedUrl
```

## 💻 Usage Examples

### Backend
```typescript
import { s3Service } from './services/s3.service';

// Upload image with WebP conversion
const result = await s3Service.uploadImage(file, 'products');
console.log('WebP URL:', result.webp.url);
console.log('Srcset:', s3Service.generateSrcSet(result.variants));

// Upload 3D model
const model = await s3Service.upload3DModel(modelFile);
console.log('Model URL:', model.url);
```

### Frontend
```typescript
import uploadService from './services/upload.service';

// Upload with validation
const validation = uploadService.validateImageFile(file);
if (validation.valid) {
  const result = await uploadService.uploadImage(file);
  console.log('Uploaded:', result.webp.url);
}
```

### React Component
```tsx
const [uploading, setUploading] = useState(false);

const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);
  try {
    const result = await uploadService.uploadImage(file);
    setImageUrl(result.webp.url);
  } finally {
    setUploading(false);
  }
};
```

## 🎯 Features

### Automatic Image Optimization
- **WebP Conversion**: 30-50% smaller than JPEG
- **Responsive Variants**: 3 sizes for different devices
- **Srcset Generation**: Automatic responsive image markup
- **Quality Optimization**: 85% quality for best size/quality ratio

### 3D Model Support
- **GLB/GLTF**: Industry-standard 3D formats
- **Large Files**: Up to 50MB per model
- **CDN Delivery**: Fast loading via CloudFront
- **Caching**: 1-year cache for optimal performance

### Security
- **Admin Only**: Upload endpoints require admin auth
- **File Validation**: Type and size checking
- **Signed URLs**: Time-limited secure access
- **HTTPS Only**: Encrypted connections

### Performance
- **CloudFront CDN**: Global edge caching
- **Cache Headers**: 1-year cache for assets
- **Compression**: Automatic gzip/brotli
- **HTTP/2**: Multiplexed connections

## 🧪 Testing

### Automated Tests
```bash
cd backend
npm run test:s3-upload
```

Tests verify:
- S3 configuration
- File upload/delete
- Signed URL generation
- CloudFront integration

### Manual Testing
1. Start backend: `npm run dev`
2. Get admin token: Login as admin
3. Test upload: Use curl or admin UI
4. Verify: Check S3 bucket and CloudFront

## 📊 Monitoring

### CloudWatch Metrics
- S3 bucket size and object count
- CloudFront requests and data transfer
- Error rates (4xx, 5xx)
- Cache hit ratio

### Cost Monitoring
- Set up billing alerts
- Monitor S3 storage costs
- Track CloudFront data transfer
- Review monthly AWS bill

## 🔒 Security Best Practices

1. **Never commit AWS credentials** - Use environment variables
2. **Use minimal IAM permissions** - Grant only required access
3. **Enable signed URLs** - For sensitive content
4. **Implement rate limiting** - Prevent abuse
5. **Validate all uploads** - Check file types and sizes
6. **Use HTTPS only** - Enforce secure connections
7. **Monitor access logs** - Track unusual activity

## 💰 Cost Optimization

1. **Use CloudFront** - Reduces S3 transfer costs
2. **Set lifecycle policies** - Archive old assets
3. **Optimize images** - Smaller files = lower costs
4. **Monitor usage** - Set up billing alerts
5. **Use S3 Intelligent-Tiering** - Automatic optimization

**Estimated Costs**:
- Development: < $5/month
- Production (1000 products): ~$10-15/month

## 🐛 Troubleshooting

### Upload Fails
- Check AWS credentials in `.env`
- Verify IAM permissions
- Ensure bucket exists
- Check file size limits

### Images Don't Load
- Wait for CloudFront deployment (5-10 min)
- Verify bucket policy
- Check CloudFront domain
- Test with direct S3 URL

### Slow Uploads
- Check file size (compress first)
- Verify network connection
- Consider multipart upload

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Multer File Upload](https://github.com/expressjs/multer)

## ✅ Verification

Use [S3_CLOUDFRONT_CHECKLIST.md](S3_CLOUDFRONT_CHECKLIST.md) to verify:
- [ ] AWS setup complete
- [ ] Environment configured
- [ ] Tests passing
- [ ] Upload working in admin UI
- [ ] Images loading via CloudFront
- [ ] Security measures in place

## 🎉 Success Criteria

Your setup is complete when:
1. ✅ All tests pass (`npm run test:s3-upload`)
2. ✅ Admin can upload images and models
3. ✅ Files appear in S3 bucket
4. ✅ Assets load via CloudFront URLs
5. ✅ WebP conversion working
6. ✅ Responsive variants generated

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review error logs
3. Verify AWS configuration
4. Test with curl commands
5. Check CloudWatch logs

## 📝 Notes

- CloudFront deployment takes 5-10 minutes
- Signed URLs are optional for development
- WebP conversion requires Sharp library
- File uploads are admin-only by default
- Cache headers set to 1 year for immutability

---

**Status**: ✅ Complete and Production Ready

**Last Updated**: Task 27 Implementation

**Requirements Satisfied**: 1.2, 3.1, 7.1
