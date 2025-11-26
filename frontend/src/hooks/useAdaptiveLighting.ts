import { useEffect } from 'react';
import { ARTryOnEngine } from '../engine/ARTryOnEngine';
import { LightingData } from '../types/faceTracking';
import { LightSource } from '../engine/AdaptiveLighting';

interface UseAdaptiveLightingOptions {
  engine: ARTryOnEngine | null;
  lighting: LightingData | null;
  lightSource: LightSource | null;
  enabled?: boolean;
}

/**
 * Custom hook to apply adaptive lighting to AR engine
 * Updates lighting based on ambient conditions and detected light sources
 */
export const useAdaptiveLighting = ({
  engine,
  lighting,
  lightSource,
  enabled = true,
}: UseAdaptiveLightingOptions) => {
  // Update ambient lighting based on brightness
  useEffect(() => {
    if (!engine || !lighting || !enabled) return;
    
    engine.updateLighting(lighting.brightness);
  }, [engine, lighting, enabled]);

  // Update directional light based on detected light source
  useEffect(() => {
    if (!engine || !lightSource || !enabled) return;
    
    engine.updateLightDirection(lightSource.direction);
  }, [engine, lightSource, enabled]);
};
