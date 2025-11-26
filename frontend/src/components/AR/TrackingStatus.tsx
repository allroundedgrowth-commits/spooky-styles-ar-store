import React from 'react';
import { FaceTrackingStatus, FaceLandmarks, HeadPose } from '../../types/faceTracking';

interface TrackingStatusProps {
  status: FaceTrackingStatus;
  landmarks: FaceLandmarks | null;
  headPose: HeadPose | null;
  showDetails?: boolean;
}

/**
 * Display face tracking status and confidence information
 */
export const TrackingStatus: React.FC<TrackingStatusProps> = ({
  status,
  landmarks,
  headPose,
  showDetails = false,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case FaceTrackingStatus.TRACKING:
        return 'bg-green-500';
      case FaceTrackingStatus.INITIALIZING:
        return 'bg-yellow-500';
      case FaceTrackingStatus.LOST:
        return 'bg-orange-500';
      case FaceTrackingStatus.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case FaceTrackingStatus.TRACKING:
        return 'Tracking';
      case FaceTrackingStatus.INITIALIZING:
        return 'Initializing';
      case FaceTrackingStatus.LOST:
        return 'Lost';
      case FaceTrackingStatus.ERROR:
        return 'Error';
      default:
        return 'Not Started';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/10">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
          <span className="text-white text-sm font-medium">{getStatusText()}</span>
        </div>

        {/* Confidence Score */}
        {landmarks && status === FaceTrackingStatus.TRACKING && (
          <div className="text-white/70 text-xs">
            Confidence: {Math.round(landmarks.confidence * 100)}%
          </div>
        )}

        {/* Detailed Information */}
        {showDetails && headPose && status === FaceTrackingStatus.TRACKING && (
          <div className="mt-2 pt-2 border-t border-white/10 space-y-1 text-xs text-white/60">
            <div>Pitch: {headPose.rotation.x.toFixed(1)}°</div>
            <div>Yaw: {headPose.rotation.y.toFixed(1)}°</div>
            <div>Roll: {headPose.rotation.z.toFixed(1)}°</div>
          </div>
        )}
      </div>
    </div>
  );
};
