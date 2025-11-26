import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FaceTrackingModule } from '../FaceTrackingModule';
import { FaceTrackingStatus } from '../../types/faceTracking';

// Mock MediaPipe Face Mesh
vi.mock('@mediapipe/face_mesh', () => ({
  FaceMesh: vi.fn().mockImplementation(() => ({
    setOptions: vi.fn(),
    onResults: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn().mockResolvedValue(undefined),
  getBackend: vi.fn().mockReturnValue('webgl'),
}));

describe('FaceTrackingModule', () => {
  let videoElement: HTMLVideoElement;
  let module: FaceTrackingModule;

  beforeEach(() => {
    // Create mock video element
    videoElement = document.createElement('video');
    module = new FaceTrackingModule(videoElement);
  });

  it('should initialize with NOT_STARTED status', () => {
    expect(module.getStatus()).toBe(FaceTrackingStatus.NOT_STARTED);
  });

  it('should initialize MediaPipe Face Mesh model', async () => {
    await module.initialize();
    expect(module.getStatus()).toBe(FaceTrackingStatus.INITIALIZING);
  });

  it('should return null for landmarks before tracking starts', () => {
    expect(module.getFaceLandmarks()).toBeNull();
  });

  it('should return null for head pose before tracking starts', () => {
    expect(module.getHeadPose()).toBeNull();
  });

  it('should return null for lighting data before tracking starts', () => {
    expect(module.getLightingData()).toBeNull();
  });

  it('should allow setting lighting threshold', () => {
    module.setLightingThreshold(0.5);
    // No error should be thrown
    expect(true).toBe(true);
  });

  it('should allow setting tracking lost threshold', () => {
    module.setTrackingLostThreshold(3000);
    // No error should be thrown
    expect(true).toBe(true);
  });

  it('should register callbacks without errors', () => {
    module.onLandmarks(() => {});
    module.onHeadPose(() => {});
    module.onLighting(() => {});
    module.onStatusChange(() => {});
    module.onError(() => {});
    // No error should be thrown
    expect(true).toBe(true);
  });

  it('should cleanup without errors', () => {
    module.cleanup();
    expect(module.getStatus()).toBe(FaceTrackingStatus.NOT_STARTED);
  });
});
