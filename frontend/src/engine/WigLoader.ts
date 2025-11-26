import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FaceLandmarks, HeadPose } from '../types/faceTracking';

/**
 * Model load progress callback
 */
export type LoadProgressCallback = (progress: number) => void;

/**
 * Model load error callback
 */
export type LoadErrorCallback = (error: Error) => void;

/**
 * Cached model entry
 */
interface CachedModel {
  model: THREE.Group;
  url: string;
  loadedAt: number;
}

/**
 * Wig positioning configuration
 */
interface WigPositionConfig {
  offsetY: number; // Vertical offset from head top
  scale: number; // Scale factor
  rotationOffset: THREE.Euler; // Additional rotation offset
}

/**
 * WigLoader
 * Handles loading, caching, and positioning of 3D wig models
 */
export class WigLoader {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private modelCache: Map<string, CachedModel> = new Map();
  private currentWig: THREE.Group | null = null;
  private scene: THREE.Scene;
  private maxRetries = 3;
  private retryDelay = 1000; // ms
  private wigPositionConfig: WigPositionConfig = {
    offsetY: 0.1,
    scale: 1.0,
    rotationOffset: new THREE.Euler(0, 0, 0),
  };

  // Performance tracking
  private lastUpdateTime = 0;
  private targetFPS = 24;
  private minFrameTime = 1000 / this.targetFPS;

  // Smooth interpolation for jitter prevention
  private targetPosition = new THREE.Vector3();
  private targetRotation = new THREE.Euler();
  private smoothingFactor = 0.3; // Lower = smoother but more lag

  // Previous pose for interpolation
  private previousPosition = new THREE.Vector3();
  private previousRotation = new THREE.Euler();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    // Initialize GLTF loader
    this.gltfLoader = new GLTFLoader();
    
    // Initialize Draco loader for compressed models
    this.dracoLoader = new DRACOLoader();
    // Set path to Draco decoder (hosted on CDN)
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  /**
   * Load a wig model from URL with caching and retry logic
   * @param modelUrl - URL to the GLTF/GLB model
   * @param onProgress - Optional progress callback
   * @param onError - Optional error callback
   * @returns Promise resolving to the loaded model
   */
  public async loadWigModel(
    modelUrl: string,
    onProgress?: LoadProgressCallback,
    onError?: LoadErrorCallback
  ): Promise<THREE.Group> {
    // Check cache first
    const cached = this.modelCache.get(modelUrl);
    if (cached) {
      console.log(`Loading wig from cache: ${modelUrl}`);
      return this.cloneModel(cached.model);
    }

    // Load with retry logic
    return this.loadWithRetry(modelUrl, 0, onProgress, onError);
  }

  /**
   * Load model with retry logic
   */
  private async loadWithRetry(
    modelUrl: string,
    attempt: number,
    onProgress?: LoadProgressCallback,
    onError?: LoadErrorCallback
  ): Promise<THREE.Group> {
    try {
      const model = await this.loadModelFromUrl(modelUrl, onProgress);
      
      // Cache the loaded model
      this.modelCache.set(modelUrl, {
        model: model,
        url: modelUrl,
        loadedAt: Date.now(),
      });
      
      console.log(`Wig model loaded successfully: ${modelUrl}`);
      return this.cloneModel(model);
    } catch (error) {
      const err = error as Error;
      console.error(`Failed to load wig model (attempt ${attempt + 1}/${this.maxRetries}):`, err);
      
      if (attempt < this.maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        return this.loadWithRetry(modelUrl, attempt + 1, onProgress, onError);
      } else {
        // Max retries reached
        const finalError = new Error(`Failed to load wig model after ${this.maxRetries} attempts: ${err.message}`);
        if (onError) {
          onError(finalError);
        }
        throw finalError;
      }
    }
  }

