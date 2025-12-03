# Spooky Wigs - Year-Round Wig & Accessory Store 📱

An e-commerce platform with augmented reality try-on capabilities for wigs and head accessories. Professional, casual, fashion, and costume styles - all with a hauntingly beautiful shopping experience.

## 📱 Mobile-First Design

**"If it's not on mobile, it doesn't exist."**

This application is built mobile-first, optimized for phone cameras (which are typically superior to webcams). The AR try-on experience works beautifully on smartphones with touch gestures, photo upload, and responsive design throughout.

**Quick Mobile Test:** Start the dev server, get your computer's IP address, and access from your phone on the same WiFi: `http://YOUR_IP:3000`

See [Mobile Testing Guide](./MOBILE_TESTING_QUICK_REFERENCE.md) for details.

## Project Structure

```
spooky-styles-ar-store/
├── frontend/          # React + TypeScript frontend with Vite
├── backend/           # Node.js + Express backend API
├── docker-compose.yml # Local PostgreSQL and Redis setup
└── package.json       # Monorepo workspace configuration
```

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local database)
- Git

## Getting Started

### 1. Install Dependencies

```bash
# Install root dependencies and workspace dependencies
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy example environment files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit .env files with your configuration
```

### 3. Start Local Services

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 4. Run Development Servers

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

## Available Scripts

### Root Level
- `npm run dev` - Run both frontend and backend in development mode
- `npm run build` - Build both workspaces for production
- `npm run lint` - Lint all workspaces
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Frontend
- `npm run dev --workspace=frontend` - Start Vite dev server
- `npm run build --workspace=frontend` - Build for production
- `npm run preview --workspace=frontend` - Preview production build

### Backend
- `npm run dev --workspace=backend` - Start backend with hot reload
- `npm run build --workspace=backend` - Compile TypeScript
- `npm run start --workspace=backend` - Run compiled backend

## 📱 Mobile Experience

### Test on Your Phone (Recommended!)

1. Start dev server: `npm run dev`
2. Get your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Access from phone: `http://YOUR_IP:3000`

### Mobile Features
- **Superior Camera Quality**: Phone cameras > webcams
- **Touch Gestures**: Drag to position, tap to select
- **Photo Upload**: Alternative to live camera
- **Responsive Design**: Optimized for all screen sizes
- **Portrait Mode**: 9:16 AR canvas for phones
- **Auto-Fit**: One-tap wig positioning

See [Mobile Testing Quick Reference](./MOBILE_TESTING_QUICK_REFERENCE.md) for complete guide.

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Three.js + React Three Fiber for 3D rendering
- TensorFlow.js with MediaPipe for face tracking
- Zustand for state management
- TailwindCSS for styling (mobile-first)
- Stripe for payments
- **Mobile-optimized**: Touch events, responsive breakpoints, PWA-ready

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL for data storage
- Redis for caching and sessions
- Stripe API for payment processing
- JWT for authentication

## Development Tools

- ESLint for code linting
- Prettier for code formatting
- Husky for Git hooks
- lint-staged for pre-commit checks

## Docker Services

The `docker-compose.yml` provides:
- **PostgreSQL 15**: Database on port 5432
- **Redis 7**: Cache and session store on port 6379

## Environment Variables

See `.env.example` and `frontend/.env.example` for required configuration.

## License

MIT
