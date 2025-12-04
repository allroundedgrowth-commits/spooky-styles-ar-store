/**
 * Simple 2D AR Try-On Engine
 * Uses MediaPipe Face Mesh for precise face tracking with 468 landmarks
 * Overlays 2D images instead of 3D models
 * 
 * Extended with Smart Hair Flattening support for realistic wig try-on
 * 
 * Requirements: 1.1, 1.2, 1.3, 2.1, 4.1
 */

import { HairSegmentationModule, SegmentationResult } from './HairSegmentationModule';
import { HairVolumeDetector, VolumeMetrics, VolumeCategory } from './HairVolumeDetector';
import { HairFlatteningEngine, AdjustmentMode, FlattenedResult } from './HairFlatteningEngine';
import { MediaPipeFaceMeshTracker, FaceLandmarks } from './MediaPipeFaceMesh';
import { ProcessingError as SegmentationProcessingError, SegmentationErrorType } from './SegmentationErrorHandler';
import { WigAnalyzer, WigAnalysis } from './WigAnalyzer';

// Re-export for convenience
export { AdjustmentMode };
export type { VolumeCategory };

export interface FaceDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface ARConfig {
  wigImageUrl: string;
  wigColor?: string;
  scale?: number;
  offsetY?: number;
  offsetX?: number;
  opacity?: number;
  enableHairFlattening?: boolean; // Optional hair flattening feature
}

/**
 * Hair processing state for the AR engine
 */
export interface HairProcessingState {
  isInitialized: boolean;
  isProcessing: boolean;
  currentMode: AdjustmentMode;
  segmentationData: HairSegmentationData | null;
  flattenedResult: FlattenedResult | null;
  error: ProcessingError | null;
  performanceMetrics: PerformanceMetrics;
}

export interface HairSegmentationData {
  mask: ImageData;
  confidence: number;
  volumeScore: number;
  volumeCategory: VolumeCategory;
  boundingBox: { x: number; y: number; width: number; height: number };
  timestamp: number;
}

export type ProcessingError = SegmentationProcessingError;

export interface PerformanceMetrics {
  segmentationFPS: number;
  overallFPS: number;
  lastSegmentationTime: number;
  lastFlatteningTime: number;
  memoryUsage: number;
}

export class Simple2DAREngine {
  private videoElement: HTMLVideoElement;
  private canvasElement: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private wigImage: HTMLImageElement | null = null;
  private userImage: HTMLImageElement | null = null;
  private config: ARConfig;
  private useStaticImage: boolean = false;

  // MediaPipe Face Mesh tracker
  private faceMeshTracker: MediaPipeFaceMeshTracker | null = null;
  private currentLandmarks: FaceLandmarks | null = null;
  private useMediaPipe: boolean = true; // Toggle for MediaPipe vs fallback

  // Smooth interpolation for natural tracking
  private smoothedLandmarks: FaceLandmarks | null = null;
  private readonly SMOOTHING_FACTOR = 0.3; // Lower = smoother but more lag, Higher = more responsive but jittery

  // Wig analyzer for intelligent fitting
  private wigAnalyzer: WigAnalyzer;
  private wigAnalysis: WigAnalysis | null = null;

  // Hair flattening modules (optional)
  private hairSegmentation: HairSegmentationModule | null = null;
  private hairVolumeDetector: HairVolumeDetector | null = null;
  private flatteningEngine: HairFlatteningEngine | null = null;
  private hairProcessingState: HairProcessingState;
  
  // Performance tracking
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;
  private lastSegmentationTime: number = 0;

  constructor(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.ctx = canvasElement.getContext('2d')!;
    this.wigAnalyzer = new WigAnalyzer();
    this.config = {
      wigImageUrl: '',
      scale: 1.3,        // Will be overridden by wig analysis
      offsetY: -0.05,    // Will be overridden by wig analysis
      offsetX: 0,
      opacity: 0.9,      // High opacity for realistic appearance
      enableHairFlattening: false,
    };

    // Initialize hair processing state
    this.hairProcessingState = {
      isInitialized: false,
      isProcessing: false,
      currentMode: AdjustmentMode.NORMAL,
      segmentationData: null,
      flattenedResult: null,
      error: null,
      performanceMetrics: {
        segmentationFPS: 0,
        overallFPS: 0,
        lastSegmentationTime: 0,
        lastFlatteningTime: 0,
        memoryUsage: 0,
      },
    };
  }

