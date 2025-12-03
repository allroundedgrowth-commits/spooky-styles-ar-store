/**
 * Hair Flattening Preferences Example
 * 
 * Demonstrates how to use the hair flattening preferences system
 * in a React component.
 */

import React, { useState } from 'react';
import { useHairFlatteningPreferences } from '../hooks/useHairFlatteningPreferences';
import { AdjustmentMode } from '../engine/HairFlatteningEngine';

/**
 * Example component showing preferences management
 */
export const HairFlatteningPreferencesExample: React.FC = () => {
  const {
    preferences,
    isLoaded,
    hasStoredPreferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    getDefaults,
  } = useHairFlatteningPreferences({
    autoLoad: true,
    onChange: (prefs) => {
      console.log('Preferences changed:', prefs);
    },
  });

  const [showDefaults, setShowDefaults] = useState(false);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePreference('defaultMode', e.target.value as AdjustmentMode);
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreference('autoFlattenThreshold', parseInt(e.target.value));
  };

  const handleShowMessageToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreference('showInfoMessage', e.target.checked);
  };

  const handleComparisonToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreference('enableComparison', e.target.checked);
  };

  const handleReset = () => {
    if (confirm('Reset all preferences to defaults?')) {
      resetPreferences();
    }
  };

  const handleBulkUpdate = () => {
    // Example of updating multiple preferences at once
    updatePreferences({
      defaultMode: AdjustmentMode.FLATTENED,
      autoFlattenThreshold: 50,
      showInfoMessage: true,
    });
  };

  const defaults = getDefaults();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-halloween-darkPurple rounded-lg">
      <h2 className="text-2xl font-bold text-halloween-orange mb-6">
        Hair Flattening Preferences
      </h2>

      {/* Status */}
      <div className="mb-6 p-4 bg-halloween-black rounded">
        <p className="text-white">
          <strong>Status:</strong> {isLoaded ? 'Loaded' : 'Loading...'}
        </p>
        <p className="text-white">
          <strong>Has Stored Preferences:</strong>{' '}
          {hasStoredPreferences ? 'Yes' : 'No (using defaults)'}
        </p>
      </div>

      {/* Default Mode */}
      <div className="mb-6">
        <label className="block text-halloween-orange font-semibold mb-2">
          Default Adjustment Mode
        </label>
        <select
          value={preferences.defaultMode}
          onChange={handleModeChange}
          className="w-full p-2 bg-halloween-black text-white border border-halloween-purple rounded"
        >
          <option value={AdjustmentMode.NORMAL}>Normal (No adjustment)</option>
          <option value={AdjustmentMode.FLATTENED}>
            Flattened (Recommended)
          </option>
          <option value={AdjustmentMode.BALD}>Bald (Preview only)</option>
        </select>
        <p className="text-sm text-gray-400 mt-1">
          The adjustment mode to use when starting an AR session
        </p>
      </div>

      {/* Auto-Flatten Threshold */}
      <div className="mb-6">
        <label className="block text-halloween-orange font-semibold mb-2">
          Auto-Flatten Threshold: {preferences.autoFlattenThreshold}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={preferences.autoFlattenThreshold}
          onChange={handleThresholdChange}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>0 (Never auto-flatten)</span>
          <span>100 (Always auto-flatten)</span>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          When your hair volume score exceeds this value, flattening will be
          automatically applied
        </p>
      </div>

      {/* Show Info Message */}
      <div className="mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.showInfoMessage}
            onChange={handleShowMessageToggle}
            className="w-5 h-5"
          />
          <span className="text-white">
            Show info message when flattening is applied
          </span>
        </label>
        <p className="text-sm text-gray-400 mt-1 ml-8">
          Display a helpful message explaining the hair adjustment feature
        </p>
      </div>

      {/* Enable Comparison */}
      <div className="mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.enableComparison}
            onChange={handleComparisonToggle}
            className="w-5 h-5"
          />
          <span className="text-white">
            Enable comparison view by default
          </span>
        </label>
        <p className="text-sm text-gray-400 mt-1 ml-8">
          Show before/after comparison when starting AR session
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleReset}
          disabled={!hasStoredPreferences}
          className="px-4 py-2 bg-halloween-purple text-white rounded hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset to Defaults
        </button>

        <button
          onClick={handleBulkUpdate}
          className="px-4 py-2 bg-halloween-orange text-white rounded hover:bg-opacity-80"
        >
          Apply Recommended Settings
        </button>

        <button
          onClick={() => setShowDefaults(!showDefaults)}
          className="px-4 py-2 bg-halloween-green text-white rounded hover:bg-opacity-80"
        >
          {showDefaults ? 'Hide' : 'Show'} Defaults
        </button>
      </div>

      {/* Default Values */}
      {showDefaults && (
        <div className="p-4 bg-halloween-black rounded">
          <h3 className="text-halloween-orange font-semibold mb-2">
            Default Values
          </h3>
          <pre className="text-white text-sm">
            {JSON.stringify(defaults, null, 2)}
          </pre>
        </div>
      )}

      {/* Current Values */}
      <div className="p-4 bg-halloween-black rounded">
        <h3 className="text-halloween-orange font-semibold mb-2">
          Current Preferences
        </h3>
        <pre className="text-white text-sm">
          {JSON.stringify(preferences, null, 2)}
        </pre>
      </div>

      {/* Usage Example */}
      <div className="mt-6 p-4 bg-halloween-black rounded">
        <h3 className="text-halloween-orange font-semibold mb-2">
          Usage in AR Session
        </h3>
        <pre className="text-white text-sm overflow-x-auto">
{`// Load preferences when AR starts
const prefs = loadHairFlatteningPreferences();

// Apply default mode
setAdjustmentMode(prefs.defaultMode);

// Check if message should be shown
if (prefs.showInfoMessage && volumeScore > prefs.autoFlattenThreshold) {
  showInfoMessage();
}

// Enable comparison if preferred
if (prefs.enableComparison) {
  enableComparisonView();
}`}
        </pre>
      </div>
    </div>
  );
};

export default HairFlatteningPreferencesExample;
