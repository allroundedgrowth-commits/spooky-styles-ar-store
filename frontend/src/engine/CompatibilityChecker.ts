/**
 * CompatibilityChecker
 * 
 * Checks browser and device compatibility for hair flattening features.
 * Verifies support for:
 * - WebGL (required for shader-based processing)
 * - Camera access (required for AR try-on)
 * - TensorFlow.js (required for hair segmentation)
 * - Device performance (warns about low-end devices)
 * 
 * Provides clear messages for missing features and fallback to standard AR
 * when compatibility issues are detected.
 * 
 * Requirements: 1.1, 1.5
 */

export interface CompatibilityResult {
  isCompatible: boolean;
  features: {
    webgl: boolean;
    camera: boolean;
    tensorflowjs: boolean;
  };
  warnings: string[];
  errors: string[];
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  isLowEnd: boolean;
  isMobile: boolean;
  browser: string;
  os: string;
  gpuTier?: 'high' | 'medium' | 'low';
}

export class CompatibilityChecker {
  private cachedResult: CompatibilityResult | null = null;

  /**
   * Perform comprehensive compatibility check
   * Checks all required features and device capabilities
   * 
   * @returns CompatibilityResult with detailed information
   */
  async checkCompatibility(): Promise<CompatibilityResult> {
    // Return cached result if available
    if (this.cachedResult) {
      return this.cachedResult;
    }

    const warnings: string[] = [];
    const errors: string[] = [];

    // Check WebGL support
    const webglSupported = this.checkWebGLSupport();
    if (!webglSupported) {
      errors.push('WebGL is not supported in your browser. Hair flattening requires WebGL for optimal performance.');
    }

    // Check camera access
    const cameraSupported = await this.checkCameraAccess();
    if (!cameraSupported) {
      errors.push('Camera access is not available. Please grant camera permissions to use AR try-on.');
    }

    // Check TensorFlow.js compatibility
    const tensorflowSupported = await this.checkTensorFlowJS();
    if (!tensorflowSupported) {
      errors.push('TensorFlow.js is not compatible with your browser. Hair detection will not be available.');
    }

    // Get device information
    const deviceInfo = this.detectDevice();

    // Add warnings for low-end devices
    if (deviceInfo.isLowEnd) {
      warnings.push('Your device may experience reduced performance. Consider using a more powerful device for the best experience.');
    }

    if (deviceInfo.gpuTier === 'low') {
      warnings.push('Limited GPU capabilities detected. Hair flattening may run at reduced quality.');
    }

    // Determine overall compatibility
    const isCompatible = webglSupported && cameraSupported && tensorflowSupported;

    this.cachedResult = {
      isCompatible,
      features: {
        webgl: webglSupported,
        camera: cameraSupported,
        tensorflowjs: tensorflowSupported
      },
      warnings,
      errors,
      deviceInfo
    };

    return this.cachedResult;
  }

  /**
   * Check if WebGL is supported
   * Tests both WebGL 1.0 and WebGL 2.0 contexts
   * 
   * @returns true if WebGL is supported, false otherwise
   */
  checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      
      // Try WebGL 2.0 first
      const gl2 = canvas.getContext('webgl2');
      if (gl2) {
        return true;
      }

