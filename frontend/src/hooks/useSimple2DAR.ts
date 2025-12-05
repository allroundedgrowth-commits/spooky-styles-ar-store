import { useEffect, useRef, useState } from 'react';
import { Simple2DAREngine, ARConfig, AdjustmentMode, HairProcessingState } from '../engine/Simple2DAREngine';

export const useSimple2DAR = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Simple2DAREngine | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [hairProcessingState, setHairProcessingState] = useState<HairProcessingState | null>(null);
  const [isUsingMediaPipe, setIsUsingMediaPipe] = useState(false);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

  const initialize = async () => {
    console.log('🎬 [useSimple2DAR] Starting initialization...');
    
    if (!videoRef.current || !canvasRef.current) {
      const errorMsg = 'Video or canvas element not found';
      console.error('❌ [useSimple2DAR]', errorMsg);
      setError(errorMsg);
      return;
    }

    console.log('✅ [useSimple2DAR] Video and canvas refs found');
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔧 [useSimple2DAR] Creating engine instance...');
      const engine = new Simple2DAREngine(videoRef.current, canvasRef.current);
      
      console.log('📹 [useSimple2DAR] Initializing camera...');
      await engine.initialize();
      
      engineRef.current = engine;
      setIsInitialized(true);
      setCameraPermission('granted');
      setIsUsingMediaPipe(engine.isUsingMediaPipe());
      
      console.log('✅ [useSimple2DAR] Initialization complete!', {
        usingMediaPipe: engine.isUsingMediaPipe(),
        canvasSize: `${canvasRef.current.width}x${canvasRef.current.height}`
      });
    } catch (err: any) {
      console.error('❌ [useSimple2DAR] Failed to initialize AR:', err);
      setError(err.message || 'Failed to access camera');
      setCameraPermission('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWig = async (config: ARConfig) => {
    console.log('🎭 [useSimple2DAR] Loading wig...', config);
    
    if (!engineRef.current) {
      const errorMsg = 'Engine not initialized';
      console.error('❌ [useSimple2DAR]', errorMsg);
      throw new Error(errorMsg);
    }

    setIsLoading(true);
    try {
      console.log('📦 [useSimple2DAR] Loading wig image:', config.wigImageUrl);
      await engineRef.current.loadWig(config);
      
      console.log('🎬 [useSimple2DAR] Starting rendering loop...');
      engineRef.current.startRendering();
      
      console.log('✅ [useSimple2DAR] Wig loaded and rendering started!');
    } catch (err: any) {
      console.error('❌ [useSimple2DAR] Failed to load wig:', err);
      setError(err.message || 'Failed to load wig');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserImage = async (imageFile: File) => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }

    setIsLoading(true);
    try {
      await engineRef.current.loadUserImage(imageFile);
      engineRef.current.startRendering();
    } catch (err: any) {
      setError(err.message || 'Failed to load image');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchToCamera = () => {
    if (engineRef.current) {
      engineRef.current.switchToCamera();
    }
  };

  const updateConfig = (config: Partial<ARConfig>) => {
    if (engineRef.current) {
      engineRef.current.updateConfig(config);
    }
  };

  const takeScreenshot = (): string | null => {
    if (!engineRef.current) return null;
    return engineRef.current.takeScreenshot();
  };

  const setAdjustmentMode = (mode: AdjustmentMode) => {
    if (engineRef.current) {
      engineRef.current.setAdjustmentMode(mode);
      // Update state after mode change
      const state = engineRef.current.getHairProcessingState();
      setHairProcessingState(state);
    }
  };

  const getHairProcessingState = (): HairProcessingState | null => {
    if (engineRef.current) {
      return engineRef.current.getHairProcessingState();
    }
    return null;
  };

  const isHairFlatteningEnabled = (): boolean => {
    if (engineRef.current) {
      return engineRef.current.isHairFlatteningEnabled();
    }
    return false;
  };

  const stop = () => {
    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
      setIsInitialized(false);
      setHairProcessingState(null);
    }
  };

  // Poll hair processing state periodically when initialized
  useEffect(() => {
    if (!isInitialized || !engineRef.current) return;

    const interval = setInterval(() => {
      if (engineRef.current) {
        const state = engineRef.current.getHairProcessingState();
        setHairProcessingState(state);
      }
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [isInitialized]);

  return {
    videoRef,
    canvasRef,
    isInitialized,
    isLoading,
    error,
    cameraPermission,
    hairProcessingState,
    isUsingMediaPipe,
    initialize,
    loadWig,
    loadUserImage,
    switchToCamera,
    updateConfig,
    takeScreenshot,
    setAdjustmentMode,
    getHairProcessingState,
    isHairFlatteningEnabled,
    stop,
  };
};
