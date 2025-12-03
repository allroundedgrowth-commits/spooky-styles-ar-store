/**
 * useHairFlattening Hook Tests
 * 
 * Unit tests for the useHairFlattening custom hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useHairFlattening } from '../useHairFlattening';
import { AdjustmentMode, HairProcessingState } from '../../engine/Simple2DAREngine';

describe('useHairFlattening', () => {
  const mockSetAdjustmentMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state when hairProcessingState is null', () => {
      const { result } = renderHook(() =>
        useHairFlattening(null, mockSetAdjustmentMode)
      );

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.currentMode).toBe(AdjustmentMode.NORMAL);
      expect(result.current.volumeScore).toBeNull();
      expect(result.current.volumeCategory).toBeNull();
      expect(result.current.confidence).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isComparisonMode).toBe(false);
    });

    it('should extract values from hairProcessingState', () => {
      const mockState: HairProcessingState = {
        isInitialized: true,
        isProcessing: false,
        currentMode: AdjustmentMode.FLATTENED,
        segmentationData: {
          mask: new ImageData(100, 100),
          confidence: 0.95,
          volumeScore: 75,
          volumeCategory: 'high',
          boundingBox: { x: 0, y: 0, width: 100, height: 100 },
          timestamp: Date.now(),
        },
        flattenedResult: null,
        error: null,
        performanceMetrics: {
          segmentationFPS: 15,
          overallFPS: 30,
          lastSegmentationTime: 100,
          lastFlatteningTime: 50,
          memoryUsage: 50,
        },
      };

      const { result } = renderHook(() =>
        useHairFlattening(mockState, mockSetAdjustmentMode)
      );

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.currentMode).toBe(AdjustmentMode.FLATTENED);
      expect(result.current.volumeScore).toBe(75);
      expect(result.current.volumeCategory).toBe('high');
      expect(result.current.confidence).toBe(0.95);
    });

    it('should handle error state from hairProcessingState', () => {
      const mockState: HairProcessingState = {
        isInitialized: false,
        isProcessing: false,
        currentMode: AdjustmentMode.NORMAL,
        segmentationData: null,
        flattenedResult: null,
        error: {
          type: 'SEGMENTATION_FAILED',
          message: 'Failed to segment hair',
          timestamp: Date.now(),
        },
        performanceMetrics: {
          segmentationFPS: 0,
          overallFPS: 0,
          lastSegmentationTime: 0,
          lastFlatteningTime: 0,
          memoryUsage: 0,
        },
      };

      const { result } = renderHook(() =>
        useHairFlattening(mockState, mockSetAdjustmentMode)
      );

      expect(result.current.error).toBe('Failed to segment hair');
    });
  });

  describe('Mode Changes', () => {
    it('should call setAdjustmentMode when changeMode is called', () => {
      const { result } = renderHook(() =>
        useHairFlattening(null, mockSetAdjustmentMode)
      );

      act(() => {
        result.current.changeMode(AdjustmentMode.FLATTENED);
      });

      expect(mockSetAdjustmentMode).toHaveBeenCalledWith(AdjustmentMode.FLATTENED);
    });

    it('should call onModeChange callback when mode changes', () => {
      const onModeChange = jest.fn();
      const { result } = renderHook(() =>
        useHairFlattening(null, mockSetAdjustmentMode, { onModeChange })
      );

      act(() => {
        result.current.changeMode(AdjustmentMode.BALD);
      });

      expect(onModeChange).toHaveBeenCalledWith(AdjustmentMode.BALD);
    });

    it('should handle errors when changing mode', () => {
      const mockSetModeWithError = jest.fn(() => {
        throw new Error('Mode change failed');
      });

      const { result } = renderHook(() =>
        useHairFlattening(null, mockSetModeWithError)
      );

      act(() => {
        result.current.changeMode(AdjustmentMode.FLATTENED);
      });

      expect(result.current.error).toBe('Mode change failed');
    });
  });

  describe('Comparison Mode', () => {
    it('should toggle comparison mode', () => {
      const { result } = renderHook(() =>
        useHairFlattening(null, mockSetAdjustmentMode)
      );

      expect(result.current.isComparisonMode).toBe(false);

      act(() => {
        result.current.toggleComparison();
      });

      expect(result.current.isComparisonMode).toBe(true);

      act(() => {
        result.current.toggleComparison();
      });

      expect(result.current.isComparisonMode).toBe(false);
    });
  });

  describe('Initialization', () => {
    it('should handle successful initialization', async () => {
      const mockState: HairProcessingState = {
        isInitialized: true,
        isProcessing: false,
        currentMode: AdjustmentMode.NORMAL,
        segmentationData: null,
        flattenedResult: null,
        error: null,
        performanceMetrics: {
          segmentationFPS: 0,
          overallFPS: 0,
          lastSegmentationTime: 0,
          lastFlatteningTime: 0,
          memoryUsage: 0,
        },
      };

      const { result } = renderHook(() =>
        useHairFlattening(mockState, mockSetAdjustmentMode)
      );

      await act(async () => {
        await result.current.initializeSegmentation();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle initialization failure', async () => {
      const { result } = renderHook(() =>
        useHairFlattening(null, mockSetAdjustmentMode)
      );

      await act(async () => {
        try {
          await result.current.initializeSegmentation();
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Reset', () => {
    it('should reset all state to defaults', () => {
      const { result } = renderHook(() =>
        useHairFlattening(null, mockSetAdjustmentMode)
      );

      // Set some state
      act(() => {
        result.current.toggleComparison();
        result.current.changeMode(AdjustmentMode.FLATTENED);
      });

      expect(result.current.isComparisonMode).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isComparisonMode).toBe(false);
      expect(mockSetAdjustmentMode).toHaveBeenCalledWith(AdjustmentMode.NORMAL);
    });
  });

  describe('Callbacks', () => {
    it('should call onStateChange when hairProcessingState changes', () => {
      const onStateChange = jest.fn();
      
      const initialState: HairProcessingState = {
        isInitialized: false,
        isProcessing: false,
        currentMode: AdjustmentMode.NORMAL,
        segmentationData: null,
        flattenedResult: null,
        error: null,
        performanceMetrics: {
          segmentationFPS: 0,
          overallFPS: 0,
          lastSegmentationTime: 0,
          lastFlatteningTime: 0,
          memoryUsage: 0,
        },
      };

      const { rerender } = renderHook(
        ({ state }) => useHairFlattening(state, mockSetAdjustmentMode, { onStateChange }),
        { initialProps: { state: initialState } }
      );

      expect(onStateChange).toHaveBeenCalledWith(initialState);

      const updatedState: HairProcessingState = {
        ...initialState,
        isInitialized: true,
      };

      rerender({ state: updatedState });

      expect(onStateChange).toHaveBeenCalledWith(updatedState);
    });
  });

  describe('Auto-initialization', () => {
    it('should auto-initialize when autoInitialize is true', async () => {
      const mockState: HairProcessingState = {
        isInitialized: true,
        isProcessing: false,
        currentMode: AdjustmentMode.NORMAL,
        segmentationData: null,
        flattenedResult: null,
        error: null,
        performanceMetrics: {
          segmentationFPS: 0,
          overallFPS: 0,
          lastSegmentationTime: 0,
          lastFlatteningTime: 0,
          memoryUsage: 0,
        },
      };

      const { result } = renderHook(() =>
        useHairFlattening(mockState, mockSetAdjustmentMode, { autoInitialize: true })
      );

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });
    });

    it('should not auto-initialize when autoInitialize is false', () => {
      const mockState: HairProcessingState = {
        isInitialized: false,
        isProcessing: false,
        currentMode: AdjustmentMode.NORMAL,
        segmentationData: null,
        flattenedResult: null,
        error: null,
        performanceMetrics: {
          segmentationFPS: 0,
          overallFPS: 0,
          lastSegmentationTime: 0,
          lastFlatteningTime: 0,
          memoryUsage: 0,
        },
      };

      const { result } = renderHook(() =>
        useHairFlattening(mockState, mockSetAdjustmentMode, { autoInitialize: false })
      );

      expect(result.current.isInitialized).toBe(false);
    });
  });

  describe('Raw State Access', () => {
    it('should provide access to raw hairProcessingState', () => {
      const mockState: HairProcessingState = {
        isInitialized: true,
        isProcessing: false,
        currentMode: AdjustmentMode.FLATTENED,
        segmentationData: {
          mask: new ImageData(100, 100),
          confidence: 0.95,
          volumeScore: 75,
          volumeCategory: 'high',
          boundingBox: { x: 0, y: 0, width: 100, height: 100 },
          timestamp: Date.now(),
        },
        flattenedResult: null,
        error: null,
        performanceMetrics: {
          segmentationFPS: 15,
          overallFPS: 30,
          lastSegmentationTime: 100,
          lastFlatteningTime: 50,
          memoryUsage: 50,
        },
      };

      const { result } = renderHook(() =>
        useHairFlattening(mockState, mockSetAdjustmentMode)
      );

      expect(result.current.hairProcessingState).toEqual(mockState);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values in hairProcessingState', () => {
      const mockState = {
        isInitialized: true,
        isProcessing: false,
        currentMode: AdjustmentMode.NORMAL,
        segmentationData: null,
        flattenedResult: null,
        error: null,
        performanceMetrics: {
          segmentationFPS: 0,
          overallFPS: 0,
          lastSegmentationTime: 0,
          lastFlatteningTime: 0,
          memoryUsage: 0,
        },
      } as HairProcessingState;

      const { result } = renderHook(() =>
        useHairFlattening(mockState, mockSetAdjustmentMode)
      );

      expect(result.current.volumeScore).toBeNull();
      expect(result.current.volumeCategory).toBeNull();
      expect(result.current.confidence).toBeNull();
    });

    it('should handle rapid mode changes', () => {
      const { result } = renderHook(() =>
        useHairFlattening(null, mockSetAdjustmentMode)
      );

      act(() => {
        result.current.changeMode(AdjustmentMode.FLATTENED);
        result.current.changeMode(AdjustmentMode.BALD);
        result.current.changeMode(AdjustmentMode.NORMAL);
      });

      expect(mockSetAdjustmentMode).toHaveBeenCalledTimes(3);
      expect(mockSetAdjustmentMode).toHaveBeenLastCalledWith(AdjustmentMode.NORMAL);
    });

    it('should handle multiple toggleComparison calls', () => {
      const { result } = renderHook(() =>
        useHairFlattening(null, mockSetAdjustmentMode)
      );

      act(() => {
        result.current.toggleComparison();
        result.current.toggleComparison();
        result.current.toggleComparison();
      });

      expect(result.current.isComparisonMode).toBe(true);
    });
  });
});
