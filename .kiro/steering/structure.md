---
inclusion: always
---

# Project Structure

## Monorepo Organization

```
spooky-wigs-store/
├── frontend/              # React frontend application
├── backend/               # Express backend API
├── k8s/                   # Kubernetes deployment configs
├── scripts/               # Deployment and utility scripts
├── docker-compose.yml     # Local development services
├── docker-compose.prod.yml
└── package.json           # Workspace root
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Account/       # User profile, order history
│   │   ├── Admin/         # Admin dashboard components
│   │   ├── AR/            # AR try-on UI components
│   │   ├── Auth/          # Login, register forms
│   │   ├── Cart/          # Shopping cart components
│   │   ├── Checkout/      # Checkout flow components
│   │   ├── Common/        # Shared components (LazyImage, etc.)
│   │   ├── Halloween/     # Themed decorations and animations
│   │   ├── Layout/        # Header, Footer, MainLayout
│   │   ├── Payment/       # Payment integration components
│   │   └── Products/      # Product catalog components
│   ├── engine/
│   │   ├── ARTryOnEngine.ts        # 3D AR engine
│   │   ├── Simple2DAREngine.ts     # 2D AR engine
│   │   ├── FaceTrackingModule.ts   # MediaPipe face tracking
│   │   ├── WigLoader.ts            # 3D model loading
│   │   ├── AccessoryLayer.ts       # Accessory rendering
│   │   ├── AdaptiveLighting.ts     # Lighting adjustments
│   │   ├── TextureAtlas.ts         # Texture optimization
│   │   ├── ProgressiveModelLoader.ts
│   │   └── __tests__/              # Engine unit tests
│   ├── hooks/
│   │   ├── useAREngine.ts          # 3D AR hook
│   │   ├── useSimple2DAR.ts        # 2D AR hook
│   │   ├── useFaceTracking.ts      # Face tracking hook
│   │   ├── useARSession.ts         # AR session management
│   │   ├── useAdaptiveLighting.ts
│   │   ├── useLoadingState.ts
│   │   └── usePaystack.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ARTryOn.tsx             # 3D AR try-on page
│   │   ├── Simple2DARTryOn.tsx     # 2D AR try-on page
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderConfirmation.tsx
│   │   ├── Account.tsx
│   │   └── AdminDashboard.tsx
│   ├── services/
│   │   ├── api.ts                  # Axios instance
│   │   ├── apiService.ts           # Base API service
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── admin.service.ts
│   │   ├── analytics.service.ts
│   │   ├── upload.service.ts
│   │   ├── screenshot.service.ts
│   │   ├── socialShare.service.ts
│   │   └── __tests__/
│   ├── store/
│   │   ├── index.ts                # Store exports
│   │   ├── userStore.ts            # Auth state
│   │   ├── cartStore.ts            # Cart state
│   │   ├── arSessionStore.ts       # AR session state
│   │   └── productFilterStore.ts   # Product filters
│   ├── types/
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   ├── inspiration.ts
│   │   └── faceTracking.ts
│   ├── utils/
│   │   ├── performanceMonitor.ts
│   │   └── serviceWorkerRegistration.ts
│   ├── examples/                   # Usage examples for features
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   ├── manifest.json
│   └── service-worker.js
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts             # PostgreSQL config
│   │   ├── redis.ts                # Redis config
│   │   ├── aws.ts                  # S3/CloudFront config
│   │   ├── stripe.ts               # Stripe config
│   │   ├── paystack.ts             # Paystack config
│   │   └── cors.ts                 # CORS config
│   ├── db/
│   │   ├── migrations/             # SQL migration files
│   │   │   ├── 001_create_users_table.sql
│   │   │   ├── 002_create_products_table.sql
│   │   │   ├── 003_create_product_colors_table.sql
│   │   │   ├── 004_create_orders_table.sql
│   │   │   ├── 005_create_order_items_table.sql
│   │   │   ├── 006_create_costume_inspirations_tables.sql
│   │   │   ├── 007_create_analytics_tables.sql
│   │   │   ├── 008_create_cart_tables.sql
│   │   │   ├── 009_add_guest_fields_to_orders.sql
│   │   │   ├── 010_update_products_for_2d_ar.sql
│   │   │   └── 012_add_third_product_image.sql
│   │   ├── migrate.ts              # Migration runner
│   │   ├── seed.ts                 # Seed data
│   │   ├── setup-all.ts            # Complete setup
│   │   ├── create-admin.ts         # Admin user creation
│   │   ├── test-connection.ts
│   │   └── run-*-migration.ts      # Individual migration runners
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── admin.middleware.ts     # Admin authorization
│   │   ├── analytics.middleware.ts # Event tracking
│   │   ├── cache.middleware.ts     # Redis caching
│   │   ├── csrf.middleware.ts      # CSRF protection
│   │   ├── error.middleware.ts     # Error handling
│   │   ├── rateLimiter.middleware.ts
│   │   ├── sanitization.middleware.ts
│   │   └── upload.middleware.ts    # Multer file upload
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── paystack.routes.ts
│   │   ├── inspiration.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── upload.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── paystack.service.ts
│   │   ├── inspiration.service.ts
│   │   ├── analytics.service.ts
│   │   └── s3.service.ts
│   ├── types/
│   │   ├── express.d.ts            # Express type extensions
│   │   └── user.types.ts
│   ├── utils/
│   │   ├── errors.ts               # Custom error classes
│   │   └── validation.ts           # Input validation
│   ├── index.ts                    # Express app entry
│   ├── test-*.ts                   # API test scripts
│   └── configure-s3-cors.ts
├── Dockerfile
├── tsconfig.json
└── package.json
```

## Key Architectural Patterns

### Frontend
- **Component Organization**: Grouped by feature/domain (Admin, AR, Auth, etc.)
- **Service Layer**: All API calls go through service modules
- **State Management**: Zustand stores for global state, local state for UI
- **Engine Separation**: AR/3D logic isolated in `engine/` directory
- **Type Safety**: Shared types in `types/` directory

### Backend
- **Layered Architecture**: Routes → Services → Database
- **Middleware Chain**: Auth → Validation → Rate Limiting → Business Logic
- **Configuration**: Centralized in `config/` directory
- **Database**: Migration-based schema management
- **Error Handling**: Centralized error middleware

## Documentation Locations

- Feature READMEs: Scattered throughout codebase (e.g., `frontend/src/components/Admin/README.md`)
- Implementation summaries: Root and feature directories (e.g., `ANALYTICS_IMPLEMENTATION.md`)
- Quick starts: Root directory (e.g., `ADMIN_QUICK_START.md`)
- API documentation: Backend service directories (e.g., `backend/src/CART_API_README.md`)

## Important Files

- `.env.example` - Environment variable template
- `docker-compose.yml` - Local development services
- `START_HERE.md` - Project onboarding guide
- `PROJECT_STATUS.md` - Current project state
- `TESTING_CHECKLIST.md` - Testing guidelines
