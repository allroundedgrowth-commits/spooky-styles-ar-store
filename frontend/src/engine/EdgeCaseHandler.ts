/**
 * EdgeCaseHandler
 * 
 * Handles edge cases in hair segmentation and flattening:
 * - Bald users (skip flattening when volume is very low)
 * - Hat/head covering detection
 * - Low quality image detection
 * - Multiple face detection and primary face selection
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

import type { HairSegmentationData } from './HairSegmentationModule';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EdgeCaseResult {
  shouldSkipFlattening: boolean;
  message?: string;
  reason?: 'bald_user' | 'hat_detected' | 'low_quality' | 'multiple_faces' | 'none';
}

export interface QualityMetrics {
  brightness: number; // 0-255
  sharpness: number; // 0-1
  contrast: number; // 0-1
}

export class EdgeCaseHandler {
  private readonly BALD_THRESHOLD = 5; // Volume score below this is considered bald
  private readonly MIN_BRIGHTNESS = 30;
  private readonly MAX_BRIGHTNESS = 225;
  private readonly MIN_SHARPNESS = 0.3;
  private readonly MIN_CONTRAST = 0.2;

  /**
   * Handle bald user case
   * Skip flattening when volumeScore < 5
   * Requirement 10.1
   */
  handleBaldUser(segmentationData: HairSegmentationData): EdgeCaseResult {
    if (segmentationData.volumeScore < this.BALD_THRESHOLD) {
      return {
        shouldSkipFlattening: true,
        message: 'No hair adjustment needed',
        reason: 'bald_user'
      };
    }

    return {
      shouldSkipFlattening: false,
      reason: 'none'
    };
  }

  /**
   * Detect if user is wearing a hat or head covering
   * Uses segmentation pattern analysis to detect unusual coverage
   * Requirement 10.2
   */
  handleHatDetection(segmentationData: HairSegmentationData): EdgeCaseResult {
    const { mask, boundingBox } = segmentationData;
    
    // Analyze segmentation pattern
    const hasUnusualPattern = this.detectUnusualSegmentationPattern(mask, boundingBox);
    
    if (hasUnusualPattern) {
      return {
        shouldSkipFlattening: true,
        message: 'For best results, please remove head coverings or hats',
        reason: 'hat_detected'
      };
    }

    return {
      shouldSkipFlattening: false,
      reason: 'none'
    };
  }

  /**
   * Detect unusual segmentation patterns that indicate hats or coverings
   * Looks for:
   * - Very high density in upper region
   * - Sharp edges that don't match natural hair
   * - Unusual aspect ratios
   */
  private detectUnusualSegmentationPattern(mask: ImageData, boundingBox: BoundingBox): boolean {
    const { data, width } = mask;
    const { x, y, width: boxWidth, height: boxHeight } = boundingBox;
    
    // Calculate density in upper third of bounding box
    let upperDensity = 0;
    let upperPixels = 0;
    const upperThird = Math.floor(boxHeight / 3);
    
    for (let row = y; row < y + upperThird; row++) {
      for (let col = x; col < x + boxWidth; col++) {
        const idx = (row * width + col) * 4;
        if (data[idx] > 128) { // Hair pixel
          upperDensity++;
        }
        upperPixels++;
      }
    }
    
    const upperDensityRatio = upperPixels > 0 ? upperDensity / upperPixels : 0;
    
    // Calculate overall density
    let totalDensity = 0;
    let totalPixels = 0;
    
    for (let row = y; row < y + boxHeight; row++) {
      for (let col = x; col < x + boxWidth; col++) {
        const idx = (row * width + col) * 4;
        if (data[idx] > 128) {
          totalDensity++;
        }
        totalPixels++;
      }
    }
    
    const totalDensityRatio = totalPixels > 0 ? totalDensity / totalPixels : 0;
    
    // Hat indicators:
    // 1. Very high density in upper region (> 0.9)
    // 2. Much higher density in upper region compared to overall (> 1.5x)
    // 3. Unusual aspect ratio (very wide or very tall)
    const aspectRatio = boxWidth / boxHeight;
    
    const hasHighUpperDensity = upperDensityRatio > 0.9;
    const hasConcentratedUpper = upperDensityRatio > totalDensityRatio * 1.5;
    const hasUnusualAspectRatio = aspectRatio > 2.5 || aspectRatio < 0.4;
    
    return hasHighUpperDensity && hasConcentratedUpper || hasUnusualAspectRatio;
  }

  /**
   * Check image quality and suggest improvements
   * Requirement 10.3
   */
  handleLowQuality(image: ImageData): EdgeCaseResult {
    const quality = this.analyzeImageQuality(image);
    
    const issues: string[] = [];
    
    if (quality.brightness < this.MIN_BRIGHTNESS) {
      issues.push('lighting is too dim');
    } else if (quality.brightness > this.MAX_BRIGHTNESS) {
      issues.push('lighting is too bright');
    }
    
    if (quality.sharpness < this.MIN_SHARPNESS) {
      issues.push('image is out of focus');
    }
    
    if (quality.contrast < this.MIN_CONTRAST) {
      issues.push('image contrast is too low');
    }
    
    if (issues.length > 0) {
      const message = `Image quality is low: ${issues.join(', ')}. Please improve lighting or camera focus for best results.`;
      return {
        shouldSkipFlattening: false, // Don't skip, but warn user
        message,
        reason: 'low_quality'
      };
    }

    return {
      shouldSkipFlattening: false,
      reason: 'none'
    };
  }

  /**
   * Analyze image quality metrics
   */
  private analyzeImageQuality(image: ImageData): QualityMetrics {
    const { data, width, height } = image;
    
    // Calculate average brightness
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      pixelCount++;
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    
    // Calculate sharpness using Laplacian variance
    const sharpness = this.calculateSharpness(data, width, height);
    
    // Calculate contrast using standard deviation
    const contrast = this.calculateContrast(data, avgBrightness);
    
    return {
      brightness: avgBrightness,
      sharpness,
      contrast
    };
  }

  /**
   * Calculate image sharpness using simplified Laplacian
   */
  private calculateSharpness(data: Uint8ClampedArray, width: number, height: number): number {
    let variance = 0;
    let count = 0;
    
    // Sample every 10th pixel for performance
    for (let y = 1; y < height - 1; y += 10) {
      for (let x = 1; x < width - 1; x += 10) {
        const idx = (y * width + x) * 4;
        const center = data[idx];
        
        // Simple Laplacian: center - average of neighbors
        const top = data[((y - 1) * width + x) * 4];
        const bottom = data[((y + 1) * width + x) * 4];
        const left = data[(y * width + (x - 1)) * 4];
        const right = data[(y * width + (x + 1)) * 4];
        
        const avgNeighbor = (top + bottom + left + right) / 4;
        const diff = Math.abs(center - avgNeighbor);
        
        variance += diff * diff;
        count++;
      }
    }
    
    // Normalize to 0-1 range
    const normalizedVariance = Math.sqrt(variance / count) / 255;
    return Math.min(normalizedVariance, 1);
  }

  /**
   * Calculate image contrast using standard deviation
   */
  private calculateContrast(data: Uint8ClampedArray, mean: number): number {
    let variance = 0;
    let count = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const diff = brightness - mean;
      variance += diff * diff;
      count++;
    }
    
    const stdDev = Math.sqrt(variance / count);
    // Normalize to 0-1 range
    return Math.min(stdDev / 128, 1);
  }

  /**
   * Handle multiple faces and select primary face
   * Selects largest or most centered face
   * Requirement 10.4
   */
  handleMultipleFaces(faces: BoundingBox[], imageWidth: number, imageHeight: number): BoundingBox {
    if (faces.length === 0) {
      throw new Error('No faces provided');
    }
    
    if (faces.length === 1) {
      return faces[0];
    }
    
    // Calculate scores for each face
    const faceScores = faces.map(face => {
      // Size score: larger faces score higher
      const area = face.width * face.height;
      const maxArea = imageWidth * imageHeight;
      const sizeScore = area / maxArea;
      
      // Centrality score: faces closer to center score higher
      const faceCenterX = face.x + face.width / 2;
      const faceCenterY = face.y + face.height / 2;
      const imageCenterX = imageWidth / 2;
      const imageCenterY = imageHeight / 2;
      
      const distanceFromCenter = Math.sqrt(
        Math.pow(faceCenterX - imageCenterX, 2) +
        Math.pow(faceCenterY - imageCenterY, 2)
      );
      const maxDistance = Math.sqrt(
        Math.pow(imageWidth / 2, 2) +
        Math.pow(imageHeight / 2, 2)
      );
      const centralityScore = 1 - (distanceFromCenter / maxDistance);
      
      // Combined score: 60% size, 40% centrality
      return sizeScore * 0.6 + centralityScore * 0.4;
    });
    
    // Find face with highest score
    let maxScore = -1;
    let primaryFaceIndex = 0;
    
    for (let i = 0; i < faceScores.length; i++) {
      if (faceScores[i] > maxScore) {
        maxScore = faceScores[i];
        primaryFaceIndex = i;
      }
    }
    
    return faces[primaryFaceIndex];
  }

  /**
   * Comprehensive edge case check
   * Runs all edge case handlers and returns combined result
   */
  checkAllEdgeCases(
    segmentationData: HairSegmentationData,
    image: ImageData,
    faces?: BoundingBox[]
  ): EdgeCaseResult {
    // Check for bald user first
    const baldResult = this.handleBaldUser(segmentationData);
    if (baldResult.shouldSkipFlattening) {
      return baldResult;
    }
    
    // Check for hat detection
    const hatResult = this.handleHatDetection(segmentationData);
    if (hatResult.shouldSkipFlattening) {
      return hatResult;
    }
    
    // Check image quality (doesn't skip, just warns)
    const qualityResult = this.handleLowQuality(image);
    if (qualityResult.message) {
      return qualityResult;
    }
    
    // Check for multiple faces
    if (faces && faces.length > 1) {
      return {
        shouldSkipFlattening: false,
        message: `Multiple faces detected. Using ${faces.length > 2 ? 'largest' : 'primary'} face for hair adjustment.`,
        reason: 'multiple_faces'
      };
    }
    
    return {
      shouldSkipFlattening: false,
      reason: 'none'
    };
  }
}

export default EdgeCaseHandler;
