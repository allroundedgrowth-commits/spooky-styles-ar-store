import React, { useRef, useEffect } from 'react';
import { useAREngine } from '../../hooks/useAREngine';

interface ARCanvasProps {
  onEngineReady?: (engine: any) => void;
  onFPSUpdate?: (fps: number) => void;
  className?: string;
}

/**
 * AR Canvas Component
 * Provides a responsive canvas for Three.js AR rendering
 */
const ARCanvas: React.FC<ARCanvasProps> = ({ 
  onEngineReady, 
  onFPSUpdate,
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engine, isInitialized, fps, error } = useAREngine(canvasRef);

  // Notify parent when engine is ready
  useEffect(() => {
    if (isInitialized && engine && onEngineReady) {
      onEngineReady(engine);
    }
  }, [isInitialized, engine, onEngineReady]);

  // Notify parent of FPS updates
  useEffect(() => {
    if (onFPSUpdate) {
      onFPSUpdate(fps);
    }
  }, [fps, onFPSUpdate]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          display: 'block',
          touchAction: 'none' // Prevent default touch behaviors
        }}
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center p-6">
            <p className="text-red-500 text-lg font-semibold mb-2">
              AR Engine Error
            </p>
            <p className="text-gray-300 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}
      
      {!isInitialized && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-halloween-orange mx-auto mb-4"></div>
            <p className="text-gray-300">Initializing AR Engine...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARCanvas;