  async initialize(): Promise<void> {
    try {
      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Mobile-friendly camera constraints with fallbacks
      const constraints: MediaStreamConstraints = {
        video: isMobile ? {
          // Mobile: simpler constraints for better compatibility
          facingMode: 'user',
          width: { ideal: 720, max: 1280 },
          height: { ideal: 1280, max: 1920 },
        } : {
          // Desktop: more specific constraints
          width: { ideal: 720 },
          height: { ideal: 1280 },
          facingMode: 'user',
          aspectRatio: { ideal: 9/16 },
        },
        audio: false,
      };

      try {
        // Try with ideal constraints first
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.warn('Failed with ideal constraints, trying basic constraints:', error);
        
        // Fallback to minimal constraints for maximum compatibility
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
          },
          audio: false,
        });
      }

      this.videoElement.srcObject = this.stream;
      
      // Add playsinline attribute for iOS
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.setAttribute('webkit-playsinline', 'true');
      
      await this.videoElement.play();

      // Set canvas size to match video with portrait orientation
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasElement.height = this.videoElement.videoHeight;

      // Initialize MediaPipe Face Mesh for precise tracking
      await this.initializeFaceDetection();

      // Initialize hair flattening if enabled
      if (this.config.enableHairFlattening) {
        await this.initializeHairFlattening();
      }

      console.log('2D AR Engine initialized', {
        faceTracking: this.useMediaPipe ? 'MediaPipe Face Mesh' : 'Fallback',
        hairFlattening: this.config.enableHairFlattening,
        videoSize: `${this.canvasElement.width}x${this.canvasElement.height}`,
        isMobile,
      });
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      
      // Provide helpful error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        throw new Error('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
        throw new Error('No camera found. Please ensure your device has a camera.');
      } else if (errorMessage.includes('NotReadableError')) {
        throw new Error('Camera is already in use by another application.');
      } else if (errorMessage.includes('NotSupportedError') || errorMessage.includes('https')) {
        throw new Error('Camera access requires HTTPS. Please use a secure connection.');
      } else {
        throw new Error(`Failed to access camera: ${errorMessage}`);
      }
    }
  }

  /**
   * Initialize hair flattening modules
   * Implements initialization flow: segmentation → volume detection → flattening
   * 
   * Requirements: 1.1, 1.2, 1.3, 2.1
   */
  private async initializeHairFlattening(): Promise<void> {
    try {
      console.log('Initializing hair flattening modules...');

      // Initialize segmentation module
      this.hairSegmentation = new HairSegmentationModule();
      await this.hairSegmentation.initialize();

      // Initialize volume detector
      this.hairVolumeDetector = new HairVolumeDetector();

      // Initialize flattening engine
      this.flatteningEngine = new HairFlatteningEngine();
      this.flatteningEngine.initialize(
        this.canvasElement.width,
        this.canvasElement.height,
        true // Enable WebGL acceleration
      );

      this.hairProcessingState.isInitialized = true;
      console.log('Hair flattening modules initialized successfully');
    } catch (error) {
      console.error('Failed to initialize hair flattening:', error);
      
      // Set error state but don't fail the entire initialization
      this.hairProcessingState.error = {
        type: SegmentationErrorType.MODEL_LOAD_FAILED,
        message: `Failed to initialize hair flattening: ${error}`,
        timestamp: Date.now(),
        retryable: false,
      };

      // Disable hair flattening
      this.config.enableHairFlattening = false;
      
      // Clean up partially initialized modules
      this.disposeHairFlattening();
    }
  }

  private async initializeFaceDetection(): Promise<void> {
    try {
      // Initialize MediaPipe Face Mesh for precise landmark tracking
      this.faceMeshTracker = new MediaPipeFaceMeshTracker();
      await this.faceMeshTracker.initialize(this.videoElement);
      
      // Set up landmarks callback with smooth interpolation
      this.faceMeshTracker.onLandmarks((landmarks: FaceLandmarks) => {
        this.currentLandmarks = landmarks;
        // Apply smooth interpolation for natural tracking
        this.smoothedLandmarks = this.interpolateLandmarks(landmarks);
      });
      
      // Start tracking
      await this.faceMeshTracker.start();
      
      this.useMediaPipe = true;
      console.log('✅ MediaPipe Face Mesh initialized for 2D AR');
    } catch (error) {
      console.warn('⚠️ MediaPipe initialization failed, using fallback detection:', error);
      this.useMediaPipe = false;
      this.faceMeshTracker = null;
    }
  }

  async loadWig(config: ARConfig): Promise<void> {
    this.config = { ...this.config, ...config };

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        this.wigImage = img;
        console.log('Wig image loaded:', config.wigImageUrl);
        
        // Analyze wig to detect hairline and optimal positioning
        try {
          this.wigAnalysis = await this.wigAnalyzer.analyzeWig(img);
          console.log('Wig analysis complete:', {
            hairlineY: `${(this.wigAnalysis.hairlineY * 100).toFixed(1)}%`,
            confidence: `${(this.wigAnalysis.hairlineConfidence * 100).toFixed(0)}%`,
            recommendedScale: this.wigAnalysis.recommendedScale,
            recommendedOffsetY: this.wigAnalysis.recommendedOffsetY,
            hasTransparency: this.wigAnalysis.hasTransparency,
          });
          
          // Apply recommended positioning if not explicitly overridden
          if (!config.scale) {
            this.config.scale = this.wigAnalysis.recommendedScale;
          }
          if (!config.offsetY) {
            this.config.offsetY = this.wigAnalysis.recommendedOffsetY;
          }
          
          console.log('Using positioning:', {
            scale: this.config.scale,
            offsetY: this.config.offsetY,
          });
        } catch (error) {
          console.warn('Wig analysis failed, using defaults:', error);
        }
        
        resolve();
      };

      img.onerror = (error) => {
        console.error('Failed to load wig image:', error);
        reject(error);
      };

      img.src = config.wigImageUrl;
    });
  }

  startRendering(): void {
    console.log('🎬 [Simple2DAREngine] Starting rendering loop...');
    let frameCount = 0;
    
    const render = async () => {
      await this.renderFrame();
      
      // Log first few frames for debugging
      if (frameCount < 5) {
        console.log(`🎞️ [Simple2DAREngine] Frame ${frameCount} rendered`);
      }
      frameCount++;
      
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private async renderFrame(): Promise<void> {
    if (!this.ctx) return;

    // Update FPS tracking
    this.updateFPS();

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Get current frame as ImageData
    let currentFrame: ImageData;
    
    // Draw either static image or video frame
    if (this.useStaticImage && this.userImage) {
      this.ctx.drawImage(
        this.userImage,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
    } else if (this.videoElement) {
      this.ctx.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
    }

    // Get current frame data for hair processing
    currentFrame = this.ctx.getImageData(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    // Process hair flattening if enabled
    if (this.config.enableHairFlattening && this.hairProcessingState.isInitialized) {
      currentFrame = await this.processHairFlattening(currentFrame);
      
      // Draw processed frame back to canvas
      this.ctx.putImageData(currentFrame, 0, 0);
    }

    // Detect face and draw wig
    const face = this.detectFace();
    if (face && this.wigImage) {
      this.drawWig(face);
    }
  }

  /**
   * Process hair flattening on the current frame
   * Implements flow: segmentation → volume detection → flattening → wig rendering
   * 
   * Requirements: 1.1, 1.2, 1.3, 2.1
   */
  private async processHairFlattening(frame: ImageData): Promise<ImageData> {
    // Skip if already processing or modules not ready
    if (
      this.hairProcessingState.isProcessing ||
      !this.hairSegmentation ||
      !this.hairVolumeDetector ||
      !this.flatteningEngine
    ) {
      return frame;
    }

    // Throttle segmentation to maintain performance (15+ FPS requirement)
    const now = Date.now();
    const timeSinceLastSegmentation = now - this.lastSegmentationTime;
    const minSegmentationInterval = 1000 / 15; // 15 FPS = ~67ms

    if (timeSinceLastSegmentation < minSegmentationInterval) {
      // Use cached flattened result if available
      if (this.hairProcessingState.flattenedResult) {
        return this.hairProcessingState.flattenedResult.flattenedImage;
      }
      return frame;
    }

    try {
      this.hairProcessingState.isProcessing = true;
      this.lastSegmentationTime = now;

      // Step 1: Segment hair
      const segmentationStart = performance.now();
      const segmentationResult: SegmentationResult = await this.hairSegmentation.segmentHair(frame);
      const segmentationTime = performance.now() - segmentationStart;

      // Step 2: Calculate volume
      const face = this.detectFace();
      const faceRegion = {
        x: face?.x || 0,
        y: face?.y || 0,
        width: face?.width || frame.width,
        height: face?.height || frame.height,
      };

      const volumeMetrics: VolumeMetrics = this.hairVolumeDetector.calculateVolume(
        segmentationResult.hairMask,
        faceRegion
      );

      // Step 3: Auto-apply flattening if volume score > 40
      if (
        this.hairVolumeDetector.shouldAutoFlatten(volumeMetrics.score) &&
        this.hairProcessingState.currentMode === AdjustmentMode.NORMAL
      ) {
        // Auto-switch to flattened mode
        this.flatteningEngine.setMode(AdjustmentMode.FLATTENED);
        this.hairProcessingState.currentMode = AdjustmentMode.FLATTENED;
        console.log(`Auto-flattening applied (volume score: ${volumeMetrics.score})`);
      }

      // Step 4: Apply flattening based on current mode
      const flatteningStart = performance.now();
      const flattenedResult: FlattenedResult = await this.flatteningEngine.applyFlattening(
        frame,
        segmentationResult.hairMask,
        faceRegion
      );
      const flatteningTime = performance.now() - flatteningStart;

      // Update state
      this.hairProcessingState.segmentationData = {
        mask: segmentationResult.hairMask,
        confidence: segmentationResult.confidence,
        volumeScore: volumeMetrics.score,
        volumeCategory: this.hairVolumeDetector.getVolumeCategory(volumeMetrics.score),
        boundingBox: volumeMetrics.boundingBox,
        timestamp: now,
      };

      this.hairProcessingState.flattenedResult = flattenedResult;
      this.hairProcessingState.error = null;

      // Update performance metrics
      this.hairProcessingState.performanceMetrics.lastSegmentationTime = segmentationTime;
      this.hairProcessingState.performanceMetrics.lastFlatteningTime = flatteningTime;

      return flattenedResult.flattenedImage;
    } catch (error) {
      console.error('Hair processing error:', error);
      
      this.hairProcessingState.error = {
        type: SegmentationErrorType.SEGMENTATION_FAILED,
        message: `Hair processing failed: ${error}`,
        timestamp: Date.now(),
        retryable: true,
      };

      // Return original frame on error
      return frame;
    } finally {
      this.hairProcessingState.isProcessing = false;
    }
  }

  /**
   * Update FPS tracking
   */
  private updateFPS(): void {
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastFPSUpdate >= 1000) {
      this.hairProcessingState.performanceMetrics.overallFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }
  }

  private detectFace(): FaceDetection | null {
    // Use smoothed MediaPipe landmarks if available for natural tracking
    if (this.useMediaPipe && this.smoothedLandmarks) {
      return this.detectFaceFromLandmarks(this.smoothedLandmarks);
    }

    // Fallback to basic detection for static images or if MediaPipe fails
    return this.detectFaceBasic();
  }

  /**
   * Detect face using MediaPipe landmarks
   * Provides precise positioning based on 468 facial landmarks
   */
  private detectFaceFromLandmarks(landmarks: FaceLandmarks): FaceDetection {
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;

    // Convert normalized coordinates to pixel coordinates
    const foreheadTop = {
      x: landmarks.foreheadTop.x * width,
      y: landmarks.foreheadTop.y * height,
    };
    
    const leftTemple = {
      x: landmarks.leftTemple.x * width,
      y: landmarks.leftTemple.y * height,
    };
    
    const rightTemple = {
      x: landmarks.rightTemple.x * width,
      y: landmarks.rightTemple.y * height,
    };

    // Calculate face bounding box from landmarks
    // Use temples for width and extend upward for wig placement
    const faceWidth = Math.abs(rightTemple.x - leftTemple.x);
    const faceHeight = landmarks.headHeight * height;
    
    // Center X between temples
    const centerX = (leftTemple.x + rightTemple.x) / 2;
    
    // FIXED: Position wig to sit naturally on head
    // The wig should start slightly above the forehead and extend upward
    const wigHeight = faceHeight * 0.7; // Wig covers 70% of head height
    const wigY = foreheadTop.y - wigHeight * 0.15; // Start just slightly above forehead (15% overlap)
    
    return {
      x: centerX - faceWidth / 2,
      y: wigY,
      width: faceWidth,
      height: wigHeight,
      confidence: landmarks.confidence,
    };
  }

  /**
   * Basic face detection fallback
   * Uses skin tone detection or assumes centered face
   */
  private detectFaceBasic(): FaceDetection | null {
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;

    try {
      // Get current frame data
      const imageData = this.ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Simple skin tone detection to find face region
      let minX = width, maxX = 0, minY = height, maxY = 0;
      let skinPixelCount = 0;

      // Sample every 10th pixel for performance
      for (let y = 0; y < height; y += 10) {
        for (let x = 0; x < width; x += 10) {
          const i = (y * width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Simple skin tone detection (works for most skin tones)
          if (this.isSkinTone(r, g, b)) {
            skinPixelCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // If we found enough skin pixels, use detected region
      if (skinPixelCount > 50) {
        // Add padding and center the face region
        const padding = 40;
        const faceX = Math.max(0, minX - padding);
        const faceY = Math.max(0, minY - padding);
        const faceWidth = Math.min(width - faceX, maxX - minX + padding * 2);
        const faceHeight = Math.min(height - faceY, maxY - minY + padding * 2);

        return {
          x: faceX,
          y: faceY,
          width: faceWidth,
          height: faceHeight,
          confidence: 0.8,
        };
      }
    } catch (error) {
      console.warn('Face detection error:', error);
    }

    // Fallback: assume face is in upper-center portion (portrait mode)
    // This works well for selfie-style photos
    // Return HAIRLINE position (top of forehead), not full face
    // This represents where the wig should START (bottom edge of wig)
    return {
      x: width * 0.15,       // 15% from left (centered, slightly wider)
      y: height * 0.15,      // 15% from top (hairline/forehead area)
      width: width * 0.7,    // 70% of width (head width including hair)
      height: height * 0.15, // Small height - just the hairline reference point
      confidence: 0.6,
    };
  }

  /**
   * Simple skin tone detection
   * Works for a wide range of skin tones
   */
  private isSkinTone(r: number, g: number, b: number): boolean {
    // RGB skin tone detection algorithm
    // Works for most skin tones from light to dark
    const rgbSum = r + g + b;
    
    // Basic checks
    if (rgbSum === 0) return false;
    if (r < 60 || g < 40 || b < 20) return false;
    
    // Skin tone characteristics
    const rg = r - g;
    const rb = r - b;
    const gb = g - b;
    
    // Skin typically has: R > G > B
    if (r > g && g > b) {
      // Additional checks for skin tone range
      if (rg > 15 && rb > 15 && Math.abs(gb) < 15) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Interpolate landmarks for smooth, natural tracking
   * Uses exponential moving average to reduce jitter while maintaining responsiveness
   * 
   * @param newLandmarks - Latest landmarks from MediaPipe
   * @returns Smoothed landmarks
   */
  private interpolateLandmarks(newLandmarks: FaceLandmarks): FaceLandmarks {
    // First frame - no previous data to interpolate
    if (!this.smoothedLandmarks) {
      return newLandmarks;
    }

    // Apply exponential moving average (EMA) to each landmark point
    // Formula: smoothed = smoothed * (1 - alpha) + new * alpha
    // where alpha = SMOOTHING_FACTOR
    const alpha = this.SMOOTHING_FACTOR;
    const beta = 1 - alpha;

    return {
      foreheadTop: {
        x: this.smoothedLandmarks.foreheadTop.x * beta + newLandmarks.foreheadTop.x * alpha,
        y: this.smoothedLandmarks.foreheadTop.y * beta + newLandmarks.foreheadTop.y * alpha,
        z: this.smoothedLandmarks.foreheadTop.z * beta + newLandmarks.foreheadTop.z * alpha,
      },
      foreheadLeft: {
        x: this.smoothedLandmarks.foreheadLeft.x * beta + newLandmarks.foreheadLeft.x * alpha,
        y: this.smoothedLandmarks.foreheadLeft.y * beta + newLandmarks.foreheadLeft.y * alpha,
        z: this.smoothedLandmarks.foreheadLeft.z * beta + newLandmarks.foreheadLeft.z * alpha,
      },
      foreheadRight: {
        x: this.smoothedLandmarks.foreheadRight.x * beta + newLandmarks.foreheadRight.x * alpha,
        y: this.smoothedLandmarks.foreheadRight.y * beta + newLandmarks.foreheadRight.y * alpha,
        z: this.smoothedLandmarks.foreheadRight.z * beta + newLandmarks.foreheadRight.z * alpha,
      },
      leftTemple: {
        x: this.smoothedLandmarks.leftTemple.x * beta + newLandmarks.leftTemple.x * alpha,
        y: this.smoothedLandmarks.leftTemple.y * beta + newLandmarks.leftTemple.y * alpha,
        z: this.smoothedLandmarks.leftTemple.z * beta + newLandmarks.leftTemple.z * alpha,
      },
      rightTemple: {
        x: this.smoothedLandmarks.rightTemple.x * beta + newLandmarks.rightTemple.x * alpha,
        y: this.smoothedLandmarks.rightTemple.y * beta + newLandmarks.rightTemple.y * alpha,
        z: this.smoothedLandmarks.rightTemple.z * beta + newLandmarks.rightTemple.z * alpha,
      },
      hairlineCenter: {
        x: this.smoothedLandmarks.hairlineCenter.x * beta + newLandmarks.hairlineCenter.x * alpha,
        y: this.smoothedLandmarks.hairlineCenter.y * beta + newLandmarks.hairlineCenter.y * alpha,
        z: this.smoothedLandmarks.hairlineCenter.z * beta + newLandmarks.hairlineCenter.z * alpha,
      },
      pitch: this.smoothedLandmarks.pitch * beta + newLandmarks.pitch * alpha,
      yaw: this.smoothedLandmarks.yaw * beta + newLandmarks.yaw * alpha,
      roll: this.smoothedLandmarks.roll * beta + newLandmarks.roll * alpha,
      headWidth: this.smoothedLandmarks.headWidth * beta + newLandmarks.headWidth * alpha,
      headHeight: this.smoothedLandmarks.headHeight * beta + newLandmarks.headHeight * alpha,
      allLandmarks: newLandmarks.allLandmarks, // Don't smooth all landmarks array
      confidence: newLandmarks.confidence, // Don't smooth confidence
    };
  }

  private drawWig(face: FaceDetection): void {
    if (!this.wigImage) return;

    const { scale = 1.5, offsetY = -0.3, offsetX = 0, opacity = 0.85, wigColor } = this.config;

    // Use smoothed landmark-based positioning for natural tracking
    if (this.useMediaPipe && this.smoothedLandmarks) {
      this.drawWigWithLandmarks(this.smoothedLandmarks, scale, offsetX, offsetY, opacity, wigColor);
      return;
    }

    // Fallback to bounding box positioning
    this.drawWigWithBoundingBox(face, scale, offsetX, offsetY, opacity, wigColor);
  }

  /**
   * Draw wig using precise facial landmarks
   * OPTIMIZED: Fast and accurate positioning based on actual face measurements
   */
  private drawWigWithLandmarks(
    landmarks: FaceLandmarks,
    scale: number,
    offsetX: number,
    offsetY: number,
    opacity: number,
    wigColor?: string
  ): void {
    if (!this.wigImage) return;

    const width = this.canvasElement.width;
    const height = this.canvasElement.height;

    // Convert normalized landmark coordinates to pixels
    const foreheadTopPx = {
      x: landmarks.foreheadTop.x * width,
      y: landmarks.foreheadTop.y * height,
    };
    
    const leftTemplePx = {
      x: landmarks.leftTemple.x * width,
      y: landmarks.leftTemple.y * height,
    };
    
    const rightTemplePx = {
      x: landmarks.rightTemple.x * width,
      y: landmarks.rightTemple.y * height,
    };

    // Calculate actual head width from temple to temple
    const headWidthPx = Math.abs(rightTemplePx.x - leftTemplePx.x);
    
    // Calculate wig width based on head width and scale
    // Scale multiplier: 1.0 = exact head width, 1.3 = 30% wider (default)
    const wigWidth = headWidthPx * scale;
    
    // Maintain aspect ratio
    const wigHeight = (this.wigImage.height / this.wigImage.width) * wigWidth;
    
    // Position wig centered horizontally on the head
    const headCenterX = (leftTemplePx.x + rightTemplePx.x) / 2;
    const wigX = headCenterX - wigWidth / 2 + (width * offsetX);
    
    // Position wig vertically at hairline
    // The wig bottom should align with forehead top (hairline)
    // Subtract wig height so bottom edge sits at hairline
    const wigY = foreheadTopPx.y - wigHeight + (height * offsetY);

    // Save context state
    this.ctx.save();
    
    // Set transparency
    this.ctx.globalAlpha = opacity;
    
    // Draw wig on top
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Apply color tint if specified
    if (wigColor) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = wigWidth;
      tempCanvas.height = wigHeight;
      const tempCtx = tempCanvas.getContext('2d')!;
      
      tempCtx.drawImage(this.wigImage, 0, 0, wigWidth, wigHeight);
      
      tempCtx.globalCompositeOperation = 'multiply';
      tempCtx.fillStyle = wigColor;
      tempCtx.fillRect(0, 0, wigWidth, wigHeight);
      
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.drawImage(this.wigImage, 0, 0, wigWidth, wigHeight);
      
      this.ctx.drawImage(tempCanvas, wigX, wigY);
    } else {
      this.ctx.drawImage(this.wigImage, wigX, wigY, wigWidth, wigHeight);
    }
    
    // Restore context state
    this.ctx.restore();
  }

  /**
   * Draw wig using bounding box (fallback method)
   * OPTIMIZED: Uses detected face position when MediaPipe is unavailable
   */
  private drawWigWithBoundingBox(
    face: FaceDetection,
    scale: number,
    offsetX: number,
    offsetY: number,
    opacity: number,
    wigColor?: string
  ): void {
    if (!this.wigImage) return;

    const width = this.canvasElement.width;
    const height = this.canvasElement.height;

    // Use detected face width as base for wig sizing
    const faceWidth = face.width;
    
    // Calculate wig dimensions based on face width and scale
    const wigWidth = faceWidth * scale;
    const wigHeight = (this.wigImage.height / this.wigImage.width) * wigWidth;
    
    // Position wig centered on face horizontally
    const faceCenterX = face.x + face.width / 2;
    const wigX = faceCenterX - wigWidth / 2 + (width * offsetX);
    
    // Position wig at hairline (top of detected face)
    // Subtract wig height so bottom edge aligns with hairline
    const wigY = face.y - wigHeight + (height * offsetY);

    // Save context state
    this.ctx.save();
    
    // Set transparency
    this.ctx.globalAlpha = opacity;
    
    // Draw wig on top
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Apply color tint if specified
    if (wigColor) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = wigWidth;
      tempCanvas.height = wigHeight;
      const tempCtx = tempCanvas.getContext('2d')!;
      
      tempCtx.drawImage(this.wigImage, 0, 0, wigWidth, wigHeight);
      
      tempCtx.globalCompositeOperation = 'multiply';
      tempCtx.fillStyle = wigColor;
      tempCtx.fillRect(0, 0, wigWidth, wigHeight);
      
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.drawImage(this.wigImage, 0, 0, wigWidth, wigHeight);
      
      this.ctx.drawImage(tempCanvas, wigX, wigY);
    } else {
      this.ctx.drawImage(this.wigImage, wigX, wigY, wigWidth, wigHeight);
    }
    
    // Restore context state
    this.ctx.restore();
  }

  /**
   * REMOVED - Auto-scale was causing unpredictable behavior
   * Now using simple direct scaling controlled by user
   */

  updateConfig(config: Partial<ARConfig>): void {
    this.config = { ...this.config, ...config };
    
    // If enabling hair flattening and not yet initialized
    if (config.enableHairFlattening && !this.hairProcessingState.isInitialized) {
      this.initializeHairFlattening().catch(error => {
        console.error('Failed to enable hair flattening:', error);
      });
    }
    
    // If disabling hair flattening
    if (config.enableHairFlattening === false && this.hairProcessingState.isInitialized) {
      this.disposeHairFlattening();
    }
  }

  /**
   * Set the hair adjustment mode
   * Requirement: 4.1
   * 
   * @param mode - Adjustment mode to apply
   */
  setAdjustmentMode(mode: AdjustmentMode): void {
    if (!this.flatteningEngine) {
      console.warn('Hair flattening not initialized');
      return;
    }

    this.flatteningEngine.setMode(mode);
    this.hairProcessingState.currentMode = mode;
    
    // Clear cached result to force re-processing with new mode
    this.hairProcessingState.flattenedResult = null;
    
    console.log(`Adjustment mode changed to: ${mode}`);
  }

  /**
   * Get the current hair processing state
   * 
   * @returns Current hair processing state
   */
  getHairProcessingState(): HairProcessingState {
    return { ...this.hairProcessingState };
  }

  /**
   * Check if hair flattening is enabled and initialized
   * 
   * @returns true if hair flattening is ready
   */
  isHairFlatteningEnabled(): boolean {
    return this.config.enableHairFlattening === true && this.hairProcessingState.isInitialized;
  }

  /**
   * Check if MediaPipe Face Mesh is being used
   * 
   * @returns true if MediaPipe is active
   */
  isUsingMediaPipe(): boolean {
    return this.useMediaPipe && this.faceMeshTracker !== null;
  }

  /**
   * Get current face landmarks from MediaPipe
   * 
   * @returns Current landmarks or null if not available
   */
  getCurrentLandmarks(): FaceLandmarks | null {
    return this.currentLandmarks;
  }

  takeScreenshot(): string {
    return this.canvasElement.toDataURL('image/png');
  }

  stopRendering(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loadUserImage(imageFile: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.userImage = img;
          this.useStaticImage = true;
          
          // Set canvas size to match image
          this.canvasElement.width = img.width;
          this.canvasElement.height = img.height;
          
          // Stop video stream if active
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }
          
          console.log('User image loaded:', img.width, 'x', img.height);
          resolve();
        };
        
        img.onerror = (error) => {
          console.error('Failed to load user image:', error);
          reject(error);
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = (error) => {
        console.error('Failed to read image file:', error);
        reject(error);
      };
      
      reader.readAsDataURL(imageFile);
    });
  }

  switchToCamera(): void {
    this.useStaticImage = false;
    this.userImage = null;
  }

  /**
   * Dispose of hair flattening modules
   */
  private disposeHairFlattening(): void {
    if (this.hairSegmentation) {
      this.hairSegmentation.dispose();
      this.hairSegmentation = null;
    }

    if (this.flatteningEngine) {
      this.flatteningEngine.dispose();
      this.flatteningEngine = null;
    }

    this.hairVolumeDetector = null;
    
    // Reset state
    this.hairProcessingState = {
      isInitialized: false,
      isProcessing: false,
      currentMode: AdjustmentMode.NORMAL,
      segmentationData: null,
      flattenedResult: null,
      error: null,
      performanceMetrics: {
        segmentationFPS: 0,
        overallFPS: 0,
        lastSegmentationTime: 0,
        lastFlatteningTime: 0,
        memoryUsage: 0,
      },
    };
  }

  dispose(): void {
    this.stopRendering();

    // Dispose MediaPipe Face Mesh
    if (this.faceMeshTracker) {
      this.faceMeshTracker.dispose();
      this.faceMeshTracker = null;
    }
    this.currentLandmarks = null;
    this.smoothedLandmarks = null;

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.wigImage = null;
    this.userImage = null;
    
    // Dispose hair flattening modules
    this.disposeHairFlattening();
  }
}
