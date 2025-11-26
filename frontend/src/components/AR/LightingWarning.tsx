import React from 'react';
import { LightingData } from '../../types/faceTracking';

interface LightingWarningProps {
  lighting: LightingData | null;
  threshold?: number;
}

/**
 * Display warning when lighting conditions are poor
 */
export const LightingWarning: React.FC<LightingWarningProps> = ({ 
  lighting, 
  threshold = 0.3 
}) => {
  if (!lighting || lighting.isAdequate) {
    return null;
  }

  const brightnessPercentage = Math.round(lighting.brightness * 100);
  const thresholdPercentage = Math.round(threshold * 100);

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 max-w-sm w-full px-4">
      <div className="bg-yellow-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-yellow-500/30 animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-base mb-2">
              Lighting Too Dark
            </h3>
            <p className="text-white/90 text-sm mb-3">
              Current brightness: {brightnessPercentage}% (minimum: {thresholdPercentage}%)
            </p>
            <div className="space-y-1 text-white/80 text-xs">
              <p>• Move to a brighter area</p>
              <p>• Turn on more lights</p>
              <p>• Face a window or light source</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
