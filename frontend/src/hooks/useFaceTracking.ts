import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceTrackingModule } from '../engine/FaceTrackingModule';
import {
  FaceLandmarks,
  HeadPose,
  LightingData,
  FaceTrackingStatus,
  FaceTrackingError,
} from '../types/faceTracking';
import { LightSource } from '../engine/AdaptiveLighting';

interface UseFaceTrackingOptions {
  autoStart?: boolean;
  lightingThreshold?: number;
  trackingLostThreshold?: number;
}

interface UseFaceTrackingReturn {
  // State
  isInitialized: boolean;
  isTracking: boolean;
  status: FaceTrackingStatus;
  landmarks: FaceLandmarks | null;
  headPose: HeadPose | null;
  lighting: LightingData | null;
  lightSource: LightSource | null;
  error: { type: FaceTrackingError; message: string } | null;
  
  // Methods
  start: () => Promise<void>;
  stop: () => void;
  
  // Module reference
  module: FaceTrackingModule | null;
}

/**
 * Custom hook to manage Face Tracking Module lifecycle
 */
export const useFaceTracking = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UseFaceTrackingOptions = {}
): UseFaceTrackingReturn => {
  const {
    autoStart = false,
    lightingThreshold = 0.3,
    trackingLostThreshold = 2000,
  } = options;
  
  const moduleRef = useRef<FaceTrackingModule | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState<FaceTrackingStatus>(FaceTrackingStatus.NOT_STARTED);
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [headPose, setHeadPose] = useState<HeadPose | null>(null);
  const [lighting, setLighting] = useState<LightingData | null>(null);
  const [lightSource, setLightSource] = useState<LightSource | null>(null);
  const [error, setError] = useState<{ type: FaceTrackingError; message: string } | null>(null);

  /**
   * Initialize and start face tracking
   */
  const start = useCallback(async () => {
    if (!videoRef.current) {
      console.error('Video element not available');
      return;
    }
    
    try {
      // Create module if not exists
      if (!moduleRef.current) {
        const module = new FaceTrackingModule(videoRef.current);
        moduleRef.current = module;
        
        // Set thresholds
        module.setLightingThreshold(lightingThreshold);
        module.setTrackingLostThreshold(trackingLostThreshold);
        
        // Register callbacks
        module.onLandmarks((lm) => setLandmarks(lm));
        module.onHeadPose((pose) => setHeadPose(pose));
        module.onLighting((light) => setLighting(light));
        module.onLightSource((source) => setLightSource(source));
        module.onStatusChange((newStatus) => {
          setStatus(newStatus);
          setIsTracking(newStatus === FaceTrackingStatus.TRACKING);
        });
        module.onError((errorType, message) => {
          setError({ type: errorType, message });
        });
        
        // Initialize model
        await module.initialize();
        setIsInitialized(true);
      }
      
      // Start camera and tracking
      await moduleRef.current.startCamera();
      await moduleRef.current.startTracking();
      
      setError(null);
    } catch (err) {
      console.error('Failed to start face tracking:', err);
      
      // Error is already set by module callbacks
      if (!error) {
        setError({
          type: FaceTrackingError.MODEL_LOAD_FAILED,
          message: err instanceof Error ? err.message : 'Failed to start face tracking',
        });
      }
    }
  }, [videoRef, lightingThreshold, trackingLostThreshold, error]);

  /**
   * Stop face tracking
   */
  const stop = useCallback(() => {
    if (moduleRef.current) {
      moduleRef.current.stopTracking();
      setIsTracking(false);
      setLandmarks(null);
      setHeadPose(null);
      setLighting(null);
    }
  }, []);

  /**
   * Auto-start if enabled
   */
  useEffect(() => {
    if (autoStart && videoRef.current && !isInitialized) {
      start();
    }
  }, [autoStart, videoRef, isInitialized, start]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (moduleRef.current) {
        moduleRef.current.cleanup();
        moduleRef.current = null;
      }
    };
  }, []);

  return {
    isInitialized,
    isTracking,
    status,
    landmarks,
    headPose,
    lighting,
    lightSource,
    error,
    start,
    stop,
    module: moduleRef.current,
  };
};
