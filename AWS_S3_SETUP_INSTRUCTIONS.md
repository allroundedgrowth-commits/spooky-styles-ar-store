# AWS S3 Setup Instructions

## ✅ Credentials Configured

Your AWS credentials have been added to the project:
- **Bucket Name:** `amz-s3-hackathon-wigs`
- **Region:** `us-east-1`
- **Access Key:** Configured ✓
- **Secret Key:** Configured ✓

---

## 🔧 Required S3 Bucket Configuration

### Step 1: Configure Bucket Permissions

Go to AWS Console → S3 → `amz-s3-hackathon-wigs` → Permissions

#### A. Block Public Access Settings
**Uncheck these options** (to allow public read access to images):
- [ ] Block all public access
- [ ] Block public access to buckets and objects granted through new access control lists (ACLs)
- [ ] Block public access to buckets and objects granted through any access control lists (ACLs)
- [ ] Block public access to buckets and objects granted through new public bucket or access point policies
- [ ] Block public and cross-account access to buckets and objects through any public bucket or access point policies

**Click "Save changes"**

---

#### B. Bucket Policy

Go to **Permissions** → **Bucket Policy** → Click "Edit"

Paste this policy (allows public read access to all objects):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::amz-s3-hackathon-wigs/*"
    }
  ]
}
```

**Click "Save changes"**

---

#### C. CORS Configuration

Go to **Permissions** → **Cross-origin resource sharing (CORS)** → Click "Edit"

Paste this CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**Click "Save changes"**

---

### Step 2: Create Folder Structure (Optional but Recommended)

In your S3 bucket, create these folders:
- `wigs/` - For wig product images
- `models/` - For 3D model files (.glb, .gltf)
- `thumbnails/` - For product thumbnails
- `accessories/` - For accessory images

---

## 🧪 Test S3 Connection

Run this command to test if your S3 connection works:

```bash
cd backend
npm run test:s3
```

Or manually:
```bash
cd backend
npx tsx src/test-s3.ts
```

This will:
1. Test AWS credentials
2. List buckets
3. Try to upload a test file
4. Verify the file is accessible

---

## 📤 How to Use S3 in Your App

### Admin Dashboard Upload

1. Go to http://localhost:3001/admin
2. Login as admin
3. Create/Edit a product
4. Upload images - they'll automatically go to S3
5. The URL will be: `https://amz-s3-hackathon-wigs.s3.us-east-1.amazonaws.com/filename.jpg`

### API Endpoints

**Upload Image:**
```bash
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

Body: { file: <image-file> }
```

**Upload 3D Model:**
```bash
POST /api/upload/model
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

Body: { file: <model-file> }
```

---

## 🌐 CloudFront CDN (Optional - For Faster Delivery)

### Benefits:
- Faster global content delivery
- Reduced S3 costs
- HTTPS by default
- Custom domain support

### Setup:
1. Go to AWS CloudFront → Create Distribution
2. Origin Domain: `amz-s3-hackathon-wigs.s3.us-east-1.amazonaws.com`
3. Origin Access: Public
4. Viewer Protocol Policy: Redirect HTTP to HTTPS
5. Create Distribution
6. Copy the CloudFront domain (e.g., `d1234567890.cloudfront.net`)
7. Update `.env` with: `CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net`

---

## 💰 Cost Monitoring

### Free Tier (First 12 months):
- ✅ 5 GB storage
- ✅ 20,000 GET requests
- ✅ 2,000 PUT requests per month

### After Free Tier:
- Storage: ~$0.023 per GB/month
- GET requests: $0.0004 per 1,000 requests
- PUT requests: $0.005 per 1,000 requests

**Estimated monthly cost for small shop:** $1-5/month

### Monitor Usage:
AWS Console → S3 → Metrics → Storage & Requests

---

## 🔒 Security Best Practices

### ✅ Already Implemented:
- IAM user with limited permissions
- Secure credential storage in .env
- CORS configuration
- Public read-only access (users can't upload)

### 🔐 Additional Security (Optional):
1. **Enable S3 Versioning** - Recover deleted files
2. **Enable Server-Side Encryption** - Encrypt files at rest
3. **Set up CloudWatch Alarms** - Monitor unusual activity
4. **Rotate Access Keys** - Every 90 days

---

## 🐛 Troubleshooting

### Error: "Access Denied"
- Check IAM user has S3 permissions
- Verify bucket policy is correct
- Ensure Block Public Access is OFF

### Error: "CORS Error"
- Verify CORS configuration is saved
- Check AllowedOrigins includes your domain
- Clear browser cache

### Error: "Bucket Not Found"
- Verify bucket name is correct
- Check region matches (us-east-1)
- Ensure credentials are for correct AWS account

### Files Upload But Can't Access
- Check bucket policy allows public read
- Verify URL format: `https://BUCKET.s3.REGION.amazonaws.com/KEY`
- Test URL in incognito browser

---

## 📝 Next Steps

1. ✅ Configure bucket permissions (Steps above)
2. ✅ Test S3 connection: `npm run test:s3`
3. ✅ Upload test image via admin dashboard
4. ✅ Verify image is publicly accessible
5. ⏭️ (Optional) Set up CloudFront CDN
6. ⏭️ (Optional) Configure custom domain

---

## 🆘 Need Help?

Check these files for more details:
- `backend/src/services/s3.service.ts` - S3 upload logic
- `backend/src/routes/upload.routes.ts` - Upload API endpoints
- `backend/src/test-s3.ts` - Connection test script
- `backend/src/AWS_SETUP_GUIDE.md` - Detailed AWS guide

---

**Status:** ✅ Credentials configured, ready to test!
**Next:** Configure bucket permissions and run test
