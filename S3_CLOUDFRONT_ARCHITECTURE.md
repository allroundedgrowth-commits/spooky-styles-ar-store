# AWS S3 & CloudFront Architecture

Visual guide to the asset storage architecture for Spooky Styles.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin User                               │
│                    (Product Management)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Upload Request
                         │ (Image/3D Model)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ProductForm Component                                    │  │
│  │  - File input with validation                            │  │
│  │  - Upload progress indicator                             │  │
│  │  - Image preview                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                        │
│                         │ uploadService.uploadImage(file)        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Upload Service                                           │  │
│  │  - validateImageFile()                                    │  │
│  │  - validate3DModelFile()                                  │  │
│  │  - POST /api/upload/image                                 │  │
│  │  - POST /api/upload/model                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP POST (multipart/form-data)
                         │ Authorization: Bearer <admin_token>
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Upload Routes (/api/upload)                             │  │
│  │  - POST /image                                            │  │
│  │  - POST /images                                           │  │
│  │  - POST /model                                            │  │
│  │  - DELETE /:key                                           │  │
│  │  - POST /signed-url                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                        │
│                         │ authenticate() middleware              │
│                         │ requireAdmin() middleware              │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Upload Middleware (Multer)                              │  │
│  │  - Memory storage                                         │  │
│  │  - File type validation                                   │  │
│  │  - Size limits (5MB images, 50MB models)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                        │
│                         │ req.file                               │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  S3 Service                                               │  │
│  │  - uploadImage() → WebP conversion                        │  │
│  │  - createImageVariants() → 320w, 640w, 1280w            │  │
│  │  - upload3DModel()                                        │  │
│  │  - deleteFile()                                           │  │
│  │  - generateSignedUrl()                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                        │
│                         │ AWS SDK v3                             │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AWS Configuration                                        │  │
│  │  - S3Client initialization                                │  │
│  │  - CloudFront signer setup                                │  │
│  │  - Environment variables                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ PutObjectCommand
                         │ DeleteObjectCommand
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS S3 Bucket                               │
│                  (spooky-styles-assets)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  products/                                                │  │
│  │  ├── uuid-original.jpg                                    │  │
│  │  ├── uuid.webp                                            │  │
│  │  ├── uuid-thumb.webp (320w)                               │  │
│  │  ├── uuid-medium.webp (640w)                              │  │
│  │  └── uuid-large.webp (1280w)                              │  │
│  │                                                            │  │
│  │  models/                                                   │  │
│  │  └── uuid.glb                                             │  │
│  │                                                            │  │
│  │  inspirations/                                             │  │
│  │  └── uuid.webp                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Properties:                                                     │
│  - Region: us-east-1                                            │
│  - Encryption: SSE-S3                                           │
│  - Versioning: Enabled (optional)                               │
│  - Public Access: Blocked                                       │
│  - Cache-Control: max-age=31536000 (1 year)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Origin Access Control (OAC)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CloudFront Distribution                        │
│                (d1234567890abc.cloudfront.net)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Edge Locations (200+ worldwide)                         │  │
│  │  - Cache assets at edge                                   │  │
│  │  - Serve from nearest location                            │  │
│  │  - Reduce latency                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Configuration:                                                  │
│  - Origin: S3 bucket                                            │
│  - Protocol: HTTPS only (redirect HTTP)                         │
│  - Cache Policy: CachingOptimized                               │
│  - Compression: gzip, brotli                                    │
│  - HTTP/2: Enabled                                              │
│  - Signed URLs: Optional (for secure access)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      End Users                                   │
│                  (Product Catalog, AR Try-On)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  <img src="https://cdn.../products/uuid.webp"            │  │
│  │       srcset="...thumb.webp 320w,                         │  │
│  │               ...medium.webp 640w,                        │  │
│  │               ...large.webp 1280w"                        │  │
│  │       sizes="(max-width: 640px) 320px, ..."              │  │
│  │       loading="lazy" />                                   │  │
│  │                                                            │  │
│  │  <model-viewer src="https://cdn.../models/uuid.glb">     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Upload Flow

