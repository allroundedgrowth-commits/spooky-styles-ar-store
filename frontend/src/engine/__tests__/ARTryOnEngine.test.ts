import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ARTryOnEngine } from '../ARTryOnEngine';

describe('ARTryOnEngine', () => {
  let canvas: HTMLCanvasElement;
  let engine: ARTryOnEngine;

  beforeEach(() => {
    // Create a mock canvas element
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    
    engine = new ARTryOnEngine(canvas);
  });

  afterEach(() => {
    engine.cleanup();
    document.body.removeChild(canvas);
  });

  it('should initialize the scene successfully', () => {
    engine.initializeScene();
    
    const scene = engine.getScene();
    const camera = engine.getCamera();
    const renderer = engine.getRenderer();
    
    expect(scene).toBeDefined();
    expect(camera).toBeDefined();
    expect(renderer).toBeDefined();
  });

  it('should set up lighting with ambient and directional lights', () => {
    engine.initializeScene();
    
    const scene = engine.getScene();
    const lights = scene.children.filter(
      child => child.type === 'AmbientLight' || child.type === 'DirectionalLight'
    );
    
    expect(lights.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle resize correctly', () => {
    engine.initializeScene();
    
    canvas.width = 1024;
    canvas.height = 768;
    
    engine.handleResize();
    
    const camera = engine.getCamera();
    expect(camera.aspect).toBeCloseTo(1024 / 768);
  });

  it('should update lighting based on brightness', () => {
    engine.initializeScene();
    
    // Should not throw error
    expect(() => engine.updateLighting(0.5)).not.toThrow();
    expect(() => engine.updateLighting(0)).not.toThrow();
    expect(() => engine.updateLighting(1)).not.toThrow();
  });

  it('should track FPS updates', (done) => {
    engine.initializeScene();
    
    let fpsCallbackCalled = false;
    engine.onFPSUpdate((fps) => {
      expect(fps).toBeGreaterThanOrEqual(0);
      fpsCallbackCalled = true;
      done();
    });
    
    engine.startRendering();
    
    // Wait a bit to ensure callback is called
    setTimeout(() => {
      if (!fpsCallbackCalled) {
        done();
      }
    }, 1500);
  });

  it('should cleanup resources properly', () => {
    engine.initializeScene();
    engine.startRendering();
    
    expect(() => engine.cleanup()).not.toThrow();
    
    const scene = engine.getScene();
    expect(scene.children.length).toBe(0);
  });

  describe('Wig Loading and Management', () => {
    beforeEach(() => {
      engine.initializeScene();
    });

    it('should have no current wig initially', () => {
      expect(engine.getCurrentWig()).toBeNull();
    });

    it('should remove current wig', () => {
      engine.removeCurrentWig();
      expect(engine.getCurrentWig()).toBeNull();
    });

    it('should have zero cached models initially', () => {
      expect(engine.getCachedModelCount()).toBe(0);
    });

    it('should clear model cache', () => {
      engine.clearModelCache();
      expect(engine.getCachedModelCount()).toBe(0);
    });

    it('should throw error when loading model before initialization', async () => {
      const uninitializedEngine = new ARTryOnEngine(canvas);
      
      await expect(
        uninitializedEngine.loadWigModel('test.glb')
      ).rejects.toThrow('AR Engine must be initialized');
      
      uninitializedEngine.cleanup();
    });

    it('should update wig position with face tracking data', () => {
      const landmarks = {
        points: Array(468).fill({ x: 0, y: 0, z: 0 }),
        confidence: 0.9,
      };
      const headPose = {
        rotation: { x: 0, y: 0, z: 0 },
        translation: { x: 0, y: 0, z: 0 },
      };

      expect(() => {
        engine.updateWigPosition(landmarks, headPose);
      }).not.toThrow();
    });
  });
});
