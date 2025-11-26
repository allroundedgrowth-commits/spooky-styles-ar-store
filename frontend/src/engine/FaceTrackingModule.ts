import * as tf from '@tensorflow/tfjs';
import * as faceMesh from '@mediapipe/face_mesh';
import {
  FaceLandmarks,
  HeadPose,
  LightingData,
  FaceTrackingStatus,
  FaceTrackingError,
} from '../types/faceTracking';
import { AdaptiveLighting, LightSource } from './AdaptiveLighting';

/**
 * Face Tracking Module
 * Handles face detection, landmark tracking, head pose estimation, and lighting detection
 * using MediaPipe Face Mesh and TensorFlow.js
 */
export class FaceTrackingModule {
  private faceMesh: faceMesh.FaceMesh | null = null;
  private videoElement: HTMLVideoElement;
  private stream: MediaStream | null = null;
  private isTracking = false;
  private status: FaceTrackingStatus = FaceTrackingStatus.NOT_STARTED;
  
  // Current tracking data
  private currentLandmarks: FaceLandmarks | null = null;
  private currentHeadPose: HeadPose | null = null;
  private currentLighting: LightingData | null = null;
  private currentLightSource: LightSource | null = null;
  
  // Adaptive lighting manager
  private adaptiveLighting: AdaptiveLighting | null = null;
  
  // Callbacks
  private onLandmarksCallback?: (landmarks: FaceLandmarks) => void;
  private onHeadPoseCallback?: (pose: HeadPose) => void;
  private onLightingCallback?: (lighting: LightingData) => void;
  private onLightSourceCallback?: (lightSource: LightSource) => void;
  private onStatusChangeCallback?: (status: FaceTrackingStatus) => void;
  private onErrorCallback?: (error: FaceTrackingError, message: string) => void;
  
  // Tracking loss detection
  private lastDetectionTime = 0;
  private trackingLostThreshold = 2000; // 2 seconds
  private trackingLostCheckInterval: number | null = null;
  