      // Fall back to WebGL 1.0
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('[CompatibilityChecker] WebGL check failed:', error);
      return false;
    }
  }

  /**
   * Check if camera access is available
   * Tests getUserMedia API availability
   * 
   * @returns Promise<boolean> true if camera is available
   */
  async checkCameraAccess(): Promise<boolean> {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      // Try to enumerate devices to check for camera
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');

      return hasCamera;
    } catch (error) {
      console.error('[CompatibilityChecker] Camera check failed:', error);
      return false;
    }
  }

  /**
   * Check TensorFlow.js compatibility
   * Tests if TensorFlow.js can be loaded and initialized
   * 
   * @returns Promise<boolean> true if TensorFlow.js is compatible
   */
  async checkTensorFlowJS(): Promise<boolean> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return false;
      }

      // Check for WebAssembly support (required by TensorFlow.js)
      if (typeof WebAssembly === 'undefined') {
        return false;
      }

      // Check for required browser APIs
      const hasRequiredAPIs = 
        typeof fetch !== 'undefined' &&
        typeof Promise !== 'undefined' &&
        typeof ArrayBuffer !== 'undefined';

      if (!hasRequiredAPIs) {
        return false;
      }

      // TensorFlow.js requires WebGL or CPU backend
      // We already checked WebGL, so if that's available, TF.js should work
      const webglSupported = this.checkWebGLSupport();
      
      return webglSupported;
    } catch (error) {
      console.error('[CompatibilityChecker] TensorFlow.js check failed:', error);
      return false;
    }
  }

  /**
   * Detect device type and capabilities
   * Identifies mobile devices, browser, OS, and performance tier
   * 
   * @returns DeviceInfo object
   */
  detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detect mobile
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    // Detect browser
    let browser = 'unknown';
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
      browser = 'chrome';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      browser = 'safari';
    } else if (userAgent.includes('firefox')) {
      browser = 'firefox';
    } else if (userAgent.includes('edge')) {
      browser = 'edge';
    }

    // Detect OS
    let os = 'unknown';
    if (userAgent.includes('windows')) {
      os = 'windows';
    } else if (userAgent.includes('mac')) {
      os = 'macos';
    } else if (userAgent.includes('linux')) {
      os = 'linux';
    } else if (userAgent.includes('android')) {
      os = 'android';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      os = 'ios';
    }

    // Detect GPU tier
    const gpuTier = this.detectGPUTier();

    // Determine if device is low-end
    const isLowEnd = this.isLowEndDevice(isMobile, gpuTier);

    return {
      isLowEnd,
      isMobile,
      browser,
      os,
      gpuTier
    };
  }

  /**
   * Detect GPU performance tier
   * Uses WebGL renderer info to estimate GPU capabilities
   * 
   * @returns GPU tier: 'high', 'medium', or 'low'
   */
  private detectGPUTier(): 'high' | 'medium' | 'low' {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      
      if (!gl) {
        return 'low';
      }

      // Get renderer info
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string).toLowerCase();
        
        // High-end GPUs
        if (
          renderer.includes('nvidia') ||
          renderer.includes('geforce') ||
          renderer.includes('radeon') ||
          renderer.includes('amd') ||
          renderer.includes('apple m1') ||
          renderer.includes('apple m2')
        ) {
          return 'high';
        }

        // Low-end indicators
        if (
          renderer.includes('intel') ||
          renderer.includes('integrated') ||
          renderer.includes('mali') ||
          renderer.includes('adreno 3') ||
          renderer.includes('adreno 4')
        ) {
          return 'low';
        }
      }

      // Default to medium if we can't determine
      return 'medium';
    } catch (error) {
      console.error('[CompatibilityChecker] GPU tier detection failed:', error);
      return 'medium';
    }
  }

  /**
   * Determine if device is low-end based on various factors
   * 
   * @param isMobile - Whether device is mobile
   * @param gpuTier - GPU performance tier
   * @returns true if device is considered low-end
   */
  private isLowEndDevice(isMobile: boolean, gpuTier?: 'high' | 'medium' | 'low'): boolean {
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2;
    const hasLowCores = cores < 4;

    // Check memory (if available)
    const memory = (navigator as any).deviceMemory;
    const hasLowMemory = memory && memory < 4; // Less than 4GB

    // Low-end if:
    // - Mobile with low GPU tier
    // - Low CPU cores
    // - Low memory
    // - Low GPU tier on desktop
    return (
      (isMobile && gpuTier === 'low') ||
      hasLowCores ||
      hasLowMemory ||
      (!isMobile && gpuTier === 'low')
    );
  }

  /**
   * Get user-friendly compatibility message
   * Provides clear guidance based on compatibility check results
   * 
   * @param result - CompatibilityResult from checkCompatibility
   * @returns User-friendly message string
   */
  getCompatibilityMessage(result: CompatibilityResult): string {
    if (result.isCompatible && result.warnings.length === 0) {
      return 'Your device is fully compatible with hair flattening features.';
    }

    if (!result.isCompatible) {
      const missingFeatures: string[] = [];
      
      if (!result.features.webgl) {
        missingFeatures.push('WebGL');
      }
      if (!result.features.camera) {
        missingFeatures.push('camera access');
      }
      if (!result.features.tensorflowjs) {
        missingFeatures.push('TensorFlow.js support');
      }

      return `Hair flattening is not available. Missing: ${missingFeatures.join(', ')}. You can still use standard AR try-on.`;
    }

    if (result.warnings.length > 0) {
      return result.warnings[0]; // Return first warning
    }

    return 'Compatibility check completed.';
  }

  /**
   * Check if should fallback to standard AR
   * Determines if hair flattening should be disabled
   * 
   * @param result - CompatibilityResult from checkCompatibility
   * @returns true if should use standard AR, false if can use hair flattening
   */
  shouldFallbackToStandardAR(result: CompatibilityResult): boolean {
    return !result.isCompatible;
  }

  /**
   * Get detailed compatibility report for debugging
   * 
   * @returns Formatted string with all compatibility information
   */
  async getDetailedReport(): Promise<string> {
    const result = await this.checkCompatibility();
    
    const lines: string[] = [
      '=== Hair Flattening Compatibility Report ===',
      '',
      `Overall Compatible: ${result.isCompatible ? 'YES' : 'NO'}`,
      '',
      'Features:',
      `  WebGL: ${result.features.webgl ? '✓' : '✗'}`,
      `  Camera: ${result.features.camera ? '✓' : '✗'}`,
      `  TensorFlow.js: ${result.features.tensorflowjs ? '✓' : '✗'}`,
      '',
      'Device Info:',
      `  Mobile: ${result.deviceInfo.isMobile ? 'Yes' : 'No'}`,
      `  Browser: ${result.deviceInfo.browser}`,
      `  OS: ${result.deviceInfo.os}`,
      `  GPU Tier: ${result.deviceInfo.gpuTier || 'unknown'}`,
      `  Low-End: ${result.deviceInfo.isLowEnd ? 'Yes' : 'No'}`,
      ''
    ];

    if (result.errors.length > 0) {
      lines.push('Errors:');
      result.errors.forEach(error => lines.push(`  - ${error}`));
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('Warnings:');
      result.warnings.forEach(warning => lines.push(`  - ${warning}`));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Clear cached compatibility result
   * Forces re-check on next call to checkCompatibility
   */
  clearCache(): void {
    this.cachedResult = null;
  }

  /**
   * Quick check if hair flattening is available
   * Simplified version that returns boolean
   * 
   * @returns Promise<boolean> true if hair flattening can be used
   */
  async isHairFlatteningAvailable(): Promise<boolean> {
    const result = await this.checkCompatibility();
    return result.isCompatible;
  }

  /**
   * Get performance warnings for display
   * Returns array of warnings that should be shown to user
   * 
   * @returns Promise<string[]> array of warning messages
   */
  async getPerformanceWarnings(): Promise<string[]> {
    const result = await this.checkCompatibility();
    return result.warnings;
  }
}

export default CompatibilityChecker;
