import React, { useRef, useEffect, useState } from 'react';
import { useAREngine } from '../hooks/useAREngine';
import { useFaceTracking } from '../hooks/useFaceTracking';
import { useAdaptiveLighting } from '../hooks/useAdaptiveLighting';

/**
 * Example component demonstrating adaptive lighting and head rotation features
 * 
 * Features demonstrated:
 * - Dynamic brightness adjustment based on ambient lighting
 * - Realistic shadow and highlight rendering based on detected light sources
 * - Accurate wig positioning during head rotation up to 45 degrees
 * - Smooth interpolation for wig movements to prevent jittering
 * - Support for both portrait and landscape device orientations
 */
export const AdaptiveLightingExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { engine, isInitialized: engineInitialized, fps } = useAREngine(canvasRef);
  const { 
    isTracking, 
    landmarks, 
    headPose, 
    lighting,
    lightSource,
    start, 
    stop 
  } = useFaceTracking(videoRef);

  const [adaptiveLightingEnabled, setAdaptiveLightingEnabled] = useState(true);
  const [smoothingFactor, setSmoothingFactor] = useState(0.3);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Apply adaptive lighting
  useAdaptiveLighting({
    engine,
    lighting,
    lightSource,
    enabled: adaptiveLightingEnabled,
  });

  // Update wig position based on face tracking
  useEffect(() => {
    if (engine && landmarks && headPose && isTracking) {
      engine.updateWigPosition(landmarks, headPose);
    }
  }, [engine, landmarks, headPose, isTracking]);

  // Update smoothing factor
  useEffect(() => {
    if (engine?.getCurrentWig()) {
      const wigLoader = (engine as any).wigLoader;
      if (wigLoader) {
        wigLoader.setSmoothingFactor(smoothingFactor);
      }
    }
  }, [engine, smoothingFactor]);

  // Monitor orientation changes
  useEffect(() => {
    const updateOrientation = () => {
      if (engine) {
        setOrientation(engine.getOrientation());
      }
    };

    window.addEventListener('resize', updateOrientation);
    updateOrientation();

    return () => {
      window.removeEventListener('resize', updateOrientation);
    };
  }, [engine]);

  const handleStart = async () => {
    try {
      await start();
    } catch (error) {
      console.error('Failed to start tracking:', error);
    }
  };

  const handleStop = () => {
    stop();
  };

  return (
    <div className="adaptive-lighting-example">
      <h2>Adaptive Lighting & Head Rotation Demo</h2>
      
      {/* AR Canvas */}
      <div className="ar-container" style={{ position: 'relative', width: '100%', height: '600px' }}>
        <video
          ref={videoRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Controls */}
      <div className="controls" style={{ marginTop: '20px' }}>
        <div>
          <button onClick={handleStart} disabled={isTracking}>
            Start Tracking
          </button>
          <button onClick={handleStop} disabled={!isTracking}>
            Stop Tracking
          </button>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={adaptiveLightingEnabled}
              onChange={(e) => setAdaptiveLightingEnabled(e.target.checked)}
            />
            Enable Adaptive Lighting
          </label>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>
            Smoothing Factor: {smoothingFactor.toFixed(2)}
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={smoothingFactor}
              onChange={(e) => setSmoothingFactor(parseFloat(e.target.value))}
            />
          </label>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Lower = smoother but more lag, Higher = more responsive but potential jitter
          </p>
        </div>
      </div>

      {/* Status Display */}
      <div className="status" style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h3>Status</h3>
        <p>Engine Initialized: {engineInitialized ? 'Yes' : 'No'}</p>
        <p>Tracking: {isTracking ? 'Active' : 'Inactive'}</p>
        <p>FPS: {fps}</p>
        <p>Orientation: {orientation}</p>
        
        {lighting && (
          <div>
            <h4>Lighting Conditions</h4>
            <p>Brightness: {(lighting.brightness * 100).toFixed(1)}%</p>
            <p>Adequate: {lighting.isAdequate ? 'Yes' : 'No'}</p>
          </div>
        )}

        {lightSource && (
          <div>
            <h4>Light Source</h4>
            <p>Direction: ({lightSource.direction.x.toFixed(2)}, {lightSource.direction.y.toFixed(2)}, {lightSource.direction.z.toFixed(2)})</p>
            <p>Intensity: {(lightSource.intensity * 100).toFixed(1)}%</p>
          </div>
        )}

        {headPose && (
          <div>
            <h4>Head Pose</h4>
            <p>Pitch: {headPose.rotation.x.toFixed(1)}°</p>
            <p>Yaw: {headPose.rotation.y.toFixed(1)}°</p>
            <p>Roll: {headPose.rotation.z.toFixed(1)}°</p>
          </div>
        )}
      </div>

      {/* Feature Description */}
      <div className="features" style={{ marginTop: '20px' }}>
        <h3>Features Demonstrated</h3>
        <ul>
          <li>✅ Dynamic brightness adjustment based on ambient lighting</li>
          <li>✅ Realistic shadow and highlight rendering based on detected light sources</li>
          <li>✅ Accurate wig positioning during head rotation up to 45 degrees</li>
          <li>✅ Smooth interpolation for wig movements to prevent jittering</li>
          <li>✅ Support for both portrait and landscape device orientations</li>
        </ul>
      </div>
    </div>
  );
};