```
1. Admin selects file
   ↓
2. Frontend validates file (type, size)
   ↓
3. Upload service sends to backend
   ↓
4. Backend authenticates admin
   ↓
5. Multer validates and buffers file
   ↓
6. S3 Service processes file:
   - Images: Convert to WebP + create variants
   - Models: Upload as-is
   ↓
7. Upload to S3 with PutObjectCommand
   ↓
8. Generate CDN URLs
   ↓
9. Return URLs to frontend
   ↓
10. Frontend displays preview and saves URLs
```

## Image Processing Pipeline

```
Original Image (JPEG/PNG)
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
   Keep Original                        Convert to WebP
   (for compatibility)                  (85% quality)
         │                                     │
         │                                     ├──────────────┐
         │                                     │              │
         ▼                                     ▼              ▼
   Upload to S3                          Resize to:     Resize to:
   products/uuid.jpg                     320px width    640px width
         │                                     │              │
         │                                     ▼              ▼
         │                               Upload to S3    Upload to S3
         │                               uuid-thumb.webp uuid-medium.webp
         │                                     │              │
         │                                     │              ▼
         │                                     │         Resize to:
         │                                     │         1280px width
         │                                     │              │
         │                                     │              ▼
         │                                     │         Upload to S3
         │                                     │         uuid-large.webp
         │                                     │              │
         └─────────────────┬───────────────────┴──────────────┘
                           │
                           ▼
                    Generate URLs:
                    - original.url
                    - webp.url
                    - variants[].url
                    - srcset string
                           │
                           ▼
                    Return to frontend
```

## CloudFront Caching Flow

```
First Request:
User → CloudFront Edge → Origin (S3) → CloudFront Edge → User
       (Cache MISS)                     (Cache & Serve)

Subsequent Requests:
User → CloudFront Edge → User
       (Cache HIT)
       
Cache Headers:
- Cache-Control: max-age=31536000 (1 year)
- X-Cache: Hit from cloudfront
- Age: <seconds since cached>
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: Frontend Validation                                    │
│  - File type check (MIME type)                                   │
│  - File size check (5MB/50MB)                                    │
│  - Extension validation                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: API Authentication                                     │
│  - JWT token validation                                          │
│  - Admin role check                                              │
│  - Rate limiting (100 req/15min)                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: Multer Validation                                      │
│  - MIME type verification                                        │
│  - File extension check                                          │
│  - Size limit enforcement                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4: S3 Security                                            │
│  - IAM permissions                                               │
│  - Bucket policy (CloudFront only)                               │
│  - Server-side encryption                                        │
│  - No public access                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: CloudFront Security                                    │
│  - HTTPS only                                                    │
│  - Origin access control                                         │
│  - Signed URLs (optional)                                        │
│  - Geographic restrictions (optional)                            │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin   │────▶│ Frontend │────▶│ Backend  │────▶│   S3     │
│   UI     │     │ Service  │     │   API    │     │  Bucket  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                 │
     │ Select File    │                 │                 │
     │───────────────▶│                 │                 │
     │                │ Validate        │                 │
     │                │────────────────▶│                 │
     │                │                 │ Authenticate    │
     │                │                 │────────────────▶│
     │                │                 │                 │
     │                │                 │ Process & Upload│
     │                │                 │────────────────▶│
     │                │                 │                 │
     │                │                 │◀────────────────│
     │                │                 │ S3 URLs         │
     │                │◀────────────────│                 │
     │                │ CDN URLs        │                 │
     │◀───────────────│                 │                 │
     │ Display URLs   │                 │                 │
     │                │                 │                 │
     │                │                 │                 │
     ▼                ▼                 ▼                 ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Product  │────▶│   User   │────▶│CloudFront│────▶│   S3     │
│ Catalog  │     │ Browser  │     │   CDN    │     │  Bucket  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

## Component Interaction

```
ProductForm.tsx
    │
    ├─ handleImageUpload()
    │   │
    │   └─▶ uploadService.validateImageFile()
    │       │
    │       └─▶ uploadService.uploadImage()
    │           │
    │           └─▶ apiService.post('/upload/image')
    │               │
    │               └─▶ Backend: upload.routes.ts
    │                   │
    │                   ├─ authenticate()
    │                   ├─ requireAdmin()
    │                   ├─ uploadImage.single('image')
    │                   │
    │                   └─▶ s3Service.uploadImage()
    │                       │
    │                       ├─ uploadFile() → S3
    │                       ├─ sharp().webp() → WebP
    │                       ├─ createImageVariants() → S3
    │                       │
    │                       └─▶ Return URLs
    │
    └─ handleModelUpload()
        │
        └─▶ uploadService.validate3DModelFile()
            │
            └─▶ uploadService.upload3DModel()
                │
                └─▶ apiService.post('/upload/model')
                    │
                    └─▶ Backend: upload.routes.ts
                        │
                        └─▶ s3Service.upload3DModel()
                            │
                            └─▶ uploadFile() → S3
