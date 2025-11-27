---
inclusion: always
---

# Tech Stack

## Architecture
Monorepo with npm workspaces containing frontend and backend applications.

## Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4
- **Styling**: TailwindCSS 3
- **State Management**: Zustand 4
- **Routing**: React Router 6
- **3D/AR Engine**: 
  - Three.js + React Three Fiber (3D rendering)
  - TensorFlow.js + MediaPipe Face Mesh (face tracking)
- **HTTP Client**: Axios
- **Payments**: Stripe React components
- **Icons**: Lucide React

## Backend
- **Runtime**: Node.js 18+ with Express
- **Language**: TypeScript (ES modules)
- **Database**: PostgreSQL 15
- **Cache/Sessions**: Redis 7
- **Authentication**: JWT with bcrypt
- **File Storage**: AWS S3 + CloudFront
- **Payments**: Stripe API, Paystack API
- **Image Processing**: Sharp
- **Security**: Helmet, express-rate-limit, CORS

## Development Tools
- **TypeScript Compiler**: tsc
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Process Management**: tsx (TypeScript execution), concurrently
- **Containerization**: Docker + Docker Compose

## Common Commands

### Setup
```bash
npm install                    # Install all workspace dependencies
docker-compose up -d           # Start PostgreSQL and Redis
npm run db:setup --workspace=backend  # Run migrations and seed data
```

### Development
```bash
npm run dev                    # Run both frontend and backend
npm run dev:frontend           # Frontend only (http://localhost:3000)
npm run dev:backend            # Backend only (http://localhost:5000)
```

### Database
```bash
npm run db:test --workspace=backend     # Test database connection
npm run db:migrate --workspace=backend  # Run migrations
npm run db:seed --workspace=backend     # Seed sample data
npm run create-admin --workspace=backend # Create admin user
```

### Build & Deploy
```bash
npm run build                  # Build both workspaces
npm run build --workspace=frontend     # Build frontend only
npm run build --workspace=backend      # Build backend only
npm run start --workspace=backend      # Run production backend
```

### Code Quality
```bash
npm run lint                   # Lint all workspaces
npm run format                 # Format all code
npm run format:check           # Check formatting
```

### Testing
```bash
npm run test:cart --workspace=backend
npm run test:payment --workspace=backend
npm run test:order --workspace=backend
npm run test:s3 --workspace=backend
```

## Environment Variables

### Backend (.env or backend/.env)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT signing
- `STRIPE_SECRET_KEY` - Stripe API key
- `PAYSTACK_SECRET_KEY` - Paystack API key
- `AWS_ACCESS_KEY_ID` - AWS S3 access
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket name
- `CLOUDFRONT_DOMAIN` - CloudFront distribution domain

### Frontend (frontend/.env)
- `VITE_API_URL` - Backend API URL
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key

## Key Dependencies

### Frontend Performance
- `vite-plugin-compression2` - Gzip/Brotli compression
- Service Worker for PWA capabilities
- Lazy loading with React.lazy and Suspense
- Image optimization with LazyImage component

### Backend Performance
- Redis caching middleware
- Rate limiting per endpoint
- Connection pooling (pg)
- Compression middleware

## Database Schema
Migrations located in `backend/src/db/migrations/`:
- Users (with admin flag)
- Products (with colors, images, AR models)
- Orders & Order Items
- Cart & Cart Items
- Costume Inspirations
- Analytics Events

## File Structure
```
frontend/src/
├── components/    # UI components (Admin, AR, Auth, Cart, etc.)
├── pages/         # Route pages
├── services/      # API service layer
├── hooks/         # Custom React hooks
├── store/         # Zustand stores
├── types/         # TypeScript types
├── engine/        # AR/3D rendering engine
└── utils/         # Helper utilities

backend/src/
├── config/        # Configuration (DB, AWS, Redis, Stripe, etc.)
├── db/            # Migrations, seeds, setup scripts
├── middleware/    # Express middleware
├── routes/        # API route handlers
├── services/      # Business logic
├── types/         # TypeScript types
└── utils/         # Helper utilities
```
