import * as THREE from 'three';
import { WigLoader, LoadProgressCallback, LoadErrorCallback } from './WigLoader';
import { AccessoryLayer, AccessoryLayerInfo } from './AccessoryLayer';
import { FaceLandmarks, HeadPose } from '../types/faceTracking';

// Re-export AccessoryLayerInfo for convenience
export type { AccessoryLayerInfo };

/**
 * AR Try-On Engine
 * Manages Three.js scene, camera, renderer, and lighting for AR wig try-on
 */
export class ARTryOnEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private canvas: HTMLCanvasElement;
  private animationFrameId: number | null = null;
  private isInitialized = false;

  // Wig loader
  private wigLoader: WigLoader | null = null;

  // Accessory layer manager
  private accessoryLayer: AccessoryLayer | null = null;

  // FPS monitoring
  private fpsCallback?: (fps: number) => void;
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private currentFps = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.ambientLight = new THREE.AmbientLight();
    this.directionalLight = new THREE.DirectionalLight();
  }

  /**
   * Initialize the Three.js scene with camera, renderer, and lighting
   */
  public initializeScene(): void {
    if (this.isInitialized) {
      console.warn('AR Engine already initialized');
      return;
    }

    // Configure camera
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view
      this.canvas.clientWidth / this.canvas.clientHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    this.camera.position.z = 5;

    // Configure WebGL renderer with mobile-optimized settings
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true, // Transparent background for AR overlay
      antialias: true, // Smooth edges
      powerPreference: 'high-performance', // Optimize for performance
      precision: 'mediump', // Balance quality and performance for mobile
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Set up lighting for realistic wig rendering
    this.setupLighting();

    // Set scene background to transparent
    this.scene.background = null;

    // Initialize wig loader
    this.wigLoader = new WigLoader(this.scene);

    // Initialize accessory layer manager
    this.accessoryLayer = new AccessoryLayer(this.scene);

    this.isInitialized = true;
    console.log('AR Engine initialized successfully');
  }

  /**
   * Set up ambient and directional lighting for realistic rendering
   */
  private setupLighting(): void {
    // Ambient light provides base illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // Directional light simulates sunlight/main light source
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 7.5);
    this.directionalLight.castShadow = true;

    // Configure shadow properties for better quality
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;

    this.scene.add(this.directionalLight);
  }

  /**
   * Start the render loop
   */
  public startRendering(): void {
    if (!this.isInitialized) {
      throw new Error('AR Engine must be initialized before rendering');
    }

    if (this.animationFrameId !== null) {
      console.warn('Rendering already started');
      return;
    }

    this.lastFpsUpdate = performance.now();
    this.animate();
  }

  /**
   * Animation loop with FPS monitoring
   */
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Update FPS counter
    this.updateFPS();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Update FPS monitoring
   */
  private updateFPS(): void {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsUpdate;

    // Update FPS every second
    if (elapsed >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      if (this.fpsCallback) {
        this.fpsCallback(this.currentFps);
      }
    }
  }

  /**
   * Set callback for FPS updates
   */
  public onFPSUpdate(callback: (fps: number) => void): void {
    this.fpsCallback = callback;
  }

  /**
   * Get current FPS
   */
  public getCurrentFPS(): number {
    return this.currentFps;
  }

  /**
   * Handle window resize to maintain responsive canvas
   * Supports both portrait and landscape orientations
   */
  public handleResize(): void {
    if (!this.isInitialized) return;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // Update camera aspect ratio
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Adjust camera FOV based on orientation for better viewing
    const isPortrait = height > width;
    this.camera.fov = isPortrait ? 75 : 65;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(width, height);
    
    // Update pixel ratio (cap at 2x for performance)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Get current device orientation
   */
  public getOrientation(): 'portrait' | 'landscape' {
    return this.canvas.clientHeight > this.canvas.clientWidth ? 'portrait' : 'landscape';
  }

  /**
   * Update lighting based on ambient conditions with dynamic brightness adjustment
   * @param brightness - Brightness level (0-1)
   */
  public updateLighting(brightness: number): void {
    const clampedBrightness = Math.max(0, Math.min(1, brightness));
    
    // Adjust ambient light intensity (base illumination)
    this.ambientLight.intensity = 0.3 + (clampedBrightness * 0.5);
    
    // Adjust directional light intensity (main light source)
    this.directionalLight.intensity = 0.5 + (clampedBrightness * 0.6);
    
    // Adjust tone mapping exposure for overall brightness
    this.renderer.toneMappingExposure = 0.8 + (clampedBrightness * 0.4);
    
    // Apply dynamic brightness to wig materials
    this.applyDynamicBrightnessToWig(clampedBrightness);
  }

  /**
   * Apply dynamic brightness adjustment to wig materials
   * @param brightness - Brightness level (0-1)
   */
  private applyDynamicBrightnessToWig(brightness: number): void {
    const currentWig = this.getCurrentWig();
    if (!currentWig) return;

    currentWig.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              // Adjust emissive intensity for brightness compensation
              const emissiveIntensity = Math.max(0, (1 - brightness) * 0.15);
              mat.emissiveIntensity = emissiveIntensity;
              
              // Adjust roughness for better light response
              mat.roughness = 0.6 - (brightness * 0.2);
              
              // Adjust metalness slightly for highlight response
              mat.metalness = Math.min(0.3, mat.metalness + (brightness * 0.1));
              
              mat.needsUpdate = true;
            }
          });
        }
      }
    });
  }

  /**
   * Update directional light position based on detected light source
   * @param lightDirection - Direction vector of the light source
   */
  public updateLightDirection(lightDirection: THREE.Vector3): void {
    // Normalize the direction
    const normalizedDirection = lightDirection.clone().normalize();
    
    // Position the directional light
    this.directionalLight.position.copy(normalizedDirection.multiplyScalar(10));
    this.directionalLight.lookAt(0, 0, 0);
  }

  /**
   * Enable or disable realistic shadows
   * @param enabled - Whether shadows should be enabled
   */
  public setShadowsEnabled(enabled: boolean): void {
    this.renderer.shadowMap.enabled = enabled;
    this.directionalLight.castShadow = enabled;
  }

  /**
   * Get the Three.js scene
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get the Three.js camera
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get the Three.js renderer
   */
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * Load a wig model from URL
   * @param modelUrl - URL to the GLTF/GLB model
   * @param onProgress - Optional progress callback (0-100)
   * @param onError - Optional error callback
   * @returns Promise resolving to the loaded model
   */
  public async loadWigModel(
    modelUrl: string,
    onProgress?: LoadProgressCallback,
    onError?: LoadErrorCallback
  ): Promise<THREE.Group> {
    if (!this.wigLoader) {
      throw new Error('AR Engine must be initialized before loading models');
    }
    return this.wigLoader.loadWigModel(modelUrl, onProgress, onError);
  }

  /**
   * Set the current wig model to display
   * @param model - The wig model to display
   * @param switchDelay - Maximum delay for switching (default: 500ms)
   */
  public async setCurrentWig(model: THREE.Group, switchDelay: number = 500): Promise<void> {
    if (!this.wigLoader) {
      throw new Error('AR Engine must be initialized before setting wig');
    }
    await this.wigLoader.setCurrentWig(model, switchDelay);
  }

  /**
   * Update wig position based on face tracking data
   * @param landmarks - Face landmarks from tracking
   * @param headPose - Head pose data
   */
  public updateWigPosition(landmarks: FaceLandmarks, headPose: HeadPose): void {
    if (!this.wigLoader) {
      return;
    }
    this.wigLoader.updateWigPosition(landmarks, headPose);

    // Also update accessory positions
    if (this.accessoryLayer) {
      this.accessoryLayer.updateAccessoryPositions(landmarks, headPose);
    }
  }

  /**
   * Get the current wig model
   */
  public getCurrentWig(): THREE.Group | null {
    if (!this.wigLoader) {
      return null;
    }
    return this.wigLoader.getCurrentWig();
  }

  /**
   * Remove current wig from scene
   */
  public removeCurrentWig(): void {
    if (this.wigLoader) {
      this.wigLoader.removeCurrentWig();
    }
  }

  /**
   * Clear the model cache
   */
  public clearModelCache(): void {
    if (this.wigLoader) {
      this.wigLoader.clearCache();
    }
  }

  /**
   * Get the number of cached models
   */
  public getCachedModelCount(): number {
    if (!this.wigLoader) {
      return 0;
    }
    return this.wigLoader.getCacheSize();
  }

  /**
   * Apply color customization to the current wig
   * @param colorHex - Hex color code (e.g., '#FF5733')
   */
  public applyColorCustomization(colorHex: string): void {
    if (!this.wigLoader) {
      throw new Error('AR Engine must be initialized before applying color customization');
    }
    this.wigLoader.applyColorCustomization(colorHex);
  }

  /**
   * Load an accessory model from URL
   * @param modelUrl - URL to the GLTF/GLB model
   * @returns Promise resolving to the loaded model
   */
  public async loadAccessoryModel(modelUrl: string): Promise<THREE.Group> {
    if (!this.accessoryLayer) {
      throw new Error('AR Engine must be initialized before loading accessories');
    }
    return this.accessoryLayer.loadAccessoryModel(modelUrl);
  }

  /**
   * Add an accessory to a specific layer
   * @param accessoryId - Unique identifier for this accessory instance
   * @param productId - Product ID of the accessory
   * @param model - The loaded accessory model
   * @param layer - Layer number (0-2)
   * @param accessoryType - Type of accessory for positioning (hat, earrings, glasses, etc.)
   */
  public addAccessory(
    accessoryId: string,
    productId: string,
    model: THREE.Group,
    layer: number,
    accessoryType?: string
  ): void {
    if (!this.accessoryLayer) {
      throw new Error('AR Engine must be initialized before adding accessories');
    }
    this.accessoryLayer.addAccessory(accessoryId, productId, model, layer, accessoryType);
  }

  /**
   * Remove an accessory by its ID
   * @param accessoryId - The accessory ID to remove
   * @returns true if removed, false if not found
   */
  public removeAccessory(accessoryId: string): boolean {
    if (!this.accessoryLayer) {
      return false;
    }
    return this.accessoryLayer.removeAccessory(accessoryId);
  }

  /**
   * Get all active accessories
   */
  public getActiveAccessories(): AccessoryLayerInfo[] {
    if (!this.accessoryLayer) {
      return [];
    }
    return this.accessoryLayer.getActiveAccessories();
  }

  /**
   * Get available layers for accessories
   */
  public getAvailableAccessoryLayers(): number[] {
    if (!this.accessoryLayer) {
      return [];
    }
    return this.accessoryLayer.getAvailableLayers();
  }

  /**
   * Check if max accessories reached
   */
  public isMaxAccessoriesReached(): boolean {
    if (!this.accessoryLayer) {
      return false;
    }
    return this.accessoryLayer.isMaxAccessoriesReached();
  }

  /**
   * Remove all accessories
   */
  public removeAllAccessories(): void {
    if (this.accessoryLayer) {
      this.accessoryLayer.removeAllAccessories();
    }
  }

  /**
   * Add an accessory to a specific layer (simplified interface)
   * @param model - The loaded accessory model
   * @param layer - Layer number (0-2)
   */
  public async addAccessoryLayer(model: THREE.Group, layer: number): Promise<void> {
    if (!this.accessoryLayer) {
      throw new Error('AR Engine must be initialized before adding accessories');
    }
    const accessoryId = `accessory-${layer}-${Date.now()}`;
    this.accessoryLayer.addAccessory(accessoryId, accessoryId, model, layer);
  }

  /**
   * Remove an accessory from a specific layer
   * @param layer - Layer number (0-2)
   */
  public async removeAccessoryLayer(layer: number): Promise<void> {
    if (!this.accessoryLayer) {
      return;
    }
    const accessories = this.accessoryLayer.getActiveAccessories();
    const accessory = accessories.find(acc => acc.layer === layer);
    if (accessory) {
      this.accessoryLayer.removeAccessory(accessory.id);
    }
  }

  /**
   * Capture a screenshot of the current AR view
   * @param width - Width of the screenshot (default: 1920 for 1080p)
   * @param height - Height of the screenshot (default: 1080 for 1080p)
   * @returns Promise resolving to a Blob containing the screenshot
   */
  public async captureScreenshot(width: number = 1920, height: number = 1080): Promise<Blob> {
    if (!this.isInitialized) {
      throw new Error('AR Engine must be initialized before capturing screenshot');
    }

    // Store current size
    const currentWidth = this.canvas.width;
    const currentHeight = this.canvas.height;

    // Temporarily resize renderer for high-res capture
    this.renderer.setSize(width, height, false);
    
    // Render one frame at high resolution
    this.renderer.render(this.scene, this.camera);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create screenshot blob'));
        }
      }, 'image/png', 1.0);
    });

    // Restore original size
    this.renderer.setSize(currentWidth, currentHeight, false);
    
    return blob;
  }

  /**
   * Stop rendering and clean up resources
   */
  public cleanup(): void {
    // Stop animation loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Cleanup wig loader
    if (this.wigLoader) {
      this.wigLoader.cleanup();
      this.wigLoader = null;
    }

    // Cleanup accessory layer
    if (this.accessoryLayer) {
      this.accessoryLayer.cleanup();
      this.accessoryLayer = null;
    }

    // Dispose of renderer
    this.renderer.dispose();

    // Clear scene
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Clear scene children
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    this.isInitialized = false;
    this.fpsCallback = undefined;
    
    console.log('AR Engine cleaned up');
  }
}
