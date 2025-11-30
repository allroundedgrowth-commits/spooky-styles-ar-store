import { describe, it, expect, beforeEach } from 'vitest';
import { HairVolumeDetector, BoundingBox } from '../HairVolumeDetector';

describe('HairVolumeDetector', () => {
  let detector: HairVolumeDetector;
  let faceRegion: BoundingBox;

  beforeEach(() => {
    detector = new HairVolumeDetector();
    faceRegion = {
      x: 100,
      y: 100,
      width: 200,
      height: 250,
    };
  });

  describe('calculateVolume', () => {
    it('should return volume score of 0 for empty mask', () => {
      const hairMask = createEmptyMask(400, 400);
      const result = detector.calculateVolume(hairMask, faceRegion);
      
      expect(result.score).toBe(0);
      expect(result.density).toBe(0);
    });

    it('should return volume score between 0 and 100', () => {
      const hairMask = createMaskWithHair(400, 400, 0.3);
      const result = detector.calculateVolume(hairMask, faceRegion);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should calculate higher score for more hair pixels', () => {
      const sparseMask = createMaskWithHair(400, 400, 0.1);
      const denseMask = createMaskWithHair(400, 400, 0.5);
      
      const sparseResult = detector.calculateVolume(sparseMask, faceRegion);
      const denseResult = detector.calculateVolume(denseMask, faceRegion);
      
      expect(denseResult.score).toBeGreaterThan(sparseResult.score);
    });

    it('should return valid bounding box', () => {
      const hairMask = createMaskWithHair(400, 400, 0.3);
      const result = detector.calculateVolume(hairMask, faceRegion);
      
      expect(result.boundingBox.width).toBeGreaterThan(0);
      expect(result.boundingBox.height).toBeGreaterThan(0);
      expect(result.boundingBox.x).toBeGreaterThanOrEqual(0);
      expect(result.boundingBox.y).toBeGreaterThanOrEqual(0);
    });

    it('should classify distribution pattern', () => {
      const hairMask = createMaskWithHair(400, 400, 0.3);
      const result = detector.calculateVolume(hairMask, faceRegion);
      
      expect(['even', 'concentrated', 'sparse']).toContain(result.distribution);
    });
  });

  describe('shouldAutoFlatten', () => {
    it('should return false for volume score <= 40', () => {
      expect(detector.shouldAutoFlatten(0)).toBe(false);
      expect(detector.shouldAutoFlatten(20)).toBe(false);
      expect(detector.shouldAutoFlatten(40)).toBe(false);
    });

    it('should return true for volume score > 40', () => {
      expect(detector.shouldAutoFlatten(41)).toBe(true);
      expect(detector.shouldAutoFlatten(60)).toBe(true);
      expect(detector.shouldAutoFlatten(100)).toBe(true);
    });
  });

  describe('getVolumeCategory', () => {
    it('should return "minimal" for scores < 20', () => {
      expect(detector.getVolumeCategory(0)).toBe('minimal');
      expect(detector.getVolumeCategory(10)).toBe('minimal');
      expect(detector.getVolumeCategory(19)).toBe('minimal');
    });

    it('should return "moderate" for scores 20-49', () => {
      expect(detector.getVolumeCategory(20)).toBe('moderate');
      expect(detector.getVolumeCategory(35)).toBe('moderate');
      expect(detector.getVolumeCategory(49)).toBe('moderate');
    });

    it('should return "high" for scores 50-74', () => {
      expect(detector.getVolumeCategory(50)).toBe('high');
      expect(detector.getVolumeCategory(60)).toBe('high');
      expect(detector.getVolumeCategory(74)).toBe('high');
    });

    it('should return "very-high" for scores >= 75', () => {
      expect(detector.getVolumeCategory(75)).toBe('very-high');
      expect(detector.getVolumeCategory(90)).toBe('very-high');
      expect(detector.getVolumeCategory(100)).toBe('very-high');
    });
  });
});

// Helper functions to create test masks
function createEmptyMask(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  // All pixels are transparent (alpha = 0)
  return new ImageData(data, width, height);
}

function createMaskWithHair(
  width: number,
  height: number,
  coverage: number
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  
  // Fill with hair pixels based on coverage ratio
  const totalPixels = width * height;
  const hairPixels = Math.floor(totalPixels * coverage);
  
  // Distribute hair pixels in the upper portion of the image
  let pixelsAdded = 0;
  for (let y = 0; y < height && pixelsAdded < hairPixels; y++) {
    for (let x = 0; x < width && pixelsAdded < hairPixels; x++) {
      // Add some randomness to distribution
      if (Math.random() < coverage * 2) {
        const index = (y * width + x) * 4;
        data[index] = 255;     // R
        data[index + 1] = 255; // G
        data[index + 2] = 255; // B
        data[index + 3] = 255; // A (opaque = hair)
        pixelsAdded++;
      }
    }
  }
  
  return new ImageData(data, width, height);
}
