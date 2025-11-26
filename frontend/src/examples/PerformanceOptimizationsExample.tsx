import React, { useEffect, useState } from 'react';
import LazyImage from '../components/Common/LazyImage';
import progressiveLoader from '../engine/ProgressiveModelLoader';
import { accessoryAtlas } from '../engine/TextureAtlas';
import { performanceMonitor } from '../utils/performanceMonitor';

/**
 * Example demonstrating all performance optimizations
 */
const PerformanceOptimizationsExample: React.FC = () => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [atlasBuilt, setAtlasBuilt] = useState(false);

  useEffect(() => {
    // Mark performance point
    performanceMonitor.mark('example-start');

    // Example 1: Progressive Model Loading
    const loadModel = async () => {
      try {
        const model = await progressiveLoader.loadModel(
          '/models/example-wig.glb',
          (progress) => {
            setLoadProgress(progress.percentage);
            console.log(`Loading model: ${progress.percentage.toFixed(1)}%`);
          }
        );
        setModelLoaded(true);
        console.log('✅ Model loaded successfully', model);
      } catch (error) {
        console.error('❌ Failed to load model:', error);
      }
    };

    // Example 2: Texture Atlas Building
    const buildAtlas = async () => {
      try {
        await accessoryAtlas.buildAtlas([
          { id: 'hat', url: '/textures/hat.png' },
          { id: 'earrings', url: '/textures/earrings.png' },
          { id: 'glasses', url: '/textures/glasses.png' },
        ]);
        setAtlasBuilt(true);
        
        const stats = accessoryAtlas.getStats();
        console.log('✅ Texture atlas built:', stats);
      } catch (error) {
        console.error('❌ Failed to build atlas:', error);
      }
    };

    // Example 3: Preload Multiple Models
    const preloadModels = async () => {
      await progressiveLoader.preloadModels([
        '/models/wig1.glb',
        '/models/wig2.glb',
        '/models/wig3.glb',
      ]);
      console.log('✅ Models preloaded');
    };

    // Run examples
    loadModel();
    buildAtlas();
    preloadModels();

    // Mark end and measure
    performanceMonitor.mark('example-end');
    const duration = performanceMonitor.measureTiming(
      'example-init',
      'example-start',
      'example-end'
    );
    console.log(`⏱️ Example initialization took: ${duration}ms`);

    // Get performance report after 5 seconds
    setTimeout(() => {
      performanceMonitor.report();
    }, 5000);

    return () => {
      // Cleanup
      progressiveLoader.clearCache();
      accessoryAtlas.clear();
    };
  }, []);

  return (
    <div className="p-8 bg-halloween-black min-h-screen">
      <h1 className="text-3xl font-bold text-halloween-purple mb-8">
        Performance Optimizations Demo
      </h1>

      {/* Example 1: Lazy Loading Images */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-halloween-orange mb-4">
          1. Lazy Loading Images
        </h2>
        <p className="text-gray-300 mb-4">
          Images below the fold are loaded only when they enter the viewport:
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <LazyImage
                src={`/images/product-${i}.jpg`}
                alt={`Product ${i}`}
                className="w-full h-full object-cover"
                onLoad={() => console.log(`Image ${i} loaded`)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Example 2: Progressive Model Loading */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-halloween-orange mb-4">
          2. Progressive 3D Model Loading
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Loading Progress:</span>
              <span>{loadProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-halloween-purple h-4 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
          {modelLoaded && (
            <p className="text-green-400">✅ Model loaded and cached</p>
          )}
        </div>
      </section>

      {/* Example 3: Texture Atlas */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-halloween-orange mb-4">
          3. Texture Atlas for Accessories
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          {atlasBuilt ? (
            <div>
              <p className="text-green-400 mb-4">✅ Texture atlas built</p>
              <button
                onClick={() => {
                  const stats = accessoryAtlas.getStats();
                  console.log('Atlas Stats:', stats);
                  alert(
                    `Atlas Stats:\n` +
                    `Size: ${stats.size}x${stats.size}\n` +
                    `Textures: ${stats.textureCount}\n` +
                    `Efficiency: ${stats.efficiency.toFixed(2)}%`
                  );
                }}
                className="px-4 py-2 bg-halloween-purple text-white rounded hover:bg-purple-700"
              >
                View Atlas Stats
              </button>
            </div>
          ) : (
            <p className="text-gray-400">Building texture atlas...</p>
          )}
        </div>
      </section>

      {/* Example 4: Code Splitting */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-halloween-orange mb-4">
          4. Code Splitting
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-300 mb-4">
            All routes are lazy-loaded. Check the Network tab to see chunks loading on-demand:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>react-vendor.js - React libraries</li>
            <li>three-vendor.js - Three.js libraries</li>
            <li>tensorflow-vendor.js - TensorFlow.js</li>
            <li>ui-vendor.js - UI libraries</li>
          </ul>
        </div>
      </section>

      {/* Example 5: Service Worker */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-halloween-orange mb-4">
          5. Service Worker (PWA)
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-300 mb-4">
            Service worker status:
          </p>
          <button
            onClick={() => {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistration().then((reg) => {
                  if (reg) {
                    alert('✅ Service Worker is registered and active!');
                  } else {
                    alert('❌ Service Worker is not registered (only works in production)');
                  }
                });
              } else {
                alert('❌ Service Worker not supported in this browser');
              }
            }}
            className="px-4 py-2 bg-halloween-purple text-white rounded hover:bg-purple-700"
          >
            Check Service Worker Status
          </button>
        </div>
      </section>

      {/* Example 6: Performance Monitoring */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-halloween-orange mb-4">
          6. Performance Monitoring
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-300 mb-4">
            View performance metrics in the console:
          </p>
          <button
            onClick={() => {
              performanceMonitor.report();
              const metrics = performanceMonitor.getMetrics();
              alert(
                `Performance Metrics:\n` +
                `FCP: ${metrics.fcp?.toFixed(2)}ms\n` +
                `LCP: ${metrics.lcp?.toFixed(2)}ms\n` +
                `FID: ${metrics.fid?.toFixed(2)}ms\n` +
                `CLS: ${metrics.cls?.toFixed(4)}`
              );
            }}
            className="px-4 py-2 bg-halloween-purple text-white rounded hover:bg-purple-700"
          >
            View Performance Report
          </button>
        </div>
      </section>

      {/* Example 7: Redis Caching */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-halloween-orange mb-4">
          7. Redis Query Caching
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-300 mb-4">
            API responses are cached in Redis. Check the Network tab:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>First request: ~500ms (database query)</li>
            <li>Cached request: ~50ms (Redis cache)</li>
            <li>Cache TTL: 1 hour for products</li>
          </ul>
          <button
            onClick={async () => {
              const start = performance.now();
              await fetch('/api/products');
              const duration = performance.now() - start;
              alert(`API Response Time: ${duration.toFixed(2)}ms`);
            }}
            className="mt-4 px-4 py-2 bg-halloween-purple text-white rounded hover:bg-purple-700"
          >
            Test API Response Time
          </button>
        </div>
      </section>
    </div>
  );
};

export default PerformanceOptimizationsExample;
