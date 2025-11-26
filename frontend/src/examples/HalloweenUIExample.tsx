import React, { useState } from 'react';
import {
  PumpkinSpinner,
  HalloweenSpinner,
  SkeletonCard,
  SeasonalPromotions,
} from '../components/Halloween';

/**
 * Example component demonstrating all Halloween UI elements
 * This is for reference and testing purposes
 */
const HalloweenUIExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [skeletonVariant, setSkeletonVariant] = useState<'product' | 'order' | 'inspiration'>('product');

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      <h1 className="text-4xl font-bold text-halloween-orange text-center mb-8">
        🎃 Halloween UI Components Demo 🎃
      </h1>

      {/* Loading Spinners Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white mb-4">Loading Spinners</h2>
        
        <div className="card-halloween">
          <h3 className="text-xl font-bold text-halloween-orange mb-4">Pumpkin Spinner</h3>
          <div className="flex gap-8 items-center justify-center p-8">
            <div className="text-center">
              <PumpkinSpinner size="small" />
              <p className="text-sm text-gray-400 mt-2">Small</p>
            </div>
            <div className="text-center">
              <PumpkinSpinner size="medium" />
              <p className="text-sm text-gray-400 mt-2">Medium</p>
            </div>
            <div className="text-center">
              <PumpkinSpinner size="large" />
              <p className="text-sm text-gray-400 mt-2">Large</p>
            </div>
          </div>
        </div>

        <div className="card-halloween">
          <h3 className="text-xl font-bold text-halloween-orange mb-4">Halloween Spinner</h3>
          <div className="flex gap-8 items-center justify-center p-8">
            <HalloweenSpinner size="small" text="Loading..." />
            <HalloweenSpinner size="medium" text="Processing..." />
            <HalloweenSpinner size="large" text="Please wait..." />
          </div>
        </div>
      </section>

      {/* Skeleton Cards Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white mb-4">Skeleton Loading States</h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSkeletonVariant('product')}
            className={`btn-${skeletonVariant === 'product' ? 'primary' : 'secondary'}`}
          >
            Product
          </button>
          <button
            onClick={() => setSkeletonVariant('order')}
            className={`btn-${skeletonVariant === 'order' ? 'primary' : 'secondary'}`}
          >
            Order
          </button>
          <button
            onClick={() => setSkeletonVariant('inspiration')}
            className={`btn-${skeletonVariant === 'inspiration' ? 'primary' : 'secondary'}`}
          >
            Inspiration
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard variant={skeletonVariant} />
          <SkeletonCard variant={skeletonVariant} />
          <SkeletonCard variant={skeletonVariant} />
        </div>
      </section>

      {/* Loading Simulation Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white mb-4">Loading State Demo</h2>
        
        <div className="card-halloween text-center">
          <button
            onClick={simulateLoading}
            disabled={loading}
            className="btn-primary mb-8"
          >
            {loading ? 'Loading...' : 'Simulate Loading (3s)'}
          </button>

          {loading ? (
            <div className="space-y-4">
              <PumpkinSpinner size="large" />
              <p className="text-halloween-purple text-lg">Loading spooky content...</p>
            </div>
          ) : (
            <div className="p-8 bg-halloween-black rounded-lg">
              <h3 className="text-2xl font-bold text-halloween-orange mb-4">
                Content Loaded! 🎃
              </h3>
              <p className="text-gray-300">
                This is where your actual content would appear after loading.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Seasonal Promotions Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white mb-4">Seasonal Promotions</h2>
        <p className="text-gray-300 mb-4">
          This component is automatically included on the home page. Here's a preview:
        </p>
        <SeasonalPromotions />
      </section>

      {/* Theme Colors Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white mb-4">Halloween Color Palette</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-full h-24 bg-halloween-orange rounded-lg mb-2"></div>
            <p className="text-sm text-gray-300">Orange</p>
            <p className="text-xs text-gray-500">#FF6B35</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-halloween-purple rounded-lg mb-2"></div>
            <p className="text-sm text-gray-300">Purple</p>
            <p className="text-xs text-gray-500">#6A0572</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-halloween-black border-2 border-gray-600 rounded-lg mb-2"></div>
            <p className="text-sm text-gray-300">Black</p>
            <p className="text-xs text-gray-500">#1A1A1D</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-halloween-green rounded-lg mb-2"></div>
            <p className="text-sm text-gray-300">Green</p>
            <p className="text-xs text-gray-500">#4E9F3D</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-halloween-darkPurple rounded-lg mb-2"></div>
            <p className="text-sm text-gray-300">Dark Purple</p>
            <p className="text-xs text-gray-500">#3D0C4F</p>
          </div>
        </div>
      </section>

      {/* Animations Info Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white mb-4">Decorative Animations</h2>
        
        <div className="card-halloween">
          <p className="text-gray-300 mb-4">
            The following decorative elements are automatically added to every page via the MainLayout:
          </p>
          
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-halloween-orange mr-2">🕸️</span>
              <span><strong>Cobwebs:</strong> Appear in all four corners with varying sizes</span>
            </li>
            <li className="flex items-start">
              <span className="text-halloween-orange mr-2">👻</span>
              <span><strong>Floating Ghosts:</strong> Slowly float down the screen at different positions</span>
            </li>
            <li className="flex items-start">
              <span className="text-halloween-orange mr-2">🦇</span>
              <span><strong>Floating Bats:</strong> Drift down with pulsing wing animation</span>
            </li>
            <li className="flex items-start">
              <span className="text-halloween-orange mr-2">🔊</span>
              <span><strong>Ambient Sounds:</strong> Optional Halloween sounds with volume control (bottom-right corner)</span>
            </li>
            <li className="flex items-start">
              <span className="text-halloween-orange mr-2">✨</span>
              <span><strong>Page Transitions:</strong> Smooth 500ms fade between routes</span>
            </li>
          </ul>

          <div className="mt-6 p-4 bg-halloween-black rounded-lg">
            <p className="text-sm text-gray-400 italic">
              💡 All decorative elements use pointer-events: none to ensure they don't interfere with user interactions.
            </p>
          </div>
        </div>
      </section>

      {/* Usage Examples Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white mb-4">Usage Examples</h2>
        
        <div className="card-halloween">
          <h3 className="text-xl font-bold text-halloween-orange mb-4">Import Components</h3>
          <pre className="bg-halloween-black p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-halloween-green">
{`import {
  PumpkinSpinner,
  HalloweenSpinner,
  SkeletonCard,
  SeasonalPromotions,
} from './components/Halloween';`}
            </code>
          </pre>
        </div>

        <div className="card-halloween">
          <h3 className="text-xl font-bold text-halloween-orange mb-4">Use Loading Spinner</h3>
          <pre className="bg-halloween-black p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-halloween-green">
{`{loading ? (
  <PumpkinSpinner size="large" />
) : (
  <YourContent />
)}`}
            </code>
          </pre>
        </div>

        <div className="card-halloween">
          <h3 className="text-xl font-bold text-halloween-orange mb-4">Use Skeleton Card</h3>
          <pre className="bg-halloween-black p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-halloween-green">
{`{loading ? (
  <SkeletonCard variant="product" />
) : (
  <ProductCard product={product} />
)}`}
            </code>
          </pre>
        </div>
      </section>

      {/* Footer Note */}
      <div className="text-center text-gray-400 text-sm pt-8 border-t border-halloween-purple">
        <p>🎃 All Halloween UI components are production-ready and fully typed with TypeScript 🎃</p>
      </div>
    </div>
  );
};

export default HalloweenUIExample;
