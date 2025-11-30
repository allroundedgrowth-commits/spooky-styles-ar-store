import React, { useState, useEffect } from 'react';
import { ComparisonView } from '../components/AR/ComparisonView';
import { AdjustmentMode } from '../engine/HairFlatteningEngine';

/**
 * ComparisonViewExample
 * 
 * Demonstrates the usage of the ComparisonView component for showing
 * side-by-side comparison of original and adjusted hair images.
 * 
 * This example shows:
 * - Toggle button to show/hide comparison view
 * - Real-time updates when mode changes
 * - Screenshot capture functionality
 * - FPS monitoring
 */
export const ComparisonViewExample: React.FC = () => {
  const [showComparison, setShowComparison] = useState(false);
  const [currentMode, setCurrentMode] = useState<AdjustmentMode>(AdjustmentMode.FLATTENED);
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [adjustedImage, setAdjustedImage] = useState<ImageData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Generate sample images for demonstration
  useEffect(() => {
    // Create original image (simulated camera frame)
    const originalCanvas = document.createElement('canvas');
    originalCanvas.width = 640;
    originalCanvas.height = 480;
    const originalCtx = originalCanvas.getContext('2d');
    
    if (originalCtx) {
      // Draw gradient background
      const gradient = originalCtx.createLinearGradient(0, 0, 640, 480);
      gradient.addColorStop(0, '#4a5568');
      gradient.addColorStop(1, '#2d3748');
      originalCtx.fillStyle = gradient;
      originalCtx.fillRect(0, 0, 640, 480);
      
      // Draw "face" circle
      originalCtx.fillStyle = '#d4a574';
      originalCtx.beginPath();
      originalCtx.arc(320, 240, 100, 0, Math.PI * 2);
      originalCtx.fill();
      
      // Draw "hair" on top
      originalCtx.fillStyle = '#3d2817';
      originalCtx.beginPath();
      originalCtx.arc(320, 180, 120, 0, Math.PI);
      originalCtx.fill();
      
      // Add text
      originalCtx.fillStyle = 'white';
      originalCtx.font = 'bold 24px Arial';
      originalCtx.textAlign = 'center';
      originalCtx.fillText('Original Hair', 320, 400);
      
      setOriginalImage(originalCtx.getImageData(0, 0, 640, 480));
    }

    // Create adjusted image based on mode
    updateAdjustedImage(currentMode);
  }, []);

  // Update adjusted image when mode changes
  useEffect(() => {
    updateAdjustedImage(currentMode);
  }, [currentMode]);

  const updateAdjustedImage = (mode: AdjustmentMode) => {
    const adjustedCanvas = document.createElement('canvas');
    adjustedCanvas.width = 640;
    adjustedCanvas.height = 480;
    const adjustedCtx = adjustedCanvas.getContext('2d');
    
    if (adjustedCtx) {
      // Draw gradient background
      const gradient = adjustedCtx.createLinearGradient(0, 0, 640, 480);
      gradient.addColorStop(0, '#4a5568');
      gradient.addColorStop(1, '#2d3748');
      adjustedCtx.fillStyle = gradient;
      adjustedCtx.fillRect(0, 0, 640, 480);
      
      // Draw "face" circle
      adjustedCtx.fillStyle = '#d4a574';
      adjustedCtx.beginPath();
      adjustedCtx.arc(320, 240, 100, 0, Math.PI * 2);
      adjustedCtx.fill();
      
      // Draw adjusted "hair" based on mode
      if (mode === AdjustmentMode.NORMAL) {
        // Normal - same as original
        adjustedCtx.fillStyle = '#3d2817';
        adjustedCtx.beginPath();
        adjustedCtx.arc(320, 180, 120, 0, Math.PI);
        adjustedCtx.fill();
      } else if (mode === AdjustmentMode.FLATTENED) {
        // Flattened - reduced volume
        adjustedCtx.fillStyle = '#3d2817';
        adjustedCtx.beginPath();
        adjustedCtx.arc(320, 200, 80, 0, Math.PI);
        adjustedCtx.fill();
      } else if (mode === AdjustmentMode.BALD) {
        // Bald - no hair, just scalp
        adjustedCtx.fillStyle = '#d4a574';
        adjustedCtx.beginPath();
        adjustedCtx.arc(320, 180, 100, 0, Math.PI);
        adjustedCtx.fill();
      }
      
      // Add text
      adjustedCtx.fillStyle = 'white';
      adjustedCtx.font = 'bold 24px Arial';
      adjustedCtx.textAlign = 'center';
      adjustedCtx.fillText(`${mode} Mode`, 320, 400);
      
      setAdjustedImage(adjustedCtx.getImageData(0, 0, 640, 480));
    }
  };

  // Handle screenshot capture
  const handleCapture = (compositeImage: ImageData) => {
    // Convert ImageData to data URL for display
    const canvas = document.createElement('canvas');
    canvas.width = compositeImage.width;
    canvas.height = compositeImage.height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.putImageData(compositeImage, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      
      // Also trigger download
      const link = document.createElement('a');
      link.download = `comparison-${currentMode}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-halloween-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">
          ComparisonView Component Example
        </h1>
        <p className="text-gray-400 mb-8">
          Demonstrates split-screen comparison of original and adjusted hair images
        </p>

        {/* Controls */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Toggle comparison view */}
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                showComparison
                  ? 'bg-halloween-orange text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </button>

            {/* Mode selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMode(AdjustmentMode.NORMAL)}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                  currentMode === AdjustmentMode.NORMAL
                    ? 'bg-halloween-purple text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setCurrentMode(AdjustmentMode.FLATTENED)}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                  currentMode === AdjustmentMode.FLATTENED
                    ? 'bg-halloween-orange text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Flattened
              </button>
              <button
                onClick={() => setCurrentMode(AdjustmentMode.BALD)}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                  currentMode === AdjustmentMode.BALD
                    ? 'bg-halloween-purple text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Bald
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            <p>• Click "Show Comparison" to open the split-screen view</p>
            <p>• Change modes to see real-time updates</p>
            <p>• Click "Capture" in the comparison view to save a screenshot</p>
          </div>
        </div>

        {/* Preview area */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '600px' }}>
            {!showComparison ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <p className="text-gray-400">Click "Show Comparison" to view</p>
                </div>
              </div>
            ) : (
              <ComparisonView
                originalImage={originalImage}
                adjustedImage={adjustedImage}
                currentMode={currentMode}
                onCapture={handleCapture}
                isActive={showComparison}
              />
            )}
          </div>
        </div>

        {/* Captured screenshot */}
        {capturedImage && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Last Captured Screenshot
            </h2>
            <img
              src={capturedImage}
              alt="Captured comparison"
              className="w-full rounded-lg border-2 border-halloween-orange"
            />
            <p className="text-sm text-gray-400 mt-2">
              Screenshot saved and downloaded automatically
            </p>
          </div>
        )}

        {/* Features */}
        <div className="bg-gray-900 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Split-screen layout with original and adjusted views</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Real-time updates when adjustment mode changes</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Screenshot capture with both views side-by-side</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>FPS monitoring to ensure 24+ FPS performance</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Clear labels for "Original" and current mode</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Halloween-themed styling consistent with project design</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComparisonViewExample;
