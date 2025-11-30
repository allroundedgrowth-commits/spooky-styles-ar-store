import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AdjustmentMode } from '../../engine/HairFlatteningEngine';

interface ComparisonViewProps {
  originalImage: ImageData | null;
  adjustedImage: ImageData | null;
  currentMode: AdjustmentMode;
  onCapture: (compositeImage: ImageData) => void;
  isActive: boolean;
}

/**
 * ComparisonView Component
 * 
 * Split-screen view showing original and adjusted hair side-by-side
 * Updates in real-time as mode changes and provides screenshot capture
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 * 
 * Features:
 * - Split-screen layout with original and adjusted views
 * - Labels for "Original" and current mode name
 * - Real-time updates when mode changes
 * - Capture button for saving comparison screenshots
 * - Optimized rendering to maintain 24+ FPS
 */
export const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalImage,
  adjustedImage,
  currentMode,
  onCapture,
  isActive,
}) => {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const adjustedCanvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Get mode display name
  const getModeDisplayName = useCallback((mode: AdjustmentMode): string => {
    switch (mode) {
      case AdjustmentMode.NORMAL:
        return 'Normal';
      case AdjustmentMode.FLATTENED:
        return 'Flattened';
      case AdjustmentMode.BALD:
        return 'Bald';
      default:
        return 'Adjusted';
    }
  }, []);

  // Render image to canvas
  const renderImageToCanvas = useCallback((
    canvas: HTMLCanvasElement,
    imageData: ImageData | null
  ) => {
    if (!canvas || !imageData) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Set canvas dimensions if needed
    if (canvas.width !== imageData.width || canvas.height !== imageData.height) {
      canvas.width = imageData.width;
      canvas.height = imageData.height;
    }

    // Use putImageData for optimal performance
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Update canvases when images change
  useEffect(() => {
    if (!isActive) return;

    const startTime = performance.now();

    // Render original image
    if (originalCanvasRef.current && originalImage) {
      renderImageToCanvas(originalCanvasRef.current, originalImage);
    }

    // Render adjusted image
    if (adjustedCanvasRef.current && adjustedImage) {
      renderImageToCanvas(adjustedCanvasRef.current, adjustedImage);
    }

    // Track FPS
    const now = performance.now();
    frameCountRef.current++;

    if (now - lastFrameTimeRef.current >= 1000) {
      const currentFps = frameCountRef.current;
      setFps(currentFps);
      
      // Warn if FPS drops below 24
      if (currentFps < 24) {
        console.warn(`ComparisonView FPS: ${currentFps}, below 24 FPS requirement`);
      }

      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }

    // Verify render timing
    const duration = performance.now() - startTime;
    if (duration > 16.67) { // ~60 FPS threshold
      console.warn(`ComparisonView render took ${duration.toFixed(2)}ms`);
    }
  }, [originalImage, adjustedImage, isActive, renderImageToCanvas]);

  // Handle capture button click
  const handleCapture = useCallback(() => {
    if (!originalImage || !adjustedImage || !compositeCanvasRef.current) {
      console.warn('Cannot capture: missing images or canvas');
      return;
    }

    const canvas = compositeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create composite image with both views side-by-side
    const width = originalImage.width * 2;
    const height = originalImage.height;
    canvas.width = width;
    canvas.height = height;

    // Draw original on left
    ctx.putImageData(originalImage, 0, 0);

    // Draw adjusted on right
    ctx.putImageData(adjustedImage, originalImage.width, 0);

    // Add labels
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;

    // "Original" label
    const originalLabel = 'Original';
    const originalLabelX = originalImage.width / 2 - ctx.measureText(originalLabel).width / 2;
    ctx.strokeText(originalLabel, originalLabelX, 40);
    ctx.fillText(originalLabel, originalLabelX, 40);

    // Current mode label
    const modeLabel = getModeDisplayName(currentMode);
    const modeLabelX = originalImage.width + (originalImage.width / 2) - ctx.measureText(modeLabel).width / 2;
    ctx.strokeText(modeLabel, modeLabelX, 40);
    ctx.fillText(modeLabel, modeLabelX, 40);

    // Get composite ImageData
    const compositeImageData = ctx.getImageData(0, 0, width, height);
    onCapture(compositeImageData);
  }, [originalImage, adjustedImage, currentMode, getModeDisplayName, onCapture]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 z-40 flex flex-col">
      {/* Header */}
      <div className="bg-halloween-purple/95 backdrop-blur-sm p-4 flex items-center justify-between border-b border-halloween-orange/30">
        <h2 className="text-white font-bold text-lg">
          Comparison View
        </h2>
        <div className="flex items-center gap-4">
          {/* FPS indicator */}
          {fps > 0 && (
            <div className={`text-sm font-mono ${fps >= 24 ? 'text-halloween-green' : 'text-yellow-500'}`}>
              {fps} FPS
            </div>
          )}
          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={!originalImage || !adjustedImage}
            className="px-4 py-2 bg-halloween-orange text-white rounded-lg font-semibold hover:bg-halloween-orange/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Capture comparison screenshot"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Capture
          </button>
        </div>
      </div>

      {/* Split-screen comparison */}
      <div className="flex-1 flex overflow-hidden">
        {/* Original view */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="bg-gray-900 p-2 text-center border-b border-gray-700">
            <span className="text-white font-semibold text-sm">Original</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <canvas
              ref={originalCanvasRef}
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: 'auto' }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-1 bg-halloween-orange shadow-lg shadow-halloween-orange/50" />

        {/* Adjusted view */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="bg-gray-900 p-2 text-center border-b border-gray-700">
            <span className="text-white font-semibold text-sm">
              {getModeDisplayName(currentMode)}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <canvas
              ref={adjustedCanvasRef}
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: 'auto' }}
            />
          </div>
        </div>
      </div>

      {/* Hidden composite canvas for capture */}
      <canvas
        ref={compositeCanvasRef}
        className="hidden"
        aria-hidden="true"
      />

      {/* Instructions */}
      <div className="bg-halloween-purple/95 backdrop-blur-sm p-3 text-center border-t border-halloween-orange/30">
        <p className="text-white/80 text-sm">
          Compare your original hair with the {getModeDisplayName(currentMode).toLowerCase()} adjustment
        </p>
      </div>
    </div>
  );
};

export default ComparisonView;
