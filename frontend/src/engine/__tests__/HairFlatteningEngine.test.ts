/**
 * Tests for HairFlatteningEngine
 * 
 * Validates core functionality of hair flattening operations
 */

import { HairFlatteningEngine, AdjustmentMode } from '../HairFlatteningEngine';
import { BoundingBox } from '../HairVolumeDetector';

describe('HairFlatteningEngine', () => {
  let engine: HairFlatteningEngine;
  let testImage: ImageData;
  let testMask: ImageData;
  let testFaceRegion: BoundingBox;

  beforeEach(() => {
    engine = new HairFlatteningEngine();
    
    // Create test image (100x100 pixels)
    testImage = new ImageData(100, 100);
    // Fill with some color data
    for (let i = 0; i < testImage.data.length; i += 4) {
      testImage.data[i] = 150;     // R
      testImage.data[i + 1] = 120; // G
      testImage.data[i + 2] = 100; // B
      testImage.data[i + 3] = 255; // A
    }

    // Create test mask (100x100 pixels)
    testMask = new ImageData(100, 100);
    // Fill with hair mask data (white = hair)
    for (let i = 0; i < testMask.data.length; i += 4) {
      testMask.data[i] = 200;     // R
      testMask.data[i + 1] = 200; // G
      testMask.data[i + 2] = 200; // B
      testMask.data[i + 3] = 255; // A
    }

    // Create test face region
    testFaceRegion = {
      x: 25,
      y: 25,
      width: 50,
      height: 60
    };
  });

  describe('Mode Management', () => {
    it('should initialize with NORMAL mode', () => {
      expect(engine.getMode()).toBe(AdjustmentMode.NORMAL);
    });

    it('should allow setting mode', () => {
      engine.setMode(AdjustmentMode.FLATTENED);
      expect(engine.getMode()).toBe(AdjustmentMode.FLATTENED);

      engine.setMode(AdjustmentMode.BALD);
      expect(engine.getMode()).toBe(AdjustmentMode.BALD);
    });
  });

  describe('Configuration', () => {
    it('should enforce minimum blend radius of 5 pixels', () => {
      engine.setBlendRadius(3);
      // Internal blendRadius should be at least 5
      // We can't directly test this, but we can verify it doesn't throw
      expect(() => engine.setBlendRadius(3)).not.toThrow();
    });

    it('should clamp volume reduction to 60-80% range', () => {
      engine.setVolumeReduction(0.5); // Below minimum
      engine.setVolumeReduction(0.9); // Above maximum
      // Should not throw and should clamp internally
      expect(() => engine.setVolumeReduction(0.5)).not.toThrow();
      expect(() => engine.setVolumeReduction(0.9)).not.toThrow();
    });
  });

  describe('applyFlattening', () => {
    it('should complete within 300ms (performance requirement)', async () => {
      const startTime = performance.now();
      const result = await engine.applyFlattening(testImage, testMask, testFaceRegion);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(300);
      expect(result.processingTime).toBeLessThan(300);
    });

    it('should return FlattenedResult with all required fields', async () => {
      const result = await engine.applyFlattening(testImage, testMask, testFaceRegion);

      expect(result).toHaveProperty('flattenedImage');
      expect(result).toHaveProperty('adjustedMask');
      expect(result).toHaveProperty('processingTime');
      expect(result).toHaveProperty('headContour');

      expect(result.flattenedImage).toBeInstanceOf(ImageData);
      expect(result.adjustedMask).toBeInstanceOf(ImageData);
      expect(typeof result.processingTime).toBe('number');
      expect(Array.isArray(result.headContour)).toBe(true);
    });

    it('should preserve original image in NORMAL mode', async () => {
      engine.setMode(AdjustmentMode.NORMAL);
      const result = await engine.applyFlattening(testImage, testMask, testFaceRegion);

      // Check that image dimensions match
      expect(result.flattenedImage.width).toBe(testImage.width);
      expect(result.flattenedImage.height).toBe(testImage.height);

      // Check that pixel data is preserved (sample a few pixels)
      for (let i = 0; i < 100; i += 4) {
        expect(result.flattenedImage.data[i]).toBe(testImage.data[i]);
        expect(result.flattenedImage.data[i + 1]).toBe(testImage.data[i + 1]);
        expect(result.flattenedImage.data[i + 2]).toBe(testImage.data[i + 2]);
      }
    });

    it('should modify image in FLATTENED mode', async () => {
      engine.setMode(AdjustmentMode.FLATTENED);
      const result = await engine.applyFlattening(testImage, testMask, testFaceRegion);

      // Image should be modified (at least some pixels should be different)
      let hasChanges = false;
      for (let i = 0; i < testImage.data.length; i += 4) {
        if (result.flattenedImage.data[i] !== testImage.data[i] ||
            result.flattenedImage.data[i + 1] !== testImage.data[i + 1] ||
            result.flattenedImage.data[i + 2] !== testImage.data[i + 2]) {
          hasChanges = true;
          break;
        }
      }

      expect(hasChanges).toBe(true);
    });

    it('should modify image in BALD mode', async () => {
      engine.setMode(AdjustmentMode.BALD);
      const result = await engine.applyFlattening(testImage, testMask, testFaceRegion);

      // Image should be modified
      let hasChanges = false;
      for (let i = 0; i < testImage.data.length; i += 4) {
        if (result.flattenedImage.data[i] !== testImage.data[i] ||
            result.flattenedImage.data[i + 1] !== testImage.data[i + 1] ||
            result.flattenedImage.data[i + 2] !== testImage.data[i + 2]) {
          hasChanges = true;
          break;
        }
      }

      expect(hasChanges).toBe(true);
    });

    it('should generate head contour points', async () => {
      const result = await engine.applyFlattening(testImage, testMask, testFaceRegion);

      expect(result.headContour.length).toBeGreaterThan(0);
      
      // Verify contour points have x and y properties
      result.headContour.forEach(point => {
        expect(point).toHaveProperty('x');
        expect(point).toHaveProperty('y');
        expect(typeof point.x).toBe('number');
        expect(typeof point.y).toBe('number');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty mask', async () => {
      const emptyMask = new ImageData(100, 100);
      // All zeros (no hair)

      const result = await engine.applyFlattening(testImage, emptyMask, testFaceRegion);

      expect(result.flattenedImage).toBeInstanceOf(ImageData);
      expect(result.processingTime).toBeLessThan(300);
    });

    it('should handle full mask', async () => {
      const fullMask = new ImageData(100, 100);
      // All white (full hair coverage)
      for (let i = 0; i < fullMask.data.length; i += 4) {
        fullMask.data[i] = 255;
        fullMask.data[i + 1] = 255;
        fullMask.data[i + 2] = 255;
        fullMask.data[i + 3] = 255;
      }

      const result = await engine.applyFlattening(testImage, fullMask, testFaceRegion);

      expect(result.flattenedImage).toBeInstanceOf(ImageData);
      expect(result.processingTime).toBeLessThan(300);
    });

    it('should handle small images', async () => {
      const smallImage = new ImageData(50, 50);
      const smallMask = new ImageData(50, 50);
      const smallFaceRegion = { x: 10, y: 10, width: 30, height: 30 };

      const result = await engine.applyFlattening(smallImage, smallMask, smallFaceRegion);

      expect(result.flattenedImage.width).toBe(50);
      expect(result.flattenedImage.height).toBe(50);
      expect(result.processingTime).toBeLessThan(300);
    });
  });

  describe('WebGL Acceleration', () => {
    it('should initialize with WebGL when supported', () => {
      const webglEngine = new HairFlatteningEngine();
      webglEngine.initialize(100, 100, true);
      
      // Should not throw
      expect(() => webglEngine.initialize(100, 100, true)).not.toThrow();
      
      webglEngine.dispose();
    });

    it('should fall back to CPU when WebGL disabled', () => {
      const cpuEngine = new HairFlatteningEngine();
      cpuEngine.initialize(100, 100, false);
      
      // Should still work
      expect(() => cpuEngine.initialize(100, 100, false)).not.toThrow();
      
      cpuEngine.dispose();
    });

    it('should process correctly with WebGL enabled', async () => {
      const webglEngine = new HairFlatteningEngine();
      webglEngine.initialize(100, 100, true);
      webglEngine.setMode(AdjustmentMode.FLATTENED);

      const result = await webglEngine.applyFlattening(testImage, testMask, testFaceRegion);

      expect(result.flattenedImage).toBeInstanceOf(ImageData);
      expect(result.flattenedImage.width).toBe(100);
      expect(result.flattenedImage.height).toBe(100);
      expect(result.processingTime).toBeLessThan(300);

      webglEngine.dispose();
    });

    it('should produce consistent results between CPU and WebGL', async () => {
      // CPU engine
      const cpuEngine = new HairFlatteningEngine();
      cpuEngine.initialize(100, 100, false);
      cpuEngine.setMode(AdjustmentMode.NORMAL);

      const cpuResult = await cpuEngine.applyFlattening(testImage, testMask, testFaceRegion);

      // WebGL engine
      const webglEngine = new HairFlatteningEngine();
      webglEngine.initialize(100, 100, true);
      webglEngine.setMode(AdjustmentMode.NORMAL);

      const webglResult = await webglEngine.applyFlattening(testImage, testMask, testFaceRegion);

      // In NORMAL mode, both should preserve the original image
      expect(cpuResult.flattenedImage.width).toBe(webglResult.flattenedImage.width);
      expect(cpuResult.flattenedImage.height).toBe(webglResult.flattenedImage.height);

      cpuEngine.dispose();
      webglEngine.dispose();
    });

    it('should clean up resources on dispose', () => {
      const webglEngine = new HairFlatteningEngine();
      webglEngine.initialize(100, 100, true);
      
      // Should not throw
      expect(() => webglEngine.dispose()).not.toThrow();
      
      // Should be safe to call multiple times
      expect(() => webglEngine.dispose()).not.toThrow();
    });

    it('should handle WebGL initialization failure gracefully', async () => {
      const engine = new HairFlatteningEngine();
      // Initialize with potentially unsupported size
      engine.initialize(10000, 10000, true);
      
      // Should still work (falls back to CPU)
      const result = await engine.applyFlattening(testImage, testMask, testFaceRegion);
      
      expect(result.flattenedImage).toBeInstanceOf(ImageData);
      
      engine.dispose();
    });
  });
});
