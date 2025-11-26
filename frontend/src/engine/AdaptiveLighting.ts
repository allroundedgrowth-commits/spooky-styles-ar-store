import * as THREE from 'three';
import { LightingData } from '../types/faceTracking';

/**
 * Light source information
 */
export interface LightSource {
  direction: THREE.Vector3;
  intensity: number;
  color: THREE.Color;
}

/**
 * Adaptive Lighting Manager
 * Handles dynamic lighting adjustments based on ambient conditions
 */
export class AdaptiveLighting {
  private videoElement: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // Lighting analysis settings
  private analysisWidth = 160;
  private analysisHeight = 120;
  private gridSize = 4; // Divide frame into 4x4 grid for directional analysis

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    
    // Create canvas for lighting analysis
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.analysisWidth;
    this.canvas.height = this.analysisHeight;
    
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Failed to get 2D context for lighting analysis');
    }
    this.ctx = ctx;
  }

  /**
   * Analyze lighting conditions from video frame
   * @param threshold - Minimum brightness threshold (0-1), defaults to 0.3
   */
  public analyzeLighting(threshold: number = 0.3): LightingData {
    // Draw current video frame to canvas
    this.ctx.drawImage(this.videoElement, 0, 0, this.analysisWidth, this.analysisHeight);
    
    // Get image data
    const imageData = this.ctx.getImageData(0, 0, this.analysisWidth, this.analysisHeight);
    const data = imageData.data;
    
    // Calculate average brightness
    let totalBrightness = 0;
    const pixelCount = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate perceived brightness (weighted average)
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      totalBrightness += brightness;
    }
    
    const averageBrightness = totalBrightness / pixelCount;
    const isAdequate = averageBrightness >= threshold;
    
    return {
      brightness: averageBrightness,
      isAdequate,
      timestamp: Date.now(),
    };
  }

  /**
   * Detect primary light source direction from video frame
   * Analyzes brightness distribution across frame grid
   */
  public detectLightSource(): LightSource {
    // Draw current video frame to canvas
    this.ctx.drawImage(this.videoElement, 0, 0, this.analysisWidth, this.analysisHeight);
    
    // Get image data
    const imageData = this.ctx.getImageData(0, 0, this.analysisWidth, this.analysisHeight);
    const data = imageData.data;
    
    // Divide frame into grid and calculate brightness for each cell
    const cellWidth = this.analysisWidth / this.gridSize;
    const cellHeight = this.analysisHeight / this.gridSize;
    const brightnessGrid: number[][] = [];
    
    for (let row = 0; row < this.gridSize; row++) {
      brightnessGrid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        const cellBrightness = this.calculateCellBrightness(
          data,
          col * cellWidth,
          row * cellHeight,
          cellWidth,
          cellHeight
        );
        brightnessGrid[row][col] = cellBrightness;
      }
    }
    
    // Find brightest region to determine light direction
    let maxBrightness = 0;
    let brightestRow = 0;
    let brightestCol = 0;
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (brightnessGrid[row][col] > maxBrightness) {
          maxBrightness = brightnessGrid[row][col];
          brightestRow = row;
          brightestCol = col;
        }
      }
    }
    
    // Convert grid position to direction vector
    // Center is (0, 0, 0), edges are at (-1, -1) to (1, 1)
    const dirX = (brightestCol / (this.gridSize - 1)) * 2 - 1;
    const dirY = -((brightestRow / (this.gridSize - 1)) * 2 - 1); // Invert Y
    const dirZ = 1; // Light comes from in front
    
    const direction = new THREE.Vector3(dirX, dirY, dirZ).normalize();
    
    // Calculate average color of brightest region
    const color = this.calculateCellColor(
      data,
      brightestCol * cellWidth,
      brightestRow * cellHeight,
      cellWidth,
      cellHeight
    );
    
    return {
      direction,
      intensity: maxBrightness,
      color,
    };
  }

  /**
   * Calculate average brightness for a cell in the grid
   */
  private calculateCellBrightness(
    data: Uint8ClampedArray,
    startX: number,
    startY: number,
    width: number,
    height: number
  ): number {
    let totalBrightness = 0;
    let pixelCount = 0;
    
    const endX = Math.min(startX + width, this.analysisWidth);
    const endY = Math.min(startY + height, this.analysisHeight);
    
    for (let y = Math.floor(startY); y < endY; y++) {
      for (let x = Math.floor(startX); x < endX; x++) {
        const idx = (y * this.analysisWidth + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        totalBrightness += brightness;
        pixelCount++;
      }
    }
    
    return pixelCount > 0 ? totalBrightness / pixelCount : 0;
  }

  /**
   * Calculate average color for a cell in the grid
   */
  private calculateCellColor(
    data: Uint8ClampedArray,
    startX: number,
    startY: number,
    width: number,
    height: number
  ): THREE.Color {
    let totalR = 0, totalG = 0, totalB = 0;
    let pixelCount = 0;
    
    const endX = Math.min(startX + width, this.analysisWidth);
    const endY = Math.min(startY + height, this.analysisHeight);
    
    for (let y = Math.floor(startY); y < endY; y++) {
      for (let x = Math.floor(startX); x < endX; x++) {
        const idx = (y * this.analysisWidth + x) * 4;
        totalR += data[idx];
        totalG += data[idx + 1];
        totalB += data[idx + 2];
        pixelCount++;
      }
    }
    
    if (pixelCount === 0) {
      return new THREE.Color(1, 1, 1);
    }
    
    return new THREE.Color(
      totalR / pixelCount / 255,
      totalG / pixelCount / 255,
      totalB / pixelCount / 255
    );
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    // Canvas will be garbage collected
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}
