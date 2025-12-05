/**
 * Wig Alignment Adjuster
 * 
 * Manages wig positioning and blending with flattened hair regions.
 * Ensures proper alignment during head rotation and prevents visible gaps.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { Point } from './HairFlatteningEngine';

/**
 * Dimensions of an object
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Head pose information from face tracking
 */
export interface HeadPose {
  rotation: {
    x: number; // Pitch (up/down)
    y: number; // Yaw (left/right)
    z: number; // Roll (tilt)
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Transformation parameters for wig positioning
 */
export interface WigTransform {
  position: Point;
  scale: number;
  rotation: number;
  skew: { x: number; y: number };
}

/**
 * Quality metrics for wig alignment
 */
export interface AlignmentQuality {
  hasGaps: boolean;
  blendQuality: number; // 0-1
  edgeSmoothness: number; // 0-1
}

/**
 * WigAlignmentAdjuster
 * 
 * Calculates optimal wig positioning based on adjusted head contours,
 * blends wig edges with flattened hair, and maintains alignment during movement.
 */
export class WigAlignmentAdjuster {
  private blendWidth: number = 10; // Minimum 10 pixels per requirements
  private lastUpdateTime: number = 0;

  /**
   * Set the blend width for edge blending
   * 
   * @param width - Blend width in pixels (minimum 10)
   */
  setBlendWidth(width: number): void {
    this.blendWidth = Math.max(10, width); // Enforce minimum 10 pixels
  }

  /**
   * Get the current blend width
   * 
   * @returns Current blend width in pixels
   */
  getBlendWidth(): number {
    return this.blendWidth;
  }

  /**
   * Calculate optimal wig position based on adjusted head contours
   * Ensures wig aligns properly with flattened hair regions
   * 
   * Requirements: 5.1
   * 
   * @param headContour - Array of points defining the head outline
   * @param wigDimensions - Width and height of the wig image
   * @param headPose - Current head pose from face tracking
   * @returns WigTransform with positioning parameters
   */
  calculateWigPosition(
    headContour: Point[],
    wigDimensions: Dimensions,
    headPose: HeadPose
  ): WigTransform {
    const startTime = performance.now();

    // Find the bounding box of the head contour
    const bounds = this.calculateBounds(headContour);

    // Calculate center point of the head
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
    // const _centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2; // Reserved for future vertical alignment

    // Calculate scale based on head width
    const headWidth = bounds.maxX - bounds.minX;
    const scale = headWidth / wigDimensions.width;

    // Adjust position based on head pose
    // Yaw (left/right rotation) affects horizontal position
    const yawAdjustment = Math.sin(headPose.rotation.y) * headWidth * 0.1;
    
    // Pitch (up/down rotation) affects vertical position
    const pitchAdjustment = Math.sin(headPose.rotation.x) * headWidth * 0.1;

    // Calculate final position
    // Position wig slightly above the detected contour to ensure coverage
    const position: Point = {
      x: centerX + yawAdjustment - (wigDimensions.width * scale) / 2,
      y: bounds.minY + pitchAdjustment - (wigDimensions.height * scale) * 0.1
    };

    // Calculate rotation from head roll
    const rotation = headPose.rotation.z;

    // Calculate skew based on head pose for perspective correction
    const skew = {
      x: Math.sin(headPose.rotation.y) * 0.2, // Horizontal skew from yaw
      y: Math.sin(headPose.rotation.x) * 0.1  // Vertical skew from pitch
    };

    const processingTime = performance.now() - startTime;
    this.lastUpdateTime = processingTime;

    // Verify we met the performance requirement (< 200ms)
    if (processingTime > 200) {
      console.warn(`Wig position calculation took ${processingTime}ms, exceeding 200ms requirement`);
    }

    return {
      position,
      scale,
      rotation,
      skew
    };
  }

  /**
   * Blend wig edges with flattened background using alpha compositing
   * Uses minimum 10-pixel blend width as per requirements
   * 
   * Requirements: 5.2
   * 
   * @param wigImage - The wig image to blend
   * @param flattenedBackground - The flattened hair/scalp background
   * @param wigPosition - Transform parameters for wig positioning
   * @returns Blended composite image
   */
  blendWigEdges(
    wigImage: ImageData,
    flattenedBackground: ImageData,
    wigPosition: WigTransform
  ): ImageData {
    const startTime = performance.now();

    // Create result image from background
    const result = this.cloneImageData(flattenedBackground);
    const { width: bgWidth, height: bgHeight } = result;

    // Calculate transformed wig dimensions
    const wigWidth = Math.floor(wigImage.width * wigPosition.scale);
    const wigHeight = Math.floor(wigImage.height * wigPosition.scale);

    // Blend wig onto background
    for (let y = 0; y < wigHeight; y++) {
      for (let x = 0; x < wigWidth; x++) {
        // Calculate source position in wig image
        const srcX = Math.floor(x / wigPosition.scale);
        const srcY = Math.floor(y / wigPosition.scale);

        if (srcX >= 0 && srcX < wigImage.width && srcY >= 0 && srcY < wigImage.height) {
          // Apply rotation and skew transformations
          const transformed = this.applyTransform(
            x, y,
            wigPosition.position,
            wigPosition.rotation,
            wigPosition.skew,
            { width: wigWidth, height: wigHeight }
          );

          const destX = Math.floor(transformed.x);
          const destY = Math.floor(transformed.y);

          // Check if destination is within bounds
          if (destX >= 0 && destX < bgWidth && destY >= 0 && destY < bgHeight) {
            const srcIndex = (srcY * wigImage.width + srcX) * 4;
            const destIndex = (destY * bgWidth + destX) * 4;

            // Get wig pixel
            const wigR = wigImage.data[srcIndex];
            const wigG = wigImage.data[srcIndex + 1];
            const wigB = wigImage.data[srcIndex + 2];
            const wigA = wigImage.data[srcIndex + 3] / 255;

            // Calculate edge blend factor
            const edgeBlend = this.calculateEdgeBlend(x, y, wigWidth, wigHeight, this.blendWidth);
            const finalAlpha = wigA * edgeBlend;

            // Get background pixel
            const bgR = result.data[destIndex];
            const bgG = result.data[destIndex + 1];
            const bgB = result.data[destIndex + 2];

            // Alpha blend
            result.data[destIndex] = Math.floor(wigR * finalAlpha + bgR * (1 - finalAlpha));
            result.data[destIndex + 1] = Math.floor(wigG * finalAlpha + bgG * (1 - finalAlpha));
            result.data[destIndex + 2] = Math.floor(wigB * finalAlpha + bgB * (1 - finalAlpha));
            result.data[destIndex + 3] = 255;
          }
        }
      }
    }

    const processingTime = performance.now() - startTime;

    // Log if blending is slow
    if (processingTime > 100) {
      console.warn(`Wig edge blending took ${processingTime}ms`);
    }

    return result;
  }

  /**
   * Update wig position for head rotation
   * Maintains proper alignment during movement up to 45 degrees
   * Ensures updates complete within 200ms as per requirements
   * 
   * Requirements: 5.3, 5.5
   * 
   * @param currentTransform - Current wig transform
   * @param newHeadPose - Updated head pose
   * @returns Updated wig transform
   */
  updateForHeadRotation(
    currentTransform: WigTransform,
    newHeadPose: HeadPose
  ): WigTransform {
    const startTime = performance.now();

    // Check if rotation is within supported range (45 degrees = ~0.785 radians)
    const maxRotation = Math.PI / 4; // 45 degrees
    const rotationMagnitude = Math.sqrt(
      newHeadPose.rotation.x ** 2 +
      newHeadPose.rotation.y ** 2 +
      newHeadPose.rotation.z ** 2
    );

    if (rotationMagnitude > maxRotation) {
      console.warn(`Head rotation ${rotationMagnitude} exceeds maximum supported angle of ${maxRotation}`);
    }

    // Calculate position adjustments based on rotation
    const yawAdjustment = Math.sin(newHeadPose.rotation.y) * currentTransform.scale * 50;
    const pitchAdjustment = Math.sin(newHeadPose.rotation.x) * currentTransform.scale * 30;

    // Update position
    const updatedPosition: Point = {
      x: currentTransform.position.x + yawAdjustment,
      y: currentTransform.position.y + pitchAdjustment
    };

    // Update rotation to match head roll
    const updatedRotation = newHeadPose.rotation.z;

    // Update skew for perspective correction
    const updatedSkew = {
      x: Math.sin(newHeadPose.rotation.y) * 0.2,
      y: Math.sin(newHeadPose.rotation.x) * 0.1
    };

    // Scale remains the same during rotation
    const updatedTransform: WigTransform = {
      position: updatedPosition,
      scale: currentTransform.scale,
      rotation: updatedRotation,
      skew: updatedSkew
    };

    const processingTime = performance.now() - startTime;
    this.lastUpdateTime = processingTime;

    // Verify we met the performance requirement (< 200ms)
    if (processingTime > 200) {
      console.warn(`Wig rotation update took ${processingTime}ms, exceeding 200ms requirement`);
    }

    return updatedTransform;
  }

  /**
   * Validate alignment quality and detect gaps
   * Ensures no visible gaps between wig and adjusted hair
   * 
   * Requirements: 5.4
   * 
   * @param wigImage - The wig image
   * @param background - The background image
   * @param transform - Current wig transform
   * @returns AlignmentQuality metrics
   */
  validateAlignment(
    wigImage: ImageData,
    background: ImageData,
    transform: WigTransform
  ): AlignmentQuality {
    const wigWidth = Math.floor(wigImage.width * transform.scale);
    const wigHeight = Math.floor(wigImage.height * transform.scale);

    let gapPixels = 0;
    let edgePixels = 0;
    let smoothEdgePixels = 0;
    let totalEdgePixels = 0;

    // Check for gaps along the wig perimeter
    const perimeterPoints = this.getPerimeterPoints(wigWidth, wigHeight);

    for (const point of perimeterPoints) {
      const transformed = this.applyTransform(
        point.x, point.y,
        transform.position,
        transform.rotation,
        transform.skew,
        { width: wigWidth, height: wigHeight }
      );

      const x = Math.floor(transformed.x);
      const y = Math.floor(transformed.y);

      if (x >= 0 && x < background.width && y >= 0 && y < background.height) {
        const srcIndex = (Math.floor(point.y / transform.scale) * wigImage.width + 
                         Math.floor(point.x / transform.scale)) * 4;
        const destIndex = (y * background.width + x) * 4;

        const wigAlpha = wigImage.data[srcIndex + 3];
        const bgR = background.data[destIndex];
        const bgG = background.data[destIndex + 1];
        const bgB = background.data[destIndex + 2];

        // Check if this is a gap (wig has alpha but background is very different)
        if (wigAlpha > 128) {
          edgePixels++;
          
          // Sample neighboring pixels to check for smoothness
          const neighbors = this.sampleNeighbors(background, x, y, 2);
          const variance = this.calculateColorVariance(neighbors);
          
          if (variance < 500) { // Low variance = smooth edge
            smoothEdgePixels++;
          }

          // Check for gaps (large color difference at edge)
          const colorDiff = Math.abs(bgR - 128) + Math.abs(bgG - 128) + Math.abs(bgB - 128);
          if (colorDiff > 200) {
            gapPixels++;
          }
        }

        totalEdgePixels++;
      }
    }

    // Calculate quality metrics
    const hasGaps = gapPixels > totalEdgePixels * 0.05; // More than 5% gaps is problematic
    const blendQuality = edgePixels > 0 ? 1 - (gapPixels / edgePixels) : 1.0;
    const edgeSmoothness = totalEdgePixels > 0 ? smoothEdgePixels / totalEdgePixels : 1.0;

    return {
      hasGaps,
      blendQuality: Math.max(0, Math.min(1, blendQuality)),
      edgeSmoothness: Math.max(0, Math.min(1, edgeSmoothness))
    };
  }

  /**
   * Get the last update processing time
   * 
   * @returns Processing time in milliseconds
   */
  getLastUpdateTime(): number {
    return this.lastUpdateTime;
  }

  // ==================== Private Helper Methods ====================

  /**
   * Calculate bounding box of contour points
   */
  private calculateBounds(contour: Point[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    if (contour.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    let minX = contour[0].x;
    let maxX = contour[0].x;
    let minY = contour[0].y;
    let maxY = contour[0].y;

    for (const point of contour) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    return { minX, maxX, minY, maxY };
  }

  /**
   * Apply transformation (rotation, skew) to a point
   */
  private applyTransform(
    x: number,
    y: number,
    position: Point,
    rotation: number,
    skew: { x: number; y: number },
    dimensions: Dimensions
  ): Point {
    // Center point for rotation
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Translate to origin
    const tx = x - centerX;
    const ty = y - centerY;

    // Apply rotation
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const rx = tx * cos - ty * sin;
    const ry = tx * sin + ty * cos;

    // Apply skew
    const sx = rx + ry * skew.x;
    const sy = ry + rx * skew.y;

    // Translate back and add position offset
    return {
      x: sx + centerX + position.x,
      y: sy + centerY + position.y
    };
  }

  /**
   * Calculate edge blend factor based on distance from edge
   * Creates smooth transitions at wig boundaries
   */
  private calculateEdgeBlend(
    x: number,
    y: number,
    width: number,
    height: number,
    blendWidth: number
  ): number {
    // Calculate distance from each edge
    const distFromLeft = x;
    const distFromRight = width - x;
    const distFromTop = y;
    const distFromBottom = height - y;

    // Find minimum distance to any edge
    const minDist = Math.min(distFromLeft, distFromRight, distFromTop, distFromBottom);

    // Calculate blend factor (0 at edge, 1 at blendWidth distance)
    if (minDist >= blendWidth) {
      return 1.0;
    }

    // Smooth interpolation using smoothstep
    const t = minDist / blendWidth;
    return t * t * (3 - 2 * t); // Smoothstep function
  }

  /**
   * Get perimeter points for gap detection
   */
  private getPerimeterPoints(width: number, height: number): Point[] {
    const points: Point[] = [];
    const step = 5; // Sample every 5 pixels

    // Top edge
    for (let x = 0; x < width; x += step) {
      points.push({ x, y: 0 });
    }

    // Right edge
    for (let y = 0; y < height; y += step) {
      points.push({ x: width - 1, y });
    }

    // Bottom edge
    for (let x = width - 1; x >= 0; x -= step) {
      points.push({ x, y: height - 1 });
    }

    // Left edge
    for (let y = height - 1; y >= 0; y -= step) {
      points.push({ x: 0, y });
    }

    return points;
  }

  /**
   * Sample neighboring pixels for smoothness analysis
   */
  private sampleNeighbors(
    image: ImageData,
    x: number,
    y: number,
    radius: number
  ): Array<{ r: number; g: number; b: number }> {
    const neighbors: Array<{ r: number; g: number; b: number }> = [];
    const { width, height, data } = image;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const index = (ny * width + nx) * 4;
          neighbors.push({
            r: data[index],
            g: data[index + 1],
            b: data[index + 2]
          });
        }
      }
    }

    return neighbors;
  }

  /**
   * Calculate color variance for smoothness detection
   */
  private calculateColorVariance(
    colors: Array<{ r: number; g: number; b: number }>
  ): number {
    if (colors.length === 0) return 0;

    // Calculate mean
    const mean = {
      r: colors.reduce((sum, c) => sum + c.r, 0) / colors.length,
      g: colors.reduce((sum, c) => sum + c.g, 0) / colors.length,
      b: colors.reduce((sum, c) => sum + c.b, 0) / colors.length
    };

    // Calculate variance
    const variance = colors.reduce((sum, c) => {
      const dr = c.r - mean.r;
      const dg = c.g - mean.g;
      const db = c.b - mean.b;
      return sum + (dr * dr + dg * dg + db * db);
    }, 0) / colors.length;

    return variance;
  }

  /**
   * Clone ImageData object
   */
  private cloneImageData(imageData: ImageData): ImageData {
    const cloned = new ImageData(imageData.width, imageData.height);
    cloned.data.set(imageData.data);
    return cloned;
  }
}