  /**
   * Load model from URL using GLTFLoader
   */
  private loadModelFromUrl(
    modelUrl: string,
    onProgress?: LoadProgressCallback
  ): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;
          this.prepareModel(model);
          resolve(model);
        },
        (progressEvent) => {
          if (onProgress && progressEvent.lengthComputable) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Prepare model for rendering (optimize materials, enable shadows, etc.)
   */
  private prepareModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable shadow casting and receiving
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optimize materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => this.optimizeMaterial(mat));
          } else {
            this.optimizeMaterial(child.material);
          }
        }
      }
    });
  }

  /**
   * Optimize material properties for performance
   */
  private optimizeMaterial(material: THREE.Material): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Enable better lighting response
      material.needsUpdate = true;
      
      // Optimize for mobile
      if (material.map) {
        material.map.anisotropy = 4; // Reduce from default 16 for performance
      }
    }
  }

  /**
   * Clone a model for reuse (avoids reloading)
   */
  private cloneModel(model: THREE.Group): THREE.Group {
    return model.clone(true);
  }

  /**
   * Set the current wig model and add it to the scene
   * @param model - The wig model to display
   * @param switchDelay - Maximum delay for switching (ms)
   */
  public async setCurrentWig(model: THREE.Group, switchDelay: number = 500): Promise<void> {
    const startTime = performance.now();
    
    // Remove previous wig if exists
    if (this.currentWig) {
      this.scene.remove(this.currentWig);
      this.disposeModel(this.currentWig);
    }
    
    // Add new wig to scene
    this.currentWig = model;
    this.scene.add(this.currentWig);
    
    const elapsed = performance.now() - startTime;
    
    // Ensure we meet the switch delay requirement
    if (elapsed > switchDelay) {
      console.warn(`Wig switch took ${elapsed.toFixed(2)}ms (target: ${switchDelay}ms)`);
    }
  }

  /**
   * Update wig position based on face landmark data with smooth interpolation
   * @param landmarks - Face landmarks from tracking
   * @param headPose - Head pose data
   */
  public updateWigPosition(landmarks: FaceLandmarks, headPose: HeadPose): void {
    if (!this.currentWig || !landmarks || landmarks.points.length === 0) {
      return;
    }

    // Throttle updates to maintain target FPS
    const now = performance.now();
    if (now - this.lastUpdateTime < this.minFrameTime) {
      return;
    }
    this.lastUpdateTime = now;

    // Calculate head center and top position from landmarks
    const headTop = this.calculateHeadTop(landmarks);
    const headCenter = this.calculateHeadCenter(landmarks);
    
    // Calculate target position
    this.targetPosition.set(
      headCenter.x + headPose.translation.x,
      headTop.y + this.wigPositionConfig.offsetY + headPose.translation.y,
      headCenter.z + headPose.translation.z
    );
    
    // Calculate target rotation (convert degrees to radians)
    const rotX = (headPose.rotation.x * Math.PI / 180) + this.wigPositionConfig.rotationOffset.x;
    const rotY = (headPose.rotation.y * Math.PI / 180) + this.wigPositionConfig.rotationOffset.y;
    const rotZ = (headPose.rotation.z * Math.PI / 180) + this.wigPositionConfig.rotationOffset.z;
    
    this.targetRotation.set(rotX, rotY, rotZ);
    
    // Apply smooth interpolation to prevent jittering
    this.currentWig.position.lerp(this.targetPosition, this.smoothingFactor);
    
    // Smooth rotation interpolation using quaternions for better results
    const currentQuat = new THREE.Quaternion().setFromEuler(this.currentWig.rotation);
    const targetQuat = new THREE.Quaternion().setFromEuler(this.targetRotation);
    currentQuat.slerp(targetQuat, this.smoothingFactor);
    this.currentWig.rotation.setFromQuaternion(currentQuat);
    
    // Apply scale
    this.currentWig.scale.setScalar(this.wigPositionConfig.scale);
    
    // Store current values for next frame
    this.previousPosition.copy(this.currentWig.position);
    this.previousRotation.copy(this.currentWig.rotation);
  }

  /**
   * Calculate head top position from landmarks
   * Uses forehead landmarks (10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288)
   */
  private calculateHeadTop(landmarks: FaceLandmarks): THREE.Vector3 {
    // Key forehead/top landmarks
    const topIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288];
    
    let sumX = 0, sumY = 0, sumZ = 0;
    let count = 0;
    
    for (const idx of topIndices) {
      if (idx < landmarks.points.length) {
        const point = landmarks.points[idx];
        sumX += point.x;
        sumY += point.y;
        sumZ += point.z;
        count++;
      }
    }
    
    return new THREE.Vector3(
      sumX / count,
      sumY / count,
      sumZ / count
    );
  }

  /**
   * Calculate head center position from landmarks
   * Uses nose bridge and face center landmarks
   */
  private calculateHeadCenter(landmarks: FaceLandmarks): THREE.Vector3 {
    // Nose bridge (center of face)
    const centerIndices = [1, 4, 5, 6, 168, 197, 195];
    
    let sumX = 0, sumY = 0, sumZ = 0;
    let count = 0;
    
    for (const idx of centerIndices) {
      if (idx < landmarks.points.length) {
        const point = landmarks.points[idx];
        sumX += point.x;
        sumY += point.y;
        sumZ += point.z;
        count++;
      }
    }
    
    return new THREE.Vector3(
      sumX / count,
      sumY / count,
      sumZ / count
    );
  }

  /**
   * Get the current wig model
   */
  public getCurrentWig(): THREE.Group | null {
    return this.currentWig;
  }

  /**
   * Remove current wig from scene
   */
  public removeCurrentWig(): void {
    if (this.currentWig) {
      this.scene.remove(this.currentWig);
      this.disposeModel(this.currentWig);
      this.currentWig = null;
    }
  }

  /**
   * Configure wig positioning parameters
   */
  public setPositionConfig(config: Partial<WigPositionConfig>): void {
    this.wigPositionConfig = {
      ...this.wigPositionConfig,
      ...config,
    };
  }

  /**
   * Set smoothing factor for interpolation (0-1)
   * Lower values = smoother but more lag
   * Higher values = more responsive but potential jitter
   */
  public setSmoothingFactor(factor: number): void {
    this.smoothingFactor = Math.max(0.1, Math.min(1.0, factor));
  }

  /**
   * Clear model cache
   */
  public clearCache(): void {
    this.modelCache.forEach((cached) => {
      this.disposeModel(cached.model);
    });
    this.modelCache.clear();
    console.log('Model cache cleared');
  }

  /**
   * Get cache size
   */
  public getCacheSize(): number {
    return this.modelCache.size;
  }

  /**
   * Dispose of a model and free memory
   */
  private disposeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  /**
   * Apply color customization to the current wig
   * @param colorHex - Hex color code (e.g., '#FF5733')
   */
  public applyColorCustomization(colorHex: string): void {
    if (!this.currentWig) {
      console.warn('No wig loaded to apply color customization');
      return;
    }

    const startTime = performance.now();
    const color = new THREE.Color(colorHex);

    // Traverse the wig model and update material colors
    this.currentWig.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
              // Update the base color
              mat.color.copy(color);
              mat.needsUpdate = true;
            }
          });
        }
      }
    });

    const elapsed = performance.now() - startTime;
    console.log(`Color customization applied in ${elapsed.toFixed(2)}ms (target: 300ms)`);
    
    if (elapsed > 300) {
      console.warn(`Color customization exceeded target time: ${elapsed.toFixed(2)}ms`);
    }
  }

  /**
   * Cleanup and dispose of all resources
   */
  public cleanup(): void {
    this.removeCurrentWig();
    this.clearCache();
    this.dracoLoader.dispose();
    console.log('WigLoader cleaned up');
  }
}
