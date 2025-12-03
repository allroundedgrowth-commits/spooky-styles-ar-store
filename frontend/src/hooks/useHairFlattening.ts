/**
 * useHairFlattening Hook
 * 
 * Custom React hook for managing hair flattening state in AR try-on sessions.
 * Provides a clean interface for initializing segmentation, changing adjustment modes,
 * and toggling comparison views.
 * 
 * Integrates with user preferences to load saved settings on AR session start.
 * 
 * Requirements: 1.1, 1.2, 3.1, 4.1
 */

import { useState, useCallback, useEffect } from 'react';
import { AdjustmentMode, HairProcessingState } from '../engine/Simple2DAREngine';
import { 
  HairAdjustmentPreferences,
  loadHairFlatteningPreferences,
  saveHairFlatteningPreferences 
} from '../utils/hairFlatteningPreferences';

export interface UseHairFlatteningOptions {
  /**
   * Callback when hair processing state changes
   */
  onStateChange?: (state: HairProcessingState) => void;
  
  /**
   * Callback when adjustment mode changes
   */
  onModeChange?: (mode: AdjustmentMode) => void;
  
  /**
   * Auto-initialize segmentation when hook mounts
   */
  autoInitialize?: boolean;
  
  /**
   * Load user preferences on initialization
   * @default true
   */
  loadPreferences?: boolean;
}

export interface UseHairFlatteningReturn {
  // State
  isInitialized: boolean;
  isProcessing: boolean;
  currentMode: AdjustmentMode;
  volumeScore: number | null;
  volumeCategory: string | null;
  confidence: number | null;
  error: string | null;
  isComparisonMode: boolean;
  
  // Preferences
  preferences: HairAdjustmentPreferences;
  
  // Methods
  initializeSegmentation: () => Promise<void>;
  changeMode: (mode: AdjustmentMode) => void;
  toggleComparison: () => void;
  reset: () => void;
  updatePreferences: (preferences: Partial<HairAdjustmentPreferences>) => void;
  
  // Raw state for advanced usage
  hairProcessingState: HairProcessingState | null;
}

/**
 * Hook for managing hair flattening functionality
 * 
 * @param hairProcessingState - Current hair processing state from Simple2DAREngine
 * @param setAdjustmentMode - Function to set adjustment mode in the engine
 * @param options - Configuration options
 * @returns Hair flattening state and control methods
 * 
 * @example
 * ```tsx
 * const {
 *   isInitialized,
 *   volumeScore,
 *   currentMode,
 *   changeMode,
 *   toggleComparison
 * } = useHairFlattening(hairProcessingState, setAdjustmentMode);
 * ```
 */
export const useHairFlattening = (
  hairProcessingState: HairProcessingState | null,
  setAdjustmentMode: (mode: AdjustmentMode) => void,
  options: UseHairFlatteningOptions = {}
): UseHairFlatteningReturn => {
  const { 
    onStateChange, 
    onModeChange, 
    autoInitialize = false,
    loadPreferences: shouldLoadPreferences = true 
  } = options;
  
  // Local state
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<HairAdjustmentPreferences>(() => {
    // Load preferences on mount if enabled
    if (shouldLoadPreferences) {
      return loadHairFlatteningPreferences();
    }
    return {
      defaultMode: AdjustmentMode.FLATTENED,
      autoFlattenThreshold: 40,
      showInfoMessage: true,
      enableComparison: false,
    };
  });

  // Extract values from hair processing state
  const isInitialized = hairProcessingState?.isInitialized ?? false;
  const isProcessing = hairProcessingState?.isProcessing ?? false;
  const currentMode = hairProcessingState?.currentMode ?? AdjustmentMode.NORMAL;
  const volumeScore = hairProcessingState?.segmentationData?.volumeScore ?? null;
  const volumeCategory = hairProcessingState?.segmentationData?.volumeCategory ?? null;
  const confidence = hairProcessingState?.segmentationData?.confidence ?? null;
  const error = hairProcessingState?.error?.message ?? localError;

  /**
   * Initialize hair segmentation
   * This should be called after the AR engine is initialized
   */
  const initializeSegmentation = useCallback(async () => {
    setInitializationAttempted(true);
    setLocalError(null);
    
    try {
      // The actual initialization happens in the Simple2DAREngine
      // This method is primarily for tracking initialization state
      // and triggering any necessary UI updates
      
      // Wait a bit for the engine to initialize segmentation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!hairProcessingState?.isInitialized) {
        throw new Error('Hair segmentation failed to initialize');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to initialize hair segmentation';
      setLocalError(errorMessage);
      console.error('Hair segmentation initialization error:', err);
      throw err;
    }
  }, [hairProcessingState]);

  /**
   * Change the adjustment mode
   * 
   * @param mode - The new adjustment mode (NORMAL, FLATTENED, or BALD)
   */
  const changeMode = useCallback((mode: AdjustmentMode) => {
    try {
      setAdjustmentMode(mode);
      onModeChange?.(mode);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to change adjustment mode';
      setLocalError(errorMessage);
      console.error('Mode change error:', err);
    }
  }, [setAdjustmentMode, onModeChange]);

  /**
   * Toggle comparison view mode
   * Shows before/after comparison when enabled
   */
  const toggleComparison = useCallback(() => {
    setIsComparisonMode(prev => !prev);
  }, []);

  /**
   * Reset the hair flattening state
   */
  const reset = useCallback(() => {
    setIsComparisonMode(false);
    setInitializationAttempted(false);
    setLocalError(null);
    changeMode(AdjustmentMode.NORMAL);
  }, [changeMode]);
  
  /**
   * Update user preferences
   * Merges partial preferences with current preferences and saves to localStorage
   * 
   * @param updates - Partial preferences to update
   */
  const updatePreferences = useCallback((updates: Partial<HairAdjustmentPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...updates };
      saveHairFlatteningPreferences(updated);
      return updated;
    });
  }, []);

  // Load preferences and apply default mode on initialization
  useEffect(() => {
    if (shouldLoadPreferences && isInitialized && !initializationAttempted) {
      // Apply default mode from preferences
      if (preferences.defaultMode !== currentMode) {
        changeMode(preferences.defaultMode);
      }
      
      // Apply comparison mode preference
      if (preferences.enableComparison !== isComparisonMode) {
        setIsComparisonMode(preferences.enableComparison);
      }
    }
  }, [
    shouldLoadPreferences, 
    isInitialized, 
    initializationAttempted, 
    preferences.defaultMode, 
    preferences.enableComparison,
    currentMode,
    isComparisonMode,
    changeMode
  ]);
  
  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && !initializationAttempted && hairProcessingState) {
      initializeSegmentation().catch(err => {
        console.error('Auto-initialization failed:', err);
      });
    }
  }, [autoInitialize, initializationAttempted, hairProcessingState, initializeSegmentation]);

  // Notify state changes
  useEffect(() => {
    if (hairProcessingState && onStateChange) {
      onStateChange(hairProcessingState);
    }
  }, [hairProcessingState, onStateChange]);

  return {
    // State
    isInitialized,
    isProcessing,
    currentMode,
    volumeScore,
    volumeCategory,
    confidence,
    error,
    isComparisonMode,
    
    // Preferences
    preferences,
    
    // Methods
    initializeSegmentation,
    changeMode,
    toggleComparison,
    reset,
    updatePreferences,
    
    // Raw state
    hairProcessingState,
  };
};

export default useHairFlattening;
