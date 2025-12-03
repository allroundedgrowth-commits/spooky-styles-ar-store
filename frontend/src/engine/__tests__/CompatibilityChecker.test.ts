/**
 * CompatibilityChecker Tests
 * 
 * Tests browser and device compatibility checking functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompatibilityChecker } from '../CompatibilityChecker';

describe('CompatibilityChecker', () => {
  let checker: CompatibilityChecker;

  beforeEach(() => {
    checker = new CompatibilityChecker();
    checker.clearCache(); // Clear cache before each test
  });

  describe('checkWebGLSupport', () => {
    it('should detect WebGL support', () => {
      const supported = checker.checkWebGLSupport();
      
      // In test environment, WebGL may not be available
      // Just verify it returns a boolean
      expect(typeof supported).toBe('boolean');
    });

    it('should return false when canvas creation fails', () => {
      // Mock document.createElement to throw error
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn(() => {
        throw new Error('Canvas creation failed');
      });

      const supported = checker.checkWebGLSupport();
      expect(supported).toBe(false);

      // Restore original
      document.createElement = originalCreateElement;
    });
  });

  describe('checkCameraAccess', () => {
    it('should check for getUserMedia availability', async () => {
      const hasCamera = await checker.checkCameraAccess();
      
      // In test environment, camera may not be available
      expect(typeof hasCamera).toBe('boolean');
    });

    it('should return false when getUserMedia is not available', async () => {
      // Mock navigator.mediaDevices
      const originalMediaDevices = navigator.mediaDevices;
      Object.defineProperty(navigator, 'mediaDevices', {
        value: undefined,
        configurable: true
      });

      const hasCamera = await checker.checkCameraAccess();
      expect(hasCamera).toBe(false);

      // Restore original
      Object.defineProperty(navigator, 'mediaDevices', {
        value: originalMediaDevices,
        configurable: true
      });
    });
  });

  describe('checkTensorFlowJS', () => {
    it('should check TensorFlow.js compatibility', async () => {
      const supported = await checker.checkTensorFlowJS();
      
      // Should return boolean
      expect(typeof supported).toBe('boolean');
    });

    it('should return false when WebAssembly is not available', async () => {
      // Mock WebAssembly
      const originalWebAssembly = (global as any).WebAssembly;
      (global as any).WebAssembly = undefined;

      const supported = await checker.checkTensorFlowJS();
      expect(supported).toBe(false);

      // Restore original
      (global as any).WebAssembly = originalWebAssembly;
    });
  });

  describe('detectDevice', () => {
    it('should detect device information', () => {
      const deviceInfo = checker.detectDevice();
      
      expect(deviceInfo).toHaveProperty('isMobile');
      expect(deviceInfo).toHaveProperty('browser');
      expect(deviceInfo).toHaveProperty('os');
      expect(deviceInfo).toHaveProperty('isLowEnd');
      
      expect(typeof deviceInfo.isMobile).toBe('boolean');
      expect(typeof deviceInfo.browser).toBe('string');
      expect(typeof deviceInfo.os).toBe('string');
      expect(typeof deviceInfo.isLowEnd).toBe('boolean');
    });

    it('should detect mobile devices', () => {
      // Mock user agent for mobile
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });

      const deviceInfo = checker.detectDevice();
      expect(deviceInfo.isMobile).toBe(true);

      // Restore original
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });

    it('should detect desktop devices', () => {
      // Mock user agent for desktop
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/90.0',
        configurable: true
      });

      const deviceInfo = checker.detectDevice();
      expect(deviceInfo.isMobile).toBe(false);

      // Restore original
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
  });

  describe('checkCompatibility', () => {
    it('should return compatibility result', async () => {
      const result = await checker.checkCompatibility();
      
      expect(result).toHaveProperty('isCompatible');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('deviceInfo');
      
      expect(typeof result.isCompatible).toBe('boolean');
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should cache compatibility result', async () => {
      const result1 = await checker.checkCompatibility();
      const result2 = await checker.checkCompatibility();
      
      // Should return same object (cached)
      expect(result1).toBe(result2);
    });

    it('should clear cache when requested', async () => {
      const result1 = await checker.checkCompatibility();
      checker.clearCache();
      const result2 = await checker.checkCompatibility();
      
      // Should return different objects (not cached)
      expect(result1).not.toBe(result2);
    });

    it('should mark as incompatible when WebGL is not supported', async () => {
      // Mock checkWebGLSupport to return false
      checker.checkWebGLSupport = vi.fn(() => false);
      
      const result = await checker.checkCompatibility();
      
      expect(result.isCompatible).toBe(false);
      expect(result.features.webgl).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should include warnings for low-end devices', async () => {
      // Mock detectDevice to return low-end device
      checker.detectDevice = vi.fn(() => ({
        isLowEnd: true,
        isMobile: true,
        browser: 'chrome',
        os: 'android',
        gpuTier: 'low'
      }));
      
      const result = await checker.checkCompatibility();
      
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('getCompatibilityMessage', () => {
    it('should return success message for compatible device', async () => {
      const result = await checker.checkCompatibility();
      
      // Mock as compatible
      result.isCompatible = true;
      result.warnings = [];
      
      const message = checker.getCompatibilityMessage(result);
      
      expect(message).toContain('compatible');
      expect(typeof message).toBe('string');
    });

    it('should return error message for incompatible device', async () => {
      const result = await checker.checkCompatibility();
      
      // Mock as incompatible
      result.isCompatible = false;
      result.features.webgl = false;
      
      const message = checker.getCompatibilityMessage(result);
      
      expect(message).toContain('not available');
      expect(message).toContain('WebGL');
    });

    it('should return warning message when compatible but with warnings', async () => {
      const result = await checker.checkCompatibility();
      
      // Mock as compatible with warnings
      result.isCompatible = true;
      result.warnings = ['Performance warning'];
      
      const message = checker.getCompatibilityMessage(result);
      
      expect(message).toBe('Performance warning');
    });
  });

  describe('shouldFallbackToStandardAR', () => {
    it('should return true for incompatible devices', async () => {
      const result = await checker.checkCompatibility();
      result.isCompatible = false;
      
      const shouldFallback = checker.shouldFallbackToStandardAR(result);
      
      expect(shouldFallback).toBe(true);
    });

    it('should return false for compatible devices', async () => {
      const result = await checker.checkCompatibility();
      result.isCompatible = true;
      
      const shouldFallback = checker.shouldFallbackToStandardAR(result);
      
      expect(shouldFallback).toBe(false);
    });
  });

  describe('isHairFlatteningAvailable', () => {
    it('should return boolean indicating availability', async () => {
      const available = await checker.isHairFlatteningAvailable();
      
      expect(typeof available).toBe('boolean');
    });
  });

  describe('getPerformanceWarnings', () => {
    it('should return array of warnings', async () => {
      const warnings = await checker.getPerformanceWarnings();
      
      expect(Array.isArray(warnings)).toBe(true);
    });

    it('should return warnings for low-end devices', async () => {
      // Mock detectDevice to return low-end device
      checker.detectDevice = vi.fn(() => ({
        isLowEnd: true,
        isMobile: true,
        browser: 'chrome',
        os: 'android',
        gpuTier: 'low'
      }));
      
      checker.clearCache();
      const warnings = await checker.getPerformanceWarnings();
      
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  describe('getDetailedReport', () => {
    it('should return formatted report string', async () => {
      const report = await checker.getDetailedReport();
      
      expect(typeof report).toBe('string');
      expect(report).toContain('Compatibility Report');
      expect(report).toContain('Features:');
      expect(report).toContain('Device Info:');
    });

    it('should include errors in report', async () => {
      // Mock as incompatible
      checker.checkWebGLSupport = vi.fn(() => false);
      checker.clearCache();
      
      const report = await checker.getDetailedReport();
      
      expect(report).toContain('Errors:');
    });

    it('should include warnings in report', async () => {
      // Mock low-end device
      checker.detectDevice = vi.fn(() => ({
        isLowEnd: true,
        isMobile: true,
        browser: 'chrome',
        os: 'android',
        gpuTier: 'low'
      }));
      
      checker.clearCache();
      const report = await checker.getDetailedReport();
      
      expect(report).toContain('Warnings:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing navigator properties gracefully', async () => {
      const originalHardwareConcurrency = navigator.hardwareConcurrency;
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: undefined,
        configurable: true
      });

      const deviceInfo = checker.detectDevice();
      
      // Should not throw error
      expect(deviceInfo).toBeDefined();

      // Restore original
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: originalHardwareConcurrency,
        configurable: true
      });
    });

    it('should handle errors during compatibility check', async () => {
      // Mock checkWebGLSupport to throw error
      checker.checkWebGLSupport = vi.fn(() => {
        throw new Error('Test error');
      });

      // Should not throw, should handle gracefully
      await expect(checker.checkCompatibility()).resolves.toBeDefined();
    });
  });
});
