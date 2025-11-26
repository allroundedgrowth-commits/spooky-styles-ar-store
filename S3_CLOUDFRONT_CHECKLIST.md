# AWS S3 & CloudFront Setup Checklist

Use this checklist to verify your AWS S3 and CloudFront setup is complete and working.

## Prerequisites

- [ ] AWS Account created
- [ ] AWS CLI installed (optional)
- [ ] Backend server can run locally
- [ ] Admin user created in database

## AWS Configuration

### S3 Bucket Setup
- [ ] S3 bucket created (e.g., `spooky-styles-assets`)
- [ ] Bucket is in correct region (e.g., `us-east-1`)
- [ ] Folder structure created:
  - [ ] `products/` folder
  - [ ] `models/` folder
  - [ ] `inspirations/` folder
- [ ] Server-side encryption enabled
- [ ] Versioning configured (optional, recommended for production)

### IAM User Setup
- [ ] IAM user created (e.g., `spooky-styles-backend`)
- [ ] Programmatic access enabled
- [ ] S3 permissions attached (AmazonS3FullAccess for dev, custom policy for prod)
- [ ] Access Key ID saved
- [ ] Secret Access Key saved

### CloudFront Distribution
- [ ] CloudFront distribution created
- [ ] Origin set to S3 bucket
- [ ] Origin access control (OAC) configured
- [ ] HTTPS redirect enabled
- [ ] Cache policy set to CachingOptimized
- [ ] Distribution deployed (status: "Deployed")
- [ ] CloudFront domain noted (e.g., `d1234567890abc.cloudfront.net`)

### S3 Bucket Policy
- [ ] Bucket policy updated to allow CloudFront access
- [ ] Policy includes correct distribution ARN
- [ ] Policy tested and working

### CloudFront Signed URLs (Optional)
- [ ] RSA key pair generated
- [ ] Public key uploaded to CloudFront
- [ ] Key group created
- [ ] Distribution updated to use key group
- [ ] Key Pair ID noted
- [ ] Private key saved securely

## Backend Configuration

### Environment Variables
- [ ] `backend/.env` file exists
- [ ] `AWS_REGION` set correctly
- [ ] `AWS_ACCESS_KEY_ID` set correctly
- [ ] `AWS_SECRET_ACCESS_KEY` set correctly
- [ ] `S3_BUCKET_NAME` set correctly
- [ ] `CLOUDFRONT_DOMAIN` set (if using CloudFront)
- [ ] `CLOUDFRONT_KEY_PAIR_ID` set (if using signed URLs)
- [ ] `CLOUDFRONT_PRIVATE_KEY` set (if using signed URLs)

### Dependencies
- [ ] `@aws-sdk/client-s3` installed
- [ ] `@aws-sdk/cloudfront-signer` installed
- [ ] `@aws-sdk/s3-request-presigner` installed
- [ ] `sharp` installed (for image processing)
- [ ] `multer` installed (for file uploads)
- [ ] `uuid` installed (for unique filenames)

### Code Files
- [ ] `backend/src/config/aws.ts` exists
- [ ] `backend/src/services/s3.service.ts` exists
- [ ] `backend/src/routes/upload.routes.ts` exists
- [ ] `backend/src/middleware/upload.middleware.ts` exists
- [ ] Upload routes registered in `backend/src/index.ts`

## Frontend Configuration

### Code Files
- [ ] `frontend/src/services/upload.service.ts` exists
- [ ] `frontend/src/components/Admin/ProductForm.tsx` updated with upload UI
- [ ] Upload service imported in ProductForm

### UI Components
- [ ] Image upload button visible in admin form
- [ ] 3D model upload button visible in admin form
- [ ] Upload progress indicators working
- [ ] Image preview displays after upload
- [ ] Error messages display on upload failure

## Testing

### Backend Tests
- [ ] Run `npm run test:s3-upload` in backend
- [ ] All 8 tests pass:
  - [ ] Test 1: Create test file
  - [ ] Test 2: Upload to S3
  - [ ] Test 3: File exists check
  - [ ] Test 4: Generate signed URL
  - [ ] Test 5: Generate CloudFront signed URL (if configured)
  - [ ] Test 6: Get public URL
  - [ ] Test 7: Delete file
  - [ ] Test 8: Verify deletion

### Manual API Tests
- [ ] Start backend server (`npm run dev`)
- [ ] Get admin token (login as admin)
- [ ] Test image upload endpoint:
  ```bash
  curl -X POST http://localhost:5000/api/upload/image \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -F "image=@test.jpg"
  ```
- [ ] Response includes original, webp, and variants
- [ ] Test 3D model upload endpoint:
  ```bash
  curl -X POST http://localhost:5000/api/upload/model \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -F "model=@test.glb"
  ```
- [ ] Response includes model URL
- [ ] Test file deletion endpoint
- [ ] Test signed URL generation endpoint

