/**
 * PerformanceWarning Component
 * 
 * Displays performance warnings to users when the hair flattening
 * system degrades quality due to performance constraints.
 * 
 * Shows current quality level and provides helpful tips for
 * improving performance.
 */

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import type { QualityLevel, PerformanceWarning as Warning } from '../../engine/PerformanceManager';

interface PerformanceWarningProps {
  qualityLevel: QualityLevel;
  isDegraded: boolean;
  warnings: Warning[];
  onDismiss?: () => void;
}

export const PerformanceWarning: React.FC<PerformanceWarningProps> = ({
  qualityLevel,
  isDegraded,
  warnings,
  onDismiss
}) => {
  if (!isDegraded && warnings.length === 0) {
    return null;
  }
  
  const getQualityColor = (quality: QualityLevel): string => {
    switch (quality) {
      case 'high':
        return 'text-halloween-green';
      case 'medium':
        return 'text-halloween-orange';
      case 'low':
        return 'text-red-500';
    }
  };
  
  const getQualityLabel = (quality: QualityLevel): string => {
    switch (quality) {
      case 'high':
        return 'High Quality';
      case 'medium':
        return 'Medium Quality';
      case 'low':
        return 'Low Quality';
    }
  };
  
  const getSeverityIcon = (severity: Warning['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-halloween-orange" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };
  
  const latestWarning = warnings[warnings.length - 1];
  
  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      {/* Quality Level Indicator */}
      {isDegraded && (
        <div className="bg-halloween-black/90 backdrop-blur-sm border border-halloween-purple/30 rounded-lg p-4 mb-2 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-halloween-orange flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">
                Performance Mode Active
              </h3>
              <p className="text-gray-300 text-sm mb-2">
                Quality reduced to maintain smooth performance
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Current Quality:</span>
                <span className={`font-semibold ${getQualityColor(qualityLevel)}`}>
                  {getQualityLabel(qualityLevel)}
                </span>
              </div>
              
              {/* Performance Tips */}
              <div className="mt-3 pt-3 border-t border-halloween-purple/20">
                <p className="text-gray-400 text-xs mb-2">Tips to improve performance:</p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Close other browser tabs</li>
                  <li>• Ensure good lighting</li>
                  <li>• Move to a less busy background</li>
                  <li>• Try a different browser</li>
                </ul>
              </div>
            </div>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Dismiss warning"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Latest Warning Details */}
      {latestWarning && !isDegraded && (
        <div className="bg-halloween-black/90 backdrop-blur-sm border border-halloween-purple/30 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            {getSeverityIcon(latestWarning.severity)}
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">
                Performance Notice
              </h3>
              <p className="text-gray-300 text-sm">
                {latestWarning.message}
              </p>
            </div>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Dismiss warning"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceWarning;
