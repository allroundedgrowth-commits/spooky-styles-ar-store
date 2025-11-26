import React, { useEffect, useRef, useState } from 'react';
import { ARTryOnEngine } from '../engine/ARTryOnEngine';
import { FaceTrackingModule } from '../engine/FaceTrackingModule';

/**
 * Example component demonstrating wig loading and rendering
 * This is a reference implementation showing how to use the WigLoader system
 */
export const WigLoaderExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<ARTryOnEngine | null>(null);
  const faceTrackerRef = useRef<FaceTrackingModule | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWigUrl, setCurrentWigUrl] = useState<string | null>(null);

  // Example wig URLs (replace with actual model URLs)
  const wigModels = [
    { id: 'witch', name: 'Witch Wig', url: '/models/witch-wig.glb' },
    { id: 'vampire', name: 'Vampire Wig', url: '/models/vampire-wig.glb' },
    { id: 'zombie', name: 'Zombie Wig', url: '/models/zombie-wig.glb' },
  ];

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    // Initialize AR engine
    const engine = new ARTryOnEngine(canvasRef.current);
    engine.initializeScene();
    engine.startRendering();
    engineRef.current = engine;

    // Initialize face tracking
    const faceTracker = new FaceTrackingModule(videoRef.current);
    faceTrackerRef.current = faceTracker;

    // Start face tracking
    faceTracker.initialize().then(() => {
      faceTracker.startTracking();
    });

    // Update loop for wig positioning
    const updateLoop = setInterval(() => {
      if (!engineRef.current || !faceTrackerRef.current) return;

      const landmarks = faceTrackerRef.current.getFaceLandmarks();
      const headPose = faceTrackerRef.current.getHeadPose();

      if (landmarks && headPose && landmarks.confidence > 0.7) {
        engineRef.current.updateWigPosition(landmarks, headPose);
      }
    }, 16); // ~60 FPS update check (throttled internally to 24 FPS)

    // Cleanup
    return () => {
      clearInterval(updateLoop);
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
      if (faceTrackerRef.current) {
        faceTrackerRef.current.stopTracking();
      }
    };
  }, []);

  const loadWig = async (wigUrl: string) => {
    if (!engineRef.current) {
      setError('AR Engine not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadProgress(0);

    try {
      // Load wig model with progress tracking
      const model = await engineRef.current.loadWigModel(
        wigUrl,
        (progress) => {
          setLoadProgress(progress);
        },
        (err) => {
          setError(err.message);
        }
      );

      // Set as current wig (< 500ms)
      await engineRef.current.setCurrentWig(model);
      setCurrentWigUrl(wigUrl);
      setLoadProgress(100);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeWig = () => {
    if (engineRef.current) {
      engineRef.current.removeCurrentWig();
      setCurrentWigUrl(null);
    }
  };

  const clearCache = () => {
    if (engineRef.current) {
      engineRef.current.clearModelCache();
      alert('Model cache cleared');
    }
  };

  return (
    <div className="wig-loader-example">
      <div className="canvas-container" style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '600px',
            objectFit: 'cover',
          }}
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '600px',
            background: 'transparent',
          }}
        />
      </div>

      <div className="controls">
        <h3>Wig Selection</h3>
        
        {isLoading && (
          <div className="loading">
            Loading: {loadProgress.toFixed(0)}%
          </div>
        )}

        {error && (
          <div className="error" style={{ color: 'red' }}>
            Error: {error}
          </div>
        )}

        <div className="wig-buttons">
          {wigModels.map((wig) => (
            <button
              key={wig.id}
              onClick={() => loadWig(wig.url)}
              disabled={isLoading}
              className={currentWigUrl === wig.url ? 'active' : ''}
            >
              {wig.name}
            </button>
          ))}
        </div>

        <div className="actions">
          <button onClick={removeWig} disabled={!currentWigUrl}>
            Remove Wig
          </button>
          <button onClick={clearCache}>
            Clear Cache
          </button>
        </div>

        {engineRef.current && (
          <div className="stats">
            <p>Cached Models: {engineRef.current.getCachedModelCount()}</p>
            <p>Current FPS: {engineRef.current.getCurrentFPS()}</p>
          </div>
        )}
      </div>
    </div>
  );
};
