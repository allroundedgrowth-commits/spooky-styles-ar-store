import React, { useRef, useState, useEffect } from 'react';
import { useAREngine } from '../hooks/useAREngine';
import { useFaceTracking } from '../hooks/useFaceTracking';
import { useARSession, ActiveAccessory } from '../hooks/useARSession';
import { AccessorySelector } from '../components/AR/AccessorySelector';
import { Product } from '../types/product';

/**
 * Example component demonstrating accessory layering system usage
 * 
 * This example shows:
 * 1. Loading and displaying a base wig
 * 2. Adding accessories to different layers
 * 3. Removing accessories
 * 4. Managing layer state
 * 5. Integrating with face tracking
 */
export const AccessoryLayerExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // AR Engine
  const { engine, isInitialized, fps } = useAREngine(canvasRef);

  // Face Tracking
  const {
    isTracking,
    landmarks,
    headPose,
    start: startTracking,
    stop: stopTracking,
  } = useFaceTracking(videoRef);

  // AR Session State
  const {
    customization,
    addAccessory,
    removeAccessory,
    getAvailableLayers,
  } = useARSession();

  // UI State
  const [isLoadingAccessory, setIsLoadingAccessory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock accessory products (in real app, fetch from API)
  const [availableAccessories] = useState<Product[]>([
    {
      id: 'acc-1',
      name: 'Witch Hat',
      description: 'Classic pointed witch hat',
      price: 19.99,
      category: 'hat',
      theme: 'witch',
      model_url: '/models/accessories/witch-hat.glb',
      thumbnail_url: '/images/accessories/witch-hat.jpg',
      stock_quantity: 10,
      is_accessory: true,
      colors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc-2',
      name: 'Spider Earrings',
      description: 'Spooky spider earrings',
      price: 9.99,
      category: 'earrings',
      theme: 'witch',
      model_url: '/models/accessories/spider-earrings.glb',
      thumbnail_url: '/images/accessories/spider-earrings.jpg',
      stock_quantity: 15,
      is_accessory: true,
      colors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc-3',
      name: 'Gothic Glasses',
      description: 'Dark gothic sunglasses',
      price: 14.99,
      category: 'glasses',
      theme: 'vampire',
      model_url: '/models/accessories/gothic-glasses.glb',
      thumbnail_url: '/images/accessories/gothic-glasses.jpg',
      stock_quantity: 8,
      is_accessory: true,
      colors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  // Update wig and accessory positions when face tracking updates
  useEffect(() => {
    if (engine && landmarks && headPose && isTracking) {
      engine.updateWigPosition(landmarks, headPose);
    }
  }, [engine, landmarks, headPose, isTracking]);

  // Handle adding an accessory
  const handleAddAccessory = async (product: Product, layer: number) => {
    if (!engine) {
      setError('AR Engine not initialized');
      return;
    }

    setIsLoadingAccessory(true);
    setError(null);

    try {
      // Load the accessory model
      console.log(`Loading accessory: ${product.name} for layer ${layer}`);
      const model = await engine.loadAccessoryModel(product.model_url);

      // Generate unique ID for this instance
      const accessoryId = `${product.id}-${Date.now()}`;

      // Add to AR engine with accessory type from category
      engine.addAccessory(
        accessoryId,
        product.id,
        model,
        layer,
        product.category // 'hat', 'earrings', 'glasses', etc.
      );

      // Update session state
      const activeAccessory: ActiveAccessory = {
        id: accessoryId,
        productId: product.id,
        layer: layer,
        product: product,
      };
      addAccessory(activeAccessory);

      console.log(`Accessory added successfully: ${product.name} on layer ${layer}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add accessory';
      setError(errorMessage);
      console.error('Error adding accessory:', err);
    } finally {
      setIsLoadingAccessory(false);
    }
  };

  // Handle removing an accessory
  const handleRemoveAccessory = (accessoryId: string) => {
    if (!engine) return;

    try {
      // Remove from AR engine
      const removed = engine.removeAccessory(accessoryId);

      if (removed) {
        // Update session state
        removeAccessory(accessoryId);
        console.log(`Accessory removed: ${accessoryId}`);
      } else {
        console.warn(`Accessory not found: ${accessoryId}`);
      }
    } catch (err) {
      console.error('Error removing accessory:', err);
    }
  };

  // Start camera and tracking
  const handleStartTryOn = async () => {
    try {
      await startTracking();
    } catch (err) {
      setError('Failed to start camera');
      console.error(err);
    }
  };

  // Stop tracking
  const handleStopTryOn = () => {
    stopTracking();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-400 mb-6">
          🎃 Accessory Layering System Example
        </h1>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded p-4 mb-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AR Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-purple-400">AR Try-On View</h2>
                <div className="text-sm text-gray-400">FPS: {fps}</div>
              </div>

              {/* Video and Canvas Container */}
              <div className="relative aspect-video bg-black rounded overflow-hidden">
                {/* Video feed (hidden but active) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* AR Canvas overlay */}
                <div className="absolute inset-0 w-full h-full">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ display: 'block', touchAction: 'none' }}
                  />
                </div>

                {/* Status overlay */}
                {!isTracking && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <p className="text-white mb-4">Camera not active</p>
                      <button
                        onClick={handleStartTryOn}
                        className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded font-medium"
                      >
                        Start Try-On
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              {isTracking && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleStopTryOn}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Stop Camera
                  </button>
                  <button
                    onClick={() => engine?.removeAllAccessories()}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    Remove All Accessories
                  </button>
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">System Info</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Engine Status:</span>
                  <span className={isInitialized ? 'text-green-400' : 'text-red-400'}>
                    {isInitialized ? 'Initialized' : 'Not Initialized'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Face Tracking:</span>
                  <span className={isTracking ? 'text-green-400' : 'text-gray-400'}>
                    {isTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Accessories:</span>
                  <span className="text-white">{customization.accessories.length} / 3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Available Layers:</span>
                  <span className="text-white">{getAvailableLayers().join(', ') || 'None'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Accessory Selector */}
          <div className="lg:col-span-1">
            <AccessorySelector
              accessories={availableAccessories}
              activeAccessories={customization.accessories}
              availableLayers={getAvailableLayers()}
              onAddAccessory={handleAddAccessory}
              onRemoveAccessory={handleRemoveAccessory}
              isLoading={isLoadingAccessory}
              maxLayers={3}
            />

            {/* Usage Instructions */}
            <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">How to Use</h3>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>Click "Start Try-On" to activate camera</li>
                <li>Position your face in the camera view</li>
                <li>Select an accessory from the dropdown</li>
                <li>Choose a layer (0-2)</li>
                <li>Click "Add to Layer"</li>
                <li>Add up to 3 accessories on different layers</li>
                <li>Remove accessories using the "Remove" button</li>
              </ol>
            </div>

            {/* Layer Info */}
            <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Layer System</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div>
                  <span className="font-medium text-white">Layer 0 (Base):</span>
                  <p className="text-gray-400">Closest to head, renders first</p>
                </div>
                <div>
                  <span className="font-medium text-white">Layer 1 (Middle):</span>
                  <p className="text-gray-400">Middle layer, renders second</p>
                </div>
                <div>
                  <span className="font-medium text-white">Layer 2 (Top):</span>
                  <p className="text-gray-400">Furthest from head, renders last</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessoryLayerExample;
