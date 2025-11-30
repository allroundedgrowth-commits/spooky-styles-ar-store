/**
 * Hair Segmentation Loader Component
 * 
 * Displays a loading indicator while the MediaPipe Selfie Segmentation model
 * is being initialized. Provides visual feedback to users during the model
 * loading process.
 */

import React from 'react';

interface HairSegmentationLoaderProps {
  /** Whether the loader should be visible */
  isLoading: boolean;
  /** Optional custom message to display */
  message?: string;
  /** Optional error message if loading failed */
  error?: string | null;
}

/**
 * HairSegmentationLoader
 * 
 * A themed loading component that appears during hair segmentation model initialization.
 * Styled to match the Halloween theme of the application.
 */
export const HairSegmentationLoader: React.FC<HairSegmentationLoaderProps> = ({
  isLoading,
  message = 'Loading hair detection...',
  error = null
}) => {
  if (!isLoading && !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-halloween-black bg-opacity-80">
      <div className="bg-halloween-darkPurple border-2 border-halloween-purple rounded-lg p-8 max-w-md mx-4 text-center">
        {error ? (
          // Error state
          <>
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Loading Failed
            </h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-400">
              Please refresh the page to try again, or continue without hair adjustment.
            </p>
          </>
        ) : (
          // Loading state
          <>
            <div className="relative w-16 h-16 mx-auto mb-4">
              {/* Spinning loader */}
              <div className="absolute inset-0 border-4 border-halloween-purple border-t-halloween-orange rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Preparing Hair Detection
            </h3>
            <p className="text-gray-300 mb-2">{message}</p>
            <p className="text-sm text-gray-400">
              This may take a few seconds...
            </p>
            
            {/* Progress indicator */}
            <div className="mt-4 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-halloween-purple to-halloween-orange h-full animate-pulse"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HairSegmentationLoader;
