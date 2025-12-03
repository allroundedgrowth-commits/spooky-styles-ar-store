/**
 * Hair Volume Detector
 * 
 * Analyzes hair segmentation masks to calculate volume scores and determine
 * if automatic flattening should be applied.
 * 
 * Requirements: 1.2, 1.3
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VolumeMetrics {
  score: number; // 0-100
  density: number; // pixels per unit area
  distribution: 'even' | 'concentrated' | 'sparse';
  boundingBox: BoundingBox;
}

export type VolumeCategory = 'minimal' | 'moderate' | 'high' | 'very-high';

export class HairVolumeDetector {
  private readonly AUTO_FLATTEN_THRESHOLD = 40;
  
  /**
   * Calculate volume metrics from a hair segmentation mask
   * 
   * @param hairMask - Binary mask where hair pixels are white (255)
   * @param faceRegion - Bounding box of the detected face
   * @returns Volume metrics including score (0-100), density, and distribution
   */
  calculateVolume(hairMask: ImageData, _faceRegion: BoundingBox): VolumeMetrics {
    const { width, height, data } = hairMask;
    
    // Count hair pixels (assuming white pixels = 255 represent hair)
    let hairPixelCount = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    
    // Track hair pixel positions for distribution analysis
    const hairPixelPositions: { x: number; y: number }[] = [];
    
    // Scan the mask to count hair pixels and find bounding box
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];
        
        // Check if this is a hair pixel (high alpha value)
        if (alpha > 128) {
          hairPixelCount++;
          hairPixelPositions.push({ x, y });
          
          // Update bounding box
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // Calculate bounding box
    const boundingBox: BoundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    
    // Calculate density (hair pixels per unit area)
    const totalArea = width * height;
    const hairArea = boundingBox.width * boundingBox.height;
    const density = hairArea > 0 ? hairPixelCount / hairArea : 0;
    
    // Calculate volume score (0-100)
    // Score is based on:
    // 1. Percentage of total image covered by hair (60% weight)
    // 2. Density within the hair bounding box (40% weight)
    const coverageRatio = hairPixelCount / totalArea;
    const densityRatio = density;
    
    const coverageScore = Math.min(coverageRatio * 150, 60); // Max 60 points
    const densityScore = Math.min(densityRatio * 100, 40); // Max 40 points
    
    const score = Math.round(Math.min(coverageScore + densityScore, 100));
    
    // Determine distribution pattern
    const distribution = this.analyzeDistribution(
      hairPixelPositions,
      boundingBox,
      hairPixelCount
    );
    
    return {
      score,
      density,
      distribution,
      boundingBox,
    };
  }
  
  /**
   * Determine if automatic flattening should be applied
   * 
   * @param volumeScore - Volume score from 0-100
   * @returns true if score > 40, false otherwise
   */
  shouldAutoFlatten(volumeScore: number): boolean {
    return volumeScore > this.AUTO_FLATTEN_THRESHOLD;
  }
  
  /**
   * Get volume category for UI display
   * 
   * @param volumeScore - Volume score from 0-100
   * @returns Category label for display
   */
  getVolumeCategory(volumeScore: number): VolumeCategory {
    if (volumeScore < 20) {
      return 'minimal';
    } else if (volumeScore < 50) {
      return 'moderate';
    } else if (volumeScore < 75) {
      return 'high';
    } else {
      return 'very-high';
    }
  }
  
  /**
   * Analyze the distribution pattern of hair pixels
   * 
   * @param positions - Array of hair pixel positions
   * @param boundingBox - Bounding box of hair region
   * @param totalPixels - Total number of hair pixels
   * @returns Distribution pattern classification
   */
  private analyzeDistribution(
    positions: { x: number; y: number }[],
    boundingBox: BoundingBox,
    totalPixels: number
  ): 'even' | 'concentrated' | 'sparse' {
    if (totalPixels === 0) {
      return 'sparse';
    }
    
    // Divide bounding box into a 3x3 grid
    const gridSize = 3;
    const cellWidth = boundingBox.width / gridSize;
    const cellHeight = boundingBox.height / gridSize;
    const grid: number[] = new Array(gridSize * gridSize).fill(0);
    
    // Count pixels in each grid cell
    for (const pos of positions) {
      const relX = pos.x - boundingBox.x;
      const relY = pos.y - boundingBox.y;
      
      const cellX = Math.min(Math.floor(relX / cellWidth), gridSize - 1);
      const cellY = Math.min(Math.floor(relY / cellHeight), gridSize - 1);
      const cellIndex = cellY * gridSize + cellX;
      
      if (cellIndex >= 0 && cellIndex < grid.length) {
        grid[cellIndex]++;
      }
    }
    
    // Calculate standard deviation of pixel distribution
    const mean = totalPixels / grid.length;
    const variance = grid.reduce((sum, count) => {
      return sum + Math.pow(count - mean, 2);
    }, 0) / grid.length;
    const stdDev = Math.sqrt(variance);
    
    // Classify distribution based on standard deviation
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
    
    if (coefficientOfVariation < 0.3) {
      return 'even';
    } else if (coefficientOfVariation < 0.7) {
      return 'concentrated';
    } else {
      return 'sparse';
    }
  }
}