```

## File Naming Convention

```
Original Upload: product-image.jpg
                      │
                      ▼
Generated Files:
├── products/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg (original)
├── products/a1b2c3d4-e5f6-7890-abcd-ef1234567890.webp (webp)
├── products/a1b2c3d4-e5f6-7890-abcd-ef1234567890-thumb.webp (320w)
├── products/a1b2c3d4-e5f6-7890-abcd-ef1234567890-medium.webp (640w)
└── products/a1b2c3d4-e5f6-7890-abcd-ef1234567890-large.webp (1280w)

UUID ensures:
- Unique filenames
- No collisions
- Cache busting
- Organized structure
```

## Performance Metrics

```
Without CloudFront:
User (US) → S3 (us-east-1) → User
            ~100-200ms

With CloudFront:
User (US) → CloudFront Edge (nearby) → User
            ~10-50ms (90% faster)

Cache Hit Ratio:
First hour:  ~20% (warming up)
After 24h:   ~80% (optimal)
After week:  ~90% (excellent)

File Size Reduction:
JPEG (1MB) → WebP (500KB) = 50% smaller
PNG (2MB)  → WebP (800KB) = 60% smaller
```

## Cost Breakdown

```
Monthly Costs (1000 products, 10,000 views):

S3 Storage:
- 10GB × $0.023/GB = $0.23

S3 Requests:
- 1,000 PUT × $0.005/1000 = $0.005
- 10,000 GET × $0.0004/1000 = $0.004

CloudFront:
- 100GB transfer × $0.085/GB = $8.50
- 10,000 requests × $0.0075/10000 = $0.0075

Total: ~$8.75/month

With CloudFront savings:
- Without CDN: S3 transfer 100GB × $0.09/GB = $9.00
- With CDN: CloudFront 100GB × $0.085/GB = $8.50
- Savings: $0.50/month + faster delivery
```

## Monitoring Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  CloudWatch Metrics                                              │
├─────────────────────────────────────────────────────────────────┤
│  S3 Metrics:                                                     │
│  ├─ Bucket Size: 10.5 GB                                        │
│  ├─ Object Count: 5,234                                         │
│  ├─ PUT Requests: 1,234/day                                     │
│  └─ GET Requests: 45,678/day                                    │
│                                                                  │
│  CloudFront Metrics:                                             │
│  ├─ Requests: 50,000/day                                        │
│  ├─ Data Transfer: 150 GB/day                                   │
│  ├─ Cache Hit Ratio: 85%                                        │
│  ├─ 4xx Error Rate: 0.1%                                        │
│  └─ 5xx Error Rate: 0.01%                                       │
│                                                                  │
│  Upload Metrics:                                                 │
│  ├─ Successful Uploads: 98.5%                                   │
│  ├─ Failed Uploads: 1.5%                                        │
│  ├─ Average Upload Time: 2.3s                                   │
│  └─ Average File Size: 1.2 MB                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Scalable asset storage
- ✅ Global content delivery
- ✅ Automatic image optimization
- ✅ Secure upload process
- ✅ Cost-effective solution
- ✅ High performance
- ✅ Easy maintenance
