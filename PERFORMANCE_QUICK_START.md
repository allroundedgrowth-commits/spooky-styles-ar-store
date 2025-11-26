# Performance Optimizations - Quick Start Guide

This guide will help you quickly understand and use the performance optimizations implemented in the Spooky Styles AR Store.

## 🚀 Quick Overview

All performance optimizations are **already implemented and active**. No additional configuration needed!

### What's Included:

1. ✅ **Lazy Loading Images** - Automatic
2. ✅ **Code Splitting** - Automatic
3. ✅ **Asset Compression** - Automatic in production
4. ✅ **Service Worker (PWA)** - Automatic in production
5. ✅ **Progressive 3D Model Loading** - Use when loading models
6. ✅ **Texture Atlases** - Use for accessories
7. ✅ **Redis Caching** - Automatic for API routes

---

## 📦 Installation

### Frontend
```bash
cd frontend
npm install
```

### Backend
No additional installation needed (Redis already configured)

---

## 🎯 Usage Examples

### 1. Lazy Loading Images

**Replace regular `<img>` tags with `<LazyImage>`:**

```tsx
// Before
<img src="/images/product.jpg" alt="Product" className="w-full" />

// After
import LazyImage from './components/Common/LazyImage';

<LazyImage 
  src="/images/product.jpg" 
  alt="Product" 
  className="w-full"
/>
```

### 2. Progressive 3D Model Loading

**Use the ProgressiveModelLoader for all 3D models:**

```tsx
import progressiveLoader from './engine/ProgressiveModelLoader';

// Load a single model with progress tracking
const model = await progressiveLoader.loadModel(
  '/models/wig.glb',
  (progress) => {
    console.log(`Loading: ${progress.percentage}%`);
  }
);

// Preload multiple models
await progressiveLoader.preloadModels([
  '/models/wig1.glb',
  '/models/wig2.glb',
]);
```

### 3. Texture Atlas for Accessories

**Build and use texture atlases:**

```tsx
import { accessoryAtlas } from './engine/TextureAtlas';

// Build atlas once at app start
await accessoryAtlas.buildAtlas([
  { id: 'hat', url: '/textures/hat.png' },
  { id: 'earrings', url: '/textures/earrings.png' },
]);

// Apply to material
accessoryAtlas.applyToMaterial(material, 'hat');
```

### 4. API Caching (Backend)

**Cache is already applied to product routes. To add to new routes:**

```typescript
import { cacheMiddleware } from './middleware/cache.middleware';

router.get(
  '/my-route',
  cacheMiddleware({ ttl: 3600, varyBy: ['query'] }),
  handler
);
```

---

## 🧪 Testing

### Test Lazy Loading
1. Open DevTools → Network tab
2. Scroll down the page
3. Watch images load as they enter viewport

### Test Code Splitting
1. Open DevTools → Network tab
2. Navigate between routes
3. See separate chunk files loading

### Test Service Worker
1. Build for production: `npm run build`
2. Serve: `npm run preview`
3. Open DevTools → Application → Service Workers
4. Go offline and reload - page still works!

### Test Model Caching
```typescript
// First load - downloads from server
const model1 = await progressiveLoader.loadModel('/models/wig.glb');

// Second load - instant from cache
const model2 = await progressiveLoader.loadModel('/models/wig.glb');
```

### Test API Caching
```bash
# First request - slow (database query)
curl http://localhost:5000/api/products

# Second request - fast (Redis cache)
curl http://localhost:5000/api/products
```

---

## 📊 Performance Monitoring

### View Performance Metrics

```typescript
import { performanceMonitor } from './utils/performanceMonitor';

// Get current metrics
const metrics = performanceMonitor.getMetrics();
console.log('FCP:', metrics.fcp);
console.log('LCP:', metrics.lcp);

// Full report
performanceMonitor.report();
```

### Check Cache Statistics

```typescript
// Model cache
const modelStats = progressiveLoader.getCacheStats();
console.log('Cached models:', modelStats.size);

// Texture atlas
const atlasStats = accessoryAtlas.getStats();
console.log('Atlas efficiency:', atlasStats.efficiency);
```

---

## 🎨 Best Practices

### Images
- ✅ Use `LazyImage` for all product images
- ✅ Use WebP format when possible
- ✅ Provide appropriate alt text

### 3D Models
- ✅ Keep models under 5MB
- ✅ Use Draco compression
- ✅ Preload frequently used models
- ✅ Clear cache when memory is low

### Textures
- ✅ Combine accessory textures into atlas
- ✅ Use power-of-2 dimensions (512, 1024, 2048)
- ✅ Compress textures before upload

### API
- ✅ Cache GET requests with appropriate TTL
- ✅ Invalidate cache on updates
- ✅ Use shorter TTL for frequently changing data

---

## 🔧 Configuration

### Vite Config (frontend/vite.config.ts)

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three'],
          // Add more chunks as needed
        },
      },
    },
  },
});
```

### Cache TTL (backend)

```typescript
// Short TTL for dynamic data
cacheMiddleware({ ttl: 300 }) // 5 minutes

// Long TTL for static data
cacheMiddleware({ ttl: 3600 }) // 1 hour
```

---

## 🐛 Troubleshooting

### Images not lazy loading
- Check that you're using `LazyImage` component
- Verify Intersection Observer is supported
- Check browser console for errors

### Models loading slowly
- Verify Draco decoder is accessible
- Check model file size (should be < 5MB)
- Ensure CDN is configured correctly

### Cache not working
- Verify Redis is running: `redis-cli ping`
- Check cache middleware is applied
- Monitor Redis keys: `redis-cli keys "api:*"`

### Service Worker not registering
- Only works in production build
- Check HTTPS is enabled (required for SW)
- Clear browser cache and try again

---

## 📈 Expected Results

### Before Optimizations
- Initial load: ~5-8 seconds
- Model load: ~3-5 seconds
- API response: ~500ms
- FPS with accessories: ~15-20

### After Optimizations
- Initial load: ~2-3 seconds ✅
- Model load: ~1-2 seconds ✅
- API response: ~50-100ms (cached) ✅
- FPS with accessories: 24+ ✅

---

## 🎓 Learn More

- [Full Documentation](./PERFORMANCE_OPTIMIZATIONS.md)
- [Example Component](./frontend/src/examples/PerformanceOptimizationsExample.tsx)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Web Vitals](https://web.dev/vitals/)

---

## ✅ Checklist

Use this checklist to ensure all optimizations are working:

- [ ] LazyImage component used for product images
- [ ] Code splitting configured in vite.config.ts
- [ ] Compression plugin installed and configured
- [ ] Service worker registered in main.tsx
- [ ] Manifest.json linked in index.html
- [ ] ProgressiveModelLoader used for 3D models
- [ ] Texture atlas built for accessories
- [ ] Cache middleware applied to API routes
- [ ] Redis running and connected
- [ ] Performance monitoring active

---

## 🚀 Next Steps

1. Run Lighthouse audit: `lighthouse http://localhost:3000`
2. Monitor Core Web Vitals in production
3. Set up performance alerts
4. Optimize based on real user data

---

**Need Help?** Check the full documentation or open an issue on GitHub.