  // Lighting detection
  private lightingCheckInterval: number | null = null;
  private lightingThreshold = 0.3; // Minimum brightness (0-1)
  
  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.adaptiveLighting = new AdaptiveLighting(videoElement);
  }

  /**
   * Initialize MediaPipe Face Mesh model with TensorFlow.js
   */
  public async initialize(): Promise<void> {
    try {
      this.setStatus(FaceTrackingStatus.INITIALIZING);
      
      // Ensure TensorFlow.js is ready
      await tf.ready();
      console.log('TensorFlow.js backend:', tf.getBackend());
      
      // Initialize MediaPipe Face Mesh
      this.faceMesh = new faceMesh.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });
      
      // Configure Face Mesh options
      this.faceMesh.setOptions({
        maxNumFaces: 1, // Track single face for performance
        refineLandmarks: true, // Enable refined landmarks around eyes and lips
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      
      // Set up results callback
      this.faceMesh.onResults(this.onFaceMeshResults);
      
      console.log('Face Mesh model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Face Mesh:', error);
      this.setStatus(FaceTrackingStatus.ERROR);
      this.triggerError(
        FaceTrackingError.MODEL_LOAD_FAILED,
        'Failed to load face tracking model'
      );
      throw error;
    }
  }

  /**
   * Start video stream from device camera with permission handling
   */
  public async startCamera(): Promise<void> {
    try {
      // Request camera permissions
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user', // Front-facing camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve();
        };
      });
      
      console.log('Camera started successfully');
    } catch (error) {
      console.error('Failed to start camera:', error);
      this.setStatus(FaceTrackingStatus.ERROR);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          this.triggerError(
            FaceTrackingError.CAMERA_ACCESS_DENIED,
            'Camera access denied. Please grant camera permissions.'
          );
        } else if (error.name === 'NotFoundError') {
          this.triggerError(
            FaceTrackingError.CAMERA_NOT_FOUND,
            'No camera found on this device.'
          );
        }
      }
      
      throw error;
    }
  }

  /**
   * Start real-time face tracking
   */
  public async startTracking(): Promise<void> {
    if (!this.faceMesh) {
      throw new Error('Face Mesh not initialized. Call initialize() first.');
    }
    
    if (!this.stream) {
      throw new Error('Camera not started. Call startCamera() first.');
    }
    
    if (this.isTracking) {
      console.warn('Face tracking already started');
      return;
    }
    
    this.isTracking = true;
    this.lastDetectionTime = Date.now();
    this.setStatus(FaceTrackingStatus.TRACKING);
    
    // Start processing video frames
    this.processVideoFrame();
    
    // Start tracking loss detection
    this.startTrackingLossDetection();
    
    // Start lighting detection
    this.startLightingDetection();
    
    console.log('Face tracking started');
  }

  /**
   * Process video frame for face detection
   */
  private async processVideoFrame(): Promise<void> {
    if (!this.isTracking || !this.faceMesh) return;
    
    try {
      // Send frame to Face Mesh for processing
      await this.faceMesh.send({ image: this.videoElement });
    } catch (error) {
      console.error('Error processing video frame:', error);
    }
    
    // Continue processing next frame
    if (this.isTracking) {
      requestAnimationFrame(() => this.processVideoFrame());
    }
  }

  /**
   * Handle Face Mesh results
   */
  private onFaceMeshResults = (results: faceMesh.Results): void => {
    if (!this.isTracking) return;
    
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      // Face detected
      this.lastDetectionTime = Date.now();
      
      if (this.status === FaceTrackingStatus.LOST) {
        this.setStatus(FaceTrackingStatus.TRACKING);
      }
      
      // Extract landmarks (468 points)
      const landmarks = results.multiFaceLandmarks[0];
      const faceLandmarks: FaceLandmarks = {
        points: landmarks.map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z || 0,
        })),
        confidence: 0.9, // MediaPipe doesn't provide per-frame confidence, use high value
      };
      
      this.currentLandmarks = faceLandmarks;
      
      // Calculate head pose
      const headPose = this.calculateHeadPose(faceLandmarks);
      this.currentHeadPose = headPose;
      
      // Trigger callbacks
      if (this.onLandmarksCallback) {
        this.onLandmarksCallback(faceLandmarks);
      }
      
      if (this.onHeadPoseCallback) {
        this.onHeadPoseCallback(headPose);
      }
    } else {
      // No face detected in this frame
      // Don't immediately mark as lost, wait for threshold
    }
  };

  /**
   * Calculate head pose (rotation and translation) from landmarks
   */
  private calculateHeadPose(landmarks: FaceLandmarks): HeadPose {
    const points = landmarks.points;
    
    // Use key facial landmarks for pose estimation
    // Nose tip: index 1
    // Left eye: index 33
    // Right eye: index 263
    // Left mouth corner: index 61
    // Right mouth corner: index 291
    
    const noseTip = points[1];
    const leftEye = points[33];
    const rightEye = points[263];
    const leftMouth = points[61];
    const rightMouth = points[291];
    
    // Calculate rotation (simplified estimation)
    // Yaw (left/right rotation)
    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const yaw = (noseTip.x - eyeMidX) * 180; // Convert to degrees
    
    // Pitch (up/down rotation)
    const eyeMidY = (leftEye.y + rightEye.y) / 2;
    const mouthMidY = (leftMouth.y + rightMouth.y) / 2;
    const faceHeight = mouthMidY - eyeMidY;
    const pitch = ((noseTip.y - eyeMidY) / faceHeight - 0.5) * 90;
    
    // Roll (tilt rotation)
    const eyeDeltaY = rightEye.y - leftEye.y;
    const eyeDeltaX = rightEye.x - leftEye.x;
    const roll = Math.atan2(eyeDeltaY, eyeDeltaX) * (180 / Math.PI);
    
    // Calculate translation (normalized coordinates)
    const translation = {
      x: noseTip.x - 0.5, // Center at 0
      y: noseTip.y - 0.5,
      z: noseTip.z,
    };
    
    return {
      rotation: {
        x: pitch,
        y: yaw,
        z: roll,
      },
      translation,
    };
  }

  /**
   * Start monitoring for tracking loss
   */
  private startTrackingLossDetection(): void {
    this.trackingLostCheckInterval = window.setInterval(() => {
      const timeSinceLastDetection = Date.now() - this.lastDetectionTime;
      
      if (timeSinceLastDetection > this.trackingLostThreshold) {
        if (this.status === FaceTrackingStatus.TRACKING) {
          this.setStatus(FaceTrackingStatus.LOST);
          this.triggerError(
            FaceTrackingError.NO_FACE_DETECTED,
            'Face tracking lost. Please position your face in the camera view.'
          );
        }
      }
    }, 500); // Check every 500ms
  }

  /**
   * Start detecting ambient lighting conditions
   */
  private startLightingDetection(): void {
    this.lightingCheckInterval = window.setInterval(() => {
      const lighting = this.detectLightingConditions();
      this.currentLighting = lighting;
      
      if (this.onLightingCallback) {
        this.onLightingCallback(lighting);
      }
      
      // Detect light source direction
      if (this.adaptiveLighting) {
        const lightSource = this.adaptiveLighting.detectLightSource();
        this.currentLightSource = lightSource;
        
        if (this.onLightSourceCallback) {
          this.onLightSourceCallback(lightSource);
        }
      }
      
      // Warn if lighting is insufficient
      if (!lighting.isAdequate) {
        this.triggerError(
          FaceTrackingError.INSUFFICIENT_LIGHTING,
          'Lighting conditions are poor. Please move to a brighter area.'
        );
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Detect ambient lighting conditions from video stream
   */
  public detectLightingConditions(): LightingData {
    if (this.adaptiveLighting) {
      return this.adaptiveLighting.analyzeLighting(this.lightingThreshold);
    }
    
    // Fallback if adaptive lighting not available
    return {
      brightness: 0.5,
      isAdequate: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Get current light source information
   */
  public getLightSource(): LightSource | null {
    return this.currentLightSource;
  }

  /**
   * Stop face tracking
   */
  public stopTracking(): void {
    this.isTracking = false;
    
    // Clear intervals
    if (this.trackingLostCheckInterval !== null) {
      clearInterval(this.trackingLostCheckInterval);
      this.trackingLostCheckInterval = null;
    }
    
    if (this.lightingCheckInterval !== null) {
      clearInterval(this.lightingCheckInterval);
      this.lightingCheckInterval = null;
    }
    
    // Stop camera stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    
    this.setStatus(FaceTrackingStatus.NOT_STARTED);
    console.log('Face tracking stopped');
  }

  /**
   * Get current face landmarks
   */
  public getFaceLandmarks(): FaceLandmarks | null {
    return this.currentLandmarks;
  }

  /**
   * Get current head pose
   */
  public getHeadPose(): HeadPose | null {
    return this.currentHeadPose;
  }

  /**
   * Get current lighting data
   */
  public getLightingData(): LightingData | null {
    return this.currentLighting;
  }

  /**
   * Get current tracking status
   */
  public getStatus(): FaceTrackingStatus {
    return this.status;
  }

  /**
   * Set tracking status and notify listeners
   */
  private setStatus(status: FaceTrackingStatus): void {
    if (this.status !== status) {
      this.status = status;
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback(status);
      }
    }
  }

  /**
   * Trigger error callback
   */
  private triggerError(error: FaceTrackingError, message: string): void {
    if (this.onErrorCallback) {
      this.onErrorCallback(error, message);
    }
  }

  /**
   * Register callback for landmarks updates
   */
  public onLandmarks(callback: (landmarks: FaceLandmarks) => void): void {
    this.onLandmarksCallback = callback;
  }

  /**
   * Register callback for head pose updates
   */
  public onHeadPose(callback: (pose: HeadPose) => void): void {
    this.onHeadPoseCallback = callback;
  }

  /**
   * Register callback for lighting updates
   */
  public onLighting(callback: (lighting: LightingData) => void): void {
    this.onLightingCallback = callback;
  }

  /**
   * Register callback for light source updates
   */
  public onLightSource(callback: (lightSource: LightSource) => void): void {
    this.onLightSourceCallback = callback;
  }

  /**
   * Register callback for status changes
   */
  public onStatusChange(callback: (status: FaceTrackingStatus) => void): void {
    this.onStatusChangeCallback = callback;
  }

  /**
   * Register callback for errors
   */
  public onError(callback: (error: FaceTrackingError, message: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set lighting threshold
   */
  public setLightingThreshold(threshold: number): void {
    this.lightingThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Set tracking lost threshold (milliseconds)
   */
  public setTrackingLostThreshold(threshold: number): void {
    this.trackingLostThreshold = Math.max(1000, threshold);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopTracking();
    
    if (this.faceMesh) {
      this.faceMesh.close();
      this.faceMesh = null;
    }
    
    if (this.adaptiveLighting) {
      this.adaptiveLighting.cleanup();
      this.adaptiveLighting = null;
    }
    
    // Clear callbacks
    this.onLandmarksCallback = undefined;
    this.onHeadPoseCallback = undefined;
    this.onLightingCallback = undefined;
    this.onLightSourceCallback = undefined;
    this.onStatusChangeCallback = undefined;
    this.onErrorCallback = undefined;
    
    console.log('Face tracking module cleaned up');
  }
}
