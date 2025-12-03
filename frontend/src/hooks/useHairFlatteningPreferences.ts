/**
 * useHairFlatteningPreferences Hook
 * 
 * Custom React hook for managing hair flattening user preferences.
 * Provides a simple interface for loading, saving, and updating preferences
 * with automatic localStorage synchronization.
 * 
 * Requirements: 3.1, 4.1
 */

import { useState, useCallback, useEffect } from 'react';
import {
  HairAdjustmentPreferences,
  HairFlatteningPreferencesManager,
} from '../utils/hairFlatteningPreferences';
import { AdjustmentMode } from '../engine/HairFlatteningEngine';

export interface UseHairFlatteningPreferencesOptions {
  /**
   * Auto-load preferences on mount
   * @default true
   */
  autoLoad?: boolean;
  
  /**
   * Callback when preferences change
   */
  onChange?: (preferences: HairAdjustmentPreferences) => void;
}

export interface UseHairFlatteningPreferencesReturn {
  /**
   * Current preferences
   */
  preferences: HairAdjustmentPreferences;
  
  /**
   * Whether preferences are loaded
   */
  isLoaded: boolean;
  
  /**
   * Whether preferences exist in storage
   */
  hasStoredPreferences: boolean;
  
  /**
   * Update preferences (merges with current)
   */
  updatePreferences: (updates: Partial<HairAdjustmentPreferences>) => boolean;
  
  /**
   * Set preferences (replaces current)
   */
  setPreferences: (preferences: HairAdjustmentPreferences) => boolean;
  
  /**
   * Update a single preference field
   */
  updatePreference: <K extends keyof HairAdjustmentPreferences>(
    key: K,
    value: HairAdjustmentPreferences[K]
  ) => boolean;
  
  /**
   * Reset to default preferences
   */
  resetPreferences: () => boolean;
  
  /**
   * Reload preferences from storage
   */
  reloadPreferences: () => void;
  
  /**
   * Get default preferences
   */
  getDefaults: () => HairAdjustmentPreferences;
}

/**
 * Hook for managing hair flattening preferences
 * 
 * @param options - Configuration options
 * @returns Preferences state and management methods
 * 
 * @example
 * ```tsx
 * const {
 *   preferences,
 *   updatePreference,
 *   resetPreferences
 * } = useHairFlatteningPreferences();
 * 
 * // Update default mode
 * updatePreference('defaultMode', AdjustmentMode.NORMAL);
 * 
 * // Disable info message
 * updatePreference('showInfoMessage', false);
 * ```
 */
export const useHairFlatteningPreferences = (
  options: UseHairFlatteningPreferencesOptions = {}
): UseHairFlatteningPreferencesReturn => {
  const { autoLoad = true, onChange } = options;
  
  const [preferences, setPreferencesState] = useState<HairAdjustmentPreferences>(() => {
    if (autoLoad) {
      return HairFlatteningPreferencesManager.loadPreferences();
    }
    return HairFlatteningPreferencesManager.getDefaults();
  });
  
  const [isLoaded, setIsLoaded] = useState(autoLoad);
  const [hasStoredPreferences, setHasStoredPreferences] = useState(() => {
    return HairFlatteningPreferencesManager.hasPreferences();
  });
  
  /**
   * Update preferences by merging with current values
   */
  const updatePreferences = useCallback((updates: Partial<HairAdjustmentPreferences>): boolean => {
    const updated = { ...preferences, ...updates };
    const success = HairFlatteningPreferencesManager.savePreferences(updated);
    
    if (success) {
      setPreferencesState(updated);
      setHasStoredPreferences(true);
      onChange?.(updated);
    }
    
    return success;
  }, [preferences, onChange]);
  
  /**
   * Set preferences (replace current)
   */
  const setPreferences = useCallback((newPreferences: HairAdjustmentPreferences): boolean => {
    const success = HairFlatteningPreferencesManager.savePreferences(newPreferences);
    
    if (success) {
      setPreferencesState(newPreferences);
      setHasStoredPreferences(true);
      onChange?.(newPreferences);
    }
    
    return success;
  }, [onChange]);
  
  /**
   * Update a single preference field
   */
  const updatePreference = useCallback(<K extends keyof HairAdjustmentPreferences>(
    key: K,
    value: HairAdjustmentPreferences[K]
  ): boolean => {
    return updatePreferences({ [key]: value } as Partial<HairAdjustmentPreferences>);
  }, [updatePreferences]);
  
  /**
   * Reset to default preferences
   */
  const resetPreferences = useCallback((): boolean => {
    const success = HairFlatteningPreferencesManager.resetPreferences();
    
    if (success) {
      const defaults = HairFlatteningPreferencesManager.getDefaults();
      setPreferencesState(defaults);
      setHasStoredPreferences(false);
      onChange?.(defaults);
    }
    
    return success;
  }, [onChange]);
  
  /**
   * Reload preferences from storage
   */
  const reloadPreferences = useCallback(() => {
    const loaded = HairFlatteningPreferencesManager.loadPreferences();
    setPreferencesState(loaded);
    setIsLoaded(true);
    setHasStoredPreferences(HairFlatteningPreferencesManager.hasPreferences());
    onChange?.(loaded);
  }, [onChange]);
  
  /**
   * Get default preferences
   */
  const getDefaults = useCallback((): HairAdjustmentPreferences => {
    return HairFlatteningPreferencesManager.getDefaults();
  }, []);
  
  // Load preferences on mount if not auto-loaded
  useEffect(() => {
    if (!autoLoad && !isLoaded) {
      reloadPreferences();
    }
  }, [autoLoad, isLoaded, reloadPreferences]);
  
  return {
    preferences,
    isLoaded,
    hasStoredPreferences,
    updatePreferences,
    setPreferences,
    updatePreference,
    resetPreferences,
    reloadPreferences,
    getDefaults,
  };
};

export default useHairFlatteningPreferences;
