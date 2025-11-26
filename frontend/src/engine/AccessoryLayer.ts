import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FaceLandmarks, HeadPose } from '../types/faceTracking';

/**
 * Accessory layer information
 */
export interface AccessoryLayerInfo {
  id: string;
  productId: string;
  model: THREE.Group;
  layer: number; // 0-2 for z-ordering
  addedAt: number;
}

/**
 * Cached accessory model
 */
interface CachedAccessory {
  model: THREE.Group;
  url: string;
  loadedAt: number;
}

/**
 * Accessory positioning configuration based on type
 */
interface AccessoryPositionConfig {
  anchorLandmarks: number[]; // Face landmark indices to anchor to
  offsetY: number;
  offsetZ: number;
  scale: number;
  rotationOffset: THREE.Euler;
}

/**
 * Predefined positioning configs for common accessory types
 */
const ACCESSORY_POSITION_CONFIGS: Record<string, AccessoryPositionConfig> = {
  hat: {
    anchorLandmarks: [10, 338, 297, 332, 284, 251], // Top of head
    offsetY: 0.15,
    offsetZ: 0,
    scale: 1.0,
    rotationOffset: new THREE.Euler(0, 0, 0),
  },
  earrings: {
    anchorLandmarks: [234, 454], // Ear landmarks
    offsetY: 0,
    offsetZ: 0,
    scale: 0.8,
    rotationOffset: new THREE.Euler(0, 0, 0),
  },
  glasses: {
    anchorLandmarks: [168, 6, 197], // Nose bridge
    offsetY: 0.05,
    offsetZ: 0.02,
    scale: 1.0,
    rotationOffset: new THREE.Euler(0, 0, 0),
  },
  default: {
    anchorLandmarks: [1, 4, 5, 6], // Face center
    offsetY: 0,
    offsetZ: 0,
    scale: 1.0,
    rotationOffset: new THREE.Euler(0, 0, 0),
  },
};

/**
 * AccessoryLayer
 * Manages loading, positioning, and z-ordering of accessory models
 */
export class AccessoryLayer {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private scene: THREE.Scene;
  private accessoryCache: Map<string, CachedAccessory> = new Map();
  private activeAccessories: Map<number, AccessoryLayerInfo> = new Map(); // layer -> accessory
  private maxLayers = 3;
  private maxRetries = 3;
  private retryDelay = 1000;

  // Performance tracking
  private lastUpdateTime = 0;
  private targetFPS = 24;
  private minFrameTime = 1000 / this.targetFPS;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Initialize GLTF loader
    this.gltfLoader = new GLTFLoader();

    // Initialize Draco loader
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  /**
   * Load an accessory model from URL with caching
   */
  public async loadAccessoryModel(modelUrl: string): Promise<THREE.Group> {
    // Check cache first
    const cached = this.accessoryCache.get(modelUrl);
    if (cached) {
      console.log(`Loading accessory from cache: ${modelUrl}`);
      return this.cloneModel(cached.model);
    }

    // Load with retry logic
    return this.loadWithRetry(modelUrl, 0);
  }

  /**
   * Load model with retry logic
   */
  private async loadWithRetry(modelUrl: string, attempt: number): Promise<THREE.Group> {
    try {
      const model = await this.loadModelFromUrl(modelUrl);

      // Cache the loaded model
      this.accessoryCache.set(modelUrl, {
        model: model,
        url: modelUrl,
        loadedAt: Date.now(),
      });

      console.log(`Accessory model loaded successfully: ${modelUrl}`);
      return this.cloneModel(model);
    } catch (error) {
      const err = error as Error;
      console.error(`Failed to load accessory (attempt ${attempt + 1}/${this.maxRetries}):`, err);

      if (attempt < this.maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        return this.loadWithRetry(modelUrl, attempt + 1);
      } else {
        throw new Error(`Failed to load accessory after ${this.maxRetries} attempts: ${err.message}`);
      }
    }
  }

