import { useEffect, useRef, useState } from 'react';
import { ARTryOnEngine } from '../engine/ARTryOnEngine';

/**
 * Custom hook to manage AR Engine lifecycle
 */
export const useAREngine = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const engineRef = useRef<ARTryOnEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Create AR engine instance
      const engine = new ARTryOnEngine(canvasRef.current);
      engineRef.current = engine;

      // Initialize scene
      engine.initializeScene();
      
      // Set up FPS monitoring
      engine.onFPSUpdate((currentFps) => {
        setFps(currentFps);
      });

      // Start rendering
      engine.startRendering();
      
      setIsInitialized(true);
      setError(null);

      // Handle window resize
      const handleResize = () => {
        engine.handleResize();
      };

      window.addEventListener('resize', handleResize);

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        engine.cleanup();
        engineRef.current = null;
        setIsInitialized(false);
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize AR engine';
      setError(errorMessage);
      console.error('AR Engine initialization error:', err);
    }
  }, [canvasRef]);

  return {
    engine: engineRef.current,
    isInitialized,
    fps,
    error,
  };
};
