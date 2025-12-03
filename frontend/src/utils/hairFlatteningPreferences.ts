/**
 * Hair Flattening Preferences Storage
 * 
 * Manages user preferences for hair flattening feature using localStorage.
 * Allows users to customize their default adjustment mode, auto-flatten threshold,
 * and UI message preferences.
 * 
 * Requirements: 3.1, 4.1
 */

import { AdjustmentMode } from '../engine/HairFlatteningEngine';

/**
 * User preferences for hair adjustment feature
 */
export interface HairAdjustmentPreferences {
  /**
   * Default adjustment mode to use when starting AR session
   * @default AdjustmentMode.FLATTENED
   */
  defaultMode: AdjustmentMode;
  
  /**
   * Volume score threshold for auto-flattening (0-100)
   * When volume score exceeds this value, flattening is automatically applied
   * @default 40
   */
  autoFlattenThreshold: number;
  
  /**
   * Whether to show the info message when flattening is applied
   * Users can disable this after they understand the feature
   * @default true
   */
  showInfoMessage: boolean;
  
  /**
   * Whether comparison view is enabled by default
   * @default false
   */
  enableComparison: boolean;
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: HairAdjustmentPreferences = {
  defaultMode: AdjustmentMode.FLATTENED,
  autoFlattenThreshold: 40,
  showInfoMessage: true,
  enableComparison: false,
};

/**
 * LocalStorage key for preferences
 */
const STORAGE_KEY = 'spooky-wigs-hair-flattening-preferences';

/**
 * Hair Flattening Preferences Manager
 * 
 * Provides methods to load, save, and manage user preferences for the hair flattening feature.
 */
export class HairFlatteningPreferencesManager {
  /**
   * Load preferences from localStorage
   * Returns default preferences if none are saved or if loading fails
   * 
   * @returns User preferences
   */
  static loadPreferences(): HairAdjustmentPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        return { ...DEFAULT_PREFERENCES };
      }
      
      const parsed = JSON.parse(stored);
      
      // Validate and merge with defaults to handle missing fields
      return {
        defaultMode: this.validateMode(parsed.defaultMode) 
          ? parsed.defaultMode 
          : DEFAULT_PREFERENCES.defaultMode,
        autoFlattenThreshold: this.validateThreshold(parsed.autoFlattenThreshold)
          ? parsed.autoFlattenThreshold
          : DEFAULT_PREFERENCES.autoFlattenThreshold,
        showInfoMessage: typeof parsed.showInfoMessage === 'boolean'
          ? parsed.showInfoMessage
          : DEFAULT_PREFERENCES.showInfoMessage,
        enableComparison: typeof parsed.enableComparison === 'boolean'
          ? parsed.enableComparison
          : DEFAULT_PREFERENCES.enableComparison,
      };
    } catch (error) {
      console.error('Failed to load hair flattening preferences:', error);
      return { ...DEFAULT_PREFERENCES };
    }
  }
  
  /**
   * Save preferences to localStorage
   * 
   * @param preferences - Preferences to save
   * @returns True if save was successful, false otherwise
   */
  static savePreferences(preferences: HairAdjustmentPreferences): boolean {
    try {
      // Validate preferences before saving
      const validated: HairAdjustmentPreferences = {
        defaultMode: this.validateMode(preferences.defaultMode)
          ? preferences.defaultMode
          : DEFAULT_PREFERENCES.defaultMode,
        autoFlattenThreshold: this.validateThreshold(preferences.autoFlattenThreshold)
          ? preferences.autoFlattenThreshold
          : DEFAULT_PREFERENCES.autoFlattenThreshold,
        showInfoMessage: typeof preferences.showInfoMessage === 'boolean'
          ? preferences.showInfoMessage
          : DEFAULT_PREFERENCES.showInfoMessage,
        enableComparison: typeof preferences.enableComparison === 'boolean'
          ? preferences.enableComparison
          : DEFAULT_PREFERENCES.enableComparison,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
      return true;
    } catch (error) {
      console.error('Failed to save hair flattening preferences:', error);
      return false;
    }
  }
  
  /**
   * Update a specific preference field
   * 
   * @param key - Preference key to update
   * @param value - New value
   * @returns True if update was successful, false otherwise
   */
  static updatePreference<K extends keyof HairAdjustmentPreferences>(
    key: K,
    value: HairAdjustmentPreferences[K]
  ): boolean {
    try {
      const current = this.loadPreferences();
      current[key] = value;
      return this.savePreferences(current);
    } catch (error) {
      console.error(`Failed to update preference ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Reset preferences to defaults
   * 
   * @returns True if reset was successful, false otherwise
   */
  static resetPreferences(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to reset hair flattening preferences:', error);
      return false;
    }
  }
  
  /**
   * Get default preferences
   * 
   * @returns Default preferences object
   */
  static getDefaults(): HairAdjustmentPreferences {
    return { ...DEFAULT_PREFERENCES };
  }
  
  /**
   * Check if preferences exist in storage
   * 
   * @returns True if preferences are saved, false otherwise
   */
  static hasPreferences(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Validate adjustment mode value
   * 
   * @param mode - Mode to validate
   * @returns True if valid, false otherwise
   */
  private static validateMode(mode: any): mode is AdjustmentMode {
    return (
      mode === AdjustmentMode.NORMAL ||
      mode === AdjustmentMode.FLATTENED ||
      mode === AdjustmentMode.BALD
    );
  }
  
  /**
   * Validate auto-flatten threshold value
   * 
   * @param threshold - Threshold to validate
   * @returns True if valid (0-100), false otherwise
   */
  private static validateThreshold(threshold: any): boolean {
    return (
      typeof threshold === 'number' &&
      threshold >= 0 &&
      threshold <= 100 &&
      !isNaN(threshold)
    );
  }
}

/**
 * Hook-friendly functions for React components
 */

/**
 * Load preferences (convenience function)
 */
export const loadHairFlatteningPreferences = (): HairAdjustmentPreferences => {
  return HairFlatteningPreferencesManager.loadPreferences();
};

/**
 * Save preferences (convenience function)
 */
export const saveHairFlatteningPreferences = (
  preferences: HairAdjustmentPreferences
): boolean => {
  return HairFlatteningPreferencesManager.savePreferences(preferences);
};

/**
 * Update a single preference (convenience function)
 */
export const updateHairFlatteningPreference = <K extends keyof HairAdjustmentPreferences>(
  key: K,
  value: HairAdjustmentPreferences[K]
): boolean => {
  return HairFlatteningPreferencesManager.updatePreference(key, value);
};

/**
 * Reset to defaults (convenience function)
 */
export const resetHairFlatteningPreferences = (): boolean => {
  return HairFlatteningPreferencesManager.resetPreferences();
};

/**
 * Get default preferences (convenience function)
 */
export const getDefaultHairFlatteningPreferences = (): HairAdjustmentPreferences => {
  return HairFlatteningPreferencesManager.getDefaults();
};

export default HairFlatteningPreferencesManager;
