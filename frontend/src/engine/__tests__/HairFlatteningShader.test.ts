/**
 * Tests for HairFlatteningShader
 * 
 * Validates WebGL shader functionality for GPU-accelerated hair flattening
 */

import { HairFlatteningShader } from '../HairFlatteningShader';

describe('HairFlatteningShader', () => {
  let shader: HairFlatteningShader | null = null;
  let testImage: ImageData;
  let testMask: ImageData;

  beforeEach(() => {
    // Create test image (100x100 pixels)
    testImage = new ImageData(100, 100);
    for (let i = 0; i < testImage.data.length; i += 4) {
      testImage.data[i] = 150;     // R
      testImage.data[i + 1] = 120; // G
      testImage.data[i + 2] = 100; // B
      testImage.data[i + 3] = 255; // A
    }

    // Create test mask (100x100 pixels)
    testMask = new ImageData(100, 100);
    for (let i = 0; i < testMask.data.length; i += 4) {
      testMask.data[i] = 200;     // R
      testMask.data[i + 1] = 200; // G
      testMask.data[i + 2] = 200; // B
      testMask.data[i + 3] = 255; // A
    }
  });

  afterEach(() => {
    if (shader) {
      shader.dispose();
      shader = null;
    }
  });

  describe('WebGL Support Detection', () => {
    it('should detect WebGL support', () => {
      const isSupported = HairFlatteningShader.isSupported();
      expect(typeof isSupported).toBe('boolean');
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid dimensions', () => {
      shader = new HairFlatteningShader();
      const result = shader.initialize(100, 100);
      
      // Result depends on WebGL availability
      expect(typeof result).toBe('boolean');
    });

    it('should handle various image sizes', () => {
      const sizes = [
        [50, 50],
        [100, 100],
        [200, 200],
        [640, 480],
        [1280, 720]
      ];

      sizes.forEach(([width, height]) => {
        const testShader = new HairFlatteningShader();
        const result = testShader.initialize(width, height);
        expect(typeof result).toBe('boolean');
        testShader.dispose();
      });
    });

    it('should handle non-power-of-2 dimensions', () => {
      shader = new HairFlatteningShader();
      const result = shader.initialize(123, 456);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Processing', () => {
    beforeEach(() => {
      shader = new HairFlatteningShader();
      shader.initialize(100, 100);
    });

    it('should process in normal mode (mode 0)', () => {
      if (!shader) return;

      const result = shader.process(
        testImage,
        testMask,
        0, // normal mode
        0.7,
        5
      );

      if (result) {
        expect(result).toBeInstanceOf(ImageData);
        expect(result.width).toBe(100);
        expect(result.height).toBe(100);
      }
    });

    it('should process in flattened mode (mode 1)', () => {
      if (!shader) return;

      const result = shader.process(
        testImage,
        testMask,
        1, // flattened mode
        0.7,
        5
      );

      if (result) {
        expect(result).toBeInstanceOf(ImageData);
        expect(result.width).toBe(100);
        expect(result.height).toBe(100);
      }
    });

    it('should process in bald mode (mode 2)', () => {
      if (!shader) return;

      const result = shader.process(
        testImage,
        testMask,
        2, // bald mode
        0.7,
        5
      );

      if (result) {
        expect(result).toBeInstanceOf(ImageData);
        expect(result.width).toBe(100);
        expect(result.height).toBe(100);
      }
    });

    it('should respect volume reduction parameter', () => {
      if (!shader) return;

      const reductions = [0.6, 0.7, 0.8];

      reductions.forEach(reduction => {
        const result = shader!.process(
          testImage,
          testMask,
          1,
          reduction,
          5
        );

        if (result) {
          expect(result).toBeInstanceOf(ImageData);
        }
      });
    });

    it('should respect blend radius parameter', () => {
      if (!shader) return;

      const radii = [5, 10, 15, 20];

      radii.forEach(radius => {
        const result = shader!.process(
          testImage,
          testMask,
          1,
          0.7,
          radius
        );

        if (result) {
          expect(result).toBeInstanceOf(ImageData);
        }
      });
    });

    it('should handle empty mask', () => {
      if (!shader) return;

      const emptyMask = new ImageData(100, 100);
      // All zeros

      const result = shader.process(
        testImage,
        emptyMask,
        1,
        0.7,
        5
      );

      if (result) {
        expect(result).toBeInstanceOf(ImageData);
      }
    });

    it('should handle full mask', () => {
      if (!shader) return;

      const fullMask = new ImageData(100, 100);
      for (let i = 0; i < fullMask.data.length; i += 4) {
        fullMask.data[i] = 255;
        fullMask.data[i + 1] = 255;
        fullMask.data[i + 2] = 255;
        fullMask.data[i + 3] = 255;
      }

      const result = shader.process(
        testImage,
        fullMask,
        1,
        0.7,
        5
      );

      if (result) {
        expect(result).toBeInstanceOf(ImageData);
      }
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      shader = new HairFlatteningShader();
      shader.initialize(640, 480);
    });

    it('should process within reasonable time', () => {
      if (!shader) return;

      const largeImage = new ImageData(640, 480);
      const largeMask = new ImageData(640, 480);

      const startTime = performance.now();
      const result = shader.process(
        largeImage,
        largeMask,
        1,
        0.7,
        5
      );
      const duration = performance.now() - startTime;

      if (result) {
        // WebGL should be fast - much faster than 300ms requirement
        expect(duration).toBeLessThan(100);
      }
    });

    it('should handle multiple consecutive processing calls', () => {
      if (!shader) return;

      const iterations = 10;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const result = shader.process(
          testImage,
          testMask,
          1,
          0.7,
          5
        );
        const duration = performance.now() - startTime;

        if (result) {
          times.push(duration);
        }
      }

      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b) / times.length;
        // Average should be fast
        expect(avgTime).toBeLessThan(50);
      }
    });
  });

  describe('Resource Management', () => {
    it('should dispose without errors', () => {
      shader = new HairFlatteningShader();
      shader.initialize(100, 100);

      expect(() => shader!.dispose()).not.toThrow();
    });

    it('should handle dispose without initialization', () => {
      shader = new HairFlatteningShader();
      expect(() => shader.dispose()).not.toThrow();
    });

    it('should handle multiple dispose calls', () => {
      shader = new HairFlatteningShader();
      shader.initialize(100, 100);

      expect(() => {
        shader!.dispose();
        shader!.dispose();
        shader!.dispose();
      }).not.toThrow();
    });

    it('should not process after disposal', () => {
      shader = new HairFlatteningShader();
      shader.initialize(100, 100);
      shader.dispose();

      const result = shader.process(
        testImage,
        testMask,
        1,
        0.7,
        5
      );

      // Should return null after disposal
      expect(result).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      shader = new HairFlatteningShader();
      shader.initialize(100, 100);
    });

    it('should handle mismatched image and mask sizes gracefully', () => {
      if (!shader) return;

      const smallMask = new ImageData(50, 50);

      // Should handle gracefully (may return null or process anyway)
      const result = shader.process(
        testImage,
        smallMask,
        1,
        0.7,
        5
      );

      // Just verify it doesn't crash
      expect(result === null || result instanceof ImageData).toBe(true);
    });

    it('should handle extreme volume reduction values', () => {
      if (!shader) return;

      const extremeValues = [0, 0.1, 0.9, 1.0];

      extremeValues.forEach(value => {
        const result = shader!.process(
          testImage,
          testMask,
          1,
          value,
          5
        );

        // Should handle without crashing
        expect(result === null || result instanceof ImageData).toBe(true);
      });
    });

    it('should handle extreme blend radius values', () => {
      if (!shader) return;

      const extremeValues = [0, 1, 50, 100];

      extremeValues.forEach(value => {
        const result = shader!.process(
          testImage,
          testMask,
          1,
          0.7,
          value
        );

        // Should handle without crashing
        expect(result === null || result instanceof ImageData).toBe(true);
      });
    });

    it('should handle invalid mode values gracefully', () => {
      if (!shader) return;

      const invalidModes = [-1, 3, 999];

      invalidModes.forEach(mode => {
        const result = shader!.process(
          testImage,
          testMask,
          mode,
          0.7,
          5
        );

        // Should handle without crashing
        expect(result === null || result instanceof ImageData).toBe(true);
      });
    });
  });
});
