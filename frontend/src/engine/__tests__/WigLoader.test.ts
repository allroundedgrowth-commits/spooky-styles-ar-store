import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { WigLoader } from '../WigLoader';
import { FaceLandmarks, HeadPose } from '../../types/faceTracking';

describe('WigLoader', () => {
  let scene: THREE.Scene;
  let wigLoader: WigLoader;

  beforeEach(() => {
    scene = new THREE.Scene();
    wigLoader = new WigLoader(scene);
  });

  afterEach(() => {
    wigLoader.cleanup();
  });

  describe('Model Loading', () => {
    it('should initialize with empty cache', () => {
      expect(wigLoader.getCacheSize()).toBe(0);
    });

    it('should have no current wig initially', () => {
      expect(wigLoader.getCurrentWig()).toBeNull();
    });
  });

  describe('Model Caching', () => {
    it('should clear cache', () => {
      wigLoader.clearCache();
      expect(wigLoader.getCacheSize()).toBe(0);
    });
  });

  describe('Wig Positioning', () => {
    it('should handle updateWigPosition without current wig', () => {
      const landmarks: FaceLandmarks = {
        points: Array(468).fill({ x: 0, y: 0, z: 0 }),
        confidence: 0.9,
      };
      const headPose: HeadPose = {
        rotation: { x: 0, y: 0, z: 0 },
        translation: { x: 0, y: 0, z: 0 },
      };

      // Should not throw
      expect(() => {
        wigLoader.updateWigPosition(landmarks, headPose);
      }).not.toThrow();
    });

    it('should handle empty landmarks', () => {
      const landmarks: FaceLandmarks = {
        points: [],
        confidence: 0,
      };
      const headPose: HeadPose = {
        rotation: { x: 0, y: 0, z: 0 },
        translation: { x: 0, y: 0, z: 0 },
      };

      expect(() => {
        wigLoader.updateWigPosition(landmarks, headPose);
      }).not.toThrow();
    });
  });

  describe('Current Wig Management', () => {
    it('should remove current wig', () => {
      wigLoader.removeCurrentWig();
      expect(wigLoader.getCurrentWig()).toBeNull();
    });

    it('should set current wig', async () => {
      const mockModel = new THREE.Group();
      await wigLoader.setCurrentWig(mockModel);
      expect(wigLoader.getCurrentWig()).not.toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup without errors', () => {
      expect(() => {
        wigLoader.cleanup();
      }).not.toThrow();
    });

    it('should clear cache on cleanup', () => {
      wigLoader.cleanup();
      expect(wigLoader.getCacheSize()).toBe(0);
    });
  });
});
