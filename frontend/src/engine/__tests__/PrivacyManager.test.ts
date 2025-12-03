import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrivacyManager, ModelIntegrityConfig } from '../PrivacyManager';

describe('PrivacyManager', () => {
  let privacyManager: PrivacyManager;

  beforeEach(() => {
    privacyManager = new PrivacyManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    privacyManager.dispose();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Session Management', () => {
    it('should start a session', () => {
      privacyManager.startSession();
      
      expect(privacyManager.isSessionActive()).toBe(true);
      
      const metrics = privacyManager.getMetrics();
      expect(metrics.sessionActive).toBe(true);
      expect(metrics.framesProcessed).toBe(0);
      expect(metrics.framesCleared).toBe(0);
    });

    it('should end a session and clear data', () => {
      privacyManager.startSession();
      
      // Add some frames
      const frame = createMockImageData(640, 480);
      privacyManager.trackCameraFrame(frame);
      
      expect(privacyManager.isSessionActive()).toBe(true);
      
      // End session
      privacyManager.handleSessionEnd();
      
      expect(privacyManager.isSessionActive()).toBe(false);
      expect(privacyManager.getMemoryUsage()).toBe(0);
    });

    it('should handle session end when no session is active', () => {
      // Should not throw
      expect(() => privacyManager.handleSessionEnd()).not.toThrow();
    });
  });

  describe('Frame Tracking', () => {
    beforeEach(() => {
      privacyManager.startSession();
    });

    it('should track camera frames', () => {
      const frame = createMockImageData(640, 480);
      
      privacyManager.trackCameraFrame(frame);
      
      const metrics = privacyManager.getMetrics();
      expect(metrics.framesProcessed).toBe(1);
      expect(privacyManager.getMemoryUsage()).toBeGreaterThan(0);
    });

    it('should track processed frames', () => {
      const frame = createMockImageData(640, 480);
      
      privacyManager.trackProcessedFrame(frame);
      
      expect(privacyManager.getMemoryUsage()).toBeGreaterThan(0);
    });

    it('should enforce frame retention limits', () => {
      // Add more than MAX_FRAME_RETENTION frames
      for (let i = 0; i < 15; i++) {
        const frame = createMockImageData(640, 480);
        privacyManager.trackCameraFrame(frame);
      }
      
      const metrics = privacyManager.getMetrics();
      expect(metrics.framesProcessed).toBe(15);
      expect(metrics.framesCleared).toBeGreaterThan(0); // Some frames should be cleared
    });

    it('should not track frames outside active session', () => {
      privacyManager.handleSessionEnd();
      
      const frame = createMockImageData(640, 480);
      privacyManager.trackCameraFrame(frame);
      
      // Should not increase memory usage
      expect(privacyManager.getMemoryUsage()).toBe(0);
    });
  });

  describe('Data Cleanup', () => {
    beforeEach(() => {
      privacyManager.startSession();
    });

    it('should clear all camera data', () => {
      // Add frames
      for (let i = 0; i < 5; i++) {
        privacyManager.trackCameraFrame(createMockImageData(640, 480));
        privacyManager.trackProcessedFrame(createMockImageData(640, 480));
      }
      
      expect(privacyManager.getMemoryUsage()).toBeGreaterThan(0);
      
      // Clear data
      privacyManager.clearCameraData();
      
      expect(privacyManager.getMemoryUsage()).toBe(0);
      
      const metrics = privacyManager.getMetrics();
      expect(metrics.framesCleared).toBe(10); // 5 camera + 5 processed
      expect(metrics.memoryFreed).toBeGreaterThan(0);
    });

    it('should perform periodic cleanup', () => {
      // Add many frames
      for (let i = 0; i < 10; i++) {
        privacyManager.trackCameraFrame(createMockImageData(640, 480));
      }
      
      const beforeCleanup = privacyManager.getMemoryUsage();
      
      // Advance time to trigger cleanup
      vi.advanceTimersByTime(30000); // 30 seconds
      
      const afterCleanup = privacyManager.getMemoryUsage();
      
      // Memory should be reduced after cleanup
      expect(afterCleanup).toBeLessThan(beforeCleanup);
    });

    it('should stop periodic cleanup after session end', () => {
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
      
      privacyManager.handleSessionEnd();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    beforeEach(() => {
      privacyManager.startSession();
    });

    it('should calculate memory usage correctly', () => {
      const frame = createMockImageData(640, 480);
      const expectedSize = frame.data.length + 8; // data + width/height
      
      privacyManager.trackCameraFrame(frame);
      
      const memoryUsage = privacyManager.getMemoryUsage();
      expect(memoryUsage).toBe(expectedSize);
    });

    it('should track memory freed', () => {
      // Add frames
      for (let i = 0; i < 5; i++) {
        privacyManager.trackCameraFrame(createMockImageData(640, 480));
      }
      
      const beforeMetrics = privacyManager.getMetrics();
      expect(beforeMetrics.memoryFreed).toBe(0);
      
      // Clear data
      privacyManager.clearCameraData();
      
      const afterMetrics = privacyManager.getMetrics();
      expect(afterMetrics.memoryFreed).toBeGreaterThan(0);
    });
  });

  describe('Model Integrity Verification', () => {
    it('should verify model with valid checksum', async () => {
      // Mock fetch
      const mockData = new Uint8Array([1, 2, 3, 4, 5]);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob([mockData])),
      });

      // Mock crypto.subtle.digest
      const mockHash = new Uint8Array([0xab, 0xcd, 0xef]);
      global.crypto.subtle.digest = vi.fn().mockResolvedValue(mockHash.buffer);

      const config: ModelIntegrityConfig = {
        url: 'https://example.com/model.tflite',
        checksum: 'abcdef',
        algorithm: 'SHA-256',
      };

      const result = await privacyManager.verifyModelIntegrity(config);
      
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(config.url);
    });

    it('should fail verification with invalid checksum', async () => {
      // Mock fetch
      const mockData = new Uint8Array([1, 2, 3, 4, 5]);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob([mockData])),
      });

      // Mock crypto.subtle.digest
      const mockHash = new Uint8Array([0xab, 0xcd, 0xef]);
      global.crypto.subtle.digest = vi.fn().mockResolvedValue(mockHash.buffer);

      const config: ModelIntegrityConfig = {
        url: 'https://example.com/model.tflite',
        checksum: 'wronghash',
        algorithm: 'SHA-256',
      };

      const result = await privacyManager.verifyModelIntegrity(config);
      
      expect(result).toBe(false);
    });

    it('should handle fetch errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      const config: ModelIntegrityConfig = {
        url: 'https://example.com/model.tflite',
        checksum: 'abc123',
        algorithm: 'SHA-256',
      };

      const result = await privacyManager.verifyModelIntegrity(config);
      
      expect(result).toBe(false);
    });

    it('should handle SRI integrity (with warning)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob([new Uint8Array([1, 2, 3])])),
      });

      const config: ModelIntegrityConfig = {
        url: 'https://example.com/model.tflite',
        integrity: 'sha384-abc123',
      };

      const result = await privacyManager.verifyModelIntegrity(config);
      
      // Should return true but log warning
      expect(result).toBe(true);
    });

    it('should handle verification errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const config: ModelIntegrityConfig = {
        url: 'https://example.com/model.tflite',
        checksum: 'abc123',
        algorithm: 'SHA-256',
      };

      const result = await privacyManager.verifyModelIntegrity(config);
      
      expect(result).toBe(false);
    });
  });

  describe('Privacy Metrics', () => {
    it('should provide accurate metrics', () => {
      privacyManager.startSession();
      
      // Process some frames
      for (let i = 0; i < 3; i++) {
        privacyManager.trackCameraFrame(createMockImageData(640, 480));
      }
      
      const metrics = privacyManager.getMetrics();
      
      expect(metrics.framesProcessed).toBe(3);
      expect(metrics.sessionActive).toBe(true);
      expect(metrics.lastCleanup).toBeGreaterThan(0);
    });

    it('should update metrics on cleanup', () => {
      privacyManager.startSession();
      
      // Add frames
      for (let i = 0; i < 5; i++) {
        privacyManager.trackCameraFrame(createMockImageData(640, 480));
      }
      
      const beforeMetrics = privacyManager.getMetrics();
      
      // Clear data
      privacyManager.clearCameraData();
      
      const afterMetrics = privacyManager.getMetrics();
      
      expect(afterMetrics.framesCleared).toBeGreaterThan(beforeMetrics.framesCleared);
      expect(afterMetrics.memoryFreed).toBeGreaterThan(beforeMetrics.memoryFreed);
      expect(afterMetrics.lastCleanup).toBeGreaterThan(beforeMetrics.lastCleanup);
    });
  });

  describe('Disposal', () => {
    it('should dispose and clean up resources', () => {
      privacyManager.startSession();
      
      // Add frames
      privacyManager.trackCameraFrame(createMockImageData(640, 480));
      
      expect(privacyManager.isSessionActive()).toBe(true);
      
      // Dispose
      privacyManager.dispose();
      
      expect(privacyManager.isSessionActive()).toBe(false);
      expect(privacyManager.getMemoryUsage()).toBe(0);
    });

    it('should handle disposal when no session is active', () => {
      expect(() => privacyManager.dispose()).not.toThrow();
    });
  });
});

// Helper function to create mock ImageData
function createMockImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  return new ImageData(data, width, height);
}
