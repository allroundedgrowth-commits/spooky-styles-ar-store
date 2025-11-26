import React from 'react';
import { FaceTrackingStatus, FaceTrackingError } from '../../types/faceTracking';

interface TrackingGuidanceProps {
  status: FaceTrackingStatus;
  error: { type: FaceTrackingError; message: string } | null;
}

/**
 * Display guidance messages for face tracking issues
 */
export const TrackingGuidance: React.FC<TrackingGuidanceProps> = ({ status, error }) => {
  // Don't show anything if tracking is working fine
  if (status === FaceTrackingStatus.TRACKING && !error) {
    return null;
  }

  const getGuidanceContent = () => {
    // Handle errors first
    if (error) {
      switch (error.type) {
        case FaceTrackingError.CAMERA_ACCESS_DENIED:
          return {
            icon: '🚫',
            title: 'Camera Access Denied',
            message: error.message,
            color: 'bg-red-900/90',
          };
        
        case FaceTrackingError.CAMERA_NOT_FOUND:
          return {
            icon: '📷',
            title: 'No Camera Found',
            message: error.message,
            color: 'bg-red-900/90',
          };
        
        case FaceTrackingError.MODEL_LOAD_FAILED:
          return {
            icon: '⚠️',
            title: 'Loading Failed',
            message: error.message,
            color: 'bg-red-900/90',
          };
        
        case FaceTrackingError.INSUFFICIENT_LIGHTING:
          return {
            icon: '💡',
            title: 'Poor Lighting',
            message: 'Please move to a brighter area for better tracking.',
            color: 'bg-yellow-900/90',
          };
        
        case FaceTrackingError.NO_FACE_DETECTED:
          return {
            icon: '👤',
            title: 'Face Not Detected',
            message: 'Position your face in the camera view.',
            color: 'bg-orange-900/90',
          };
        
        default:
          return {
            icon: '⚠️',
            title: 'Tracking Issue',
            message: error.message,
            color: 'bg-red-900/90',
          };
      }
    }

    // Handle status-based guidance
    switch (status) {
      case FaceTrackingStatus.INITIALIZING:
        return {
          icon: '⏳',
          title: 'Initializing',
          message: 'Loading face tracking model...',
          color: 'bg-purple-900/90',
        };
      
      case FaceTrackingStatus.LOST:
        return {
          icon: '🔍',
          title: 'Tracking Lost',
          message: 'Please position your face in the camera view.',
          color: 'bg-orange-900/90',
        };
      
      case FaceTrackingStatus.ERROR:
        return {
          icon: '❌',
          title: 'Error',
          message: 'Face tracking encountered an error.',
          color: 'bg-red-900/90',
        };
      
      default:
        return null;
    }
  };

  const content = getGuidanceContent();
  
  if (!content) {
    return null;
  }

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 max-w-md w-full px-4">
      <div className={`${content.color} backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/10 animate-fade-in`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{content.icon}</span>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">
              {content.title}
            </h3>
            <p className="text-white/90 text-sm">
              {content.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
