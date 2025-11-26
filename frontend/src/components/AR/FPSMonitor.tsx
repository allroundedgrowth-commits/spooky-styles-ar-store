import React from 'react';

interface FPSMonitorProps {
  fps: number;
  targetFps?: number;
  show?: boolean;
}

/**
 * FPS Monitor Component
 * Displays current FPS with visual indicator for performance
 */
const FPSMonitor: React.FC<FPSMonitorProps> = ({ 
  fps, 
  targetFps = 24,
  show = true 
}) => {
  if (!show) return null;

  // Determine color based on FPS performance
  const getColorClass = () => {
    if (fps >= targetFps) {
      return 'text-green-500';
    } else if (fps >= targetFps * 0.75) {
      return 'text-yellow-500';
    } else {
      return 'text-red-500';
    }
  };

  const getPerformanceLabel = () => {
    if (fps >= targetFps) {
      return 'Good';
    } else if (fps >= targetFps * 0.75) {
      return 'Fair';
    } else {
      return 'Poor';
    }
  };

  return (
    <div className="bg-black bg-opacity-70 rounded-lg px-3 py-2 text-sm font-mono">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">FPS:</span>
        <span className={`font-bold ${getColorClass()}`}>
          {fps}
        </span>
        <span className="text-gray-500">|</span>
        <span className={`text-xs ${getColorClass()}`}>
          {getPerformanceLabel()}
        </span>
      </div>
    </div>
  );
};

export default FPSMonitor;
