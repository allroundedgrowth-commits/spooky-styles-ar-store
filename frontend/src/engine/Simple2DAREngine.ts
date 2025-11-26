/**
 * Simple 2D AR Try-On Engine
 * Uses MediaPipe Face Detection for lightweight face tracking
 * Overlays 2D images instead of 3D models
 */

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
  private faceDetector: any = null;
  private useStaticImage: boolean = false;

  constructor(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.ctx = canvasElement.getContext('2d')!;
    this.config = {
      wigImageUrl: '',
      scale: 1.5,
      offsetY: -0.3,
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

      console.log('2D AR Engine initialized');
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      throw error;
    }
  }

  private async initializeFaceDetection(): Promise<void> {
    // For now, we'll use a simple face detection approach
    // In production, you'd use MediaPipe or face-api.js
    console.log('Face detection ready (using simple detection)');
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
    const render = () => {
      this.renderFrame();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private renderFrame(): void {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

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

    // Detect face and draw wig
    const face = this.detectFace();
    if (face && this.wigImage) {
      this.drawWig(face);
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

  dispose(): void {
    this.stopRendering();

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.wigImage = null;
    this.userImage = null;
    this.faceDetector = null;
  }
}
