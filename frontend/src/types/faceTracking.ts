/**
 * Face Tracking Type Definitions
 */

/**
 * Individual 3D landmark point
 */
export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

/**
 * Face landmarks data with 468 points from MediaPipe Face Mesh
 */
export interface FaceLandmarks {
  points: LandmarkPoint[];
  confidence: number;
}

/**
 * Head pose information (rotation and translation)
 */
export interface HeadPose {
  rotation: {
    x: number; // Pitch (up/down)
    y: number; // Yaw (left/right)
    z: number; // Roll (tilt)
  };
  translation: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Lighting conditions detected from video stream
 */
export interface LightingData {
  brightness: number; // 0-1 scale
  isAdequate: boolean;
  timestamp: number;
}

/**
 * Face tracking status
 */
export enum FaceTrackingStatus {
  NOT_STARTED = 'NOT_STARTED',
  INITIALIZING = 'INITIALIZING',
  TRACKING = 'TRACKING',
  LOST = 'LOST',
  ERROR = 'ERROR',
}

/**
 * Face tracking error types
 */
export enum FaceTrackingError {
  CAMERA_ACCESS_DENIED = 'CAMERA_ACCESS_DENIED',
  CAMERA_NOT_FOUND = 'CAMERA_NOT_FOUND',
  MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
  INSUFFICIENT_LIGHTING = 'INSUFFICIENT_LIGHTING',
  NO_FACE_DETECTED = 'NO_FACE_DETECTED',
}
