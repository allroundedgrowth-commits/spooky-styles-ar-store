/**
 * Wig Image Analyzer
 * Analyzes wig images to detect:
 * - Hairline position (where wig should sit on forehead)
 * - Wig dimensions and aspect ratio
 * - Transparent areas
 * - Optimal positioning parameters
 */

export interface WigAnalysis {
  hairlineY: number; // Y position of hairline as percentage (0-1)
  hairlineConfidence: number; // Confidence score (0-1)
  wigBounds: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hasTransparency: boolean;
  aspectRatio: number;
  recommendedScale: number;
  recommendedOffsetY: number;
}

export class WigAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  /**
   * Analyze wig image to detect hairline and optimal positioning
   */
  async analyzeWig(wigImage: HTMLImageElement): Promise<WigAnalysis> {
    // Set canvas size to match image
    this.canvas.width = wigImage.width;
    this.canvas.height = wigImage.height;

    // Draw image to canvas for analysis
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(wigImage, 0, 0);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    // Detect transparency
    const hasTransparency = this.detectTransparency(data);

    // Find actual wig bounds (non-transparent area)
    const wigBounds = this.findWigBounds(data, this.canvas.width, this.canvas.height);

    // Detect hairline (bottom edge of wig where it meets forehead)
    const hairlineResult = this.detectHairline(data, this.canvas.width, this.canvas.height, wigBounds);

    // Calculate optimal positioning
    const aspectRatio = this.canvas.width / this.canvas.height;
    const recommendedScale = this.calculateRecommendedScale(wigBounds, this.canvas.width, this.canvas.height);
    const recommendedOffsetY = this.calculateRecommendedOffset(hairlineResult.hairlineY, wigBounds);

    return {
      hairlineY: hairlineResult.hairlineY,
      hairlineConfidence: hairlineResult.confidence,
      wigBounds,
      hasTransparency,
      aspectRatio,
      recommendedScale,
      recommendedOffsetY,
    };
  }

  /**
   * Detect if image has transparency
   */
  private detectTransparency(data: Uint8ClampedArray): boolean {
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true;
      }
    }
    return false;
  }

  /**
   * Find the actual bounds of the wig (non-transparent area)
   */
  private findWigBounds(data: Uint8ClampedArray, width: number, height: number): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } {
    let top = height;
    let bottom = 0;
    let left = width;
    let right = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const alpha = data[i + 3];

        // If pixel is not fully transparent
        if (alpha > 10) {
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
          left = Math.min(left, x);
          right = Math.max(right, x);
        }
      }
    }

    // Normalize to 0-1 range
    return {
      top: top / height,
      bottom: bottom / height,
      left: left / width,
      right: right / width,
    };
  }

  /**
   * Detect hairline (bottom edge of wig)
   * This is where the wig should meet the forehead
   */
  private detectHairline(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    wigBounds: { top: number; bottom: number; left: number; right: number }
  ): { hairlineY: number; confidence: number } {
    // Scan from bottom up to find the hairline
    // Hairline is typically the lowest point where hair starts
    
    const startY = Math.floor(wigBounds.bottom * height);
    const endY = Math.floor(wigBounds.top * height);
    const leftX = Math.floor(wigBounds.left * width);
    const rightX = Math.floor(wigBounds.right * width);
    
    // Track density of non-transparent pixels per row
    const rowDensity: number[] = [];
    
    for (let y = startY; y >= endY; y--) {
      let opaquePixels = 0;
      let totalPixels = 0;
      
      for (let x = leftX; x <= rightX; x++) {
        const i = (y * width + x) * 4;
        const alpha = data[i + 3];
        
        totalPixels++;
        if (alpha > 50) {
          opaquePixels++;
        }
      }
      
      const density = totalPixels > 0 ? opaquePixels / totalPixels : 0;
      rowDensity.push(density);
    }
    
    // Find the hairline: first row from bottom with significant density
    // This represents where the wig hair actually starts
    let hairlineY = wigBounds.bottom;
    let confidence = 0.5;
    
    const densityThreshold = 0.3; // 30% of pixels must be opaque
    
    for (let i = 0; i < rowDensity.length; i++) {
      if (rowDensity[i] >= densityThreshold) {
        // Found hairline - this is where hair starts
        const actualY = startY - i;
        hairlineY = actualY / height;
        
        // Calculate confidence based on density gradient
        const densityChange = i > 0 ? Math.abs(rowDensity[i] - rowDensity[i - 1]) : 0;
        confidence = Math.min(0.9, 0.5 + densityChange);
        
        break;
      }
    }
    
    return { hairlineY, confidence };
  }

  /**
   * Calculate recommended scale based on wig dimensions
   */
  private calculateRecommendedScale(
    wigBounds: { top: number; bottom: number; left: number; right: number },
    _width: number,
    _height: number
  ): number {
    // Calculate actual wig width as percentage of image
    const wigWidth = wigBounds.right - wigBounds.left;
    
    // If wig takes up most of the image width, use smaller scale
    // If wig is small in image, use larger scale
    if (wigWidth > 0.8) {
      return 1.2; // Wig fills image, use moderate scale
    } else if (wigWidth > 0.6) {
      return 1.3; // Wig is medium size
    } else {
      return 1.5; // Wig is small, scale up more
    }
  }

  /**
   * Calculate recommended Y offset based on hairline position
   */
  private calculateRecommendedOffset(
    hairlineY: number,
    _wigBounds: { top: number; bottom: number; left: number; right: number }
  ): number {
    // If hairline is at the bottom of the image, we need to position wig higher
    // If hairline is in the middle, we need less offset
    
    // const wigHeight = wigBounds.bottom - wigBounds.top;
    const hairlineFromBottom = 1 - hairlineY;
    
    // Calculate offset to position hairline at forehead
    // Negative offset moves wig up, positive moves down
    if (hairlineFromBottom < 0.1) {
      // Hairline is at very bottom - need significant upward adjustment
      return -0.15;
    } else if (hairlineFromBottom < 0.3) {
      // Hairline is near bottom - moderate adjustment
      return -0.08;
    } else {
      // Hairline is well-positioned - minimal adjustment
      return -0.03;
    }
  }

  /**
   * Get debug visualization of analysis
   */
  getDebugVisualization(wigImage: HTMLImageElement, analysis: WigAnalysis): HTMLCanvasElement {
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = wigImage.width;
    debugCanvas.height = wigImage.height;
    const debugCtx = debugCanvas.getContext('2d')!;

    // Draw original image
    debugCtx.drawImage(wigImage, 0, 0);

    // Draw wig bounds
    debugCtx.strokeStyle = 'lime';
    debugCtx.lineWidth = 2;
    debugCtx.strokeRect(
      analysis.wigBounds.left * wigImage.width,
      analysis.wigBounds.top * wigImage.height,
      (analysis.wigBounds.right - analysis.wigBounds.left) * wigImage.width,
      (analysis.wigBounds.bottom - analysis.wigBounds.top) * wigImage.height
    );

    // Draw hairline
    debugCtx.strokeStyle = 'red';
    debugCtx.lineWidth = 3;
    debugCtx.beginPath();
    debugCtx.moveTo(0, analysis.hairlineY * wigImage.height);
    debugCtx.lineTo(wigImage.width, analysis.hairlineY * wigImage.height);
    debugCtx.stroke();

    // Add text labels
    debugCtx.fillStyle = 'white';
    debugCtx.strokeStyle = 'black';
    debugCtx.lineWidth = 3;
    debugCtx.font = '16px Arial';
    
    const text = `Hairline: ${(analysis.hairlineY * 100).toFixed(1)}% (confidence: ${(analysis.hairlineConfidence * 100).toFixed(0)}%)`;
    debugCtx.strokeText(text, 10, 30);
    debugCtx.fillText(text, 10, 30);

    return debugCanvas;
  }
}

export default WigAnalyzer;
