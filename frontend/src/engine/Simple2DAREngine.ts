/**
 * Simple 2D AR Try-On Engine
 * Uses MediaPipe Face Detection for lightweight face tracking
 * Overlays 2D images instead of 3D models
 * 
 * Extended with Smart Hair Flattening support for realistic wig try-on
 * 
 * Requirements: 1.1, 1.2, 1.3, 2.1, 4.1
 */

import { HairSegmentationModule, SegmentationResult } from './HairSegmentationModule';
import { HairVolumeDetector, VolumeMetrics, VolumeCategory } from './HairVolumeDetector';
import { HairFlatteningEngine, AdjustmentMode, FlattenedResult } from './HairFlatteningEngine';

// Re-export types for convenience
export type { AdjustmentMode, VolumeCategory };

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

export interface ProcessingError {
  type: 'SEGMENTATION_FAILED' | 'TIMEOUT' | 'LOW_CONFIDENCE' | 'MODEL_LOAD_FAILED';
  message: string;
  timestamp: number;
}

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
    this.config = {
      wigImageUrl: '',
      scale: 1.5,
      offsetY: -0.3,
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
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      // Set canvas size to match video
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasElement.height = this.videoElement.videoHeight;

      // Initialize face detection (using a simple approach)
      await this.initializeFaceDetection();

      // Initialize hair flattening if enabled
      if (this.config.enableHairFlattening) {
        await this.initializeHairFlattening();
      }

      console.log('2D AR Engine initialized', {
        hairFlattening: this.config.enableHairFlattening,
      });
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      throw error;
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
        type: 'MODEL_LOAD_FAILED',
        message: `Failed to initialize hair flattening: ${error}`,
        timestamp: Date.now(),
      };

      // Disable hair flattening
      this.config.enableHairFlattening = false;
      
      // Clean up partially initialized modules
      this.disposeHairFlattening();
    }
  }

  private async initializeFaceDetection(): Promise<void> {
    // For now, we'll use a simple face detection approach
    // In production, you'd use MediaPipe or face-api.js
    console.log('Face detection ready (using simple detection)');
    // Note: faceDetector would be initialized here in production
  }

  async loadWig(config: ARConfig): Promise<void> {
    this.config = { ...this.config, ...config };

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.wigImage = img;
        console.log('Wig image loaded:', config.wigImageUrl);
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
    const render = async () => {
      await this.renderFrame();
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
        type: 'SEGMENTATION_FAILED',
        message: `Hair processing failed: ${error}`,
        timestamp: Date.now(),
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
    // Simple face detection using video dimensions
    // In production, use MediaPipe Face Detection or face-api.js
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;

    // Assume face is centered (this is a placeholder)
    return {
      x: width * 0.3,
      y: height * 0.2,
      width: width * 0.4,
      height: height * 0.5,
      confidence: 0.9,
    };
  }

  private drawWig(face: FaceDetection): void {
    if (!this.wigImage) return;

    const { scale = 1.5, offsetY = -0.3, wigColor } = this.config;

    // Calculate wig position and size
    const wigWidth = face.width * scale;
    const wigHeight = (this.wigImage.height / this.wigImage.width) * wigWidth;
    const wigX = face.x + (face.width - wigWidth) / 2;
    const wigY = face.y + face.height * offsetY;

    // Apply color tint if specified
    if (wigColor) {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'multiply';
      this.ctx.fillStyle = wigColor;
      this.ctx.fillRect(wigX, wigY, wigWidth, wigHeight);
      this.ctx.globalCompositeOperation = 'destination-in';
      this.ctx.drawImage(this.wigImage, wigX, wigY, wigWidth, wigHeight);
      this.ctx.restore();
    } else {
      this.ctx.drawImage(this.wigImage, wigX, wigY, wigWidth, wigHeight);
    }
  }

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
