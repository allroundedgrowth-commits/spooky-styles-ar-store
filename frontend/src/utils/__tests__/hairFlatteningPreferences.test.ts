/**
 * Tests for Hair Flattening Preferences Storage
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  HairFlatteningPreferencesManager,
  HairAdjustmentPreferences,
  loadHairFlatteningPreferences,
  saveHairFlatteningPreferences,
  updateHairFlatteningPreference,
  resetHairFlatteningPreferences,
  getDefaultHairFlatteningPreferences,
} from '../hairFlatteningPreferences';
import { AdjustmentMode } from '../../engine/HairFlatteningEngine';

describe('HairFlatteningPreferencesManager', () => {
  const STORAGE_KEY = 'spooky-wigs-hair-flattening-preferences';
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });
  
  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });
  
  describe('loadPreferences', () => {
    it('should return default preferences when none are saved', () => {
      const preferences = HairFlatteningPreferencesManager.loadPreferences();
      
      expect(preferences.defaultMode).toBe(AdjustmentMode.FLATTENED);
      expect(preferences.autoFlattenThreshold).toBe(40);
      expect(preferences.showInfoMessage).toBe(true);
      expect(preferences.enableComparison).toBe(false);
    });
    
    it('should load saved preferences from localStorage', () => {
      const saved: HairAdjustmentPreferences = {
        defaultMode: AdjustmentMode.NORMAL,
        autoFlattenThreshold: 50,
        showInfoMessage: false,
        enableComparison: true,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      
      const loaded = HairFlatteningPreferencesManager.loadPreferences();
      
      expect(loaded).toEqual(saved);
    });
    
    it('should return defaults if localStorage data is corrupted', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');
      
      const preferences = HairFlatteningPreferencesManager.loadPreferences();
      
      expect(preferences.defaultMode).toBe(AdjustmentMode.FLATTENED);
      expect(preferences.autoFlattenThreshold).toBe(40);
    });
    
    it('should validate and fix invalid mode values', () => {
      const invalid = {
        defaultMode: 'invalid-mode',
        autoFlattenThreshold: 40,
        showInfoMessage: true,
        enableComparison: false,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      
      const loaded = HairFlatteningPreferencesManager.loadPreferences();
      
      expect(loaded.defaultMode).toBe(AdjustmentMode.FLATTENED);
    });
    
    it('should validate and fix invalid threshold values', () => {
      const invalid = {
        defaultMode: AdjustmentMode.FLATTENED,
        autoFlattenThreshold: 150, // Out of range
        showInfoMessage: true,
        enableComparison: false,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      
      const loaded = HairFlatteningPreferencesManager.loadPreferences();
      
      expect(loaded.autoFlattenThreshold).toBe(40);
    });
  });
  
  describe('savePreferences', () => {
    it('should save preferences to localStorage', () => {
      const preferences: HairAdjustmentPreferences = {
        defaultMode: AdjustmentMode.BALD,
        autoFlattenThreshold: 60,
        showInfoMessage: false,
        enableComparison: true,
      };
      
      const success = HairFlatteningPreferencesManager.savePreferences(preferences);
      
      expect(success).toBe(true);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual(preferences);
    });
    
    it('should validate preferences before saving', () => {
      const invalid = {
        defaultMode: 'invalid' as any,
        autoFlattenThreshold: -10,
        showInfoMessage: 'not-boolean' as any,
        enableComparison: false,
      };
      
      const success = HairFlatteningPreferencesManager.savePreferences(invalid);
      
      expect(success).toBe(true);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      
      // Should have corrected invalid values
      expect(parsed.defaultMode).toBe(AdjustmentMode.FLATTENED);
      expect(parsed.autoFlattenThreshold).toBe(40);
      expect(parsed.showInfoMessage).toBe(true);
    });
  });
  
  describe('updatePreference', () => {
    it('should update a single preference field', () => {
      // First save some preferences
      const initial: HairAdjustmentPreferences = {
        defaultMode: AdjustmentMode.FLATTENED,
        autoFlattenThreshold: 40,
        showInfoMessage: true,
        enableComparison: false,
      };
      
      HairFlatteningPreferencesManager.savePreferences(initial);
      
      // Update one field
      const success = HairFlatteningPreferencesManager.updatePreference(
        'showInfoMessage',
        false
      );
      
      expect(success).toBe(true);
      
      const updated = HairFlatteningPreferencesManager.loadPreferences();
      expect(updated.showInfoMessage).toBe(false);
      expect(updated.defaultMode).toBe(AdjustmentMode.FLATTENED);
      expect(updated.autoFlattenThreshold).toBe(40);
    });
    
    it('should update threshold value', () => {
      const success = HairFlatteningPreferencesManager.updatePreference(
        'autoFlattenThreshold',
        70
      );
      
      expect(success).toBe(true);
      
      const updated = HairFlatteningPreferencesManager.loadPreferences();
      expect(updated.autoFlattenThreshold).toBe(70);
    });
  });
  
  describe('resetPreferences', () => {
    it('should remove preferences from localStorage', () => {
      // Save some preferences
      const preferences: HairAdjustmentPreferences = {
        defaultMode: AdjustmentMode.NORMAL,
        autoFlattenThreshold: 50,
        showInfoMessage: false,
        enableComparison: true,
      };
      
      HairFlatteningPreferencesManager.savePreferences(preferences);
      expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
      
      // Reset
      const success = HairFlatteningPreferencesManager.resetPreferences();
      
      expect(success).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
    
    it('should return defaults after reset', () => {
      // Save custom preferences
      HairFlatteningPreferencesManager.savePreferences({
        defaultMode: AdjustmentMode.BALD,
        autoFlattenThreshold: 80,
        showInfoMessage: false,
        enableComparison: true,
      });
      
      // Reset
      HairFlatteningPreferencesManager.resetPreferences();
      
      // Load should return defaults
      const loaded = HairFlatteningPreferencesManager.loadPreferences();
      expect(loaded.defaultMode).toBe(AdjustmentMode.FLATTENED);
      expect(loaded.autoFlattenThreshold).toBe(40);
      expect(loaded.showInfoMessage).toBe(true);
      expect(loaded.enableComparison).toBe(false);
    });
  });
  
  describe('hasPreferences', () => {
    it('should return false when no preferences are saved', () => {
      expect(HairFlatteningPreferencesManager.hasPreferences()).toBe(false);
    });
    
    it('should return true when preferences are saved', () => {
      HairFlatteningPreferencesManager.savePreferences({
        defaultMode: AdjustmentMode.FLATTENED,
        autoFlattenThreshold: 40,
        showInfoMessage: true,
        enableComparison: false,
      });
      
      expect(HairFlatteningPreferencesManager.hasPreferences()).toBe(true);
    });
  });
  
  describe('getDefaults', () => {
    it('should return default preferences', () => {
      const defaults = HairFlatteningPreferencesManager.getDefaults();
      
      expect(defaults.defaultMode).toBe(AdjustmentMode.FLATTENED);
      expect(defaults.autoFlattenThreshold).toBe(40);
      expect(defaults.showInfoMessage).toBe(true);
      expect(defaults.enableComparison).toBe(false);
    });
    
    it('should return a new object each time', () => {
      const defaults1 = HairFlatteningPreferencesManager.getDefaults();
      const defaults2 = HairFlatteningPreferencesManager.getDefaults();
      
      expect(defaults1).not.toBe(defaults2);
      expect(defaults1).toEqual(defaults2);
    });
  });
  
  describe('Convenience functions', () => {
    it('loadHairFlatteningPreferences should work', () => {
      const preferences = loadHairFlatteningPreferences();
      expect(preferences).toBeDefined();
      expect(preferences.defaultMode).toBe(AdjustmentMode.FLATTENED);
    });
    
    it('saveHairFlatteningPreferences should work', () => {
      const preferences: HairAdjustmentPreferences = {
        defaultMode: AdjustmentMode.NORMAL,
        autoFlattenThreshold: 50,
        showInfoMessage: false,
        enableComparison: true,
      };
      
      const success = saveHairFlatteningPreferences(preferences);
      expect(success).toBe(true);
      
      const loaded = loadHairFlatteningPreferences();
      expect(loaded).toEqual(preferences);
    });
    
    it('updateHairFlatteningPreference should work', () => {
      const success = updateHairFlatteningPreference('showInfoMessage', false);
      expect(success).toBe(true);
      
      const loaded = loadHairFlatteningPreferences();
      expect(loaded.showInfoMessage).toBe(false);
    });
    
    it('resetHairFlatteningPreferences should work', () => {
      saveHairFlatteningPreferences({
        defaultMode: AdjustmentMode.BALD,
        autoFlattenThreshold: 80,
        showInfoMessage: false,
        enableComparison: true,
      });
      
      const success = resetHairFlatteningPreferences();
      expect(success).toBe(true);
      
      const loaded = loadHairFlatteningPreferences();
      expect(loaded.defaultMode).toBe(AdjustmentMode.FLATTENED);
    });
    
    it('getDefaultHairFlatteningPreferences should work', () => {
      const defaults = getDefaultHairFlatteningPreferences();
      expect(defaults.defaultMode).toBe(AdjustmentMode.FLATTENED);
      expect(defaults.autoFlattenThreshold).toBe(40);
    });
  });
  
  describe('Edge cases', () => {
    it('should handle threshold at boundaries', () => {
      // Test 0
      HairFlatteningPreferencesManager.savePreferences({
        defaultMode: AdjustmentMode.FLATTENED,
        autoFlattenThreshold: 0,
        showInfoMessage: true,
        enableComparison: false,
      });
      
      let loaded = HairFlatteningPreferencesManager.loadPreferences();
      expect(loaded.autoFlattenThreshold).toBe(0);
      
      // Test 100
      HairFlatteningPreferencesManager.savePreferences({
        defaultMode: AdjustmentMode.FLATTENED,
        autoFlattenThreshold: 100,
        showInfoMessage: true,
        enableComparison: false,
      });
      
      loaded = HairFlatteningPreferencesManager.loadPreferences();
      expect(loaded.autoFlattenThreshold).toBe(100);
    });
    
    it('should handle all adjustment modes', () => {
      const modes = [
        AdjustmentMode.NORMAL,
        AdjustmentMode.FLATTENED,
        AdjustmentMode.BALD,
      ];
      
      for (const mode of modes) {
        HairFlatteningPreferencesManager.savePreferences({
          defaultMode: mode,
          autoFlattenThreshold: 40,
          showInfoMessage: true,
          enableComparison: false,
        });
        
        const loaded = HairFlatteningPreferencesManager.loadPreferences();
        expect(loaded.defaultMode).toBe(mode);
      }
    });
  });
});
