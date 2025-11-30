import React, { useState } from 'react';
import { AdjustmentModeToggle } from '../components/AR/AdjustmentModeToggle';
import { AdjustmentMode } from '../engine/HairFlatteningEngine';

/**
 * Example usage of AdjustmentModeToggle component
 * Demonstrates the three adjustment modes with volume score indicator
 */
export const AdjustmentModeToggleExample: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AdjustmentMode>(AdjustmentMode.FLATTENED);
  const [volumeScore, setVolumeScore] = useState<number>(65);
  const [disabled, setDisabled] = useState<boolean>(false);

  const handleModeChange = (mode: AdjustmentMode) => {
    console.log(`Mode changed to: ${mode}`);
    setCurrentMode(mode);
  };

  return (
    <div className="min-h-screen bg-halloween-black p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Adjustment Mode Toggle Example
          </h1>
          <p className="text-gray-400">
            Interactive demo of the hair adjustment mode toggle component
          </p>
        </div>

        {/* Main Component Demo */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Component Demo
          </h2>
          <AdjustmentModeToggle
            currentMode={currentMode}
            onModeChange={handleModeChange}
            volumeScore={volumeScore}
            disabled={disabled}
          />
        </div>

        {/* Controls */}
        <div className="bg-gray-900 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">
            Demo Controls
          </h2>

          {/* Volume Score Slider */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Volume Score: {volumeScore}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volumeScore}
              onChange={(e) => setVolumeScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>No Hair (0)</span>
              <span>Moderate (40)</span>
              <span>High Volume (100)</span>
            </div>
          </div>

          {/* Disabled Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="disabled-toggle"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              className="w-4 h-4 text-halloween-purple bg-gray-700 border-gray-600 rounded focus:ring-halloween-purple"
            />
            <label htmlFor="disabled-toggle" className="text-white text-sm">
              Disable component (simulates segmentation unavailable)
            </label>
          </div>

          {/* Current State Display */}
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">Current State:</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-300">
                <span className="text-gray-500">Mode:</span>{' '}
                <span className="text-halloween-orange font-semibold">
                  {currentMode}
                </span>
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Volume Score:</span>{' '}
                <span className="text-white">{volumeScore}</span>
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Recommended Mode:</span>{' '}
                <span className="text-halloween-green">
                  {volumeScore > 40 ? 'Flattened' : 'Normal'}
                </span>
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Disabled:</span>{' '}
                <span className={disabled ? 'text-red-400' : 'text-green-400'}>
                  {disabled ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Usage Examples
          </h2>
          
          <div className="space-y-4">
            {/* Example 1: Low Volume */}
            <div>
              <h3 className="text-white font-medium mb-2">Low Volume Hair (Score: 25)</h3>
              <AdjustmentModeToggle
                currentMode={AdjustmentMode.NORMAL}
                onModeChange={(mode) => console.log('Low volume mode:', mode)}
                volumeScore={25}
              />
            </div>

            {/* Example 2: High Volume */}
            <div>
              <h3 className="text-white font-medium mb-2">High Volume Hair (Score: 75)</h3>
              <AdjustmentModeToggle
                currentMode={AdjustmentMode.FLATTENED}
                onModeChange={(mode) => console.log('High volume mode:', mode)}
                volumeScore={75}
              />
            </div>

            {/* Example 3: Disabled State */}
            <div>
              <h3 className="text-white font-medium mb-2">Segmentation Unavailable</h3>
              <AdjustmentModeToggle
                currentMode={AdjustmentMode.NORMAL}
                onModeChange={(mode) => console.log('Disabled mode:', mode)}
                volumeScore={0}
                disabled={true}
              />
            </div>
          </div>
        </div>

        {/* Requirements Info */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Requirements Validation
          </h2>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p><strong>Req 4.1:</strong> Three adjustment modes (Normal, Flattened, Bald)</p>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p><strong>Req 4.5:</strong> Mode change response time &lt; 250ms (tracked in console)</p>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>Visual highlighting of recommended option (when volume &gt; 40)</p>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>Disabled state for segmentation unavailable</p>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-halloween-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>Volume score indicator with visual gauge</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentModeToggleExample; 