### Frontend Tests
- [ ] Start frontend (`npm run dev`)
- [ ] Login as admin
- [ ] Navigate to Admin Dashboard
- [ ] Click "Create Product"
- [ ] Click image upload button
- [ ] Select an image file
- [ ] Upload completes successfully
- [ ] Image URL populates in form
- [ ] Image preview displays
- [ ] Click model upload button
- [ ] Select a GLB/GLTF file
- [ ] Upload completes successfully
- [ ] Model URL populates in form

### Integration Tests
- [ ] Create a product with uploaded image and model
- [ ] Product saves successfully
- [ ] View product in catalog
- [ ] Image loads from CloudFront URL
- [ ] Try on AR with uploaded model
- [ ] Model loads and renders correctly

### CloudFront Tests
- [ ] Access uploaded image via CloudFront URL
- [ ] Image loads successfully
- [ ] Check browser network tab for cache headers
- [ ] Verify `X-Cache: Hit from cloudfront` on second load
- [ ] Test responsive image variants load correctly
- [ ] Test WebP images load in supported browsers

## Verification

### File Upload Verification
- [ ] Log into AWS Console → S3
- [ ] Navigate to your bucket
- [ ] Check `products/` folder has uploaded images
- [ ] Check `models/` folder has uploaded 3D models
- [ ] Verify file sizes are reasonable
- [ ] Check WebP variants exist

### CloudFront Verification
- [ ] Log into AWS Console → CloudFront
- [ ] Check distribution status is "Deployed"
- [ ] View distribution statistics
- [ ] Verify requests are being served
- [ ] Check cache hit ratio (should increase over time)

### Performance Verification
- [ ] Image file sizes reduced by WebP conversion
- [ ] Responsive variants are smaller than originals
- [ ] CloudFront serves assets faster than S3 direct
- [ ] Images load quickly on slow connections

## Security Verification

- [ ] Upload endpoints require authentication
- [ ] Only admin users can upload files
- [ ] File type validation working (reject invalid types)
- [ ] File size limits enforced (5MB images, 50MB models)
- [ ] S3 bucket is not publicly accessible
- [ ] CloudFront uses HTTPS only
- [ ] Signed URLs expire after configured time (if enabled)

## Documentation

- [ ] Read `AWS_SETUP_QUICK_START.md`
- [ ] Read `backend/src/AWS_S3_CLOUDFRONT_SETUP.md`
- [ ] Read `S3_CLOUDFRONT_IMPLEMENTATION_SUMMARY.md`
- [ ] Understand upload service API
- [ ] Understand S3 service methods

## Production Readiness

### Security
- [ ] IAM user has minimal required permissions (not full S3 access)
- [ ] AWS credentials stored securely (not in git)
- [ ] CloudFront signed URLs configured for sensitive content
- [ ] CORS configured for frontend domain only
- [ ] Rate limiting enabled on upload endpoints

### Monitoring
- [ ] CloudWatch alarms set up for S3
- [ ] CloudWatch alarms set up for CloudFront
- [ ] Billing alerts configured
- [ ] Error tracking enabled
- [ ] Upload success/failure metrics tracked

### Optimization
- [ ] S3 lifecycle policies configured
- [ ] CloudFront cache behaviors optimized
- [ ] Image compression settings tuned
- [ ] 3D model Draco compression enabled
- [ ] Lazy loading implemented for images

### Backup & Recovery
- [ ] S3 versioning enabled
- [ ] Backup strategy documented
- [ ] Recovery procedure tested
- [ ] Cross-region replication configured (optional)

## Common Issues Checklist

If uploads fail, check:
- [ ] AWS credentials are correct in `.env`
- [ ] IAM user has S3 permissions
- [ ] S3 bucket name is correct
- [ ] S3 bucket exists in specified region
- [ ] Network connectivity to AWS
- [ ] File size within limits
- [ ] File type is allowed
- [ ] Admin authentication token is valid

If images don't load, check:
- [ ] CloudFront distribution is deployed
- [ ] S3 bucket policy allows CloudFront access
- [ ] CloudFront domain is correct in `.env`
- [ ] CORS is configured correctly
- [ ] URLs are using HTTPS
- [ ] Cache is not serving stale content

## Next Steps

After completing this checklist:
1. [ ] Test with real product images and models
2. [ ] Monitor AWS costs and usage
3. [ ] Optimize based on performance metrics
4. [ ] Set up automated backups
5. [ ] Document any custom configurations
6. [ ] Train team on upload process
7. [ ] Create runbook for common issues

## Sign-off

- [ ] Development environment tested and working
- [ ] Staging environment configured (if applicable)
- [ ] Production environment ready for deployment
- [ ] Team trained on upload functionality
- [ ] Documentation reviewed and approved

---

**Date Completed**: _______________

**Completed By**: _______________

**Notes**: _______________
