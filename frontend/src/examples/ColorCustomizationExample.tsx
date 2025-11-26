import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ARTryOnEngine } from '../engine/ARTryOnEngine';
import { ColorPicker } from '../components/AR/ColorPicker';
import { ProductColor } from '../types/product';

/**
 * Example component demonstrating color customization functionality
 * This shows how to:
 * 1. Initialize AR engine
 * 2. Load a wig model
 * 3. Apply color customization
 * 4. Measure performance (< 300ms requirement)
 */
const ColorCustomizationExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<ARTryOnEngine | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [colorChangeTime, setColorChangeTime] = useState<number | null>(null);

  // Example color options (would come from product API in real usage)
  const exampleColors: ProductColor[] = [
    {
      id: '1',
      product_id: 'example',
      color_name: 'Midnight Black',
      color_hex: '#1a1a1a',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      product_id: 'example',
      color_name: 'Crimson Red',
      color_hex: '#dc143c',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      product_id: 'example',
      color_name: 'Electric Purple',
      color_hex: '#9b30ff',
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      product_id: 'example',
      color_name: 'Emerald Green',
      color_hex: '#50c878',
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      product_id: 'example',
      color_name: 'Ocean Blue',
      color_hex: '#4169e1',
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      product_id: 'example',
      color_name: 'Platinum Blonde',
      color_hex: '#e5e4e2',
      created_at: new Date().toISOString(),
    },
  ];

  // Initialize AR engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const arEngine = new ARTryOnEngine(canvasRef.current);
    arEngine.initializeScene();
    arEngine.startRendering();
    setEngine(arEngine);

    return () => {
      arEngine.cleanup();
    };
  }, []);

  // Load example wig model (you would use a real model URL)
  const handleLoadModel = async () => {
    if (!engine) return;

    try {
      // In a real scenario, you would load from product.model_url
      // For this example, we'll create a simple colored cube as a placeholder
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
      const cube = new THREE.Mesh(geometry, material);
      
      const group = new THREE.Group();
      group.add(cube);
      
      await engine.setCurrentWig(group);
      setIsModelLoaded(true);
      console.log('Example model loaded');
    } catch (error) {
      console.error('Failed to load model:', error);
    }
  };

  // Handle color selection
  const handleColorSelect = (colorHex: string, colorName: string) => {
    if (!engine || !isModelLoaded) return;

    const startTime = performance.now();
    
    engine.applyColorCustomization(colorHex);
    setSelectedColor(colorHex);
    
    const elapsed = performance.now() - startTime;
    setColorChangeTime(elapsed);
    
    console.log(`Color changed to ${colorName} in ${elapsed.toFixed(2)}ms`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-halloween-orange mb-4">
          Color Customization Example
        </h1>
        <p className="text-gray-400 mb-8">
          Demonstrates real-time color customization with performance monitoring
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl" style={{ height: '500px' }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full"
              />
            </div>

            {/* Performance Metrics */}
            {colorChangeTime !== null && (
              <div className={`mt-4 p-4 rounded-lg ${
                colorChangeTime < 300 ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'
              }`}>
                <p className="text-white font-semibold">
                  Last Color Change: {colorChangeTime.toFixed(2)}ms
                </p>
                <p className={`text-sm ${colorChangeTime < 300 ? 'text-green-400' : 'text-red-400'}`}>
                  {colorChangeTime < 300 
                    ? '✓ Within 300ms requirement' 
                    : '✗ Exceeds 300ms requirement'}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Load Model Button */}
            {!isModelLoaded && (
              <button
                onClick={handleLoadModel}
                disabled={!engine}
                className="w-full px-4 py-3 bg-halloween-orange hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Load Example Model
              </button>
            )}

            {/* Color Picker */}
            {isModelLoaded && (
              <div>
                <ColorPicker
                  colors={exampleColors}
                  selectedColor={selectedColor}
                  onColorSelect={handleColorSelect}
                  disabled={!isModelLoaded}
                />
              </div>
            )}

            {/* Status */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">AR Engine:</span>
                  <span className={engine ? 'text-green-500' : 'text-yellow-500'}>
                    {engine ? 'Ready' : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Model:</span>
                  <span className={isModelLoaded ? 'text-green-500' : 'text-gray-500'}>
                    {isModelLoaded ? 'Loaded' : 'Not Loaded'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Colors Available:</span>
                  <span className="text-white">{exampleColors.length}</span>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Display at least 5 color options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={colorChangeTime && colorChangeTime < 300 ? 'text-green-500' : 'text-gray-500'}>
                    {colorChangeTime && colorChangeTime < 300 ? '✓' : '○'}
                  </span>
                  <span>Color changes apply within 300ms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={selectedColor ? 'text-green-500' : 'text-gray-500'}>
                    {selectedColor ? '✓' : '○'}
                  </span>
                  <span>Store selected color in state</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorCustomizationExample;
