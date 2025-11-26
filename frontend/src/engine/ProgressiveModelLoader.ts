import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface ModelCacheEntry {
  model: THREE.Group;
  timestamp: number;
}

export class ProgressiveModelLoader {
  private loader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private modelCache: Map<string, ModelCacheEntry>;
  private loadingQueue: Map<string, Promise<THREE.Group>>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 20;

  constructor() {
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.modelCache = new Map();
    this.loadingQueue = new Map();

    // Configure Draco decoder for compressed models
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });
    this.loader.setDRACOLoader(this.dracoLoader);
  }

  /**
   * Load a 3D model with progressive loading and caching
   */
  async loadModel(
    url: string,
    onProgress?: (progress: LoadProgress) => void
  ): Promise<THREE.Group> {
    // Check cache first
    const cached = this.getFromCache(url);
    if (cached) {
      console.log(`📦 Model loaded from cache: ${url}`);
      return cached.clone();
    }

    // Check if already loading
    const existingLoad = this.loadingQueue.get(url);
    if (existingLoad) {
      console.log(`⏳ Model already loading: ${url}`);
      return existingLoad.then((model) => model.clone());
    }

    // Start loading
    const loadPromise = this.loadModelInternal(url, onProgress);
    this.loadingQueue.set(url, loadPromise);

    try {
      const model = await loadPromise;
      this.addToCache(url, model);
      this.loadingQueue.delete(url);
      return model.clone();
    } catch (error) {
      this.loadingQueue.delete(url);
      throw error;
    }
  }

  /**
   * Internal method to load model from URL
   */
  private loadModelInternal(
    url: string,
    onProgress?: (progress: LoadProgress) => void
  ): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf: any) => {
          const model = gltf.scene;
          
          // Optimize model
          this.optimizeModel(model);
          
          console.log(`✅ Model loaded: ${url}`);
          resolve(model);
        },
        (xhr: any) => {
          if (onProgress && xhr.total > 0) {
            const progress: LoadProgress = {
              loaded: xhr.loaded,
              total: xhr.total,
              percentage: (xhr.loaded / xhr.total) * 100,
            };
            onProgress(progress);
          }
        },
        (error: any) => {
          console.error(`❌ Error loading model: ${url}`, error);
          reject(new Error(`Failed to load model: ${url}`));
        }
      );
    });
  }

  /**
   * Optimize loaded model for better performance
   */
  private optimizeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable frustum culling
        child.frustumCulled = true;

        // Optimize materials
        if (child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          
          // Enable flat shading for low-poly models
          if (child.geometry.attributes.position.count < 1000) {
            material.flatShading = true;
          }

          // Optimize texture settings
          if (material.map) {
            material.map.anisotropy = 4; // Reduce from default 16
            material.map.generateMipmaps = true;
          }

          // Disable unnecessary features
          material.needsUpdate = true;
        }

        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }
      }
    });
  }

  /**
   * Preload multiple models in the background
   */
  async preloadModels(urls: string[]): Promise<void> {
    console.log(`🔄 Preloading ${urls.length} models...`);
    
    const loadPromises = urls.map((url) =>
      this.loadModel(url).catch((error) => {
        console.warn(`⚠️ Failed to preload model: ${url}`, error);
      })
    );

    await Promise.all(loadPromises);
    console.log(`✅ Preloaded ${urls.length} models`);
  }

  /**
   * Get model from cache
   */
  private getFromCache(url: string): THREE.Group | null {
    const entry = this.modelCache.get(url);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry is still valid
    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_DURATION) {
      this.modelCache.delete(url);
      return null;
    }

    return entry.model;
  }

  /**
   * Add model to cache
   */
  private addToCache(url: string, model: THREE.Group): void {
    // Enforce cache size limit
    if (this.modelCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = Array.from(this.modelCache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      )[0][0];
      
      this.modelCache.delete(oldestKey);
      console.log(`🗑️ Removed oldest cache entry: ${oldestKey}`);
    }

    this.modelCache.set(url, {
      model,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached models
   */
  clearCache(): void {
    this.modelCache.clear();
    console.log('🗑️ Model cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; urls: string[] } {
    return {
      size: this.modelCache.size,
      urls: Array.from(this.modelCache.keys()),
    };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.clearCache();
    this.dracoLoader.dispose();
  }
}

export default new ProgressiveModelLoader();