  /**
   * Load model from URL
   */
  private loadModelFromUrl(modelUrl: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;
          this.prepareModel(model);
          resolve(model);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Prepare model for rendering
   */
  private prepareModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => this.optimizeMaterial(mat));
          } else {
            this.optimizeMaterial(child.material);
          }
        }
      }
    });
  }

  /**
   * Optimize material properties
   */
  private optimizeMaterial(material: THREE.Material): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      material.needsUpdate = true;
      if (material.map) {
        material.map.anisotropy = 4;
      }
    }
  }

  /**
   * Clone a model
   */
  private cloneModel(model: THREE.Group): THREE.Group {
    return model.clone(true);
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
    accessoryType: string = 'default'
  ): void {
    const startTime = performance.now();

    // Validate layer
    if (layer < 0 || layer >= this.maxLayers) {
      throw new Error(`Invalid layer ${layer}. Must be between 0 and ${this.maxLayers - 1}`);
    }

    // Remove existing accessory on this layer if present
    if (this.activeAccessories.has(layer)) {
      this.removeAccessoryByLayer(layer);
    }

    // Set z-ordering based on layer (higher layer = rendered on top)
    // Use renderOrder to control rendering sequence
    model.renderOrder = layer + 1; // Start from 1, wig is 0

    // Store accessory type as user data for positioning
    model.userData.accessoryType = accessoryType;

    // Add to scene
    this.scene.add(model);

    // Store in active accessories
    this.activeAccessories.set(layer, {
      id: accessoryId,
      productId: productId,
      model: model,
      layer: layer,
      addedAt: Date.now(),
    });

    const elapsed = performance.now() - startTime;
    console.log(`Accessory added to layer ${layer} in ${elapsed.toFixed(2)}ms`);
  }

  /**
   * Remove an accessory by its ID
   * @param accessoryId - The accessory ID to remove
   * @returns true if removed, false if not found
   */
  public removeAccessory(accessoryId: string): boolean {
    const startTime = performance.now();

    // Find the accessory
    for (const [layer, info] of this.activeAccessories.entries()) {
      if (info.id === accessoryId) {
        this.scene.remove(info.model);
        this.disposeModel(info.model);
        this.activeAccessories.delete(layer);

        const elapsed = performance.now() - startTime;
        console.log(`Accessory removed in ${elapsed.toFixed(2)}ms (target: 200ms)`);

        if (elapsed > 200) {
          console.warn(`Accessory removal exceeded target time: ${elapsed.toFixed(2)}ms`);
        }

        return true;
      }
    }

    return false;
  }

  /**
   * Remove an accessory by layer number
   */
  private removeAccessoryByLayer(layer: number): void {
    const info = this.activeAccessories.get(layer);
    if (info) {
      this.scene.remove(info.model);
      this.disposeModel(info.model);
      this.activeAccessories.delete(layer);
    }
  }

  /**
   * Update positions of all active accessories based on face tracking
   */
  public updateAccessoryPositions(landmarks: FaceLandmarks, headPose: HeadPose): void {
    if (!landmarks || landmarks.points.length === 0) {
      return;
    }

    // Throttle updates to maintain target FPS
    const now = performance.now();
    if (now - this.lastUpdateTime < this.minFrameTime) {
      return;
    }
    this.lastUpdateTime = now;

    // Update each active accessory
    for (const info of this.activeAccessories.values()) {
      this.updateAccessoryPosition(info, landmarks, headPose);
    }
  }

  /**
   * Update position of a single accessory
   */
  private updateAccessoryPosition(
    info: AccessoryLayerInfo,
    landmarks: FaceLandmarks,
    headPose: HeadPose
  ): void {
    const accessoryType = info.model.userData.accessoryType || 'default';
    const config = ACCESSORY_POSITION_CONFIGS[accessoryType] || ACCESSORY_POSITION_CONFIGS.default;

    // Calculate anchor position from landmarks
    const anchorPos = this.calculateAnchorPosition(landmarks, config.anchorLandmarks);

    // Position accessory at anchor with offsets
    info.model.position.set(
      anchorPos.x + headPose.translation.x,
      anchorPos.y + config.offsetY + headPose.translation.y,
      anchorPos.z + config.offsetZ + headPose.translation.z
    );

    // Apply rotation from head pose
    info.model.rotation.set(
      headPose.rotation.x + config.rotationOffset.x,
      headPose.rotation.y + config.rotationOffset.y,
      headPose.rotation.z + config.rotationOffset.z
    );

    // Apply scale
    info.model.scale.setScalar(config.scale);
  }

  /**
   * Calculate anchor position from face landmarks
   */
  private calculateAnchorPosition(landmarks: FaceLandmarks, anchorIndices: number[]): THREE.Vector3 {
    let sumX = 0,
      sumY = 0,
      sumZ = 0;
    let count = 0;

    for (const idx of anchorIndices) {
      if (idx < landmarks.points.length) {
        const point = landmarks.points[idx];
        sumX += point.x;
        sumY += point.y;
        sumZ += point.z;
        count++;
      }
    }

    if (count === 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    return new THREE.Vector3(sumX / count, sumY / count, sumZ / count);
  }

  /**
   * Get all active accessories
   */
  public getActiveAccessories(): AccessoryLayerInfo[] {
    return Array.from(this.activeAccessories.values());
  }

  /**
   * Get accessory by layer
   */
  public getAccessoryByLayer(layer: number): AccessoryLayerInfo | undefined {
    return this.activeAccessories.get(layer);
  }

  /**
   * Get available layers (not currently occupied)
   */
  public getAvailableLayers(): number[] {
    const available: number[] = [];
    for (let i = 0; i < this.maxLayers; i++) {
      if (!this.activeAccessories.has(i)) {
        available.push(i);
      }
    }
    return available;
  }

  /**
   * Check if a layer is available
   */
  public isLayerAvailable(layer: number): boolean {
    return layer >= 0 && layer < this.maxLayers && !this.activeAccessories.has(layer);
  }

  /**
   * Get the number of active accessories
   */
  public getActiveAccessoryCount(): number {
    return this.activeAccessories.size;
  }

  /**
   * Check if max accessories reached
   */
  public isMaxAccessoriesReached(): boolean {
    return this.activeAccessories.size >= this.maxLayers;
  }

  /**
   * Remove all accessories
   */
  public removeAllAccessories(): void {
    for (const info of this.activeAccessories.values()) {
      this.scene.remove(info.model);
      this.disposeModel(info.model);
    }
    this.activeAccessories.clear();
    console.log('All accessories removed');
  }

  /**
   * Clear accessory cache
   */
  public clearCache(): void {
    this.accessoryCache.forEach((cached) => {
      this.disposeModel(cached.model);
    });
    this.accessoryCache.clear();
    console.log('Accessory cache cleared');
  }

  /**
   * Get cache size
   */
  public getCacheSize(): number {
    return this.accessoryCache.size;
  }

  /**
   * Dispose of a model
   */
  private disposeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  /**
   * Cleanup and dispose of all resources
   */
  public cleanup(): void {
    this.removeAllAccessories();
    this.clearCache();
    this.dracoLoader.dispose();
    console.log('AccessoryLayer cleaned up');
  }
}
