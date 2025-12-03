/**
 * MediaPipe Face Mesh Integration
 * Provides 468 facial landmarks for precise wig positioning
 * Snapchat-style AR tracking
 */

import { FaceMesh, Results } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

export interface FaceLandmarks {
  // Key landmarks for wig positioning
  foreheadTop: { x: number; y: number; z: number };
  foreheadLeft: { x: number; y: number; z: number };
  foreheadRight: { x: number; y: number; z: number };
  leftTemple: { x: number; y: number; z: number };
  rightTemple: { x: number; y: number; z: number };
  hairlineCenter: { x: number; y: number; z: number };
  
  // Head pose
  pitch: number;  // Up/down rotation
  yaw: number;    // Left/right rotation
  roll: number;   // Tilt rotation
  
  // Dimensions
  headWidth: number;
  headHeight: number;
  
  // All 468 landmarks
  allLandmarks: Array<{ x: number; y: number; z: number }>;
  
  // Confidence
  confidence: number;
}

export class MediaPipeFaceMeshTracker {
  private faceMesh: FaceMesh | null = null;
  private camera: Camera | null = null;
  private isInitialized: boolean = false;
  private lastLandmarks: FaceLandmarks | null = null;
  private onResultsCallback: ((landmarks: FaceLandmarks) => void) | null = null;

  constructor() {}

  /**
   * Initialize MediaPipe Face Mesh
   */
  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    try {
      // Create Face Mesh instance
      this.faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      // Configure Face Mesh
      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Set up results callback
      this.faceMesh.onResults((results: Results) => {
        this.processResults(results);
      });

      // Set up camera
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.faceMesh) {
            await this.faceMesh.send({ image: videoElement });
          }
        },
        width: 1280,
        height: 720,
      });

      this.isInitialized = true;
      console.log('✅ MediaPipe Face Mesh initialized');
    } catch (error) {
      console.error('❌ Failed to initialize MediaPipe Face Mesh:', error);
      throw error;
    }
  }

  /**
   * Start tracking
   */
  async start(): Promise<void> {
    if (!this.camera) {
      throw new Error('Camera not initialized');
    }
    await this.camera.start();
    console.log('▶️ Face tracking started');
  }

  /**
   * Stop tracking
   */
  stop(): void {
    if (this.camera) {
      this.camera.stop();
      console.log('⏹️ Face tracking stopped');
    }
  }

  /**
   * Set callback for landmarks updates
   */
  onLandmarks(callback: (landmarks: FaceLandmarks) => void): void {
    this.onResultsCallback = callback;
  }

  /**
   * Get last detected landmarks
   */
  getLastLandmarks(): FaceLandmarks | null {
    return this.lastLandmarks;
  }

  /**
   * Process MediaPipe results
   */
  private processResults(results: Results): void {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    
    // Extract key landmarks for wig positioning
    // MediaPipe Face Mesh landmark indices:
    // 10: Forehead center top
    // 234: Left temple
    // 454: Right temple
    // 338: Left hairline
    // 109: Right hairline
    
    const faceLandmarks: FaceLandmarks = {
      foreheadTop: landmarks[10],
      foreheadLeft: landmarks[338],
      foreheadRight: landmarks[109],
      leftTemple: landmarks[234],
      rightTemple: landmarks[454],
      hairlineCenter: landmarks[10],
      
      // Calculate head pose
      pitch: this.calculatePitch(landmarks),
      yaw: this.calculateYaw(landmarks),
      roll: this.calculateRoll(landmarks),
      
      // Calculate dimensions
      headWidth: Math.abs(landmarks[454].x - landmarks[234].x),
      headHeight: Math.abs(landmarks[10].y - landmarks[152].y), // 152: chin
      
      // Store all landmarks
      allLandmarks: landmarks,
      
      // Confidence (MediaPipe doesn't provide per-face confidence, use 0.9 as default)
      confidence: 0.9,
    };

    this.lastLandmarks = faceLandmarks;

    // Call callback if set
    if (this.onResultsCallback) {
      this.onResultsCallback(faceLandmarks);
    }
  }

  /**
   * Calculate pitch (up/down rotation)
   */
  private calculatePitch(landmarks: any[]): number {
    const noseTip = landmarks[1];
    const foreheadCenter = landmarks[10];
    const chinBottom = landmarks[152];
    
    const faceHeight = Math.abs(foreheadCenter.y - chinBottom.y);
    const noseOffset = noseTip.y - (foreheadCenter.y + chinBottom.y) / 2;
    
    return (noseOffset / faceHeight) * 45; // Convert to degrees
  }

  /**
   * Calculate yaw (left/right rotation)
   */
  private calculateYaw(landmarks: any[]): number {
    const noseTip = landmarks[1];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];
    
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
    const noseOffset = noseTip.x - (leftCheek.x + rightCheek.x) / 2;
    
    return (noseOffset / faceWidth) * 45; // Convert to degrees
  }

  /**
   * Calculate roll (tilt rotation)
   */
  private calculateRoll(landmarks: any[]): number {
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    
    const deltaY = rightEye.y - leftEye.y;
    const deltaX = rightEye.x - leftEye.x;
    
    return Math.atan2(deltaY, deltaX); // Returns radians
  }

  /**
   * Check if tracker is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.stop();
    this.faceMesh?.close();
    this.faceMesh = null;
    this.camera = null;
    this.isInitialized = false;
    console.log('🗑️ MediaPipe Face Mesh disposed');
  }
}
