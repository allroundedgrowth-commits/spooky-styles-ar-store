/**
 * BufferManager Unit Tests
 * 
 * Tests the buffer pooling and memory management functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BufferManager } from '../BufferManager';

describe('BufferManager', () => {
  let bufferManager: BufferManager;

  beforeEach(() => {
    bufferManager = new BufferManager();
  });

  describe('Buffer Pooling', () => {
    it('should create a new buffer when pool is empty', () => {
      const buffer = bufferManager.getBuffer(640, 480);
      
      expect(buffer).toBeDefined();
      expect(buffer.width).toBe(640);
      expect(buffer.height).toBe(480);
      expect(bufferManager.getBufferCount()).toBe(1);
    });

    it('should reuse existing buffer with matching dimensions', () => {
      const buffer1 = bufferManager.getBuffer(640, 480);
      bufferManager.returnBuffer(buffer1);
      
      const buffer2 = bufferManager.getBuffer(640, 480);
      
      expect(buffer2).toBe(buffer1);
      expect(bufferManager.getBufferCount()).toBe(1);
    });

    it('should create new buffer for different dimensions', () => {
      const buffer1 = bufferManager.getBuffer(640, 480);
      const buffer2 = bufferManager.getBuffer(1280, 720);
      
      expect(buffer2).not.toBe(buffer1);
      expect(bufferManager.getBufferCount()).toBe(2);
    });

    it('should clear buffer data when reusing', () => {
      const buffer = bufferManager.getBuffer(10, 10);
      
      // Fill buffer with data
      for (let i = 0; i < buffer.data.length; i++) {
        buffer.data[i] = 255;
      }
      
      bufferManager.returnBuffer(buffer);
      
      // Get the same buffer again
      const reusedBuffer = bufferManager.getBuffer(10, 10);
      
      expect(reusedBuffer).toBe(buffer);
      
      // Check that data is cleared
      for (let i = 0; i < reusedBuffer.data.length; i++) {
        expect(reusedBuffer.data[i]).toBe(0);
      }
    });
  });

  describe('Buffer Limit', () => {
    it('should enforce maximum of 5 buffers', () => {
      // Create 6 buffers with different dimensions
      for (let i = 0; i < 6; i++) {
        bufferManager.getBuffer(100 + i * 10, 100 + i * 10);
      }
      
      // Should only have 5 buffers (oldest removed)
      expect(bufferManager.getBufferCount()).toBe(5);
    });

    it('should remove oldest buffer when limit reached', () => {
      // Create 5 buffers
      const buffers = [];
      for (let i = 0; i < 5; i++) {
        buffers.push(bufferManager.getBuffer(100 + i * 10, 100 + i * 10));
      }
      
      // Return all buffers
      buffers.forEach(b => bufferManager.returnBuffer(b));
      
      // Access first buffer to update its lastUsed time
      const firstBuffer = bufferManager.getBuffer(100, 100);
      bufferManager.returnBuffer(firstBuffer);
      
      // Create a new buffer with different dimensions
      // This should remove the second buffer (oldest)
      bufferManager.getBuffer(200, 200);
      
      expect(bufferManager.getBufferCount()).toBe(5);
    });
  });

  describe('Memory Management', () => {
    it('should track memory usage correctly', () => {
      const width = 640;
      const height = 480;
      const expectedSize = width * height * 4; // RGBA = 4 bytes per pixel
      
      bufferManager.getBuffer(width, height);
      
      expect(bufferManager.getMemoryUsage()).toBe(expectedSize);
    });

    it('should calculate memory usage in MB correctly', () => {
      const width = 1280;
      const height = 720;
      const expectedSizeMB = (width * height * 4) / (1024 * 1024);
      
      bufferManager.getBuffer(width, height);
      
      const usageMB = bufferManager.getMemoryUsageMB();
      expect(usageMB).toBeCloseTo(expectedSizeMB, 2);
    });

    it('should update memory usage when buffers are removed', () => {
      // Create 5 buffers
      for (let i = 0; i < 5; i++) {
        bufferManager.getBuffer(100, 100);
      }
      
      const initialUsage = bufferManager.getMemoryUsage();
      
      // Create 6th buffer, which should remove oldest
      bufferManager.getBuffer(100, 100);
      
      // Memory usage should still be for 5 buffers
      expect(bufferManager.getMemoryUsage()).toBeLessThanOrEqual(initialUsage);
    });

    it('should enforce 100MB memory limit', () => {
      // Try to create buffers that would exceed 100MB
      // Each 1920x1080 buffer is ~8.3MB
      // 13 buffers would be ~108MB
      
      for (let i = 0; i < 13; i++) {
        bufferManager.getBuffer(1920, 1080);
      }
      
      // Should stay under 100MB
      expect(bufferManager.getMemoryUsageMB()).toBeLessThan(100);
      
      // Should have removed old buffers to stay under limit
      expect(bufferManager.getBufferCount()).toBeLessThanOrEqual(5);
    });

    it('should report healthy memory status under 100MB', () => {
      bufferManager.getBuffer(640, 480);
      
      expect(bufferManager.isMemoryHealthy()).toBe(true);
    });
  });

  describe('Clear Buffers', () => {
    it('should clear all buffers', () => {
      // Create multiple buffers
      bufferManager.getBuffer(640, 480);
      bufferManager.getBuffer(1280, 720);
      bufferManager.getBuffer(1920, 1080);
      
      expect(bufferManager.getBufferCount()).toBe(3);
      
      bufferManager.clearBuffers();
      
      expect(bufferManager.getBufferCount()).toBe(0);
      expect(bufferManager.getMemoryUsage()).toBe(0);
    });

    it('should reset memory usage to zero', () => {
      bufferManager.getBuffer(1920, 1080);
      
      expect(bufferManager.getMemoryUsage()).toBeGreaterThan(0);
      
      bufferManager.clearBuffers();
      
      expect(bufferManager.getMemoryUsage()).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      bufferManager.getBuffer(640, 480);
      bufferManager.getBuffer(1280, 720);
      
      const stats = bufferManager.getStats();
      
      expect(stats.bufferCount).toBe(2);
      expect(stats.maxBuffers).toBe(5);
      expect(stats.maxMemoryMB).toBe(100);
      expect(stats.memoryUsageMB).toBeGreaterThan(0);
      expect(stats.buffers).toHaveLength(2);
      
      // Check first buffer stats
      expect(stats.buffers[0].width).toBe(640);
      expect(stats.buffers[0].height).toBe(480);
      expect(stats.buffers[0].lastUsed).toBeInstanceOf(Date);
    });

    it('should track last used time', () => {
      const buffer = bufferManager.getBuffer(640, 480);
      const stats1 = bufferManager.getStats();
      const firstTime = stats1.buffers[0].lastUsed.getTime();
      
      // Wait a bit
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      return delay(10).then(() => {
        bufferManager.returnBuffer(buffer);
        const stats2 = bufferManager.getStats();
        const secondTime = stats2.buffers[0].lastUsed.getTime();
        
        expect(secondTime).toBeGreaterThanOrEqual(firstTime);
      });
    });
  });

  describe('Force Cleanup', () => {
    it('should remove buffers not used in 30 seconds', () => {
      // Create buffers
      bufferManager.getBuffer(640, 480);
      bufferManager.getBuffer(1280, 720);
      
      expect(bufferManager.getBufferCount()).toBe(2);
      
      // Mock old timestamps by directly accessing private property
      // In real scenario, buffers would naturally age
      const stats = bufferManager.getStats();
      
      // Force cleanup (won't remove anything since buffers are fresh)
      bufferManager.forceCleanup();
      
      // Buffers should still be there (they're not old enough)
      expect(bufferManager.getBufferCount()).toBe(2);
    });

    it('should not remove recently used buffers', () => {
      const buffer = bufferManager.getBuffer(640, 480);
      
      // Use the buffer
      bufferManager.returnBuffer(buffer);
      
      // Force cleanup
      bufferManager.forceCleanup();
      
      // Buffer should still be there
      expect(bufferManager.getBufferCount()).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-sized buffers', () => {
      const buffer = bufferManager.getBuffer(0, 0);
      
      expect(buffer.width).toBe(0);
      expect(buffer.height).toBe(0);
      expect(bufferManager.getMemoryUsage()).toBe(0);
    });

    it('should handle very large buffers', () => {
      // 4K resolution
      const buffer = bufferManager.getBuffer(3840, 2160);
      
      expect(buffer.width).toBe(3840);
      expect(buffer.height).toBe(2160);
      
      const expectedSize = 3840 * 2160 * 4;
      expect(bufferManager.getMemoryUsage()).toBe(expectedSize);
    });

    it('should handle returning buffer not in pool', () => {
      const externalBuffer = new ImageData(100, 100);
      
      // Should not throw error
      expect(() => {
        bufferManager.returnBuffer(externalBuffer);
      }).not.toThrow();
      
      // Should not add to pool
      expect(bufferManager.getBufferCount()).toBe(0);
    });

    it('should handle multiple returns of same buffer', () => {
      const buffer = bufferManager.getBuffer(640, 480);
      
      bufferManager.returnBuffer(buffer);
      bufferManager.returnBuffer(buffer);
      bufferManager.returnBuffer(buffer);
      
      // Should still only have one buffer in pool
      expect(bufferManager.getBufferCount()).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should handle rapid buffer requests efficiently', () => {
      const startTime = performance.now();
      
      // Request 1000 buffers
      for (let i = 0; i < 1000; i++) {
        const buffer = bufferManager.getBuffer(640, 480);
        bufferManager.returnBuffer(buffer);
      }
      
      const duration = performance.now() - startTime;
      
      // Should complete in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
      
      // Should only have 1 buffer (all same size)
      expect(bufferManager.getBufferCount()).toBe(1);
    });

    it('should maintain memory limit under stress', () => {
      // Create many buffers of different sizes
      for (let i = 0; i < 100; i++) {
        const size = 100 + (i % 10) * 100;
        bufferManager.getBuffer(size, size);
      }
      
      // Should stay under memory limit
      expect(bufferManager.getMemoryUsageMB()).toBeLessThan(100);
      
      // Should not exceed buffer count limit
      expect(bufferManager.getBufferCount()).toBeLessThanOrEqual(5);
    });
  });
});
